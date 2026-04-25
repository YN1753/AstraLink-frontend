<template>
  <div class="h-screen w-screen bg-deep-space overflow-auto scrollbar-hide">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- 头部 -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold neon-text tracking-wide">控制中心</h1>
          <p class="text-gray-400 mt-2">管理你的 AstraLink 星域设置</p>
        </div>
        <button
          @click="router.back()"
          class="glass-card px-4 py-2 flex items-center gap-2 text-sm hover:text-white transition-colors"
        >
          <Icon name="ArrowLeft" class="h-4 w-4" />
          返回工作区
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧导航 -->
        <div class="lg:col-span-1">
          <div class="glass-panel p-4">
            <nav class="space-y-1">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                class="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all"
                :class="tabClasses(tab.id)"
              >
                <Icon :name="tab.icon" class="h-4 w-4" />
                {{ tab.label }}
              </button>
            </nav>

            <div class="mt-6 pt-6 border-t border-white/10">
              <div class="text-xs text-gray-500 space-y-2 px-4">
                <p>当前版本：{{ version }}</p>
                <p>数据位置：本地存储</p>
                <p>节点总数：{{ galaxyCount + starCount }} 个</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧内容 -->
        <div class="lg:col-span-2">
          <!-- 账户设置 -->
          <div v-if="activeTab === 'account'" class="space-y-6">
            <div class="glass-panel p-6">
              <div class="flex items-center gap-4 mb-6">
                <div v-if="userStore.avatarUrl" class="w-20 h-20 rounded-full overflow-hidden border-2 border-neon-cyan/30">
                  <img :src="userStore.avatarUrl" :key="userStore.avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-20 h-20 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-2xl font-bold">
                  {{ userInitials }}
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold">{{ userStore.username }}</h3>
                  <p class="text-gray-400 text-sm">加入于 {{ joinDate }}</p>
                </div>
                <button
                  @click="showAvatarUpload = true"
                  class="glass-card px-4 py-2 flex items-center gap-2 text-sm hover:text-white transition-colors"
                >
                  <Icon name="Upload" class="h-4 w-4" />
                  更换头像
                </button>
              </div>

              <!-- 用户信息 -->
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-300">用户ID</label>
                  <div class="flex items-center gap-2">
                    <input
                      :value="userStore.user?.id || '未知'"
                      type="text"
                      readonly
                      class="w-full bg-deep-space-100/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm"
                    />
                    <button
                      @click="copyUserId"
                      class="glass-card px-3 py-2.5 text-sm hover:text-white transition-colors"
                    >
                      复制
                    </button>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-300">用户名</label>
                  <input
                    v-model="accountForm.username"
                    type="text"
                    class="w-full bg-deep-space-100/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all"
                  >
                </div>

                <button
                  @click="updateProfile"
                  :disabled="isUpdatingProfile"
                  class="w-full bg-gradient-to-r from-deep-space-100 to-deep-space-200 border border-neon-cyan/30 text-sm font-medium py-2.5 px-4 rounded-lg hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="isUpdatingProfile">更新中...</span>
                  <span v-else>更新个人资料</span>
                </button>
              </div>
            </div>

            <!-- 密码修改 -->
            <div class="glass-panel p-6">
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                <Icon name="Lock" class="h-5 w-5" />
                修改访问密钥
              </h3>

              <form @submit.prevent="changePassword" class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-300">当前密钥</label>
                  <div class="relative">
                    <input
                      v-model="passwordForm.oldPassword"
                      :type="showCurrentPassword ? 'text' : 'password'"
                      required
                      class="w-full bg-deep-space-100/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all pr-10"
                    >
                    <button
                      type="button"
                      @click="showCurrentPassword = !showCurrentPassword"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <Icon :name="showCurrentPassword ? 'EyeOff' : 'Eye'" class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-300">新密钥</label>
                  <div class="relative">
                    <input
                      v-model="passwordForm.newPassword"
                      :type="showNewPassword ? 'text' : 'password'"
                      required
                      class="w-full bg-deep-space-100/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all pr-10"
                    >
                    <button
                      type="button"
                      @click="showNewPassword = !showNewPassword"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <Icon :name="showNewPassword ? 'EyeOff' : 'Eye'" class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-300">确认新密钥</label>
                  <div class="relative">
                    <input
                      v-model="passwordForm.confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      required
                      class="w-full bg-deep-space-100/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all pr-10"
                    >
                    <button
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <Icon :name="showConfirmPassword ? 'EyeOff' : 'Eye'" class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  :disabled="isChangingPassword"
                  class="w-full bg-gradient-to-r from-deep-space-100 to-deep-space-200 border border-neon-cyan/30 text-sm font-medium py-2.5 px-4 rounded-lg hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="isChangingPassword">更新中...</span>
                  <span v-else>更新访问密钥</span>
                </button>
              </form>
            </div>
          </div>

          <!-- 主题设置 -->
          <div v-else-if="activeTab === 'theming'" class="space-y-6">
            <div class="glass-panel p-6">
              <h3 class="text-lg font-bold mb-4">视觉主题</h3>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <button
                  v-for="theme in themes"
                  :key="theme.id"
                  @click="selectedTheme = theme.id"
                  class="aspect-square rounded-lg border-2 transition-all"
                  :class="themeClasses(theme.id)"
                  :style="{ backgroundColor: theme.color }"
                >
                  <div class="absolute inset-0 flex items-center justify-center">
                    <Icon v-if="selectedTheme === theme.id" name="Check" class="h-6 w-6 text-white" />
                  </div>
                  <div class="absolute bottom-2 left-2 right-2 text-center">
                    <span class="text-xs font-medium">{{ theme.name }}</span>
                  </div>
                </button>
              </div>

              <button
                @click="applyTheme"
                class="w-full mt-6 bg-gradient-to-r from-deep-space-100 to-deep-space-200 border border-neon-cyan/30 text-sm font-medium py-2.5 px-4 rounded-lg hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-300"
              >
                应用主题
              </button>
            </div>

            <div class="glass-panel p-6">
              <h3 class="text-lg font-bold mb-4">轨道样式</h3>

              <div class="space-y-4">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="text-sm font-medium text-gray-300">轨道间距</label>
                    <span class="text-xs text-gray-400">{{ orbitSpacing }}px</span>
                  </div>
                  <input
                    v-model="orbitSpacing"
                    type="range"
                    min="80"
                    max="200"
                    step="10"
                    class="w-full h-2 bg-deep-space-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="text-sm font-medium text-gray-300">节点大小</label>
                    <span class="text-xs text-gray-400">{{ nodeSize }}px</span>
                  </div>
                  <input
                    v-model="nodeSize"
                    type="range"
                    min="30"
                    max="60"
                    step="5"
                    class="w-full h-2 bg-deep-space-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 数据管理 -->
          <div v-else-if="activeTab === 'data'" class="space-y-6">
            <div class="glass-panel p-6">
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                <Icon name="Database" class="h-5 w-5" />
                数据统计
              </h3>

              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="glass-card p-4">
                  <div class="text-2xl font-bold mb-1">{{ galaxyCount }}</div>
                  <div class="text-sm text-gray-400">星系数量</div>
                </div>
                <div class="glass-card p-4">
                  <div class="text-2xl font-bold mb-1">{{ starCount }}</div>
                  <div class="text-sm text-gray-400">笔记数量</div>
                </div>
                <div class="glass-card p-4">
                  <div class="text-2xl font-bold mb-1">{{ tagCount }}</div>
                  <div class="text-sm text-gray-400">标签数量</div>
                </div>
                <div class="glass-card p-4">
                  <div class="text-2xl font-bold mb-1">{{ tagCategoriesCount }}</div>
                  <div class="text-sm text-gray-400">标签种类</div>
                </div>
                <div class="glass-card p-4">
                  <div class="text-2xl font-bold mb-1">{{ storageSize }}</div>
                  <div class="text-sm text-gray-400">本地存储</div>
                </div>
              </div>

              <button
                @click="exportData"
                class="w-full mb-3 glass-card border border-white/10 py-2.5 px-4 rounded-lg hover:border-neon-cyan/30 transition-colors"
              >
                导出所有数据 (JSON)
              </button>
              <button
                @click="showImport = true"
                class="w-full glass-card border border-white/10 py-2.5 px-4 rounded-lg hover:border-neon-cyan/30 transition-colors"
              >
                导入数据
              </button>
            </div>

            <div class="glass-panel p-6">
              <h3 class="text-lg font-bold mb-4 text-red-400 flex items-center gap-2">
                <Icon name="AlertTriangle" class="h-5 w-5" />
                危险区域
              </h3>

              <div class="space-y-3">
                <button
                  @click="showClearConfirm = true"
                  class="w-full glass-card border border-red-500/30 text-red-400 py-2.5 px-4 rounded-lg hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="Trash2" class="h-4 w-4" />
                  清空所有笔记
                </button>

                <button
                  @click="showDeleteAccountConfirm = true"
                  class="w-full glass-card border border-red-500/30 text-red-400 py-2.5 px-4 rounded-lg hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="UserX" class="h-4 w-4" />
                  删除账户
                </button>
              </div>
            </div>
          </div>

          <!-- 关于 -->
          <div v-else class="space-y-6">
            <div class="glass-panel p-6">
              <div class="text-center mb-6">
                <h1 class="text-3xl font-bold mb-2 neon-text">🌌 AstraLink</h1>
                <p class="text-gray-400">{{ version}} • 分形知识图谱系统</p>
              </div>

              <div class="space-y-4 text-sm text-gray-300">
                <p>
                  AstraLink 是一个基于“本地优先”原则构建的网状知识图谱笔记软件，
                  采用分形宇宙和向心轨道的可视化隐喻，打造你的个人知识宇宙。
                </p>
                <p>
                  <strong>核心特性：</strong> 图数据库存储、分形钻取编辑、
                  玻璃拟态UI、本地优先架构。
                </p>
              </div>

              <div class="mt-6 space-y-3">
                <div class="flex items-center gap-3">
                  <Icon name="Cpu" class="h-4 w-4 text-gray-400" />
                  <span class="text-sm">后端：Go 1.22 + Gin + Neo4j + Bleve</span>
                </div>
                <div class="flex items-center gap-3">
                  <Icon name="Layout" class="h-4 w-4 text-gray-400" />
                  <span class="text-sm">前端：Vue 3 + TypeScript + D3.js + Tailwind + Vditor</span>
                </div>
                <div class="flex items-center gap-3">
                  <Icon name="Code" class="h-4 w-4 text-gray-400" />
                  <span class="text-sm">开源协议：MIT License</span>
                </div>
              </div>
            </div>

            <div class="glass-panel p-6">
              <h3 class="text-lg font-bold mb-4">贡献者</h3>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <!-- <div class="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-sm font-bold">
                    AS
                  </div> -->
                  <img src="data:image/jpeg;base64,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"
                      alt="Avatar"
                      class="w-10 h-10 rounded-full object-cover border-2 border-cyan-400"
                  />
                  <div class="flex-1">
                    <div class="font-medium">迟暮</div>
                    <div class="text-xs text-gray-400">开发者</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 头像上传模态框 -->
    <div
      v-if="showAvatarUpload"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="showAvatarUpload = false"
    >
      <div class="glass-panel p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold">上传新头像</h3>
          <button
            @click="showAvatarUpload = false"
            class="text-gray-400 hover:text-white"
          >
            <Icon name="X" class="h-5 w-5" />
          </button>
        </div>

        <div class="space-y-4">
          <div class="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-neon-cyan/50 transition-colors">
            <input
              type="file"
              ref="avatarInput"
              @change="handleAvatarUpload"
              accept="image/*"
              class="hidden"
            />
            <div @click="triggerAvatarUpload">
              <Icon name="Upload" class="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p class="text-sm text-gray-400">点击选择图片</p>
              <p class="text-xs text-gray-500 mt-1">支持 JPG, PNG, WebP (最大 2MB)</p>
            </div>
          </div>

          <div class="text-xs text-gray-500">
            <p>• 建议使用 1:1 比例的正方形图片</p>
            <p>• 推荐尺寸：256×256 像素</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 导入数据模态框 -->
    <div
      v-if="showImport"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="showImport = false"
    >
      <div class="glass-panel p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold">导入数据</h3>
          <button
            @click="showImport = false"
            class="text-gray-400 hover:text-white"
          >
            <Icon name="X" class="h-5 w-5" />
          </button>
        </div>

        <div class="space-y-4">
          <div class="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-neon-cyan/50 transition-colors">
            <input
              type="file"
              ref="importInput"
              accept=".json"
              class="hidden"
            />
            <div @click="triggerImport">
              <Icon name="FileJson" class="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p class="text-sm text-gray-400">点击选择 JSON 文件</p>
              <p class="text-xs text-gray-500 mt-1">请选择之前导出的 AstraLink 数据文件</p>
            </div>
          </div>

          <div class="text-xs text-yellow-500">
            <p>⚠️ 警告：导入数据将覆盖当前所有笔记，请谨慎操作</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 清除所有笔记确认模态框 -->
    <div
      v-if="showClearConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="showClearConfirm = false"
    >
      <div class="glass-panel p-6 w-full max-w-sm">
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <Icon name="AlertTriangle" class="h-8 w-8 text-red-400" />
          </div>
          <h3 class="text-xl font-bold mb-2">确认清空所有笔记</h3>
          <p class="text-gray-400 text-sm mb-6">
            此操作将删除所有星系和笔记，且<span class="text-red-400 font-semibold">无法撤销</span>。
            你的用户账户和设置将被保留。
          </p>
          <div class="flex gap-3">
            <button
              @click="showClearConfirm = false"
              class="flex-1 glass-card py-2.5 px-4 rounded-lg hover:bg-white/10 transition-colors"
            >
              取消
            </button>
            <button
              @click="clearAllNotes"
              class="flex-1 bg-red-500/20 border border-red-500/50 text-red-400 py-2.5 px-4 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除账户确认模态框 -->
    <div
      v-if="showDeleteAccountConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="showDeleteAccountConfirm = false"
    >
      <div class="glass-panel p-6 w-full max-w-sm">
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <Icon name="UserX" class="h-8 w-8 text-red-400" />
          </div>
          <h3 class="text-xl font-bold mb-2">确认删除账户</h3>
          <p class="text-gray-400 text-sm mb-6">
            此操作将<span class="text-red-400 font-semibold">永久删除</span>你的账户和所有数据，包括所有星系、笔记和标签。此操作<span class="text-red-400 font-semibold">无法撤销</span>。
          </p>
          <div class="flex gap-3">
            <button
              @click="showDeleteAccountConfirm = false"
              class="flex-1 glass-card py-2.5 px-4 rounded-lg hover:bg-white/10 transition-colors"
            >
              取消
            </button>
            <button
              @click="deleteAccount"
              class="flex-1 bg-red-500/20 border border-red-500/50 text-red-400 py-2.5 px-4 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              确认删除账户
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notification'
import { nodeApi } from '../api/node'
import Icon from '../components/Icon.vue'

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

