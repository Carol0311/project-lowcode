<template>
  <div class="smart-qty" :class="[ui.uiStatic.item, item]" @click.stop="ui.uiEvents.click">
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
    <div :class="[ui.uiStatic.ctrl, ctrl]">
      <span :class="[ui.uiStatic.inputBox, inputBox]">
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
        <span class="table-cell bg-orange-300 align-middle text-center w-7 cursor-pointer">
          <component :is="PhMinus" size="18" class="text-white inline" />
        </span>
        <input
          v-focus="config.focus"
          ref="inputRef"
          :class="[ui.uiStatic.input]"
          autocomplete="false"
          :placeholder="config.placeholder"
          :maxlength="config.maxLength"
          :disabled="config.disable"
          :readonly="config.readonly || config.tabStatus === 0"
          value=""
          :id="config.id"
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
import { PhPlus, PhMinus, PhQuestion, PhAsterisk } from '@phosphor-icons/vue'
import { useUiConfig } from '@/composables/useUiConfig'
import { Info } from '@/components/UintUI'
import { vDialog, vFocus } from '@/plugins/CusDirectives'
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
const { item, outLabel, ctrl, inputBox } = ui.uiClass
const config = computed(() => {
  return props.data.props
})
const { labelPos } = ui.uiByParent
</script>
<style scoped></style>
