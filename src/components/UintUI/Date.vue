<template>
  <FormItem :data="props.data" class="smart-text">
    <template #[dynamicSlot]="{ config, ui, icon }">
      <input
        v-model="dateValue"
        v-focus="config.focus"
        :class="[ui.uiStatic.input]"
        autocomplete="false"
        :placeholder="config.placeholder"
        :maxlength="config.maxLength"
        :disabled="config.disable"
        :readonly="true"
        componentname=""
        @focus="ui.uiEvents.focus"
        @blur="ui.uiEvents.blur"
        @mouseover="ui.uiEvents.mouseOver"
        @mouseleave="ui.uiEvents.mouseLeave"
        @change="handleChange"
      />
      <span :class="[ui.uiStatic.icon]">
        <component :is="icon" weight="duotone" size="16" class="text-zinc-400 cursor-pointer" />
      </span>
    </template>
  </FormItem>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
const dateValue = ref<any>(null)
watch(
  () => props.cellValue,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      dateValue.value = newVal
    }
  },
  { immediate: true },
)
const handleChange = () => {
  if (props.data.props.inTable) {
    emits('cell-change', dateValue.value)
  }
}
</script>
<style scoped></style>
