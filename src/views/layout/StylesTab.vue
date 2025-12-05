<template>
  <div class="styles-tab">
    <PLayout v-model="stylesData" />
    <PFont v-model="stylesData" />
    <PBackGround v-model="stylesData" />
    <PPos v-model="stylesData" />
    <PBoder v-model="stylesData" />
  </div>
</template>
<script lang="ts" setup>
import { ref, provide } from 'vue'
import { PLayout, PFont, PBackGround, PPos, PBoder } from '@/components/PropUI'
import { useEventBus } from '@/composables/useEventBus'
import { useEditorStore } from '@/stores/editorStore'
const editorStore = useEditorStore()
const { updateComponentById } = editorStore
const eventBus = useEventBus()
const stylesData = ref<Record<string, any>>({})
const cid = ref<string>('')
eventBus.on('initEditingProps', (data: Record<string, any>) => {
  cid.value = data.cid
  stylesData.value = data.inlineStyle
})
const update = () => {
  updateComponentById(cid.value, { inlineStyle: stylesData.value })
}
provide('propsChange', { update })
</script>
<style scoped></style>
