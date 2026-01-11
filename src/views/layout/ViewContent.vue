<template>
  <div>
    <PagesTab @show-edit="(arg) => showToolEvt(arg)" />
    <div
      ref="viewRef"
      class="overflow-auto p-3 relative flex-1"
      @dragover.prevent.stop="handleDragover(currentPageId)"
      @drop.stop="handleDropEvt(currentPageId)"
    >
      <component
        :is="get(com.type)"
        v-for="com in rootComponents || []"
        :key="com.id"
        :data="com"
        :data-id="com.id"
        @click.stop="clickRef(com.id)"
        @dragover.prevent.stop="handleDragover(com.id)"
        @drop.stop="handleDropEvt(com.id)"
      />
      <Edit v-show="showTool" @show-edit="(arg) => showToolEvt(arg)" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, watch, onUnmounted, onMounted, computed, useTemplateRef } from 'vue'
import { Edit } from '@/components/ToolUI'
import { eventBus } from '@/infra/bus/eventBus'
import { useScrollPosition } from '@/composables/useScrollPosition'
import { componentRegistry } from '@/infra/registry/componentRegistry'
import { useProjectStore, useEditorStore, useDragStore } from '@/stores'

import { getPageDetail, getPageList } from '@/infra/http/editorApi'
import PagesTab from './PagesTab.vue'

const { get } = componentRegistry

const editorStore = useEditorStore()
const projectStore = useProjectStore()

const { currentPage, currentPageId } = storeToRefs(editorStore)

const { setProject } = projectStore
const { setCurrentPage, setSelectedComponent } = editorStore

const { handleDropEvt, handleDragover } = useDragStore()

onMounted(() => {
  getPageList().then((res) => {
    if (res.success && res.data) {
      setProject(res.data.pageList)
      if (res.data.pageList.length > 0) {
        setCurrentPage(res.data.pageList[0])
      }
    }
  })
})
//根页面组件
const rootComponents = computed(() => {
  const components = currentPage.value?.components || {}
  const rootIds = currentPage.value?.rootComponentIds || []
  return rootIds.map((id) => components[id])
})
//点击组件选中
const clickRef = (componentId: string) => {
  setSelectedComponent(componentId)
}
watch(
  () => currentPageId.value,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      getPageDetail({ id: newId }).then((res) => {
        if (res.success) {
          setCurrentPage(res.data)
        }
      })
    }
  },
  { immediate: true, deep: true },
)
//显示组件编辑工具栏
const showTool = ref(false)
const showToolEvt = (arg: boolean) => {
  showTool.value = arg
}
//页签选择与页面滚动联动事件处理
const viewRef = useTemplateRef('viewRef')
const scrollPosition = useScrollPosition()
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
  setSelectedComponent(null)
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
