<template>
  <div>
    <component :is="get(com.type)" v-for="com in children" :key="com.id" :data="com" />
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import { componentRegistry } from '@/infra/registry/componentRegistry'
import { ComponentSchema } from '@/domain/schema/component'
const { get } = componentRegistry
const editorStore = useEditorStore()
const { currentPage } = editorStore
const props = defineProps<{
  data: ComponentSchema
}>()
const children = computed(() => {
  return props.data.children.map((id) => currentPage.components[id])
})
</script>
<style scoped></style>
