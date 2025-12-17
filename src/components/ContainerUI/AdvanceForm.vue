<template>
  <div>
    <component :is="get(com.type)" v-for="com in children" :key="com.id" :data="com" />
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores/editorStore'
import { componentRegistry } from '@/infra/registry/componentRegistry'
import { ComponentSchema } from '@/domain/schema/component'
const { get } = componentRegistry

const editorStore = useEditorStore()
const { currentPage } = storeToRefs(editorStore)

const props = defineProps<{
  data: ComponentSchema
}>()
const children = computed(() => {
  const components = currentPage.value?.components || {}
  return props.data.children.map((id) => components[id])
})
</script>
<style scoped></style>
