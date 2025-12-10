<template>
  <div ref="viewRef" class="overflow-auto p-3 relative">
    <component
      :is="get(com.type)"
      v-for="com in components || []"
      :key="com.id"
      :data="com"
      :data-id="com.id"
      @click.stop="clickRef(com)"
      @dragover.prevent.stop="handleDragover(com.id)"
      @drop.stop="handleDropEvt(com.id)"
    />
    <Edit v-show="showTool" @show-edit="(arg) => (showTool = arg)" />
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, watch, onUnmounted, onMounted, computed } from 'vue'
import { useEventBus } from '@/composables/useEventBus'
import { useScrollPosition } from '@/composables/useScrollPosition'
import { componentRegistry } from '@/infra/registry/componentRegistry'
import { ComponentSchema } from '@/domain/schema/component'
import { Edit } from '@/components/ToolUI/index'
import { useEditorStore } from '@/stores/editorStore'
import { PageSchema } from '@/domain/schema/page'
import { useDragStore } from '@/stores/dragStore'
import { generateUniqueId } from '@/utils/index'
const { get } = componentRegistry
const editorStore = useEditorStore()
const { selectedComponent, currentPage } = storeToRefs(editorStore)
const { setPage } = editorStore
const { handleDropEvt, handleDragover } = useDragStore()
//后续通过api请求获取默认页面
const defaultPageId = generateUniqueId('Page')
const defaultRootViewId = generateUniqueId('View')
const defaultRootComId = generateUniqueId('Container')

const defaultComponent = <ComponentSchema>{
  id: defaultRootComId,
  parentId: defaultRootViewId,
  type: 'Container',
  props: {
    flexDirect: 'column',
  },
  children: [],
}
const page = <PageSchema>{
  id: defaultRootViewId,
  name: '默认编辑页面',
  rootComponentIds: [defaultRootComId],
  components: { [defaultRootComId]: defaultComponent },
  children: { [defaultRootViewId]: [defaultRootComId] },
}
onMounted(() => {
  editorStore.currentPageId = defaultPageId
  setPage(defaultPageId, page)
})
const components = ref<ComponentSchema[]>([])
const clickRef = (com: ComponentSchema) => {
  selectedComponent.value = com
}
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
  () => currentPage && currentPage.value && currentPage.value.rootComponentIds,
  (rootIds, old) => {
    if (rootIds) {
      components.value = rootIds.map((id) => currentPage.value.components[id])
    }
  },
  { deep: true },
)
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
})
</script>
<style scoped></style>
