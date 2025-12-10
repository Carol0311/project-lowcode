<template>
  <div class="smart-select" :class="[ui.uiStatic.item, item]">
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
    <div :class="[ui.uiStatic.ctrl, ctrl]">
      <span :class="[ui.uiStatic.inputBox, inputBox]" :style="config.inlineStyle">
        <label v-if="labelPos === 'inner'" :class="ui.uiStatic.innerLabel">
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
        <input
          :id="config.id"
          ref="inputRef"
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
        <span :class="[ui.uiStatic.icon]">
          <component
            :is="dynamicIcon"
            weight="duotone"
            size="16"
            class="text-zinc-400 cursor-pointer"
          />
        </span>
      </span>
      <Info
        v-if="config.errTip || config.helpTip"
        :err-tip="config.errTip"
        :help-tip="config.helpTip"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import { PhCaretCircleDown, PhXCircle, PhQuestion, PhAsterisk } from '@phosphor-icons/vue'
import { Info } from '@/components/UintUI'
import { useUiConfig } from '@/composables/useUiConfig'
import { vDialog, vFocus } from '@/plugins/CusDirectives'
import { ComponentSchema } from '@/domain/schema/component'
const props = defineProps<{
  data: ComponentSchema
}>()
const ui = useUiConfig({
  id: props.data.id,
})
const config = computed(() => {
  return props.data.props
})
const dynamicIcon = config.value.clear ? PhXCircle : PhCaretCircleDown
const { item, outLabel, ctrl, inputBox } = ui.uiClass
const { labelPos } = ui.uiByParent
</script>
<style scoped></style>
