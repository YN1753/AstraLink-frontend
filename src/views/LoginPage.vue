<template>
  <div class="h-screen w-screen bg-deep-space flex items-center justify-center p-4 relative z-0">
    <!-- 星光背景动画 -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="animated-stars"></div>
      <div class="animated-stars delay-1000"></div>
    </div>

    <!-- 中心星系动画 -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="relative">
        <!-- 中心发光球体 -->
        <div class="absolute inset-0 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse-glow"></div>
        <div class="relative w-64 h-64">
          <!-- 旋转轨道 -->
          <div class="absolute inset-0 border border-dashed border-white/10 rounded-full animate-orbit-spin"></div>
          <div class="absolute inset-8 border border-dashed border-white/5 rounded-full animate-orbit-spin" style="animation-delay: -5s;"></div>
          <div class="absolute inset-16 border border-dashed border-white/3 rounded-full animate-orbit-spin" style="animation-delay: -10s;"></div>
        </div>
      </div>
    </div>

    <!-- 登录卡片 -->
    <div class="relative z-10 w-full max-w-md">
      <div class="glass-panel p-8 animate-fade-in">
        <!-- 标题 -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-2 neon-text tracking-wider">🌌 AstraLink</h1>
          <p class="text-gray-400 text-sm">分形图谱知识管理系统</p>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin">
          <div class="mb-4 text-sm text-gray-400">
            提示：用户名 test，密码 test123
          </div>
          <div class="space-y-4">
            <!-- 用户名 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Icon name="User" class="h-4 w-4" />
                星际坐标
              </label>
              <div class="relative">
                <input
                  v-model="form.username"
                  type="text"
                  required
                  placeholder="请输入用户名"
                  class="w-full bg-deep-space-100/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all backdrop-blur-sm placeholder-gray-500"
                  :class="{ 'border-red-500/50': errors.username }"
                />
                <div v-if="errors.username" class="absolute right-3 top-3">
                  <Icon name="AlertCircle" class="h-4 w-4 text-red-400" />
                </div>
              </div>
              <p v-if="errors.username" class="text-xs text-red-400">{{ errors.username }}</p>
            </div>

            <!-- 密码 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Icon name="Lock" class="h-4 w-4" />
                访问密钥
              </label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="请输入密码"
                  class="w-full bg-deep-space-100/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all backdrop-blur-sm placeholder-gray-500 pr-10"
                  :class="{ 'border-red-500/50': errors.password }"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Icon :name="showPassword ? 'EyeOff' : 'Eye'" class="h-4 w-4" />
                </button>
              </div>
              <p v-if="errors.password" class="text-xs text-red-400">{{ errors.password }}</p>
            </div>

            <!-- 记住我 -->
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  v-model="form.remember"
                  type="checkbox"
                  class="rounded border-white/20 bg-deep-space-100/50 text-neon-cyan focus:ring-neon-cyan/20"
                />
                记住此坐标
              </label>
              <button
                type="button"
                @click="showRegister = true"
                class="text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
              >
                创建新星系
              </button>
            </div>

            <!-- 登录按钮 -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-gradient-to-r from-deep-space-100 to-deep-space-200 border border-neon-cyan/30 text-white font-medium py-3 px-4 rounded-lg hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon v-if="isLoading" name="Loader2" class="h-4 w-4 animate-spin" />
              <span v-else>激活跃迁引擎</span>
            </button>
          </div>
        </form>

        </div>
    </div>

    <!-- 注册模态框 -->
    <div
      v-if="showRegister"
      class="fixed inset-0 z-20 flex items-center justify-center p-4 bg-black/70"
      @click.self="showRegister = false"
    >
      <div class="glass-panel p-6 w-full max-w-md animate-fade-in">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold neon-text">创建新星系</h2>
          <button
            @click="showRegister = false"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <Icon name="X" class="h-5 w-5" />
          </button>
        </div>

        <form @submit.prevent="handleRegister">
          <div class="space-y-4">
            <!-- 用户名 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-300">星系名称</label>
              <input
                v-model="registerForm.username"
                type="text"
                required
                placeholder="设置用户名"
                class="w-full bg-deep-space-100/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all backdrop-blur-sm placeholder-gray-500"
              />
            </div>

            <!-- 密码 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-300">访问密钥</label>
              <input
                v-model="registerForm.password"
                :type="showRegisterPassword ? 'text' : 'password'"
                required
                placeholder="设置密码"
                class="w-full bg-deep-space-100/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all backdrop-blur-sm placeholder-gray-500 pr-10"
              />
              <button
                type="button"
                @click="showRegisterPassword = !showRegisterPassword"
                class="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
              >
                <Icon :name="showRegisterPassword ? 'EyeOff' : 'Eye'" class="h-4 w-4" />
              </button>
            </div>

            <!-- 确认密码 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-300">确认密钥</label>
              <input
                v-model="registerForm.confirmPassword"
                :type="showRegisterConfirmPassword ? 'text' : 'password'"
                required
                placeholder="确认密码"
                class="w-full bg-deep-space-100/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all backdrop-blur-sm placeholder-gray-500 pr-10"
              />
              <button
                type="button"
                @click="showRegisterConfirmPassword = !showRegisterConfirmPassword"
                class="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
              >
                <Icon :name="showRegisterConfirmPassword ? 'EyeOff' : 'Eye'" class="h-4 w-4" />
              </button>
            </div>

            <!-- 注册按钮 -->
            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="showRegister = false"
                class="flex-1 bg-deep-space-100/50 border border-white/10 text-white font-medium py-3 px-4 rounded-lg hover:bg-deep-space-100 transition-all"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="isRegisterLoading"
                class="flex-1 bg-gradient-to-r from-deep-space-100 to-deep-space-200 border border-neon-cyan/30 text-white font-medium py-3 px-4 rounded-lg hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Icon v-if="isRegisterLoading" name="Loader2" class="h-4 w-4 animate-spin" />
                <span v-else>创建星域</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-500 z-10">
      <p>基于 Neo4j 图数据库的本地优先知识图谱系统</p>
      <p class="mt-1">V1.0.0 Alpha • 分形宇宙协议</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import Icon from '../components/Icon.vue'

