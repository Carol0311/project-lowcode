<template>
  <div class="props-tab">
    <FoldAndOpen class="p-layout" :data="{ name: '页面', open: true }">
      <PText v-model="pageData.id" :data="{ name: '页面Id', readonly: true }" />
      <PText v-model="pageData.name" :data="{ name: '页面名称', isPage: true }" />
    </FoldAndOpen>
    <FoldAndOpen v-show="propsData.isContainer" :data="{ name: '全局配置', open: true }">
      <PRadio v-model="propsData.tabStatus" :data="{ name: '状态', list: statusData }" />
      <PRadio v-model="propsData.tabLayout" :data="{ name: '布局', list: FColData }" />
      <PRadio v-model="propsData.labelPos" :data="{ name: '标签位置', list: posData }" />
    </FoldAndOpen>
    <FoldAndOpen v-show="!propsData.isContainer" :data="{ name: '表单项配置', open: true }">
      <PText v-model="propsData.id" :data="{ name: '表单标识' }" />
      <PRadio v-model="propsData.col" :data="{ name: '表单项宽度', list: FColData }" />
      <PText v-model="propsData.label" :data="{ name: '标题' }" />
      <!--<PSwitch :data="{ name: '开启子表单' }" />-->
      <PText v-model="propsData.errTip" :data="{ name: '错误提示' }" />
      <PText v-model="propsData.helpTip" :data="{ name: '帮助提示' }" />
      <PRadio
        v-model="propsData.validateStatus"
        :data="{
          name: '校验状态',
          list: validateStatus,
          wrap: true,
        }"
      />
      <PRadio v-model="propsData.size" :data="{ name: '尺寸', list: sizeData }" />
      <PSwitch v-model="propsData.tip" :data="{ name: '标题提示' }" />
      <PRadio v-model="propsData.device" :data="{ name: '设备', list: deviceData }" />
      <PSwitch v-model="propsData.require" :data="{ name: '是否必填' }" />
      <!--<PSwitch :data="{ name: '宽度占满' }" />-->
      <PSwitch v-model="propsData.preview" :data="{ name: '预览态' }" />
      <PSwitch v-model="propsData.autoValidate" :data="{ name: '自动校验' }" />
    </FoldAndOpen>
    <FoldAndOpen v-show="!propsData.isContainer" :data="{ name: '组件配置' }">
      <!--<PText :data="{ name: '标签文本' }" />-->
      <PText v-model="propsData.defaultVal" :data="{ name: '默认值' }" />
      <PText v-model="propsData.placeholder" :data="{ name: '输入提示' }" />
      <PRadio
        v-model="propsData.validateStatus"
        :data="{ name: '状态', list: validateStatus, wrap: true }"
      />
      <PRadio v-model="propsData.size" :data="{ name: '尺寸', list: sizeData }" />
      <PUnit
        :data="{ name: '最大长度', single: true, number: propsData.maxLength }"
        @change="updateValue"
      />
      <PSwitch v-model="propsData.clear" :data="{ name: '显示清除' }" />
      <PSwitch v-model="propsData.disable" :data="{ name: '是否禁用' }" />
      <!--<PSwitch :data="{ name: '展示限制',value:propsData.clear}" />-->
      <!--<PSwitch :data="{ name: '是否截断',value:propsData.clear }" />-->
      <PSwitch v-model="propsData.readonly" :data="{ name: '是否只读' }" />
      <PSwitch v-model="propsData.trim" :data="{ name: '是否Trim' }" />
      <PSwitch v-model="propsData.border" :data="{ name: '显示边框' }" />
      <PSwitch v-model="propsData.focus" :data="{ name: '是否聚焦' }" />
    </FoldAndOpen>
  </div>
</template>
<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { ref, provide, watch } from 'vue'
import { PText, PRadio, PSwitch, FoldAndOpen, PUnit } from '@/components/PropUI'
import { useEditorStore } from '@/stores/editorStore'
const editorStore = useEditorStore()
const { selectedComponent, currentPage } = storeToRefs(editorStore)
const { updateComponent, setCurrentPage } = editorStore
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
const propsData = ref<Record<string, any>>({})
const pageData = ref<Record<string, any>>({})
const update = (isPage?: boolean) => {
  if (isPage) {
    setCurrentPage({ ...currentPage.value, name: pageData.value.name })
  } else {
    updateComponent(propsData.value.cid, propsData.value)
  }
}
provide('propsChange', { update })
const updateValue = (params: any) => {
  updateComponent(propsData.value.cid, { maxlength: params.number })
}
watch(
  () => selectedComponent.value,
  (com) => {
    if (com) {
      propsData.value = {
        ...com.props,
        id: com.id,
        cid: com.id,
      }
    }
  },
  { immediate: true },
)
watch(
  () => currentPage.value,
  (newPage, oldPage) => {
    if ((newPage && oldPage && newPage.id !== oldPage.id) || (newPage && !oldPage)) {
      pageData.value = {
        id: newPage.id,
        name: newPage.name,
      }
    }
  },
  { deep: true },
)
</script>
<style scoped></style>
