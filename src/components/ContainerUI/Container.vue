<template>
  <div
    :class="{
      [commonClass]: true,
      border: children && children?.length < 1,
      'flex-col': config.flexDirect === 'column',
      'flex-row': config.flexDirect === 'row',
    }"
  >
    <template v-if="children && children.length > 0">
      <component
        :is="get(com.type)"
        v-for="com in children"
        :key="com.id"
        :data="com"
        :data-id="com.id"
        @click.stop="clickRef(com.id)"
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
import { computed } from 'vue'
import { componentRegistry } from '@/infra/registry/componentRegistry'
import { ComponentSchema } from '@/domain/schema/component'
import { useEditorStore, useDragStore } from '@/stores'
import { useUiConfig } from '@/composables/useUiConfig'
const { get } = componentRegistry

const editorStore = useEditorStore()
const { currentPage } = storeToRefs(editorStore)
const { setSelectedComponent } = editorStore

const { handleDropEvt, handleDragover } = useDragStore()

const props = defineProps<{
  data: ComponentSchema
}>()
const ui = useUiConfig(props.data.id)
const { config } = ui
const children = computed(() => {
  const components = currentPage.value?.components || {}
  return props.data.children.map((id) => components[id])
})
const commonClass = 'small-container flex flex-1 border-dotted border-zinc-300 justify-start'
const clickRef = (componentId: string) => {
  setSelectedComponent(componentId)
}
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