const router = useRouter()
const userStore = useUserStore()

// 登录表单
const form = ref({
  username: '',
  password: '',
  remember: true
})

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const errors = ref<Record<string, string>>({})
const showPassword = ref(false)
const showRegister = ref(false)
const showRegisterPassword = ref(false)
const showRegisterConfirmPassword = ref(false)
const isLoading = ref(false)
const isRegisterLoading = ref(false)

async function handleLogin() {
  // 清空错误
  errors.value = {}
  isLoading.value = true

  console.log('Attempting login with:', form.value)

  try {
    const success = await userStore.login(form.value.username, form.value.password)
    console.log('Login result:', success)
    console.log('User store state after login:', {
      token: userStore.token,
      user: userStore.user,
      isAuthenticated: userStore.isAuthenticated
    })

    if (success) {
      // 获取重定向路径，如果没有则默认跳转到 workspace
      const redirectPath = router.currentRoute.value.query.redirect as string || '/workspace'
      console.log('Redirecting to:', redirectPath)

      // 直接跳转，不使用nextTick避免延迟
      router.push(redirectPath).catch(err => {
        console.error('Router push error:', err)
      })
    }
  } catch (error) {
    console.error('Login error:', error)
    // 登录失败的处理已经在store中完成了
  } finally {
    isLoading.value = false
  }
}

async function handleRegister() {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    errors.value.password = '密码不匹配'
    return
  }

  isRegisterLoading.value = true

  try {
    const success = await userStore.register(registerForm.value.username, registerForm.value.password)
    if (success) {
      showRegister.value = false
      // 自动填入登录表单
      form.value.username = registerForm.value.username
      form.value.password = registerForm.value.password
      // 清空注册表单
      registerForm.value = {
        username: '',
        password: '',
        confirmPassword: ''
      }
    }
  } finally {
    isRegisterLoading.value = false
  }
}

</script>

<style scoped>
.animated-stars {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, transparent 0%, #0B0E14 100%);
  animation: starfield 20s linear infinite;
}

.animated-stars.delay-1000 {
  animation-delay: -10s;
}

@keyframes starfield {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
}

.login-success {
  animation: login-explosion 0.5s ease-out forwards;
}

@keyframes login-explosion {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>