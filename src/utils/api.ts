import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useNotificationStore } from '../stores/notification'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 统一处理成功响应
    if (response.data && response.data.code !== 200) {
      const notificationStore = useNotificationStore()
      notificationStore.addNotification({
        type: 'error',
        title: '操作失败',
        message: response.data.message || '未知错误'
      })
      return Promise.reject(new Error(response.data.message))
    }
    return response
  },
  (error) => {
    const notificationStore = useNotificationStore()

    if (error.response) {
      // CORS预检请求(204)不显示错误通知
      if (error.response.status === 204) {
        return Promise.reject(error)
      }
      // 服务器返回错误
      switch (error.response.status) {
        case 401:
          notificationStore.addNotification({
            type: 'error',
            title: '认证失败',
            message: '登录已过期，请重新登录'
          })
          // 清除token并跳转到登录页
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 400:
          notificationStore.addNotification({
            type: 'error',
            title: '请求错误',
            message: error.response.data?.message || '参数错误'
          })
          break
        case 500:
          notificationStore.addNotification({
            type: 'error',
            title: '服务器错误',
            message: '服务器内部错误，请稍后重试'
          })
          break
        default:
          notificationStore.addNotification({
            type: 'error',
            title: '请求失败',
            message: error.response.data?.message || '网络请求失败'
          })
      }
    } else if (error.request) {
      // 请求发出但没有响应
      notificationStore.addNotification({
        type: 'error',
        title: '网络错误',
        message: '无法连接到服务器，请检查网络连接'
      })
    } else {
      // 请求配置错误
      notificationStore.addNotification({
        type: 'error',
        title: '请求错误',
        message: error.message || '请求配置错误'
      })
    }

    return Promise.reject(error)
  }
)

export default api