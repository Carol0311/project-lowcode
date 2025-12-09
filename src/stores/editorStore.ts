import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { deepClone, generateUniqueId } from '@/utils/index'
import { ComponentSchema } from '@/domain/schema/component'
import { ProjectSchema } from '@/domain/schema/project'
import { PageSchema } from '@/domain/schema/page'

export const useEditorStore = defineStore('editor', () => {
  //所有页面
  const project = reactive<Omit<ProjectSchema, 'pages'>>({
    id: 'lowcode',
    name: '智能商品档案--低代码平台',
    homePageId: 'appPage',
  })

  //所有页面
  const pages = reactive<Record<string, PageSchema>>({})

  //当前页面Id
  const currentPageId = ref<string>('')

  //当前页面
  const currentPage = computed(() => pages[currentPageId.value])

  //当前选中的组件
  const selectedComponent = ref<ComponentSchema | null>(null)

  //添加页面
  const setPage = (pageId: string, page: PageSchema) => {
    pages[pageId] = page
  }

  //获取项目
  const getProject = computed(() => {
    return { ...project, pages: pages.value }
  })

  //根据id查找组件
  const findComponentById = (id: string): ComponentSchema | null => {
    const components = currentPage.value?.components || {}
    if (components.hasOwnProperty(id)) {
      return components[id]
    }
    return null
  }
  //根据id查其对应的子节点
  const findChildrenNodesById = (id: string): ComponentSchema[] | null => {
    const components = currentPage.value?.components || {}
    const children = currentPage.value?.children || {}
    if (children.hasOwnProperty(id)) {
      const childrenIds = children[id] || []
      return childrenIds.map((childId) => components[childId])
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
  const addComponent = (id: string, parentId: string | null, component: ComponentSchema) => {
    const components = currentPage.value?.components || new Map()
    //新节点加入id-->节点映射
    components[id] = component

    if (parentId) {
      const children = currentPage.value?.children || new Map()
      //新节点加入id--->childrenIds映射
      const ids = children[parentId] || []
      if (ids.indexOf(id) > -1) {
        ids.push(id)
      }
      children[parentId] = ids
    }
  }
  //删除指定组件
  const deleteComponent = (parentId: string, id: string) => {
    const components = currentPage.value?.components || new Map()
    const children = currentPage.value?.children || new Map()
    const deleteRelative = (cid: string) => {
      const childrens = children[cid] || []
      childrens.forEach((childId) => deleteRelative(childId))
      //删除cid所在的节点映射
      delete components[cid]
      //删除cid所在的路径映射
      delete children[cid]
    }
    //删除目标节点相关的所有节点映射和路径映射
    deleteRelative(id)
    //从目标节点的父节点中删除相关数据
    if (parentId) {
      const siblings = children[parentId]
      if (siblings) {
        const index = siblings.indexOf(id)
        if (index > -1) {
          siblings.splice(index, 1)
        }
      }
    }
  }
  //组件深拷贝
  const deepCloneComponent = (
    node: ComponentSchema,
    self?: boolean,
    empty?: boolean,
  ): ComponentSchema => {
    const cloned: ComponentSchema = {
      id: generateUniqueId(node.type),
      parentId: self ? node.id : node.parentId,
      type: node.type,
      props: deepClone(node.props),
      children: empty ? [] : node.children,
    }
    return cloned
  }

  //复制组件
  const copyComponent = (parentId: string, id: string, create: boolean) => {
    const components = currentPage.value?.components || new Map()
    const children = currentPage.value?.children || new Map()
    //当前被复制的原节点
    const current = findComponentById(id)
    //原节点在id--->childrenIds映射中的顺序
    const ids = children[parentId] || []
    const index = ids.indexOf(id)
    //原节点在父容器children中的顺序
    const parent = findComponentById(parentId)
    const childIds = parent?.children || []
    const childIndex = childIds.indexOf(id)
    //复制生成新节点
    const item = deepCloneComponent(current, false, create)
    //新节点id插入父容器children中
    parent?.children.splice(childIndex + 1, 0, item.id)
    //新节点加入id-->节点映射
    components[item.id] = item
    ////新节点插入对应位置的id--->childrenIds映射
    ids.splice(index + 1, 0, item.id)
  }
  //插入组件
  const cutComponent = (parentId: string, id: string, direct: string, type: string) => {
    const components = currentPage.value?.components || new Map()
    const children = currentPage.value?.children || new Map()
    if (type === 'sibling') {
      //为当前组件添加一个相邻组件
      copyComponent(parentId, id, true)
    } else if (type === 'children') {
      //为当前组件添加两个子组件
      const current = findComponentById(id)
      //新生成的子组件1，子组件2
      const item1 = deepCloneComponent(current, true, true)
      const item2 = deepCloneComponent(current, true, true)
      item1.props.parentDirect = direct
      item2.props.parentDirect = direct
      //子组件id加入父组件children中
      current.children.push(...[item1.id, item2.id])
      //子组件加入节点映射
      components[item1.id] = item1
      components[item2.id] = item2
      //子组件加入id-->childrenIds映射
      const ids = children[id] || []
      ids.push(...[item1.id, item2.id])
      children[id] = ids
    }
  }
  return {
    project: getProject,
    currentPageId,
    currentPage,
    selectedComponent,
    setPage,
    findComponentById,
    findChildrenNodesById,
    addComponent,
    deleteComponent,
    copyComponent,
    cutComponent,
    updateComponentById,
  }
})
