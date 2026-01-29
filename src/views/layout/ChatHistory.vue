<template>
  <div class="history-wrapper absolute">
    <div class="gray-layer" @click.stop="closeHistory"></div>
    <div class="content-box bg-white absolute flex flex-col p-2.5">
      <div class="history-list flex-1">
        <div v-for="history in data" :key="history.id" class="leading-6 px-2">
          {{ history.title }}
        </div>
      </div>
      <div class="user-info flex flex-row justify-between">
        <div></div>
        <PhSignOut :size="24" weight="duotone" class="text-zinc-400" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { PhSignOut } from '@phosphor-icons/vue'

export interface HistoryInfo {
  id: string
  title: string
}
defineProps<{
  data: HistoryInfo[]
}>()

const emit = defineEmits(['open-history'])
const closeHistory = () => {
  emit('open-history', false)
}
</script>
<style scoped>
.history-wrapper {
  position: absolute;
  z-index: 12;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
.gray-layer {
  position: absolute;
  z-index: 14;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.1);
}
.history-wrapper .content-box {
  left: 0;
  right: 30%;
  bottom: 0;
  top: 0;
  z-index: 20;
  animation: left-to-right 0.3s linear;
}
@keyframes left-to-right {
  0% {
    right: 100%;
  }
  30% {
    right: 70%;
  }
  60% {
    right: 50%;
  }
  100% {
    right: 30%;
  }
}
</style>
