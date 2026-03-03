/**
 * axios请求封装
 */
import axios from 'axios'
import { eventBus } from '@/infra/bus/eventBus'

const baseURL = import.meta.env.DEV ? '' : import.meta.env.VITE_LOWCODE_API_KEY
const service = axios.create({
  baseURL,
  timeout: 5 * 60 * 100, //5 min
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

service.interceptors.request.use(
  (config) => {
    if (config.method === 'get') {
    }
    if (config.method === 'post') {
    }
    return config
  },
  (error) => Promise.reject(error),
)

service.interceptors.response.use(
  (response) => {
    const result = response.data
    if (result.type === 'short') {
      eventBus.emit('show-Info', result)
    }
    return result
  },
  (error) => {
    console.log(error)
    const errorData = error.response.data
    if (errorData) {
      if (errorData.type === 'short') {
        eventBus.emit('show-Info', errorData)
      } else {
        eventBus.emit('show-error', { type: 'error', message: errorData.message })
      }
    }
    return Promise.reject(error)
  },
)

export default service
