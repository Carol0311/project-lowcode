<template>
  <div class="smart-address"></div>
</template>
<script setup lang="ts">
import { ComponentSchema } from '@/domain/schema/component'
import { useUiConfig } from '@/composables/useUiConfig'
const props = defineProps<{
  data: ComponentSchema
}>()
useUiConfig(props.data.id)
</script>
<style coped></style>
