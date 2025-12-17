import { defineStore } from 'pinia'
import { reactive } from 'vue'
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
  const pages = reactive<Record<string, PageSchema>>({})

  const setProject = (pageId: string, page: PageSchema) => {
    pages[pageId] = page
  }

  return {
    project,
    setProject,
  }
})
