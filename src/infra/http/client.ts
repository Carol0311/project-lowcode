//封装 axios/fetch，统一拦截器
// infra/http/client.ts
import request from './request'

export interface AddressList {
  id: string
  parentid: string
  name: string
  children?: []
}

//获取省份数据
export const getProvince = (): Promise<AddressList[]> =>
  request({
    url: '/api/province',
    method: 'get',
  })

//获取城市数据
export const getCity = (params): Promise<AddressList[]> =>
  request({
    url: `/api/city`,
    method: 'get',
    params,
  })

//获取区县数据
export const getDistrict = (params): Promise<AddressList[]> =>
  request({
    url: `/api/district`,
    method: 'get',
    params,
  })

//获取街道乡镇数据
export const getCounty = (params): Promise<AddressList[]> =>
  request({
    url: `/api/county`,
    method: 'get',
    params,
  })
