//components(UI)-->editor.store(Store)-->commandProcessor(Application)-->treemanager(Domain)
// stores/editor.store.ts
import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
import { CommandProcessor } from '@/application/editor/commandProcess'
import { createCommand } from '@/domain/schema/command'
import type {
  PageSchema,
  ComponentType,
  ComponentSchema,
  ComponentUpdatePayload,
} from '@/domain/schema/index'

// 初始化服务---模块化的单例模式
export const useEditorStore = defineStore('editor', () => {
  // ==================== 状态 ====================

  //当前页面
  const currentPage = ref<PageSchema>()
  //当前页面id
  const currentPageId = ref<string>('')
  //当前选中的组件
  const selectedComponent = ref<ComponentSchema | null>(null)

  // 服务
  const commandProcessor = new CommandProcessor()

  // ==================== 命令执行方法 ====================

  /**
   * 执行命令的统一入口
   */
  const executeCommand = async (
    command: any, // 使用any简化，实际应该导入类型
    options?: {
      sync?: boolean
      track?: boolean
      undoable?: boolean
    },
  ) => {
    if (!currentPage.value) return false

    const result = await commandProcessor.process(toRaw(currentPage.value), command, {
      syncToServer: options?.sync,
      trackHistory: options?.track,
    })

    if (result.success && result.newPage) {
      currentPage.value = result.newPage
      // 更新组件属性不需要 切换选中组件引用
      if (!['COMPONENT_UPDATE'].includes(command.type)) {
        setSelectedComponent(currentPage.value.selectId)
      }

      return true
    }

    return false
  }

  // ==================== 命令操作方法 ====================

  //更新组件属性props
  const updateComponent = async (
    componentId: string,
    updates: Record<string, any>,
    immediate: boolean = true,
  ) => {
    const command = createCommand('COMPONENT_UPDATE', {
      componentId,
      updates,
    } as ComponentUpdatePayload)

    // 如果是立即更新（如拖拽），不立即同步到服务器
    return executeCommand(command, {
      sync: !immediate, // 非立即更新时才同步
      track: true,
    })
  }
  //删除组件
  const deleteComponent = async (componentId: string) => {
    const component = currentPage.value?.components[componentId]
    if (!component) return false

    const command = createCommand('COMPONENT_DELETE', {
      componentId,
      parentId: component.parentId,
    })

    return executeCommand(command, { sync: true, track: true })
  }
  //移动组件
  const moveComponent = async (
    componentId: string,
    fromParentId: string | null,
    toParentId: string | null,
    fromIndex: number,
    toIndex: number,
  ) => {
    const command = createCommand('COMPONENT_MOVE', {
      componentId,
      fromParentId,
      toParentId,
      fromIndex,
      toIndex,
    })

    // 移动操作立即同步
    return executeCommand(command, { sync: true, track: true })
  }
  //复制组件
  const duplicateComponent = async (parentId: string, componentId: string) => {
    const command = createCommand('COMPONENT_DUPLICATE', {
      componentId,
      parentId,
    })
    return executeCommand(command, { sync: false, track: true })
  }
  //分割容器
  const cutComponent = async (
    parentId: string,
    componentId: string,
    direct: string,
    type: string,
  ) => {
    const command = createCommand('COMPONENT_CUT', {
      componentId,
      parentId,
      type,
      direct,
    })
    return executeCommand(command, { sync: false, track: true })
  }
  //拖拽原子组件到放置区域
  const dropComponent = async (dropId: string, type: ComponentType) => {
    const command = createCommand('COMPONENT_DROP', {
      dropId,
      type,
    })
    return executeCommand(command, { sync: false, track: true })
  }

  // ==================== 页面设置 ====================

  const setCurrentPage = (page: PageSchema) => {
    currentPage.value = page
    currentPageId.value = page.id
  }
  const setCurrentPageId = (pageId: string) => {
    currentPageId.value = pageId
  }

  const setSelectedComponent = (componentId: string | null) => {
    if (componentId && currentPage.value) {
      selectedComponent.value = currentPage.value.components[componentId] || null
    } else {
      selectedComponent.value = null
    }
  }

  // ==================== 查询方法 ====================

  const findComponentById = (componentId: string) => {
    return currentPage.value?.components[componentId] || null
  }

  const findChildren = (componentId: string) => {
    const component = findComponentById(componentId)
    if (!component || !currentPage.value) return []

    return component.children
      .map((id) => currentPage.value!.components[id])
      .filter((c) => c !== undefined)
  }

  // ==================== 保存和同步 ====================

  const pendingCommands = computed(() => {
    return commandProcessor.getPendingCommands()
  })

  const hasUnsavedChanges = computed(() => {
    return pendingCommands.value.length > 0
  })

  const save = async (): Promise<boolean> => {
    if (!currentPage.value) return false

    try {
      // 获取所有未同步的命令
      const commands = commandProcessor.getPendingCommands()

      if (commands.length === 0) {
        console.log('没有需要保存的更改')
        return true
      }

      // 调用infra层API保存
      // const success = await editorApi.save(currentPage.value, commands);

      // 模拟保存
      console.log('保存命令:', commands)
      await new Promise((resolve) => setTimeout(resolve, 300))

      // 清空待处理命令
      commandProcessor.clearPending(commands)

      console.log('保存成功')
      return true
    } catch (error) {
      console.error('保存失败:', error)
      return false
    }
  }

  // 自动保存（防抖）
  let autoSaveTimer: NodeJS.Timeout | null = null
  const scheduleAutoSave = () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer)

    autoSaveTimer = setTimeout(() => {
      if (hasUnsavedChanges.value) {
        save().catch(console.error)
      }
    }, 10000) // 10秒后自动保存
  }

  // 监听所有修改操作，触发自动保存
  const executeWithAutoSave = async (command: any) => {
    const result = await executeCommand(command)
    if (result) {
      scheduleAutoSave()
    }
    return result
  }

  return {
    // 状态
    currentPage,
    currentPageId,
    selectedComponent,

    // 命令执行
    updateComponentAuto: (id: string, updates: any) =>
      executeWithAutoSave(
        createCommand('COMPONENT_UPDATE', {
          componentId: id,
          updates,
        }),
      ),
    updateComponent,
    deleteComponent,
    moveComponent,
    duplicateComponent,
    cutComponent,
    dropComponent,

    // 设置
    setCurrentPage,
    setCurrentPageId,
    setSelectedComponent,

    // 查询
    findComponentById,
    findChildren,

    // 保存
    save,
    hasUnsavedChanges,
    pendingCommands,
  }
})
