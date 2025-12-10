<template>
  <div class="component-edit-tool fixed pointer-events-none" :style="toolStyle">
    <div class="flex flex-row bg-orange-500 text-white justify-end pointer-events-auto">
      <PhArrowUp :size="16" weight="thin" @click="selectParent" />
      <PhCopy :size="16" weight="thin" @click="copyCom" />
      <PhTrash :size="16" weight="thin" @click="deleteCom" />
    </div>
    <div
      class="rect-box border border-solid border-orange-500 pointer-events-none relative"
      :style="rectStyle"
    >
      <template v-if="showDevider">
        <PhScissors
          :size="24"
          weight="duotone"
          class="h-middle text-white rotate-90 pointer-events-auto"
          :class="{ large: showh === true }"
          :style="deviderStyle.h"
          @mouseover="() => (showh = true)"
          @mouseleave="() => (showh = false)"
          @click="cutContainer('row')"
        />
        <div v-show="showh" class="h-cut-line" :style="deviderStyle.hLine"></div>
        <PhScissors
          :size="24"
          weight="duotone"
          class="v-middle text-white rotate-90 pointer-events-auto"
          :class="{ large: showv === true }"
          :style="deviderStyle.v"
          @mouseover="() => (showv = true)"
          @mouseleave="() => (showv = false)"
          @click="cutContainer('column')"
        />
        <div v-show="showv" class="v-cut-line" :style="deviderStyle.vLine"></div>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, onUnmounted, watch } from 'vue'
import { PhArrowUp, PhCopy, PhTrash, PhScissors } from '@phosphor-icons/vue'
import { useEventBus } from '@/composables/useEventBus'
import { useEditorStore } from '@/stores/editorStore'
const editorStore = useEditorStore()
const { selectedComponent } = storeToRefs(editorStore)
const { findComponentById, deleteComponent, copyComponent } = editorStore
const emit = defineEmits(['showEdit'])
const toolStyle = ref({})
const rectStyle = ref({})
const eventBus = useEventBus()
const pid = ref('')
const cid = ref('')
interface DeviderStyle {
  h?: Record<string, any>
  hLine?: Record<string, any>
  v?: Record<string, any>
  vLine?: Record<string, any>
}
const showh = ref(false)
const showv = ref(false)
//是否显示分割容器图标
const showDevider = ref(false)
//分割容器工具图标样式
const deviderStyle = ref<DeviderStyle>({})
const FORM_ARR = ['Container', 'Form', 'AdvanceForm', 'EvelatorForm']
watch(
  () => selectedComponent.value,
  (com) => {
    if (com) {
      const target = document.querySelector(`[data-id='${com.id}']`) as HTMLElement
      if (target) {
        const pos = target.getBoundingClientRect()
        showDevider.value = FORM_ARR.includes(com.type) && com.children.length < 1
        pid.value = com.parentId
        cid.value = com.id
        toolStyle.value = {
          top: `${pos.top - 16}px`,
          left: `${pos.left}px`,
        }
        rectStyle.value = {
          width: `${pos.width}px`,
          height: `${pos.height}px`,
        }
        deviderStyle.value.h = {
          left: `${pos.width / 2}px`,
        }
        deviderStyle.value.hLine = {
          left: `${pos.width / 2}px`,
          height: `${pos.height - 2}px`,
        }
        deviderStyle.value.v = {
          top: `${pos.height / 2 - 8}px`,
        }
        deviderStyle.value.vLine = {
          top: `${pos.height / 2 - 3}px`,
          width: `${pos.width - 2}px`,
        }
        emit('showEdit', true)
      }
    }
  },
  { immediate: true },
)
//选中当前组件的父组件
const selectParent = () => {
  selectedComponent.value = findComponentById(pid.value)
}
//删除组件
const deleteCom = () => {
  deleteComponent(pid.value, cid.value)
  emit('showEdit', false)
}
//复制组件
const copyCom = () => {
  const item = copyComponent(pid.value, cid.value)
  selectedComponent.value = item
  emit('showEdit', false)
}
//分割容器
const cutContainer = (direct: string) => {
  eventBus.emit('cutContainer', { pid: pid.value, cid: cid.value, direct })
  emit('showEdit', false)
}
</script>
<style scoped>
.h-middle,
.v-middle {
  position: absolute;
  display: inline-block;
  width: 12px;
  height: 12px;
  background: rgb(253 186 116 / var(--tw-text-opacity, 1));
  border: 1px solid #dddddd;
  border-radius: 100%;
  z-index: 100000;
}
.h-cut-line {
  position: absolute;
  z-index: 100000;
  width: 2px;
  border-left: 2px dotted rgb(253 186 116 / var(--tw-text-opacity, 1));
}
.v-cut-line {
  position: absolute;
  z-index: 100000;
  height: 2px;
  border-top: 2px dotted rgb(253 186 116 / var(--tw-text-opacity, 1));
}
.large {
  width: 24px;
  height: 24px;
}
.h-middle.large {
  margin-left: -10px;
}
.v-middle.large {
  margin-top: -5px;
}
</style>
