<template>
  <div>
    <component :is="com.type" v-for="com in data.children" :key="com.id" />
  </div>
</template>
<script lang="ts" setup>
import { type Component, ref } from 'vue'
interface ComponentNode {
  id: string
  parent: string
  type: Component
  props: Record<string, any>
  children?: ComponentNode[]
}
const props = defineProps<{
  data: ComponentNode
}>()
</script>
<style scoped></style>
