/**
 * 编辑器区域请求
 */
import request from './request'
import { PageListResponse, PageResponse, PageDeleteResponse } from '@/domain/schema/request'

/*********************页面操作请求api*************************************/
//获取页面列表
export const getPageList = (): Promise<PageListResponse> =>
  request({
    url: '/api/getPageList',
    method: 'get',
  })
//新增页面
export const createPage = (data): Promise<PageResponse> =>
  request({
    url: '/api/createPage',
    method: 'post',
    data,
  })
//保存页面
export const savePage = (data): Promise<PageResponse> =>
  request({
    url: '/api/savePage',
    method: 'post',
    data,
  })

//更新页面(包括更新组件，删除/新增/复制/移动组件等)
export const updatePage = (data): Promise<PageResponse> =>
  request({
    url: '/api/updatePage',
    method: 'post',
    data,
  })

//删除页面
export const deletePage = (params): Promise<PageDeleteResponse> =>
  request({
    url: '/api/deletePage',
    method: 'delete',
    params,
  })

//获取页面详情
export const getPageDetail = (params): Promise<PageResponse> =>
  request({
    url: '/api/getPageDetail',
    method: 'get',
    params,
  })
