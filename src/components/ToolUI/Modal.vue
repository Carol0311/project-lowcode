<template>
  <div class="modal-wrapper">
    <div class="modal-body w-96">
      <div
        class="flex flex-row justify-between items-center h-10 text-gray-500 text-sm px-3 border-b border-solid border-zinc-300"
      >
        <span>信息</span>
        <PhXCircle v-if="data.type === 'confirm'" :size="16" />
      </div>
      <div class="min-h-32 max-h-40 overflow-auto text-zinc-500 text-sm p-3">
        {{ data.message }}
      </div>
      <div class="flex flex-row justify-center items-center h-8 mb-2">
        <div
          v-if="data.type === 'confirm'"
          class="bg-orange-300 text-white px-3 py-2 leading-3 rounded"
        >
          取消
        </div>
        <div class="bg-orange-300 text-white px-3 py-2 leading-3 rounded" @click="closeModal">
          确定
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PhXCircle } from '@phosphor-icons/vue'
import { ErrorInfo } from '@/domain/schema'
defineProps<{
  data: ErrorInfo
}>()
const emit = defineEmits(['close-modal'])
const closeModal = () => {
  emit('close-modal', false)
}
</script>
<style scoped>
.modal-wrapper {
  z-index: 99999999;
  background: rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.modal-body {
  background: #ffffff;
  display: inline-block;
  position: relative;
  transform: translate(-50%, -50%);
  left: 50%;
  top: 50%;
}
</style>
