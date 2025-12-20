// domain/editor/tree-manager.ts
import { produce } from 'immer'
import type {
  PageSchema,
  ComponentSchema,
  ComponentUpdatePayload,
  ComponentDeletePayload,
  ComponentMovePayload,
  ComponentDuplicatePayload,
  ComponentCutPayload,
  ComponentDropPayload,
  BatchPayload,
  EditorCommand,
  ComponentType,
  ComponentProps,
} from '@/domain/schema/index'
import { COMPONENT_DEFAULT_PROPS } from '@/domain/constants/props'
/**
 * 组件树管理器 - 纯函数实现
 * 所有方法都返回新的Page对象，支持时间旅行和协同编辑
 */
export class TreeManager {
  // ==================== 命令执行 ====================

  /**
   * 执行命令（主入口）
   */
  static execute(page: PageSchema, command: EditorCommand): PageSchema {
    switch (command.type) {
      case 'COMPONENT_UPDATE':
        return this.updateComponent(page, command.payload as ComponentUpdatePayload)
      case 'COMPONENT_DELETE':
        return this.deleteComponent(page, command.payload as ComponentDeletePayload)
      case 'COMPONENT_MOVE':
        return this.moveComponent(page, command.payload as ComponentMovePayload)
      case 'COMPONENT_DUPLICATE':
        return this.duplicateComponent(page, command.payload as ComponentDuplicatePayload)
      case 'COMPONENT_CUT':
        return this.cutComponent(page, command.payload as ComponentCutPayload)
      case 'COMPONENT_DROP':
        return this.dropComponent(page, command.payload as ComponentDropPayload)
      case 'BATCH':
        return this.executeBatch(page, command.payload as BatchPayload)
      default:
        return page
    }
  }

  /**
   * 批量执行命令
   */
  static executeBatch(page: PageSchema, payload: { commands: EditorCommand[] }): PageSchema {
    return payload.commands.reduce((currentPage, cmd) => this.execute(currentPage, cmd), page)
  }

  // ==================== 命令操作方法 =======================

  //更新组件属性
  static updateComponent(page: PageSchema, payload: ComponentUpdatePayload): PageSchema {
    const { componentId, updates } = payload
    return produce(page, (draft) => {
      const component = draft.components[componentId]
      //仅属性变更
      if (component) {
        component.props = Object.assign(component.props, updates)
      }
      draft.selectId = componentId
    })
  }

  //删除组件
  static deleteComponent(page: PageSchema, payload: ComponentDeletePayload): PageSchema {
    const { componentId, parentId } = payload

    return produce(page, (draft) => {
      const components = draft.components || {}
      const deleteRelative = (cid: string) => {
        const childrens = components[cid].children || []
        childrens.forEach((childId) => deleteRelative(childId))
        //删除cid所在的节点映射
        delete components[cid]
      }
      //删除目标组件相关的所有节点映射和路径映射
      deleteRelative(componentId)

      const parent = this.findComponentById(draft, parentId)
      if (parent) {
        //从目标组件的父组件children[]中删除相关数据
        const index = parent.children.indexOf(componentId)
        if (index > -1) {
          parent.children.splice(index, 1)
        }
      } else {
        //说明是根节点，从页面的rootComponentIds中删除
        const rootIds = draft.rootComponentIds || []
        const rootIndex = rootIds.indexOf(componentId)
        if (rootIndex > -1) {
          rootIds.splice(rootIndex, 1)
        }
      }
      draft.selectId = null
    })
  }

  //移动组件
  static moveComponent(page: PageSchema, payload: ComponentMovePayload): PageSchema {
    const { componentId, fromParentId, toParentId, fromIndex, toIndex } = payload

    return produce(page, (draft) => {
      const component = draft.components[componentId]
      if (!component) return

      // 1. 从原位置移除
      if (fromParentId) {
        const fromParent = draft.components[fromParentId]
        if (fromParent) {
          fromParent.children.splice(fromIndex, 1)
        }
      } else {
        draft.rootComponentIds.splice(fromIndex, 1)
      }

      // 2. 更新组件parentId
      component.parentId = toParentId

      // 3. 添加到新位置
      if (toParentId) {
        const toParent = draft.components[toParentId]
        if (toParent) {
          toParent.children.splice(toIndex, 0, componentId)
        }
      } else {
        draft.rootComponentIds.splice(toIndex, 0, componentId)
      }
    })
  }

