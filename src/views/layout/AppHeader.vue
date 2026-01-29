<template>
  <div
    class="lowcode-header flex flex-row justify-between items-center px-3 py-2 bg-white border-b border-solid border-zinc-200"
  >
    <div>低代码平台</div>
    <div class="inline-flex flex-row items-center">
      <div
        class="inline-block bg-orange-300 text-white px-3 leading-6 rounded mr-4"
        @click="savePageAct"
      >
        保存
      </div>
      <div class="bg-orange-300 text-white px-3 leading-6 rounded mr-4">预览</div>
      <PhRobot
        :size="36"
        weight="duotone"
        class="text-orange-300"
        @click="() => (openChat = true)"
      />
      <ChatAI
        v-if="openChat"
        :class="{ show: openChat, hide: !openChat }"
        @open-chat="() => (openChat = false)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { PhRobot } from '@phosphor-icons/vue'
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores'
import { savePage } from '@/infra/http/editorApi'
import ChatAI from './ChatAI.vue'

const openChat = ref(false)
const editorStore = useEditorStore()
const { currentPage } = storeToRefs(editorStore)

const savePageAct = () => {
  savePage(currentPage.value).then((res) => {
    console.log(res)
  })
}
</script>
<style scoped>
.robot-ai {
  animation: robot-rotate 5s infinite linear;
}
@keyframes robot-rotate {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(90deg);
  }
  50% {
    transform: rotate(180deg);
  }
  75% {
    transform: rotate(270deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
