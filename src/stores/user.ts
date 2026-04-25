import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../api/user'
import { userApi } from '../api/user'
import { useNotificationStore } from './notification'

export const useUserStore = defineStore('user', () => {
  const notificationStore = useNotificationStore()

  // 状态
  const user = ref<User | null>(null)
  const token = ref<string>(localStorage.getItem('token') || '')
  const isLoading = ref(false)
  const authChecked = ref(false)

  // 计算属性
  const hasToken = computed(() => !!token.value)
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const username = computed(() => user.value?.username || '')
  const avatar = computed(() => user.value?.avatar || '')
  const avatarUrl = computed(() => {
    if (!user.value?.avatar) return ''
    // 添加时间戳来避免缓存问题
    const separator = user.value.avatar.includes('?') ? '&' : '?'
    return `${user.value.avatar}${separator}t=${Date.now()}`
  })

  // Get avatar URL for display
  const getDisplayAvatar = () => {
    if (!user.value?.avatar) return null
    return avatarUrl.value
  }

  // 初始化检查
  async function init() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      try {
        await fetchUserInfo()
      } catch (error) {
        console.error('Token validation failed on localStorage recovery:', error)
        // 不清除token和user，保留本地缓存状态
        // 即使后端暂时不可用，也保持已登录状态
      }
    }
    authChecked.value = true
  }

  // 验证token是否有效（用于路由守卫）
  async function validateToken() {
    if (!token.value) return false
    if (user.value) return true

    try {
      await fetchUserInfo()
      return true
    } catch {
      token.value = ''
      localStorage.removeItem('token')
      user.value = null
      return false
    }
  }

  // 获取用户信息
  async function fetchUserInfo() {
    try {
      const response = await userApi.getInfo()
      user.value = response.data
      return response.data
    } catch (error) {
      throw error
    }
  }

   // 登录
  async function login(username: string, password: string) {
    isLoading.value = true
    console.log('User store login called with:', { username, password })
    try {
      const response = await userApi.login({ username, password })
      console.log('Login response:', response)

      // 先设置token
      token.value = response.data
      localStorage.setItem('token', response.data)

      // 立即设置临时用户对象，确保isAuthenticated为true
      user.value = {
        id: `${username}-temp`,
        username: username,
        password: '',
        avatar: ''
      }
      console.log('Temporary user set:', user.value)
      console.log('isAuthenticated after setting temp user:', {
        hasToken: !!token.value,
        hasUser: !!user.value,
        isAuthenticated: !!token.value && !!user.value
      })

      // 然后尝试获取完整的用户信息
      try {
        await fetchUserInfo()
        console.log('User info fetched:', user.value)
      } catch (userInfoError) {
        console.error('Failed to fetch user info after login, using temp user:', userInfoError)
        // 保留临时用户对象
      }

      notificationStore.addNotification({
        type: 'success',
        title: '登录成功',
        message: '欢迎回到 AstraLink 星系'
      })

      return true
    } catch (error) {
      console.error('Login error:', error)
      notificationStore.addNotification({
        type: 'error',
        title: '登录失败',
        message: '用户名或密码错误'
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  async function register(username: string, password: string) {
    isLoading.value = true
    try {
      await userApi.register({ username, password })

      notificationStore.addNotification({
        type: 'success',
        title: '注册成功',
        message: '新星系已创建，请登录'
      })

      return true
    } catch (error) {
      notificationStore.addNotification({
        type: 'error',
        title: '注册失败',
        message: '用户名可能已存在'
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 退出登录
  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    sessionStorage.clear()

    notificationStore.addNotification({
      type: 'info',
      title: '已退出',
      message: '期待与您再次相会'
    })

    // Redirect to login page
    window.location.href = '/login'
  }

  // 修改密码
  async function changePassword(oldPassword: string, newPassword: string, confirmPassword: string) {
    if (newPassword !== confirmPassword) {
      notificationStore.addNotification({
        type: 'error',
        title: '密码不匹配',
        message: '两次输入的新密码不一致'
      })
      return false
    }

    isLoading.value = true
    try {
      await userApi.changePassword({
        old_password: oldPassword,
        new_password1: newPassword,
        new_password2: confirmPassword
      })

      notificationStore.addNotification({
        type: 'success',
        title: '修改成功',
        message: '密码已更新，请使用新密码登录'
      })

      return true
    } catch (error) {
      notificationStore.addNotification({
        type: 'error',
        title: '修改失败',
        message: '旧密码错误或无法修改'
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 上传头像
  async function uploadAvatar(file: File) {
    isLoading.value = true
    try {
      const response = await userApi.uploadAvatar(file)
      if (user.value) {
        user.value.avatar = response.data
      }

      notificationStore.addNotification({
        type: 'success',
        title: '上传成功',
        message: '头像已更新'
      })

      return true
    } catch (error) {
      notificationStore.addNotification({
        type: 'error',
        title: '上传失败',
        message: '请检查文件格式和大小'
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 清除加载状态
  function clearLoading() {
    isLoading.value = false
  }

  return {
    // 状态
    user,
    token,
    isLoading,
    authChecked,

    // 计算属性
    hasToken,
    isAuthenticated,
    username,
    avatar,
    avatarUrl,
    getDisplayAvatar,

    // 方法
    init,
    validateToken,
    fetchUserInfo,
    login,
    register,
    logout,
    changePassword,
    uploadAvatar,
    clearLoading
  }
})