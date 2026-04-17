<template>
  <FormItem :data="props.data" class="smart-textarea">
    <template #main="{ config, ui, icon }">
      <textarea
        v-focus="config.focus"
        :class="[ui.uiStatic.input]"
        class="py-2"
        autocomplete="false"
        :placeholder="config.placeholder"
        :maxlength="config.maxLength"
        :disabled="config.disable"
        :readonly="config.readonly || config.tabStatus === 0"
        value=""
        componentname=""
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
