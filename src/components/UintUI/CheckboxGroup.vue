<template>
  <FormItem :data="props.data" class="smart-checkboxgroup">
    <template #main="{ icon, checkIcon }">
      <div class="flex flex-row items-center h-7">
        <span class="cursor-pointer">
          <component
            :is="icon"
            size="20"
            :class="[checkIcon]"
            class="smart-checkbox-icon inline-block leading-none"
          />
          <span class="smart-checkbox-label align-middle mx-1 inline-block leading-none"
            >选项1</span
          >
        </span>
        <span class="cursor-pointer">
          <component
            :is="icon"
            size="20"
            :class="[checkIcon]"
            class="smart-checkbox-icon inline-block leading-none"
          />
          <span class="smart-checkbox-label align-middle mx-1 inline-block leading-none"
            >选项2</span
          >
        </span>
      </div>
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
