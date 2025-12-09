<template>
  <div ref="viewRef" class="overflow-auto p-3 relative">
    <component
      :is="get(com.type)"
      v-for="com in components || []"
      :key="com.id"
      :data="com"
      @dragover.prevent.stop="handleDragover(com.id)"
      @drop.stop="handleDropEvt(com.id)"
    />
    <Edit v-show="showTool" @show-edit="(arg) => (showTool = arg)" />
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onUnmounted, onMounted, computed } from 'vue'
import { useEventBus } from '@/composables/useEventBus'
import { useScrollPosition } from '@/composables/useScrollPosition'
import { componentRegistry } from '@/infra/registry/componentRegistry'
import { ComponentSchema } from '@/domain/schema/component'
import { Edit } from '@/components/ToolUI/index'
import { useEditorStore } from '@/stores/editorStore'
import { PageSchema } from '@/domain/schema/page'
import { useDragStore } from '@/stores/dragStore'
const { get } = componentRegistry
const editorStore = useEditorStore()
const { setPage } = editorStore
const { handleDropEvt, handleDragover } = useDragStore()
const defaultComponent = <ComponentSchema>{
  id: 'Container_1',
  parentId: 'viewRef',
  type: 'Container',
  props: {
    flexDirect: 'column',
  },
  children: [],
}
const page = <PageSchema>{
  id: 'viewRef',
  name: '',
  rootComponentIds: ['Container_1'],
  components: { Container_1: defaultComponent },
  children: {},
}
onMounted(() => {
  editorStore.currentPageId = 'pageDefault'
  setPage('pageDefault', page)
})
const components = computed(() => {
  return page.rootComponentIds.map((id) => page.components[id])
})
const viewRef = ref<HTMLElement>()
const eventBus = useEventBus()
const scrollPosition = useScrollPosition()
const showTool = ref(false)
let tabsTop: number[] = []
eventBus.on('init-related-scroll', (tops: number[]) => {
  tabsTop = tops
})
eventBus.on('scroll-root', (options: ScrollToOptions) => {
  if (viewRef.value) {
    viewRef.value.scrollTo({ top: options.top || 0 })
  }
})
watch(
  viewRef,
  (newContainer) => {
    if (newContainer) {
      scrollPosition.setContainer(newContainer)
    }
  },
  { immediate: true },
)
const { scrollY } = scrollPosition
watch(scrollY, (newY) => {
  showTool.value = false
  let midValue = tabsTop[0] ?? 0
  if (tabsTop.length > 0 && newY > midValue) {
    let i = Math.floor(tabsTop.length / 2)
    midValue = tabsTop[i] ?? 0
    i = newY > midValue ? i + 1 : i - 1
    eventBus.emit('select-tab', { active: i })
  }
})
onUnmounted(() => {
  eventBus.off('init-related-scroll')
  eventBus.off('scroll-root')
  eventBus.off('select-tab')
})
</script>
<style scoped></style>