  //复制组件
  static duplicateComponent(page: PageSchema, payload: ComponentDuplicatePayload): PageSchema {
    const { componentId, parentId, create } = payload

    return produce(page, (draft) => {
      //当前被复制的原节点
      const current = this.findComponentById(draft, componentId)
      //复制生成新节点
      const item = this.deepCloneComponent(draft, current, current.parentId, create)
      //新节点加入id-->节点映射
      draft.components[item.id] = item
      //原节点在父容器children中的顺序
      const parent = this.findComponentById(draft, parentId)
      if (parent) {
        const childIds = parent?.children || []
        const childIndex = childIds.indexOf(componentId)
        //新节点id插入父容器children中
        parent?.children.splice(childIndex + 1, 0, item.id)
      } else {
        //说明是根节点，加入页面的rootComponentIds中
        const rootIds = draft.rootComponentIds || []
        const rootIndex = rootIds.indexOf(componentId)
        rootIds.splice(rootIndex + 1, 0, item.id)
      }
      draft.selectId = item.id
    })
  }
  //分割容器组件
  static cutComponent(page: PageSchema, payload: ComponentCutPayload): PageSchema {
    const { componentId, parentId, type, direct } = payload
    if (type === 'sibling') {
      return this.duplicateComponent(page, {
        parentId,
        componentId,
        create: true,
      } as ComponentDuplicatePayload)
    }
    //type==='children'
    return produce(page, (draft) => {
      //为当前组件添加两个子组件
      const current = this.findComponentById(draft, componentId)
      //新生成的子组件1，子组件2
      const item1 = this.deepCloneComponent(draft, current, current.id, true)
      const item2 = this.deepCloneComponent(draft, current, current.id, true)
      item1.props.parentDirect = direct
      item2.props.parentDirect = direct
      //子组件id加入父组件children中
      current.children.push(...[item1.id, item2.id])
      //子组件加入节点映射
      draft.components[item1.id] = item1
      draft.components[item2.id] = item2
      draft.selectId = item1.id
    })
  }
  //拖拽原子组件到放置区域
  static dropComponent(page: PageSchema, payload: ComponentDropPayload): PageSchema {
    const { dropId, type } = payload
    return produce(page, (draft) => {
      const components = draft.components || {}
      const rootIds = draft.rootComponentIds || []
      const drop = this.findComponentById(draft, dropId)
      let item: ComponentSchema
      if (drop) {
        const parent = this.findComponentById(draft, drop.parentId)
        if (drop.props.isContainer) {
          //拖拽组件放置在容器中成为子组件
          item = this.createNewComponent(dropId, type)
          drop.children.push(item.id)
        } else {
          if (parent) {
            //拖拽组件放置在非容器组件中，成为同级组件
            item = this.createNewComponent(drop.parentId, type)
            //子组件id加入父组件children中
            parent.children.push(item.id)
          } else {
            //放置在根页面，成为根组件
            item = this.createNewComponent(dropId, type)
            rootIds.push(item.id)
          }
        }
      } else {
        //放置在根页面，成为根组件
        item = this.createNewComponent(dropId, type)
        rootIds.push(item.id)
      }
      //子组件加入节点映射
      components[item.id] = item
      draft.selectId = item.id
    })
  }

  // ==================== 组件工具方法 ====================

  //查找组件
  static findComponentById(page: PageSchema, componentId: string): ComponentSchema | null {
    return page.components[componentId] || null
  }

