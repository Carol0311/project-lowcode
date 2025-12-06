<template>
  <div
    class="smart-checkboxgroup"
    :class="[ui.uiStatic.item, item]"
    @click.stop="ui.uiEvents.click"
  >
    <div v-if="labelPos !== 'inner'" :class="[ui.uiStatic.outLabel, outLabel]">
      <label>{{ config.label }}</label>
      <PhQuestion
        v-if="config.tip"
        v-dialog:[config.id]="config.label"
        :size="16"
        weight="light"
        class="inline-block mb-1 cursor-pointer"
      />
      <PhAsterisk
        v-if="config.require"
        :size="10"
        class="text-red-500 inline-block absolute translate-y-2"
      />
    </div>
    <div :class="[ui.uiStatic.checkCtrl, ctrl]">
      <span :class="[ui.uiStatic.checkbox]">
        <label :cv-if="labelPos === 'inner'" class="ui.uiStatic.innerLabel">
          <div>
            <label>{{ config.label }}</label>
            <PhQuestion
              v-if="config.tip"
              v-dialog:[config.id]="config.label"
              :size="16"
              weight="light"
              class="inline-block mb-1 cursor-pointer"
            />
            <PhAsterisk
              v-if="config.require"
              :size="10"
              class="text-red-500 inline-block absolute translate-y-2"
            />
          </div>
        </label>
        <div class="flex flex-row items-center h-7">
          <span class="cursor-pointer">
            <component
              :is="dynamicIcon"
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
              :is="dynamicIcon"
              size="20"
              :class="[checkIcon]"
              class="smart-checkbox-icon inline-block leading-none"
            />
            <span class="smart-checkbox-label align-middle mx-1 inline-block leading-none"
              >选项2</span
            >
          </span>
        </div>
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import { PhCheckSquare, PhQuestion, PhAsterisk } from '@phosphor-icons/vue'
import { useUiConfig } from '@/composables/useUiConfig'
import { vDialog } from '@/plugins/CusDirectives'
const dynamicIcon = PhCheckSquare
interface ComponentNode {
  id: string
  parent: string
  type: Component
  props: Record<string, any>
  children?: ComponentNode[]
}
const props = defineProps<{
  data: ComponentNode
}>()
const ui = useUiConfig({
  id: props.data.id,
})
const { item, outLabel, ctrl, checkIcon } = ui.uiClass
const config = computed(() => {
  return props.data.props
})
const { labelPos } = ui.uiByParent
</script>
<style scoped></style>
