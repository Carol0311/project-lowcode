<template>
  <div ref="anchorGroup" class="smart-tabgroup">
    <div v-if="data.props.showAnchor" class="smart-tabgroup-anchor bg-white">
      <div class="inline-flex bg-gray-100 p-1 rounded relative">
        <div
          class="anchor-list flex items-center"
          :class="{ 'flex-row': data.props.direct === 0, 'flex-col': data.props.direct === 1 }"
        >
          <div
            v-for="(tab, i) in data.children"
            :key="i"
            class="item px-4 h-6 leading-6 cursor-pointer z-10"
            :class="{ 'text-orange-300': active === i }"
            @click="(e) => clickEvt(i, e)"
          >
            {{ tab.props.tabTitle }}
          </div>
        </div>
        <div
          class="anchor-animation absolute rounded bg-white text-orange-300 z-0"
          :style="anchorStyle"
        ></div>
      </div>
    </div>
    <div>
      <component
        :is="child.type"
        v-for="child in data.children"
        :key="child.id"
        class="smart-tab"
        :data="child"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Component } from 'vue'
import { ref, useTemplateRef, onMounted, onUnmounted } from 'vue'
import { useEventBus } from '@/composables/useEventBus'
import { useEditorStore } from '@/stores/editorStore'
const editorStore = useEditorStore()
const { deleteComponent } = editorStore
interface ComponentNode {
  id: string
  parent: string
  type: Component
  props: Record<string, any>
  children?: ComponentNode[]
}
const eventBus = useEventBus()
const anchorGroup = useTemplateRef<HTMLElement>('anchorGroup')
const active = ref(0)
const tabsTop: number[] = []
const anchorsList: number[][] = []
const props = defineProps<{
  data: ComponentNode
}>()
const anchorStyle = ref<{
  width?: string
  height?: string
  transform?: string
}>()
onMounted(() => {
  const tabs = anchorGroup.value?.querySelectorAll('.smart-tab') as NodeListOf<HTMLElement>
  const anchors = anchorGroup.value?.querySelectorAll(
    '.anchor-list .item',
  ) as NodeListOf<HTMLElement>
  ;[...anchors?.entries()].forEach(([_i, anchor]) => {
    anchorsList.push([anchor.clientWidth, anchor.clientHeight])
  })
  Array.from(tabs?.entries()).forEach(([_index, node]) => {
    tabsTop.push(node.offsetTop)
  })
  eventBus.emit('init-related-scroll', tabsTop)
})
const clickEvt = function (index: any, e: any) {
  active.value = index
  anchorStyle.value = {
    width: `${e.target.clientWidth}px`,
    height: `${e.target.clientHeight}px`,
    transform: `translateX(${e.target.clientWidth * index}px)`,
  }
  eventBus.emit('scroll-root', { top: tabsTop[index] })
}
eventBus.on('select-tab', (options: any) => {
  active.value = options.active
  const anchor = anchorsList[options.active] ?? [56, 24]
  anchorStyle.value = {
    width: `${anchor[0]}px`,
    height: `${anchor[1]}px`,
    transform: `translateX(${anchor[0] ?? 56 * options.active}px)`,
  }
})
eventBus.on('deleteComponent', (data) => {
  if (data.pid === props.data.id) {
    deleteComponent(data.pid, data.cid)
  }
})
onUnmounted(() => {
  eventBus.off('init-related-scroll')
  eventBus.off('scroll-root')
  eventBus.off('select-tab')
})
</script>
<style scoped>
.anchor-animation {
  width: 58px;
  height: 24px;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  transition-duration: 0.5s;
}
</style>
