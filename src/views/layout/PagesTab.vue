<template>
  <div
    class="pages-tab w-full flex flex-row justify-between items-center overflow-hidden h-8 border-b border-zinc-200 border-solid text-gray-500"
  >
    <div class="h-full flex-1">
      <div
        v-for="page of pages"
        :key="page.id"
        class="page-item inline-flex flex-row justify-between items-center h-full px-2 border-r border-zinc-200 border-solid"
        :class="{
          'bg-orange-300 text-white': currentPage.id === page.id,
          'bg-white': currentPage.id !== page.id,
        }"
        @click.prevent="pageClick(page.id)"
      >
        <span class="min-w-16 max-w-48 text-ellipsis whitespace-nowrap overflow-hidden">{{
          page.name
        }}</span>
        <PhXCircle weight="light" :size="14" @click.stop="deletePageAct(page.id)" />
      </div>
    </div>
    <div class="inline-flex leading-8 text-center bg-white text-orange-400">
      <div class="w-8"><PhPlus :size="16" weight="light" @click="createPageAct" /></div>
      <div class="w-8"><PhDotsThreeCircle :size="16" weight="duotone" /></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { PhXCircle, PhPlus, PhDotsThreeCircle } from '@phosphor-icons/vue'
import { createPage, deletePage, getPageList } from '@/infra/http/editorApi'
import { useProjectStore, useEditorStore } from '@/stores'

const emit = defineEmits(['showEdit'])

const editorStore = useEditorStore()
const projectStore = useProjectStore()

const { pages } = storeToRefs(projectStore)
const { currentPage } = storeToRefs(editorStore)

const { setCurrentPageId } = editorStore
const { setProject } = projectStore

//点击+请求创建新页面
const createPageAct = async () => {
  emit('showEdit', false)
  await createPage({
    id: 'new-page-id',
    name: '新页面',
    rootComponentIds: [],
    components: {},
  }).then((res) => {
    console.log(res)
  })
  getPageList().then((res) => {
    if (res.success && res.data) {
      setProject(res.data.pageList)
      if (res.data.pageList.length > 0) {
        setCurrentPageId(res.data.pageList[0].id)
      }
    }
  })
}
//点击请求删除页面
const deletePageAct = async (id: string) => {
  emit('showEdit', false)
  await deletePage({ id }).then((res) => {
    console.log(res)
  })
  getPageList().then((res) => {
    if (res.success && res.data) {
      setProject(res.data.pageList)
      if (res.data.pageList.length > 0) {
        setCurrentPageId(res.data.pageList[0].id)
      }
    }
  })
}
const pageClick = async (id: string) => {
  emit('showEdit', false)
  setCurrentPageId(id)
}
</script>
<style scoped></style>
