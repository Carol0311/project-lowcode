import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { ComponentSchema, ComponentType } from '@/domain/schema/index'
import { useEditorStore } from './editorStore'
const FormArr = ['Container', 'Form', 'AdvanceForm', 'EvelatorForm']
//处理拖拽相关状态
export const useDragStore = defineStore('drag', () => {
  const editorStore = useEditorStore()
  const { currentPage } = storeToRefs(editorStore)
  const { findComponentById, createNewComponent, addComponentToRoot } = editorStore
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
    currentDrop.value = dropId
    const drop = findComponentById(dropId)
    let item: ComponentSchema
    if (drop) {
      const parent = findComponentById(drop.parentId)
      const isForm = FormArr.includes(drop.type)
      if (isForm) {
        //拖拽组件放置在容器中成为子组件
        item = createNewComponent(dropId, currentDragType.value)
        drop.children.push(item.id)
      } else {
        if (parent) {
          //拖拽组件放置在非容器组件中，成为同级组件
          item = createNewComponent(drop.parentId, currentDragType.value)
          //子组件id加入父组件children中
          parent.children.push(item.id)
        } else {
          //放置在根页面，成为根组件
          item = addComponentToRoot(dropId, currentDragType.value)
        }
      }
    } else {
      //放置在根页面，成为根组件
      item = addComponentToRoot(dropId, currentDragType.value)
    }
    //子组件加入节点映射
    components[item.id] = item
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
