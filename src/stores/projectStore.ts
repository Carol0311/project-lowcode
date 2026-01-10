import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { ProjectSchema, PageSchema } from '@/domain/schema'
export const useProjectStore = defineStore('project', () => {
  //状态

  //默认project
  const project = reactive<Omit<ProjectSchema, 'pages'>>({
    id: 'lowcode',
    name: '智能商品档案--低代码平台',
    homePageId: 'appPage',
  })

  //所有页面
  const pages = ref<Record<string, PageSchema>>({})

  const setProject = (pageList: PageSchema[]) => {
    const newPages = {}
    pageList.forEach((page) => {
      newPages[page.id] = page
    })
    pages.value = newPages
  }

  return {
    project,
    pages,
    setProject,
  }
})
