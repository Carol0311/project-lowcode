<template>
  <div class="smart-button bg-orange-300 text-white rounded-xl w-20 leading-6 text-center">
    按钮
  </div>
</template>
<script setup lang="ts">
import { useUiConfig } from '@/composables/useUiConfig'
import { ComponentSchema } from '@/domain/schema'

const props = defineProps<{
  data: ComponentSchema
}>()
const ui = useUiConfig(props.data.id)
</script>
