<template>
  <div ref="appPage" class="lowcode-plat smart-app flex flex-col bg-gray-100 relative">
    <AppHeader class="lowcode-header" />
    <div class="lowcode-container smart-container flex flex-row">
      <LeftMenu />
      <ViewContent
        class="flex-1 flex flex-col relative"
        :style="{ width: `${viewWidth}px`, minWidth: '670px' }"
      />
      <RightPanel />
    </div>
    <Modal v-if="showModal" :data="showModal" @close-modal="() => (showModal = null)" />
    <Info v-if="showInfo" :data="showInfo" @close-info="() => (showInfo = null)" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { AppHeader, LeftMenu, RightPanel, ViewContent } from './layout'
import { eventBus } from '@/infra/bus/eventBus'
import { Modal, Info } from '@/components/ToolUI'
import { ErrorInfo, ShortErrorInfo } from '@/domain/schema'
import { useElementResize } from '@/composables/useElementResize'

const appPage = ref<HTMLElement>()

const showModal = ref<ErrorInfo>(null)
const showInfo = ref<ShortErrorInfo>(null)
const viewWidth = ref(0)

const handleResize = () => {
  viewWidth.value = appPage.value.clientWidth - 48 - 320
}

useElementResize(appPage, handleResize)

onMounted(() => {
  viewWidth.value = appPage.value.clientWidth - 48 - 320
})

eventBus.on('show-error', (data) => {
  showModal.value = data
})
eventBus.on('show-Info', (data) => {
  showInfo.value = data
})
</script>
<style scoped>
.lowcode-plat {
  overflow: hidden;
}
.lowcode-header {
  height: 3rem;
}
.lowcode-container {
  height: calc(100vh - 3rem);
  overflow: hidden;
}
</style>
