//对接后端：保存页面、加载项目、发布等
import { PageSchema, ProjectSchema } from '@/domain/schema/index'
export class EditorApi {
  async savePage(projectId: string, page: PageSchema): Promise<boolean> {
    // 调用后端API保存页面
    console.log(`Saving page ${page.id} of project ${projectId} to server...`)
    // 模拟异步操作
    return new Promise((resolve) => setTimeout(() => resolve(true), 500))
  }

  async loadProject(projectId: string): Promise<ProjectSchema | null> {
    // 调用后端API加载项目
    console.log(`Loading project ${projectId} from server...`)
    // 模拟异步操作
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            id: projectId,
            name: 'Demo Project',
            pages: {},
            homePageId: 'view page id',
          }),
        500,
      ),
    )
  }

  async publishProject(projectId: string): Promise<boolean> {
    // 调用后端API发布项目
    console.log(`Publishing project ${projectId} to live...`)
    // 模拟异步操作
    return new Promise((resolve) => setTimeout(() => resolve(true), 500))
  }
}
