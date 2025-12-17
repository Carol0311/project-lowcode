//封装 axios/fetch，统一拦截器
// infra/http/client.ts
import axios, { AxiosInstance } from 'axios'
import type {
  ApiConfig,
  SavePageRequest,
  SavePageResponse,
  OperationLog,
  Collaborator,
} from './types'
import type { EditorCommand, PageSchema } from '@/domain/schema/index'
export class ApiClient {
  private axios: AxiosInstance

  constructor(config: ApiConfig) {
    this.axios = axios.create(config)
    this.setupInterceptors()
  }
  setupInterceptors() {
    this.axios.interceptors.request.use(
      (config) => {
        // 请求拦截器逻辑
        return config
      },
      (error) => Promise.reject(error),
    )

    this.axios.interceptors.response.use(
      (response) => {
        // 响应拦截器逻辑
        return response
      },
      (error) => Promise.reject(error),
    )
  }

  async savePage(pageId: string, data: SavePageRequest): Promise<SavePageResponse> {
    return this.axios.post(`/pages/${pageId}`, data)
  }

  async recordOperation(operation: OperationLog): Promise<void> {
    // 异步发送，不阻塞用户
    this.axios.post('/operations', operation).catch(console.error)
  }

  async getCollaborators(pageId: string): Promise<Collaborator[]> {
    return this.axios.get(`/pages/${pageId}/collaborators`)
  }
}

// infra/http/editor.api.ts
export class EditorApi {
  constructor(private client: ApiClient) {}

  async saveEditorState(page: PageSchema, operations: OperationLog[]): Promise<void> {
    await this.client.savePage(page.id, {
      content: page,
      operations,
      version: Date.now(),
    })
  }

  async syncOperation(operation: EditorCommand): Promise<void> {
    // 实时同步操作（未来功能）
    return this.client.recordOperation({
      ...operation,
      syncedAt: Date.now(),
    })
  }
}
