<template>
  <div
    class="lowcode-header flex flex-row justify-between items-center px-3 py-2 bg-white border-b border-solid border-zinc-200"
  >
    <div>低代码平台</div>
    <div class="inline-flex flex-row">
      <div class="bg-orange-300 text-white px-3 py-2 leading-3 rounded mr-4" @click="savePageAct">
        保存
      </div>
      <div class="bg-orange-300 text-white px-3 py-2 leading-3 rounded">预览</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEditorStore } from '@/stores'
import { savePage } from '@/infra/http/editorApi'

const editorStore = useEditorStore()
const { currentPage } = storeToRefs(editorStore)
const savePageAct = () => {
  savePage(currentPage.value).then((res) => {
    console.log(res)
  })
}
</script>
