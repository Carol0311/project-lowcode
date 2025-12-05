import type { Component } from 'vue'
import { defineStore } from 'pinia'
import { ref, reactive, computed, markRaw } from 'vue'
import { deepClone, generateUniqueId, getComponentName } from '@/utils/index'
//组件类型声明
interface ComponentNode {
  id: string
  parent: string
  type: Component
  props: Record<string, any>
  children?: ComponentNode[]
}
//页面类型声明
interface PageConfig {
  id: string
  components: ComponentNode[]
}
export const useEditorStore = defineStore('editor', () => {
  //所有页面
  const pages = reactive<Record<string, PageConfig>>({})

  //当前页面Id
  const currentPageId = ref<string>('')

  //当前页面
  const currentPage = computed(() => pages[currentPageId.value])

  //当前选中的组件
  const selectedComponent = ref<ComponentNode | null>(null)

  //根据id查找组件
  const findComponentById = (id: string, nodes?: ComponentNode[]): ComponentNode | null => {
    const searchNodes = nodes || currentPage.value?.components || []
    for (const node of searchNodes) {
      if (node.id === id) return node
      if (node.children) {
        //递归查找
        const found = findComponentById(id, node.children)
        if (found) return found
      }
    }
    return null
  }
  //更新指定组件的属性值
  const updateComponentById = (id: string, data: Record<string, any>) => {
    const component = findComponentById(id)
    if (component) {
      component.props = Object.assign(component.props, data)
    }
  }
  //增加组件
  const addComponentById = (parentId: string | null, component: ComponentNode) => {
    if (parentId) {
      const parent = findComponentById(parentId)
      parent?.children?.push(component)
    } else {
      currentPage.value.components.push(component)
    }
  }
  //删除指定位置的组件
  const deleteComponent = (parentId: string, id: string) => {
    const parent = findComponentById(parentId)
    const index = parent?.children?.findIndex((child) => child.id === id)
    if (index !== undefined && index !== -1) {
      parent?.children?.splice(index, 1)
    }
  }
  //组件深拷贝
  const deepCloneComponent = (node: ComponentNode, self?: boolean): ComponentNode => {
    const name = getComponentName(node.type as Component)
    const cloned: ComponentNode = {
      id: generateUniqueId(name),
      parent: self ? node.id : node.parent,
      type: markRaw(node.type as Component),
      props: deepClone(node.props), //属性深拷贝
      children: node.children ? node.children.map((child) => deepCloneComponent(child)) : undefined,
    }
    return cloned
  }

  //复制组件
  const copyComponent = (parentId: string, id: string) => {
    const parent = findComponentById(parentId)
    if (parent) {
      const index = parent.children?.findIndex((child) => child.id === id)
      if (index !== undefined && index !== -1) {
        const child = parent.children?.[index]
        if (child) {
          const item = deepCloneComponent(child)
          item.props.parentDirect = parent.props.flexDirect
          parent.children?.splice(index, 0, item)
        }
      }
    } else {
      //页面根节点插入组件
      const root = currentPage.value?.components
      const current = findComponentById(id)
      if (current) {
        const item = deepCloneComponent(current)
        root.push(item)
      }
    }
  }
  //插入组件
  const cutComponent = (parentId: string, id: string, direct: string, type: string) => {
    if (type === 'sibling') {
      //为当前组件添加一个相邻组件
      copyComponent(parentId, id)
    } else if (type === 'children') {
      //为当前组件添加两个子组件
      const current = findComponentById(id)
      if (current) {
        if (!current.children) {
          current.children = []
        }
        const item1 = deepCloneComponent(current, true)
        const item2 = deepCloneComponent(item1)
        item1.props.parentDirect = direct
        item2.props.parentDirect = direct
        current.children.push(...[item1, item2])
      }
    }
  }
  return {
    pages,
    currentPageId,
    currentPage,
    selectedComponent,
    findComponentById,
    addComponentById,
    deleteComponent,
    copyComponent,
    cutComponent,
    updateComponentById,
  }
})
