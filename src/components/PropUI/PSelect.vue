<template>
  <div class="p-select flex flex-row items-center h-7 my-3">
    <span class="mr-1 w-20" v-show="data.name">{{ data.name }}</span>
    <div
      class="px-1 relative flex flex-row flex-1 border border-solid border-zinc-300 rounded h-7 items-center"
    >
      <input
        placeholder="请选择"
        type="text"
        class="h-full flex-1 w-full"
        :value="selectVal"
        :readonly="true"
        @click.prevent="() => (open = true)"
      />
      <PhCaretDown
        :size="14"
        weight="thin"
        class="mx-1"
        v-show="!open"
        @click="() => (open = !open)"
      />
      <PhCaretUp
        :size="14"
        weight="thin"
        class="mx-1"
        v-show="open"
        @click="() => (open = !open)"
      />
      <div
        class="select-list absolute border border-solid border-zinc-300 py-2 px-4 bg-white w-full"
        v-show="open"
      >
        <div class="p-1" @click="selectEvt(item)" v-for="item in data.list" :key="item.value">
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { Component } from 'vue'
import { ref, watch } from 'vue'
import { PhCaretDown, PhCaretUp } from '@phosphor-icons/vue'
const emit = defineEmits(['change'])
interface ListItem {
  name: string | Component
  value: string | number
}
const props = defineProps<{
  data: {
    name: string
    value?: string
    list: ListItem[]
  }
}>()
const open = ref(false)
const selectVal = ref(props.data.value)
const selectEvt = function (item: any) {
  selectVal.value = item.name
  open.value = false
  emit('change', { value: selectVal.value })
}
watch(
  () => props.data.value,
  (newVal) => {
    selectVal.value = newVal
  },
)
</script>
<style scoped>
.p-select .select-list {
  top: 1.75rem;
  right: 0;
  z-index: 3;
}
</style>
