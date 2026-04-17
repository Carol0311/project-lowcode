<template>
  <FormItem :data="props.data" class="smart-switch">
    <template #main="{ ui, icon, checkIcon }">
      <span :class="[ui.uiStatic.checkIcon]" class="h-7 align-middle table-cell">
        <component
          :is="icon"
          size="24"
          :class="[checkIcon]"
          class="smart-switch-icon inline-block leading-none"
        />
      </span>
    </template>
  </FormItem>
</template>
<script setup lang="ts">
import FormItem from '@/components/SlotUI/FormItem.vue'
import { ComponentSchema } from '@/domain/schema/component'
const props = defineProps<{
  data: ComponentSchema
}>()
</script>
<style scoped></style>