// 状态
const activeTab = ref('account')
const accountForm = ref({
  username: userStore.username || ''
})
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const showAvatarUpload = ref(false)
const showImport = ref(false)
const showClearConfirm = ref(false)
const showDeleteAccountConfirm = ref(false)
const isUpdatingProfile = ref(false)
const isChangingPassword = ref(false)
const selectedTheme = ref('deep-space')
const orbitSpacing = ref(120)
const nodeSize = ref(40)

const avatarInput = ref<HTMLInputElement | null>(null)
const importInput = ref<HTMLInputElement | null>(null)

// Real data from API
const galaxyCount = ref(0)
const starCount = ref(0)
const tagCount = ref(0)
const tagCategoriesCount = ref(0)
const storageSize = ref('0 KB')
const joinDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const tabs = [
  { id: 'account', label: '账户设置', icon: 'User' },
  { id: 'theming', label: '主题与外观', icon: 'Palette' },
  { id: 'data', label: '数据管理', icon: 'Database' },
  { id: 'about', label: '关于', icon: 'Info' }
]

const themes = [
  { id: 'deep-space', name: '深空', color: '#0B0E14' },
  { id: 'nebula', name: '星云', color: '#1A1037' },
  { id: 'cosmos', name: '宇宙', color: '#0F172A' },
  { id: 'dark-matter', name: '暗物质', color: '#111111' },
  { id: 'black-hole', name: '黑洞', color: '#000000' },
  { id: 'galaxy', name: '银河', color: '#0F0F23' }
]

