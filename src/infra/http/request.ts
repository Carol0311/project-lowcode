/**
 * axios请求封装
 */
import axios from 'axios'

const baseURL = import.meta.env.DEV ? '' : import.meta.env.VITE_LOWCODE_API_KEY
const service = axios.create({
  baseURL,
  timeout: 5000,
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
    return result.data
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default service
