<template>
  <div class="props-tab">
    <FoldAndOpen :data="{ name: '全局配置', open: true }" v-show="propsData.isForm">
      <PRadio :data="{ name: '状态', list: statusData }" v-model="propsData.tabStatus" />
      <PRadio :data="{ name: '布局', list: FColData }" v-model="propsData.tabLayout" />
      <PRadio :data="{ name: '标签位置', list: posData }" v-model="propsData.labelPos" />
    </FoldAndOpen>
    <FoldAndOpen :data="{ name: '表单项配置', open: true }" v-show="!propsData.isForm">
      <PText :data="{ name: '表单标识' }" v-model="propsData.id" />
      <PRadio :data="{ name: '表单项宽度', list: FColData }" v-model="propsData.col" />
      <PText :data="{ name: '标题' }" v-model="propsData.label" />
      <!--<PSwitch :data="{ name: '开启子表单' }" />-->
      <PText :data="{ name: '错误提示' }" v-model="propsData.errTip" />
      <PText :data="{ name: '帮助提示' }" v-model="propsData.helpTip" />
      <PRadio
        :data="{
          name: '校验状态',
          list: validateStatus,
          wrap: true,
        }"
        v-model="propsData.validateStatus"
      />
      <PRadio :data="{ name: '尺寸', list: sizeData }" v-model="propsData.size" />
      <PSwitch :data="{ name: '标题提示' }" v-model="propsData.tip" />
      <PRadio :data="{ name: '设备', list: deviceData }" v-model="propsData.device" />
      <PSwitch :data="{ name: '是否必填' }" v-model="propsData.require" />
      <!--<PSwitch :data="{ name: '宽度占满' }" />-->
      <PSwitch :data="{ name: '预览态' }" v-model="propsData.preview" />
      <PSwitch :data="{ name: '自动校验' }" v-model="propsData.autoValidate" />
    </FoldAndOpen>
    <FoldAndOpen :data="{ name: '组件配置' }" v-show="!propsData.isForm">
      <!--<PText :data="{ name: '标签文本' }" />-->
      <PText :data="{ name: '默认值' }" v-model="propsData.defaultVal" />
      <PText :data="{ name: '输入提示' }" v-model="propsData.placeholder" />
      <PRadio
        :data="{ name: '状态', list: validateStatus, wrap: true }"
        v-model="propsData.validateStatus"
      />
      <PRadio :data="{ name: '尺寸', list: sizeData }" v-model="propsData.size" />
      <PUnit
        :data="{ name: '最大长度', single: true, number: propsData.maxLength }"
        @change="updateValue"
      />
      <PSwitch :data="{ name: '显示清除' }" v-model="propsData.clear" />
      <PSwitch :data="{ name: '是否禁用' }" v-model="propsData.disable" />
      <!--<PSwitch :data="{ name: '展示限制',value:propsData.clear}" />-->
      <!--<PSwitch :data="{ name: '是否截断',value:propsData.clear }" />-->
      <PSwitch :data="{ name: '是否只读' }" v-model="propsData.readonly" />
      <PSwitch :data="{ name: '是否Trim' }" v-model="propsData.trim" />
      <PSwitch :data="{ name: '显示边框' }" v-model="propsData.border" />
      <PSwitch :data="{ name: '是否聚焦' }" v-model="propsData.focus" />
    </FoldAndOpen>
  </div>
</template>
<script lang="ts" setup>
import { ref, provide } from 'vue'
import { PText, PRadio, PSwitch, FoldAndOpen, PUnit } from '@/components/PropUI'
import { useEventBus } from '@/composables/useEventBus'
import { useEditorStore } from '@/stores/editorStore'
const editorStore = useEditorStore()
const { updateComponentById } = editorStore
interface ListItem {
  name: string
  value: number | string
}
const FColData = ref<ListItem[]>([
  { name: '一列', value: 1 },
  { name: '两列', value: 2 },
  { name: '三列', value: 3 },
  { name: '四列', value: 4 },
])
const validateStatus = ref<ListItem[]>([
  { name: 'error', value: 0 },
  { name: 'success', value: 1 },
  { name: 'loading', value: 2 },
  { name: 'warning', value: 3 },
])
const sizeData = ref<ListItem[]>([
  { name: 'small', value: 0 },
  { name: 'medium', value: 1 },
  { name: 'large', value: 2 },
])
const deviceData = ref<ListItem[]>([
  { name: 'phone', value: 0 },
  { name: 'tablet', value: 1 },
  { name: 'desktop', value: 2 },
])
const statusData = ref<ListItem[]>([
  { name: '只读态', value: 0 },
  { name: '编辑态', value: 1 },
])
const posData = ref<ListItem[]>([
  { name: '上', value: 'top' },
  { name: '左', value: 'left' },
  { name: '内', value: 'inner' },
])
const eventBus = useEventBus()
const propsData = ref<Record<string, any>>({})
eventBus.on('initEditingProps', (data: Record<string, any>) => {
  propsData.value = data
})
const update = () => {
  updateComponentById(propsData.value.cid, propsData.value)
}
provide('propsChange', { update })
const updateValue = (params: any) => {
  updateComponentById(propsData.value.cid, { maxlength: params.number })
}
</script>
<style scoped></style>