// 计算属性
const userInitials = computed(() => {
  const username = userStore.username
  if (!username) return 'U'
  return username.substring(0, 2).toUpperCase()
})

function tabClasses(tabId: string) {
  const baseClasses = 'hover:bg-white/5 hover:text-white transition-colors'
  if (activeTab.value === tabId) {
    return `${baseClasses} bg-gradient-to-r from-deep-space-100 to-deep-space-200 text-white border border-neon-cyan/30`
  }
  return `${baseClasses} text-gray-400`
}

function themeClasses(themeId: string) {
  const baseClasses = 'relative transition-all'
  if (selectedTheme.value === themeId) {
    return `${baseClasses} border-neon-cyan scale-105 shadow-[0_0_20px_rgba(0,229,255,0.3)]`
  }
  return `${baseClasses} border-transparent`
}

// 方法
function updateProfile() {
  isUpdatingProfile.value = true
  // 这里应该调用API更新用户信息
  setTimeout(() => {
    notificationStore.addNotification({
      type: 'success',
      title: '更新成功',
      message: '个人资料已更新'
    })
    isUpdatingProfile.value = false
  }, 1000)
}

async function changePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    notificationStore.addNotification({
      type: 'error',
      title: '错误',
      message: '两次输入的新密码不一致'
    })
    return
  }

  isChangingPassword.value = true
  try {
    const success = await userStore.changePassword(
      passwordForm.value.oldPassword,
      passwordForm.value.newPassword,
      passwordForm.value.confirmPassword
    )

    if (success) {
      passwordForm.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  } finally {
    isChangingPassword.value = false
  }
}

