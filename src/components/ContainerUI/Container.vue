<template>
  <div
    :class="{
      [commonClass]: true,
      border: children && children?.length < 1,
      'flex-col': flexDirect === 'column',
      'flex-row': flexDirect === 'row',
    }"
    :data-id="data.id"
    @click.stop="clickRef"
  >
    <template v-if="children && children.length > 0">
      <component
        :is="get(com.type)"
        v-for="com in children"
        :key="com.id"
        :data="com"
        @dragover.prevent.stop="handleDragover(com.id)"
        @drop.stop="handleDropEvt(com.id)"
      ></component>
    </template>
    <div v-else class="empty-placeholder min-h-16 flex justify-center items-center text-zinc-500">
      拖拽组件或模版到这里
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useEventBus } from '@/composables/useEventBus'
import { useEditorStore } from '@/stores/editorStore'
import { componentRegistry } from '@/infra/registry/componentRegistry'
import { ComponentSchema } from '@/domain/schema/component'
import { useDragStore } from '@/stores/dragStore'
const { get } = componentRegistry
const editorStore = useEditorStore()
const { currentPage } = storeToRefs(editorStore)
const { cutComponent } = editorStore
const { handleDropEvt, handleDragover } = useDragStore()
const props = defineProps<{
  data: ComponentSchema
}>()
const children = ref([])
const flexDirect = ref(props.data.props.flexDirect)
const eventBus = useEventBus()
const commonClass = 'small-container flex flex-1 border-dotted border-zinc-300 justify-start'
const clickRef = (e: Event) => {
  const target = e.currentTarget as HTMLElement
  const pos = target.getBoundingClientRect()
  eventBus.emit('updateToolPos', {
    isContainer: true,
    parent: props.data.parentId,
    cid: props.data.id,
    left: pos.left,
    top: pos.top,
    width: pos.width,
    height: pos.height,
  })
  eventBus.emit('initEditingProps', { ...props.data.props, isForm: true, cid: props.data.id })
}
watch(
  () => currentPage && currentPage.value && currentPage.value.components,
  (components, oldVal) => {
    if (components) {
      children.value = props.data.children.map((id) => components[id])
    }
  },
  { deep: true },
)
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
