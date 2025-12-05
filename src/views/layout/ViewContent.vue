<template>
  <div ref="viewRef" class="overflow-auto p-3 relative">
    <component
      v-for="com in currentPage?.components || []"
      :key="com.id"
      :is="com.type"
      :data="com"
      @drop="dropEvt"
    />
    <Edit @show-edit="(arg) => (showTool = arg)" v-show="showTool" />
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, watch, onUnmounted, onMounted } from 'vue'
import { useEventBus } from '@/composables/useEventBus'
import { useScrollPosition } from '@/composables/useScrollPosition'
import { useDynComponent } from '@/composables/useDynComponent'
/**import EvelatorForm from '@/components/ContainerUI/EvelatorForm.vue'
import Container from '@/components/ContainerUI/Container.vue'
import { Text } from '@/components/UintUI'
import Form from '@/components/ContainerUI/Form.vue'*/
import Edit from '@/components/ToolUI/Edit.vue'
import { useEditorStore } from '@/stores/editorStore'
const editorStore = useEditorStore()
const { currentPage } = storeToRefs(editorStore)
const dynComponent = useDynComponent()
const { getComponent } = dynComponent
onMounted(() => {
  editorStore.currentPageId = 'viewDemo'
  editorStore.pages['viewDemo'] = {
    id: 'viewRef',
    components: [
      {
        id: 'Container_1',
        parent: 'viewRef',
        type: getComponent('Container'),
        props: {
          flexDirect: 'column',
        },
        children: [],
      },
    ],
  }
  /**editorStore.pages['viewDemo'] = {
    id: 'viewRef',
    components: [
      {
        id: 'EvelatorForm_1',
        parent: 'viewRef',
        type: markRaw(EvelatorForm),
        props: {
          direct: 0,
          showAnchor: true,
        },
        children: [
          {
            id: 'Form_1',
            parent: 'EvelatorForm_1',
            type: markRaw(Form),
            props: {
              tabTitle: 'tab1',
            },
            children: [
              { id: 'Text_1', parent: 'Form_1', type: markRaw(Text), props: {} },
              { id: 'Text_2', parent: 'Form_1', type: markRaw(Text), props: {} },
              { id: 'Text_3', parent: 'Form_1', type: markRaw(Text), props: {} },
              { id: 'Text_4', parent: 'Form_1', type: markRaw(Text), props: {} },
            ],
          },
          {
            id: 'Form_2',
            parent: 'EvelatorForm_1',
            type: markRaw(Form),
            props: {
              tabTitle: 'tab2',
            },
            children: [
              { id: 'Text_5', parent: 'Form_2', type: markRaw(Text), props: {} },
              { id: 'Text_6', parent: 'Form_2', type: markRaw(Text), props: {} },
              { id: 'Text_7', parent: 'Form_2', type: markRaw(Text), props: {} },
              { id: 'Text_8', parent: 'Form_2', type: markRaw(Text), props: {} },
            ],
          },
          {
            id: 'Form_3',
            parent: 'EvelatorForm_1',
            type: markRaw(Form),
            props: {
              tabTitle: 'tab3',
            },
            children: [
              { id: 'Text_9', parent: 'Form_3', type: markRaw(Text), props: {} },
              { id: 'Text_10', parent: 'Form_3', type: markRaw(Text), props: {} },
              { id: 'Text_11', parent: 'Form_3', type: markRaw(Text), props: {} },
              { id: 'Text_12', parent: 'Form_3', type: markRaw(Text), props: {} },
            ],
          },
          {
            id: 'Form_4',
            parent: 'EvelatorForm_1',
            type: markRaw(Form),
            props: {
              tabTitle: 'tab4',
            },
            children: [
              { id: 'Text_13', parent: 'Form_4', type: markRaw(Text), props: {} },
              { id: 'Text_14', parent: 'Form_4', type: markRaw(Text), props: {} },
              { id: 'Text_15', parent: 'Form_4', type: markRaw(Text), props: {} },
              { id: 'Text_16', parent: 'Form_4', type: markRaw(Text), props: {} },
            ],
          },
        ],
      },
    ],
  }*/
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
const dropEvt = () => {}
</script>
<style scoped></style>
