<template>
  <FormItem :data="props.data" class="smart-qty">
    <template #main="{ config, ui }">
      <span class="table-cell bg-orange-300 align-middle text-center w-7 cursor-pointer">
        <component :is="PhMinus" size="18" class="text-white inline" />
      </span>
      <input
        v-focus="config.focus"
        :class="[ui.uiStatic.input]"
        autocomplete="false"
        :placeholder="config.placeholder"
        :maxlength="config.maxLength"
        :disabled="config.disable"
        :readonly="config.readonly || config.tabStatus === 0"
        value=""
        componentname=""
        @focus="ui.uiEvents.focus"
        @blur="ui.uiEvents.blur"
        @mouseover="ui.uiEvents.mouseOver"
        @mouseleave="ui.uiEvents.mouseLeave"
        @change="ui.uiEvents.change"
      />
      <span class="table-cell bg-orange-300 align-middle text-center w-7 cursor-pointer">
        <component :is="PhPlus" size="18" class="text-white inline" />
      </span>
    </template>
  </FormItem>
</template>
<script setup lang="ts">
import FormItem from '@/components/SlotUI/FormItem.vue'
import { PhPlus, PhMinus } from '@phosphor-icons/vue'
import { vFocus } from '@/plugins/CusDirectives'
import { ComponentSchema } from '@/domain/schema/component'
const props = defineProps<{
  data: ComponentSchema
}>()
</script>
<style scoped></style>
