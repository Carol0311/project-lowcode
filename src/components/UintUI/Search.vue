<template>
  <div
    class="smart-search flex flex-row mb-4 items-center bg-white w-fit border border-solid border-orange-300 rounded"
  >
    <div class="smart-form-item-inputBox inline-table align-middle">
      <input type="text" class="px-2 min-w-48" />
    </div>
    <div
      class="flex flex-row items-center leading-7 px-2 bg-orange-300 text-white h-full border-l border-solid border-orange-300"
    >
      <PhMagnifyingGlass :size="16" class="" />
      <span>搜索</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PhMagnifyingGlass } from '@phosphor-icons/vue'
import { ComponentSchema } from '@/domain/schema/component'
import { useUiConfig } from '@/composables/useUiConfig'
const props = defineProps<{
  data: ComponentSchema
}>()
const ui = useUiConfig(props.data.id)
</script>
<style coped></style>