function copyUserId() {
  const userId = userStore.user?.id
  if (userId) {
    navigator.clipboard.writeText(userId)
    notificationStore.addNotification({
      type: 'success',
      title: '复制成功',
      message: '用户ID已复制到剪贴板'
    })
  }
}

function applyTheme() {
  notificationStore.addNotification({
    type: 'success',
    title: '主题已应用',
    message: `已切换到 ${themes.find(t => t.id === selectedTheme.value)?.name} 主题`
  })
}

function exportData() {
  // 这里应该实现数据导出功能
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    galaxyCount: galaxyCount.value,
    starCount: starCount.value,
    tagCount: tagCount.value
  }

  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = `astralink-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  notificationStore.addNotification({
    type: 'success',
    title: '导出成功',
    message: '数据已导出为JSON文件'
  })
}

async function clearAllNotes() {
  showClearConfirm.value = false
  try {
    await nodeApi.clearAllStars()
    notificationStore.addNotification({
      type: 'success',
      title: '已清空',
      message: '所有笔记已删除'
    })
    // Reload stats to reflect the change
    await loadStats()
  } catch (error) {
    console.error('Failed to clear notes:', error)
    notificationStore.addNotification({
      type: 'error',
      title: '清空失败',
      message: '无法清空笔记，请稍后重试'
    })
  }
}

function deleteAccount() {
  showDeleteAccountConfirm.value = false
  notificationStore.addNotification({
    type: 'error',
    title: '账户已删除',
    message: '你的账户和所有数据已被永久删除'
  })
  // 这里应该调用API删除账户并跳转到登录页
  setTimeout(() => {
    userStore.logout()
    router.push('/login')
  }, 2000)
}

function triggerAvatarUpload() {
  avatarInput.value?.click()
}

async function handleAvatarUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    // 检查文件大小和类型
    if (file.size > 2 * 1024 * 1024) {
      notificationStore.addNotification({
        type: 'error',
        title: '文件太大',
        message: '请选择小于2MB的图片'
      })
      return
    }

    if (!file.type.startsWith('image/')) {
      notificationStore.addNotification({
        type: 'error',
        title: '文件格式错误',
        message: '请选择图片文件'
      })
      return
    }

    showAvatarUpload.value = false
    await userStore.uploadAvatar(file)
    input.value = ''
  }
}

function triggerImport() {
  importInput.value?.click()
}

// 加载用户统计
async function loadStats() {
  try {
    const response = await nodeApi.getUserStats()
    if (response.data) {
      galaxyCount.value = response.data.galaxyCount || 0
      starCount.value = response.data.starCount || 0
      tagCount.value = response.data.tagCount || 0
    }
    // Load tag categories count
    const tagCategoriesResponse = await nodeApi.getTagCategoriesCount()
    if (tagCategoriesResponse.data) {
      tagCategoriesCount.value = tagCategoriesResponse.data.tagCategoriesCount || 0
    }
    // Calculate storage size by checking the data directory
    await calculateStorageSize()
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

// Calculate storage size
async function calculateStorageSize() {
  try {
    // Estimate storage based on star count (each note file is roughly 2-5KB on average)
    const estimatedSize = starCount.value * 3 // KB
    if (estimatedSize < 1024) {
      storageSize.value = `${estimatedSize} KB`
    } else {
      storageSize.value = `${(estimatedSize / 1024).toFixed(1)} MB`
    }
  } catch (error) {
    console.error('Failed to calculate storage:', error)
    storageSize.value = '未知'
  }
}
const version = __APP_VERSION__
// 生命周期
onMounted(async () => {
  // 初始化表单数据
  accountForm.value.username = userStore.username || ''
  // 加载真实统计数据
  await loadStats()
})
</script>