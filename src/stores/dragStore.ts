import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { ComponentSchema, ComponentType } from '@/domain/schema/component'
import { useEditorStore } from './editorStore'
const FormArr = ['Container', 'Form', 'AdvanceForm', 'EvelatorForm']
//处理拖拽相关状态
export const useDragStore = defineStore('drag', () => {
  const editorStore = useEditorStore()
  const { currentPage } = storeToRefs(editorStore)
  const { findComponentById, createNewComponent } = editorStore
  //当前拖拽组件类型
  const currentDragType = ref<ComponentType>()
  //当前拖拽组件
  const currentDrag = ref<string>('')
  //当前拖拽悬停组件
  const currentDragover = ref<string>('')
  //当前拖拽放置组件
  const currentDrop = ref<string>('')

  //拖拽开始事件
  const handleDragStart = (dragType: string, dragId?: string) => {
    currentDragType.value = dragType as ComponentType
    currentDrag.value = dragId
  }
  //拖拽悬停事件
  const handleDragover = (dragOverId: string) => {
    currentDragover.value = dragOverId
  }
  //拖拽放置事件
  const handleDropEvt = (dropId: string) => {
    const components = currentPage.value?.components || {}
    const children = currentPage.value?.children || {}
    currentDrop.value = dropId
    const drop = findComponentById(dropId)
    let item = <ComponentSchema>{}
    const isForm = FormArr.includes(drop.type)
    if (isForm) {
      //拖拽组件放置在容器中成为子组件
      item = createNewComponent(dropId, currentDragType.value)
      //子组件id加入父组件children中
      drop.children.push(item.id)
    } else {
      //拖拽组件放置在非容器组件中，成为同级组件
      item = createNewComponent(drop.parentId, currentDragType.value)
      //子组件id加入父组件children中
      const parent = findComponentById(drop.parentId)
      parent.children.push(item.id)
    }
    //子组件加入节点映射
    components[item.id] = item
    //子组件加入id-->childrenIds映射
    const ids = children[dropId] || []
    ids.push(item.id)
    children[dropId] = ids
  }

  return {
    currentDrag,
    currentDragover,
    currentDrop,
    handleDragStart,
    handleDragover,
    handleDropEvt,
  }
})
