<template>
  <div ref="FormRef" class="smart-tab border border-solid border-zinc-300 mb-5 rounded bg-white">
    <div class="smart-tab-head px-4">
      <div class="smart-tab-head-main mt-2 border-b border-solid border-zinc-300">
        <div class="smart-tab-title pl-2 text-gray-600 text-base relative">
          {{ data.props.tabTitle }}
        </div>
      </div>
    </div>
    <div class="smart-tab-body py-3 px-4">
      <div class="smart-tab-content overflow-hidden" :style="{ height: `${tabFormHeight}px` }">
        <div ref="tabForm" class="smart-tab-form">
          <div
            class="grid gap-4"
            :style="`grid-template-columns: repeat(${config.tabLayout}, minmax(0, 1fr));`"
          >
            <component
              :is="get(com.type)"
              v-for="com in children"
              :key="com.id"
              :data="com"
              :data-id="com.id"
              @click.stop="clickRef(com)"
              @dragover.prevent.stop="handleDragover(com.id)"
              @drop.stop="handleDropEvt(com.id)"
            />
          </div>
        </div>
      </div>
      <div class="smart-tab-footer text-orange-300 text-xs">
        <div class="flex flex-row items-center" @click="clickEvt">
          <span>{{ direct }}</span>
          <PhCaretDown v-show="fold" :size="14" weight="light" />
          <PhCaretUp v-show="!fold" :size="14" weight="light" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { ref, useTemplateRef, onMounted } from 'vue'
import { PhCaretDown, PhCaretUp } from '@phosphor-icons/vue'
import { useEventBus } from '@/composables/useEventBus'
import { useEditorStore } from '@/stores/editorStore'
import { componentRegistry } from '@/infra/registry/componentRegistry'
import { ComponentSchema } from '@/domain/schema/component'
import { useDragStore } from '@/stores/dragStore'
const { handleDropEvt, handleDragover } = useDragStore()
const { get } = componentRegistry
const editorStore = useEditorStore()
const eventBus = useEventBus()
const { selectedComponent } = storeToRefs(editorStore)
const { currentPage, deleteComponent, copyComponent } = editorStore
const props = defineProps<{
  data: ComponentSchema
}>()
const children = computed(() => {
  return props.data.children.map((id) => currentPage.components[id])
})
/**展开收起功能*/
const fold = ref(true)
const direct = ref('展开')
const FormRef = useTemplateRef<HTMLElement>('FormRef')
const config = computed(() => props.data.props)
const tabForm = useTemplateRef<HTMLElement>('tabForm')
const tabFormHeight = ref(100)
onMounted(() => {
  tabFormHeight.value = fold.value ? 100 : tabForm.value?.clientHeight || 100
})
const clickEvt = () => {
  fold.value = !fold.value
  if (fold.value === true) {
    direct.value = '展开'
    tabFormHeight.value = 100
  } else {
    direct.value = '收起'
    tabFormHeight.value = tabForm.value?.clientHeight || 100
  }
}
const clickRef = (com: ComponentSchema) => {
  selectedComponent.value = com
}
</script>
<style scoped>
.smart-tab-title::before {
  content: '';
  display: inline-block;
  height: 16px;
  width: 3px;
  background: rgb(253 186 116 / var(--tw-text-opacity, 1));
  position: absolute;
  left: 0;
  top: calc(50% - 8px);
}
</style>
