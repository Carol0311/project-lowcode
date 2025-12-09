<template>
  <div ref="appPage" class="lowcode-plat smart-app flex flex-col bg-gray-100">
    <AppHeader class="lowcode-header" />
    <div class="lowcode-container smart-container flex flex-row">
      <LeftMenu />
      <ViewContent class="flex-1" />
      <RightPanel />
    </div>
  </div>
</template>
<script setup lang="ts">
import { AppHeader, LeftMenu, RightPanel, ViewContent } from './layout'
import { provideEventBus } from '@/composables/useEventBus'
provideEventBus()
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
