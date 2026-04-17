<template>
  <FormItem :data="props.data" class="smart-price">
    <template #main="{ config, ui, icon }">
      <span class="table-cell bg-transparent align-middle w-4 text-center text-orange-300">¥</span>
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
      <span v-if="config.clear || config.showIcon" :class="[ui.uiStatic.icon]">
        <component :is="icon" weight="duotone" size="16" class="text-zinc-400 cursor-pointer" />
      </span>
    </template>
  </FormItem>
</template>
<script setup lang="ts">
import FormItem from '@/components/SlotUI/FormItem.vue'
import { vFocus } from '@/plugins/CusDirectives'
import { ComponentSchema } from '@/domain/schema/component'
const props = defineProps<{
  data: ComponentSchema
}>()
</script>
<style scoped></style>
