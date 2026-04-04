<template>
  <FormItem :data="props.data" class="smart-number">
    <template #[dynamicSlot]="{ config, ui, icon }">
      <input
        v-model="numValue"
        v-focus="config.focus"
        :class="[ui.uiStatic.input]"
        autocomplete="false"
        :placeholder="config.placeholder"
        :maxlength="config.maxLength"
        :disabled="config.disable"
        :readonly="config.readonly || config.tabStatus === 1"
        @change="handleChange"
      />
      <span v-if="config.clear || config.showIcon" :class="[ui.uiStatic.icon]">
        <component :is="icon" weight="duotone" size="16" class="text-zinc-400 cursor-pointer" />
      </span>
    </template>
  </FormItem>
</template>
<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import FormItem from '@/components/SlotUI/FormItem.vue'
import { vFocus } from '@/plugins/CusDirectives'
import { ComponentSchema, ColumnSchema } from '@/domain/schema'
const props = defineProps<{
  data: ComponentSchema | ColumnSchema
  cellValue: any
}>()
const emits = defineEmits(['cell-change'])

const dynamicSlot = computed(() => {
  return props.data.props.inTable ? 'cellMain' : 'main'
})
const numValue = ref<any>(null)
watch(
  () => props.cellValue,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      numValue.value = newVal
    }
  },
  { immediate: true },
)
const handleChange = () => {
  if (props.data.props.inTable) {
    emits('cell-change', numValue.value)
  }
}
</script>
<style scoped></style>
