import api from '../utils/api'
import type { ApiResponse } from '../utils/api'

export interface User {
  id: string
  username: string
  password: string
  avatar: string
}

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
}

export interface ChangePasswordData {
  old_password: string
  new_password1: string
  new_password2: string
}

class UserApi {
  // 用户注册
  async register(data: RegisterData): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>('/api/user/register', data)
    return response.data
  }

  // 用户登录
  async login(data: LoginData): Promise<ApiResponse<string>> {
    const response = await api.post<ApiResponse<string>>('/api/user/login', data)
    return response.data
  }

  // 获取用户信息
  async getInfo(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>('/api/user/info')
    return response.data
  }

  // 修改密码
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>('/api/user/password', data)
    return response.data
  }

  // 上传头像
  async uploadAvatar(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await api.post<ApiResponse<string>>('/api/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  // 检查token是否有效
  async checkAuth(): Promise<boolean> {
    try {
      await this.getInfo()
      return true
    } catch {
      return false
    }
  }
}

export const userApi = new UserApi()