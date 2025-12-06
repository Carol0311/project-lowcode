<template>
  <div
    :class="{
      [commonClass]: true,
      border: data.children && data.children?.length < 1,
      'flex-col': flexDirect === 'column',
      'flex-row': flexDirect === 'row',
    }"
    :data-id="data.id"
    @click.stop="clickRef"
  >
    <template v-if="data.children && data.children.length > 0">
      <component :is="com.type" v-for="com in data.children" :key="com.id" :data="com"></component>
    </template>
    <div v-else class="empty-placeholder min-h-16 flex justify-center items-center text-zinc-500">
      拖拽组件或模版到这里
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, type Component } from 'vue'
import { useEventBus } from '@/composables/useEventBus'
import { useEditorStore } from '@/stores/editorStore'
const editorStore = useEditorStore()
const { cutComponent } = editorStore
interface ComponentNode {
  id: string
  parent: string
  type: Component
  props: Record<string, any>
  children?: ComponentNode[]
}
const props = defineProps<{
  data: ComponentNode
}>()
const flexDirect = ref(props.data.props.flexDirect)
const eventBus = useEventBus()
const commonClass = 'small-container flex flex-1 border-dotted border-zinc-300 justify-start'
const clickRef = (e: Event) => {
  const target = e.currentTarget as HTMLElement
  const pos = target.getBoundingClientRect()
  eventBus.emit('updateToolPos', {
    isContainer: true,
    parent: props.data.parent,
    cid: props.data.id,
    left: pos.left,
    top: pos.top,
    width: pos.width,
    height: pos.height,
  })
  eventBus.emit('initEditingProps', { ...props.data.props, isForm: true, cid: props.data.id })
}
eventBus.on('cutContainer', (args: any) => {
  //direct与父容器中的flex-direction方向相同则为自身增加一个相邻组件
  //direct与父容器中的flex-direction方向相反则为自身增加两个子组件
  //无方向时，均为给自身增加两个字节点
  //同时设计高度宽度计算
  if (args.cid === props.data.id) {
    const { pid, cid, direct } = args
    const parentDirect = props.data.props.parentDirect || 'column'
    const type = direct === parentDirect ? 'sibling' : 'children'
    cutComponent(pid, cid, direct, type)
    if (type === 'children') {
      flexDirect.value = direct
    }
  }
})
</script>
<style scoped>
.small-container {
  min-height: max-content;
  gap: 0.5rem;
}
.empty-placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
}
.container-devider {
  left: 0;
  top: 0;
  z-index: 100000;
}
</style>