  //查找子组件
  static findChildren(page: PageSchema, componentId: string): ComponentSchema[] {
    const component = this.findComponentById(page, componentId)
    if (!component) return []

    return component.children
      .map((id) => this.findComponentById(page, id))
      .filter((c): c is ComponentSchema => c !== null)
  }

  //查找父组件
  static findParent(page: PageSchema, componentId: string): ComponentSchema | null {
    const component = this.findComponentById(page, componentId)
    if (!component || !component.parentId) return null

    return this.findComponentById(page, component.parentId)
  }
  //原子组件创建新组件
  static createNewComponent(parentId: string, type: ComponentType): ComponentSchema {
    return {
      id: generateComponentId(type),
      parentId,
      type,
      props: createDefaultProps(type),
      children: [],
    }
  }

  //深拷贝组件
  static deepCloneComponent(
    page: PageSchema,
    component: ComponentSchema,
    parentId: string,
    empty?: boolean,
  ): ComponentSchema {
    const components = page.components || {}
    const clonedId = generateComponentId(component.type)
    const clonedChildren: string[] = []
    if (!empty && component.children) {
      component.children.forEach((childId) => {
        const childNode = this.findComponentById(page, childId)
        const clonedChild = this.deepCloneComponent(page, childNode, clonedId, false)
        components[clonedChild.id] = clonedChild
        clonedChildren.push(clonedChild.id)
      })
    }
    const cloned: ComponentSchema = {
      id: clonedId,
      parentId,
      type: component.type,
      props: deepClone(component.props),
      children: clonedChildren,
    }
    return cloned
  }

  //获取组件路径（从根到该组件）
  static getComponentPath(page: PageSchema, componentId: string): ComponentSchema[] {
    const path: ComponentSchema[] = []
    let currentId: string | null = componentId

    while (currentId) {
      const component = this.findComponentById(page, currentId)
      if (!component) break

      path.unshift(component)
      currentId = component.parentId
    }

    return path
  }

  //检查是否循环引用
  static willCauseCycle(
    page: PageSchema,
    componentId: string,
    newParentId: string | null,
  ): boolean {
    if (!newParentId) return false

    // 检查newParentId是否是componentId的后代
    let currentId: string | null = newParentId
    while (currentId) {
      if (currentId === componentId) return true
      const component = this.findComponentById(page, currentId)
      currentId = component?.parentId || null
    }

    return false
  }
}

// ==================== 辅助函数 ====================

// 生成随机id
function generateComponentId(type: string): string {
  return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
//属性深拷贝
function deepClone(arg: any, hash = new WeakMap()) {
  //待拷贝数据为null/undefined 原值返回
  if (arg === null || arg === undefined) return arg
  //Date/RegExp类型 返回类型实例
  if (arg instanceof Date) return new Date(arg)
  if (arg instanceof RegExp) return new RegExp(arg)
  //待拷贝数据为基础类型，返回基础类型的拷贝
  if (typeof arg !== 'object') return arg
  //避免重复
  if (hash.get(arg)) return hash.get(arg)
  //待拷贝数据为对象类型
  if (typeof arg === 'object') {
    const result = new arg.constructor()
    hash.set(arg, result)
    for (const key in arg) {
      if (arg.hasOwnProperty(key)) {
        //递归拷贝
        result[key] = deepClone(arg[key], hash)
      }
    }
    return result
  }
}
//获取组件默认属性
export function createDefaultProps(type: ComponentType): ComponentProps {
  switch (type) {
    case 'Container':
      return { ...COMPONENT_DEFAULT_PROPS, flexDirect: 'column', isContainer: true }
    case 'Form':
      return { ...COMPONENT_DEFAULT_PROPS, tabTitle: '表单标题', isContainer: true }
    case 'AdvanceForm':
      return { ...COMPONENT_DEFAULT_PROPS, isContainer: true }
    case 'EvelatorForm':
      return {
        ...COMPONENT_DEFAULT_PROPS,
        tabTitle: '电梯表单',
        showAnchor: true,
        direct: 0,
        isContainer: true,
      }
  }
  return COMPONENT_DEFAULT_PROPS
}
