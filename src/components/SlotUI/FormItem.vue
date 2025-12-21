<template>
  <div :class="[ui.uiStatic.item, item]" :colspan="config.col">
    <div v-if="labelPos !== 'inner'" :class="[ui.uiStatic.outLabel, outLabel]">
      <label>{{ config.label }}</label>
      <PhQuestion
        v-if="config.tip"
        v-dialog:[config.cid]="config.label"
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
    <div :class="[isCheckType ? ui.uiStatic.checkCtrl : ui.uiStatic.ctrl, ctrl]">
      <span
        :class="[
          isCheckType ? ui.uiStatic.checkbox : ui.uiStatic.inputBox,
          isCheckType ? '' : inputBox,
        ]"
        :style="config.inlineStyle"
      >
        <label v-if="labelPos === 'inner'" :class="ui.uiStatic.innerLabel">
          <div>
            <label>{{ config.label }}</label>
            <PhQuestion
              v-if="config.tip"
              v-dialog:[config.cid]="config.label"
              :size="16"
              weight="light"
              class="inline-block mb-1 cursor-pointer"
            />
            <PhAsterisk
              v-if="config.require"
              :size="10"
              class="text-red-500 inline-block absolute translate-y-1"
            />
          </div>
        </label>
        <slot
          name="main"
          :config="config"
          :ui="ui"
          :icon="dynamicIcon"
          :check-icon="checkIcon"
        ></slot>
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
import { ref } from 'vue'
import { PhQuestion, PhAsterisk } from '@phosphor-icons/vue'
import { useUiConfig } from '@/composables/useUiConfig'
import { Info } from '@/components/UintUI'
import { vDialog } from '@/plugins/CusDirectives'
import { ComponentSchema } from '@/domain/schema/component'

const props = defineProps<{
  data: ComponentSchema
}>()
const ui = useUiConfig(props.data.id)
const { config } = ui
const { labelPos } = ui.uiByParent
const { item, outLabel, ctrl, inputBox, checkIcon } = ui.uiClass
const dynamicIcon = ui.getIcon(props.data.type)
const isCheckType = ref(false)
isCheckType.value = ['SCheckbox', 'CheckboxGroup', 'Radio', 'RadioGroup', 'Switch'].includes(
  props.data.type,
)
</script>
<style scoped></style>
