<template>
  <div
    ref="viewRef"
    class="overflow-auto p-3 relative"
    @dragover.prevent.stop="handleDragover(defaultRootViewId)"
    @drop.stop="handleDropEvt(defaultRootViewId)"
  >
    <component
      :is="get(com.type)"
      v-for="com in rootComponents || []"
      :key="com.id"
      :data="com"
      :data-id="com.id"
      @click.stop="clickRef(com)"
      @dragover.prevent.stop="handleDragover(com.id)"
      @drop.stop="handleDropEvt(com.id)"
    />
    <Edit v-show="showTool" @show-edit="(arg) => showToolEvt(arg)" />
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, watch, onUnmounted, onMounted, computed, useTemplateRef } from 'vue'
import { useEventBus } from '@/composables/useEventBus'
import { useScrollPosition } from '@/composables/useScrollPosition'
import { componentRegistry } from '@/infra/registry/componentRegistry'
import { ComponentSchema, PageSchema } from '@/domain/schema/index'
import { Edit } from '@/components/ToolUI/index'
import { useEditorStore } from '@/stores/editorStore'
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
//根页面组件
const rootComponents = computed(() => {
  const components = currentPage.value?.components || {}
  const rootIds = currentPage.value?.rootComponentIds || []
  return rootIds.map((id) => components[id])
})
//点击组件选中
const clickRef = (com: ComponentSchema) => {
  selectedComponent.value = com
}
//显示组件编辑工具栏
const showToolEvt = (arg: boolean) => {
  showTool.value = arg
}
//页签选择与页面滚动联动事件处理
const viewRef = useTemplateRef('viewRef')
const eventBus = useEventBus()
const scrollPosition = useScrollPosition()
const showTool = ref(false)
let tabsTop: number[] = []
const onInitRelated = (tops: number[]) => {
  tabsTop = tops
}
const onScrollRoot = (options: ScrollToOptions) => {
  if (viewRef.value) {
    viewRef.value.scrollTo({ top: options.top || 0 })
  }
}
eventBus.on('init-related-scroll', onInitRelated)
eventBus.on('scroll-root', onScrollRoot)
onUnmounted(() => {
  eventBus.off('init-related-scroll', onInitRelated)
  eventBus.off('scroll-root', onScrollRoot)
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
</script>
<style scoped></style>
