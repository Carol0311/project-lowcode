<template>
  <div class="smart-switch" :class="[ui.uiStatic.item, item]" @click.stop="ui.uiEvents.click">
    <div :class="[ui.uiStatic.outLabel, outLabel]" v-if="labelPos !== 'inner'">
      <label>{{ config.label }}</label>
      <PhQuestion
        v-if="config.tip"
        :size="16"
        weight="light"
        v-dialog:[config.id]="config.label"
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
        <label :class="ui.uiStatic.innerLabel" v-if="labelPos === 'inner'">
          <div>
            <label>{{ config.label }}</label>
            <PhQuestion
              v-if="config.tip"
              :size="16"
              weight="light"
              v-dialog:[config.id]="config.label"
              class="inline-block mb-1 cursor-pointer"
            />
            <PhAsterisk
              v-if="config.require"
              :size="10"
              class="text-red-500 inline-block absolute translate-y-2"
            />
          </div>
        </label>
        <span :class="[ui.uiStatic.checkIcon]" class="h-7 align-middle table-cell">
          <component
            :is="dynamicIcon"
            size="24"
            :class="[checkIcon]"
            class="smart-switch-icon inline-block leading-none"
          />
        </span>
      </span>
      <Info
        v-if="config.errTip || config.helpTip"
        :errTip="config.errTip"
        :helpTip="config.helpTip"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import { PhToggleRight, PhQuestion, PhAsterisk } from '@phosphor-icons/vue'
import { Info } from '@/components/UintUI'
import { useUiConfig } from '@/composables/useUiConfig'
import { vDialog } from '@/plugins/CusDirectives'
const dynamicIcon = PhToggleRight
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
