<template>
  <div class="glass-panel p-6 w-80" @click.stop>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-semibold text-white">个人中心</h3>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-white transition-colors"
      >
        <Icon name="X" class="h-5 w-5" />
      </button>
    </div>

    <!-- Avatar and Username -->
    <div class="flex flex-col items-center mb-6">
      <div class="relative mb-4">
        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center overflow-hidden">
          <img
            v-if="storeAvatar || displayAvatar"
            :src="storeAvatar || displayAvatar"
            :alt="userInfo.username || userStore.username"
            class="w-full h-full object-cover"
            @error="avatarLoadError = true"
          />
          <span v-else class="text-3xl font-bold text-white">
            {{ userInitials }}
          </span>
        </div>
        <button
          class="absolute bottom-0 right-0 w-8 h-8 bg-neon-cyan rounded-full flex items-center justify-center hover:bg-neon-cyan/80 transition-colors"
          @click="triggerAvatarUpload"
        >
          <Icon name="Camera" class="h-4 w-4 text-white" />
        </button>
        <input
          ref="avatarInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleAvatarUpload"
        />
      </div>
      <h4 class="text-lg font-medium text-white mb-1">{{ userInfo.username }}</h4>
      <p class="text-sm text-gray-400">{{ userInfo.id }}</p>
    </div>

    <!-- Statistics -->
    <div class="space-y-4 mb-6">
      <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-neon-blue/20 rounded-lg flex items-center justify-center">
            <Icon name="FolderOpen" class="h-5 w-5 text-neon-blue" />
          </div>
          <span class="text-gray-300">星系数</span>
        </div>
        <span class="text-xl font-semibold text-white">{{ stats.galaxyCount }}</span>
      </div>

      <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-neon-cyan/20 rounded-lg flex items-center justify-center">
            <Icon name="FileText" class="h-5 w-5 text-neon-cyan" />
          </div>
          <span class="text-gray-300">笔记数</span>
        </div>
        <span class="text-xl font-semibold text-white">{{ stats.starCount }}</span>
      </div>

      <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-neon-purple/20 rounded-lg flex items-center justify-center">
            <Icon name="Tag" class="h-5 w-5 text-neon-purple" />
          </div>
          <span class="text-gray-300">标签数</span>
        </div>
        <span class="text-xl font-semibold text-white">{{ stats.tagCount }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="space-y-2">
      <button
        @click="goToSettings"
        class="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Icon name="Settings" class="h-4 w-4" />
        设置
      </button>
      <button
        @click="handleLogout"
        class="w-full px-4 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Icon name="LogOut" class="h-4 w-4" />
        退出登录
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { userApi } from '../api/user'
import { nodeApi } from '../api/node'
import { useNotificationStore } from '../stores/notification'
import Icon from './Icon.vue'

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const avatarInputRef = ref<HTMLInputElement>()
const userInfo = ref<Partial<{
  id: string
  username: string
  avatar: string
}>>({})
const avatarLoadError = ref(false)

const stats = ref({
  galaxyCount: 0,
  starCount: 0,
  tagCount: 0
})

const userInitials = computed(() => {
  // 优先使用从 API 加载的用户信息
  const username = userInfo.value.username || userStore.username
  if (!username) return 'U'
  return username.substring(0, 2).toUpperCase()
})

// 添加缓存破坏机制以获取最新的头像
const getAvatarUrl = (avatar: string | undefined, userId: string | undefined) => {
  if (!avatar || !userId) return undefined

  // 如果是完整URL，直接使用
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    // 添加时间戳来避免缓存问题
    const url = new URL(avatar)
    url.searchParams.set('t', Date.now().toString())
    return url.toString()
  }

  // 否则构建本地URL
  return `http://localhost:8181/data/avatar/uid_${userId}.jpg?t=${Date.now()}`
}

const displayAvatar = computed(() => {
  // 优先使用从 API 加载的头像
  const avatar = userInfo.value.avatar || userStore.avatar
  const userId = userInfo.value.id || userStore.user?.id

  if (!avatar || avatarLoadError.value) return undefined
  return getAvatarUrl(avatar, userId)
})

// 使用用户 store 的头像
const storeAvatar = computed(() => {
  return userStore.getDisplayAvatar()
})

const loadUserInfo = async () => {
  try {
    const response = await userApi.getInfo()
    if (response.data) {
      userInfo.value = {
        ...response.data
      }
      avatarLoadError.value = false
    }
  } catch (error) {
    console.error('Failed to load user info:', error)
  }
}

const loadStats = async () => {
  try {
    const response = await nodeApi.getUserStats()
    if (response.data) {
      stats.value = {
        galaxyCount: response.data.galaxyCount || 0,
        starCount: response.data.starCount || 0,
        tagCount: response.data.tagCount || 0
      }
    }
  } catch (error) {
    console.error('Failed to load user stats:', error)
    // Keep default zeros on error
  }
}

const triggerAvatarUpload = () => {
  avatarInputRef.value?.click()
}

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    notificationStore.addNotification({
      type: 'error',
      title: '上传失败',
      message: '头像文件大小不能超过 5MB'
    })
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    notificationStore.addNotification({
      type: 'error',
      title: '上传失败',
      message: '请选择图片文件'
    })
    return
  }

  try {
    const response = await userApi.uploadAvatar(file)
    if (response.data) {
      userInfo.value.avatar = response.data
      avatarLoadError.value = false
      // 强制刷新显示的头像
      await loadUserInfo()
      notificationStore.addNotification({
        type: 'success',
        title: '上传成功',
        message: '头像已更新'
      })
    }
  } catch (error) {
    notificationStore.addNotification({
      type: 'error',
      title: '上传失败',
      message: '头像上传失败，请稍后重试'
    })
  } finally {
    // Reset input
    target.value = ''
  }
}

const goToSettings = () => {
  emit('close')
  router.push('/settings')
}

const handleLogout = () => {
  emit('close')
  userStore.logout()
}

onMounted(() => {
  loadUserInfo()
  loadStats()
})
</script>

<style scoped>
.glass-panel {
  background: rgba(26, 32, 44, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
</style>