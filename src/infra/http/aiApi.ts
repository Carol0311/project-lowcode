//调用后端 AI 服务（或 OpenAI / 自建推理服务等）
import request from './request'
import { ChatResponse, PageDeleteResponse } from '@/domain/schema/request'
export const startChat = (data): Promise<ChatResponse> =>
  request({
    url: '/api/ai/startChat',
    method: 'post',
    data,
  })
export const continueChat = (data): Promise<ChatResponse> =>
  request({
    url: '/api/ai/continueChat',
    method: 'post',
    data,
  })
export const deleteChat = (params): Promise<PageDeleteResponse> =>
  request({
    url: '/api/ai/deleteChat',
    method: 'delete',
    params,
  })
