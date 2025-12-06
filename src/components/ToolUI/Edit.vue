<template>
  <div class="component-edit-tool fixed pointer-events-none" :style="toolStyle">
    <div class="flex flex-row bg-orange-500 text-white justify-end pointer-events-auto">
      <PhArrowUp :size="16" weight="thin" @click="selectParent" />
      <PhCopy :size="16" weight="thin" @click="copyComponent" />
      <PhTrash :size="16" weight="thin" @click="deleteComponent" />
    </div>
    <div
      class="rect-box border border-solid border-orange-500 pointer-events-none relative"
      :style="rectStyle"
    >
      <template v-if="isContainer">
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
import { ref, onUnmounted } from 'vue'
import { PhArrowUp, PhCopy, PhTrash, PhScissors } from '@phosphor-icons/vue'
import { useEventBus } from '@/composables/useEventBus'
const emit = defineEmits(['showEdit'])
const toolStyle = ref({})
const rectStyle = ref({})
const eventBus = useEventBus()
const pid = ref('')
const cid = ref('')
interface PosItem {
  isContainer?: boolean
  parent: string
  cid: string
  top: number
  left: number
  width: number
  height: number
}
interface DeviderStyle {
  h?: Record<string, any>
  hLine?: Record<string, any>
  v?: Record<string, any>
  vLine?: Record<string, any>
}
const isContainer = ref<boolean>(false)
const showh = ref(false)
const showv = ref(false)
const showDevider = ref(false)
const deviderStyle = ref<DeviderStyle>({})
eventBus.on('updateToolPos', (args: PosItem) => {
  if (args.hasOwnProperty('isContainer')) {
    isContainer.value = Boolean(args.isContainer)
  }
  pid.value = args.parent
  cid.value = args.cid
  toolStyle.value = {
    top: `${args.top - 16}px`,
    left: `${args.left}px`,
  }
  rectStyle.value = {
    width: `${args.width}px`,
    height: `${args.height}px`,
  }
  showDevider.value = true
  deviderStyle.value.h = {
    left: `${args.width / 2}px`,
  }
  deviderStyle.value.hLine = {
    left: `${args.width / 2}px`,
    height: `${args.height - 2}px`,
  }
  deviderStyle.value.v = {
    top: `${args.height / 2 - 8}px`,
  }
  deviderStyle.value.vLine = {
    top: `${args.height / 2 - 8}px`,
    width: `${args.width - 2}px`,
  }
  emit('showEdit', true)
})
onUnmounted(() => {
  eventBus.off('updateToolPos')
})
//选中当前组件的父组件
const selectParent = () => {
  eventBus.emit('parentSelect', pid.value)
}
//删除组件
const deleteComponent = () => {
  eventBus.emit('deleteComponent', { pid: pid.value, cid: cid.value })
  emit('showEdit', false)
}
//复制组件
const copyComponent = () => {
  eventBus.emit('copyComponent', { pid: pid.value, cid: cid.value })
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
  margin-top: -3px;
}
</style>
