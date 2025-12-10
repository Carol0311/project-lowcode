<template>
  <div
    :class="{
      [commonClass]: true,
      border: children && children?.length < 1,
      'flex-col': flexDirect === 'column',
      'flex-row': flexDirect === 'row',
    }"
  >
    <template v-if="children && children.length > 0">
      <component
        :is="get(com.type)"
        v-for="com in children"
        :key="com.id"
        :data="com"
        :data-id="com.id"
        @click.stop="clickRef(com)"
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
const { currentPage, selectedComponent } = storeToRefs(editorStore)
const { cutComponent } = editorStore
const { handleDropEvt, handleDragover } = useDragStore()
const props = defineProps<{
  data: ComponentSchema
}>()
const children = ref<ComponentSchema[]>([])
const flexDirect = ref(props.data.props.flexDirect)
const eventBus = useEventBus()
const commonClass = 'small-container flex flex-1 border-dotted border-zinc-300 justify-start'
const clickRef = (com: ComponentSchema) => {
  selectedComponent.value = com
}
watch(
  [
    () => currentPage && currentPage.value && currentPage.value.components,
    () => props.data.children,
  ],
  ([components, childIds]) => {
    if (components) {
      children.value = (childIds as string[]).map((id) => components[id])
    }
  },
  { immediate: true, deep: true },
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
