import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ComponentType } from '@/domain/schema/index'
import { useEditorStore } from './editorStore'
//处理拖拽相关状态
export const useDragStore = defineStore('drag', () => {
  const editorStore = useEditorStore()
  const { dropComponent } = editorStore
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
    currentDrop.value = dropId
    dropComponent(dropId, currentDragType.value)
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
