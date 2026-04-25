<template>
  <div class="h-screen w-screen bg-deep-space overflow-hidden relative z-10">
    <!-- 顶部导航栏 -->
    <header class="absolute top-0 left-0 right-0 z-20 px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- 左侧：面包屑导航 -->
        <nav class="flex items-center gap-2 text-sm">
          <button
            @click="navigateHome"
            class="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
          >
            <Icon name="Home" class="h-4 w-4" />
            <span class="font-medium">🌌 AstraLink</span>
          </button>

          <div class="flex items-center gap-2 text-gray-400" v-if="currentPath.length > 0">
            <Icon name="ChevronRight" class="h-3 w-3" />
            <template v-for="(item, index) in currentPath" :key="item.id">
              <button
                @click="navigateToPath(index)"
                class="hover:text-white transition-colors"
                :class="{ 'font-medium text-neon-cyan': index === currentPath.length - 1 }"
              >
                {{ item.name }}
              </button>
              <Icon v-if="index < currentPath.length - 1" name="ChevronRight" class="h-3 w-3" />
            </template>
          </div>
        </nav>

        <!-- 右侧：用户工具 -->
        <div class="flex items-center gap-3">
          <!-- 搜索按钮 -->
          <button
            @click="showSearch = true"
            class="glass-card px-3 py-1.5 flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <Icon name="Search" class="h-4 w-4" />
            <span class="hidden sm:inline">搜索</span>
            <kbd class="hidden lg:inline text-xs bg-deep-space-100 px-1.5 py-0.5 rounded border border-white/10">
              ⌘K
            </kbd>
          </button>

          <!-- 标签视图 -->
          <button
            @click="showTagView = !showTagView"
            class="glass-card px-3 py-1.5 flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            :class="{ 'text-neon-cyan border-neon-cyan/30': showTagView }"
          >
            <Icon name="Tag" class="h-4 w-4" />
            <span class="hidden sm:inline">标签</span>
          </button>

          <!-- 用户菜单 -->
          <div class="relative user-menu-container">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center gap-2 text-sm hover:bg-white/5 rounded-lg px-3 py-2 transition-colors"
            >
              <div
                class="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xs font-bold overflow-hidden"
              >
                <img
                  v-if="userStore.getDisplayAvatar()"
                  :src="userStore.getDisplayAvatar() || ''"
                  :alt="userStore.username"
                  class="w-full h-full object-cover"
                  @error="(e) => {const target = e.target as HTMLImageElement; target.style.display = 'none'}"
                />
                <span v-else>{{ userInitials }}</span>
              </div>
              <span class="hidden md:inline text-gray-300 font-medium">{{ userStore.username }}</span>
              <Icon name="ChevronDown" class="h-4 w-4 text-gray-400" />
            </button>

            <!-- 用户菜单下拉 -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 top-full mt-2 w-48 glass-panel border border-white/10 animate-fade-in"
              @click.self="showUserMenu = false"
            >
              <div class="p-2 space-y-1">
                <button
                  @click="router.push('/settings')"
                  class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Icon name="Settings" class="h-4 w-4" />
                  设置
                </button>
                <button
                  @click="userStore.logout()"
                  class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Icon name="LogOut" class="h-4 w-4" />
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主工作区 -->
    <main class="h-full w-full pt-16 relative">
      <!-- Force Graph -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center pt-16">
        <div class="text-center">
          <div class="w-16 h-16 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-400">正在加载星系图谱...</p>
        </div>
      </div>

      <ForceGraph
        v-if="!isLoading && !loadError"
        ref="forceGraphRef"
        :nodes="nodes"
        :links="links"
        :width="graphWidth"
        :height="graphHeight"
        :center-node-id="centerNodeId"
        @node-click="selectNode"
        @node-double-click="handleNodeDoubleClick"
        @node-context-menu="handleNodeContextMenu"
      />

      <!-- Error display -->
      <div v-if="loadError" class="absolute inset-0 flex items-center justify-center pt-16">
        <div class="text-center glass-panel p-8">
          <h3 class="text-xl font-semibold text-white mb-4">加载失败</h3>
          <p class="text-gray-400 mb-6">{{ loadError }}</p>
          <button
            @click="() => { loadError = null; loadGraphData() }"
            class="px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors"
          >
            重试
          </button>
        </div>
      </div>

      <!-- Context Menu -->
      <div
        v-if="showContextMenu && contextMenuNode"
        class="context-menu glass-panel py-2 min-w-[180px]"
        :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
        @click.stop
      >
        <div class="px-4 py-2 text-sm text-gray-400 border-b border-white/10 flex items-center gap-2">
          <Icon :name="contextMenuNode.type === 'galaxy' ? 'FolderOpen' : 'FileText'" class="h-4 w-4" />
          {{ contextMenuNode.label }}
        </div>
        <button
          @click="openTagSelectorFromContextMenu"
          class="w-full px-4 py-2.5 text-left text-sm text-neon-cyan hover:bg-neon-cyan/10 flex items-center gap-3 transition-colors"
        >
          <Icon name="Tag" class="h-4 w-4" />
          添加标签
        </button>
        <button
          @click="deleteNodeFromMenu"
          class="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-3 transition-colors"
        >
          <Icon name="Trash" class="h-4 w-4" />
          删除{{ contextMenuNode.type === 'galaxy' ? '星系' : '笔记' }}
        </button>
      </div>

      <!-- 右侧编辑器面板 -->
      <transition name="slide">
        <div
          v-if="showEditor && selectedNode"
          class="absolute right-0 bottom-0 bg-deep-space/90 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col z-20"
          :style="{ width: '35%', height: 'calc(100vh - 4rem)', top: '4rem' }"
        >
          <!-- 编辑器头部 -->
          <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <Icon :name="getNodeIcon(selectedNode.type)" class="h-5 w-5" />
              {{ selectedNode.label }}
            </h3>
            <div class="flex items-center gap-2">
              <button
                @click="toggleEditor"
                class="text-gray-400 hover:text-white transition-colors"
              >
                <Icon name="X" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- 编辑器内容 -->
          <div class="flex-1 min-h-0 overflow-hidden relative" style="height: calc(100% - 140px);">
            <VditorEditor
              v-if="selectedNode.type === 'star'"
              v-model="editorContent"
              :placeholder="'开始书写你的知识...支持 Markdown 语法和即时预览'"
              @save="saveNote"
              @fullscreen-change="handleFullscreenChange"
              @open-tag-selector="showTagSelector = true"
              @remove-tag="(tagId) => selectedNode && removeTagFromNode(selectedNode.id, tagId)"
              mode="ir"
              height="600px"
              :tags="nodeTags"
              :show-add-tag="true"
            />
            <!-- Galaxy description -->
            <div v-else-if="selectedNode.type === 'galaxy'" class="p-6">
              <textarea
                v-model="galaxyDescription"
                placeholder="为这个星系添加描述..."
                class="w-full h-32 bg-deep-space-100/50 border border-white/10 rounded-lg px-4 py-3 text-gray-300 resize-none focus:outline-none focus:border-neon-cyan/50"
              ></textarea>
              <button
                @click="saveGalaxyDescription"
                class="mt-4 px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors"
              >
                保存描述
              </button>
            </div>

            <!-- 笔记/星系标签显示 -->
            <div v-if="selectedNode.type === 'star' || selectedNode.type === 'galaxy'" class="px-6 py-3 border-t border-white/10">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs text-gray-400">标签:</span>
                <span
                  v-for="tag in nodeTags"
                  :key="tag.id"
                  class="inline-flex items-center gap-1 px-2 py-0.5 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full text-xs text-neon-cyan"
                >
                  {{ tag.name }}
                  <button
                    @click.stop="removeTagFromNode(selectedNode!.id, tag.id)"
                    class="hover:text-red-400 ml-1"
                  >
                    <Icon name="X" class="h-3 w-3" />
                  </button>
                </span>
                <button
                  @click="showTagSelector = true"
                  class="inline-flex items-center gap-1 px-2 py-0.5 border border-dashed border-white/20 rounded-full text-xs text-gray-400 hover:text-neon-cyan hover:border-neon-cyan/30 transition-colors"
                >
                  <Icon name="Plus" class="h-3 w-3" />
                  添加标签
                </button>
              </div>
            </div>
          </div>

          <!-- 编辑器底部 -->
          <div class="px-6 py-4 border-t border-white/10">
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                <span v-if="lastSaved">已保存 {{ lastSaved }}</span>
                <span v-else>按 Ctrl+S 保存</span>
              </div>
              <button
                @click="saveCurrentContent"
                class="px-4 py-2 bg-gradient-to-r from-deep-space-100 to-deep-space-200 border border-neon-cyan/30 text-sm font-medium rounded-lg hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-300"
              >
                立即保存
              </button>
            </div>
          </div>
        </div>
      </transition>
    </main>

    <!-- 创建新节点菜单 -->
    <div v-if="showCreateMenu" class="create-menu-container fixed bottom-20 right-6 glass-panel p-2 z-50">
      <div class="space-y-2">
        <button
          @click="createNode('star')"
          class="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors text-gray-300 hover:text-white w-full"
        >
          <Icon name="FileText" class="h-4 w-4 text-neon-cyan" />
          <span>创建笔记</span>
        </button>
        <button
          @click="createNode('galaxy')"
          class="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors text-gray-300 hover:text-white w-full"
        >
          <Icon name="FolderOpen" class="h-4 w-4 text-neon-blue" />
          <span>创建星系</span>
        </button>
      </div>
    </div>

    <!-- 创建新节点按钮 -->
    <button
      @click.stop="testClick"
      class="create-menu-button fixed bottom-6 right-6 z-[60] glass-card w-12 h-12 rounded-full flex items-center justify-center text-neon-cyan hover:scale-110 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all duration-300 animate-pulse-glow"
    >
      <span class="text-xl">+</span>
    </button>

    <!-- 用户资料卡片 -->
    <div
      v-if="showUserProfile"
      class="absolute inset-0 z-30 flex items-center justify-center p-4"
      style="background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(2px);"
      @click.self="showUserProfile = false"
    >
      <UserProfile @close="showUserProfile = false" />
    </div>

    <!-- 搜索模态框 -->
    <transition name="fade">
      <div
        v-if="showSearch"
        class="absolute inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-md"
        @click.self="showSearch = false"
      >
        <div class="glass-panel w-full max-w-2xl mx-auto">
          <div class="p-6">
            <!-- 搜索输入 -->
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索内容..."
                class="w-full bg-deep-space-100/50 border border-white/10 rounded-lg px-10 py-4 text-lg focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all backdrop-blur-sm placeholder-gray-500"
                @input="clearSearchResults"
                @keyup.esc="showSearch = false"
                @keyup.enter="performSearch"
                autofocus
              />
              <Icon name="Search" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <button
                @click="showSearch = false"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <Icon name="X" class="h-5 w-5" />
              </button>
            </div>

            <!-- 搜索结果 -->
            <div v-if="searchResults.length > 0" class="mt-6 space-y-2 max-h-64 overflow-auto">
              <div
                v-for="result in searchResults"
                :key="result.id"
                class="p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                @click="selectSearchResult(result)"
              >
                <div class="flex items-center gap-3">
                  <Icon name="FileText" class="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium truncate">{{ result.title }}</h4>
                    <p class="text-sm text-gray-400 truncate">{{ result.preview }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 标签视图 -->
    <transition name="fade">
      <div
        v-if="showTagView"
        class="absolute inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-start justify-end p-4 pt-16"
        @click.self="showTagView = false"
      >
        <div class="glass-panel w-80 max-h-96 overflow-auto">
          <div class="p-4 border-b border-white/10">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">
                标签星云
                <span class="text-sm text-gray-400 ml-1">({{ tagCategoriesCount }}种)</span>
              </h3>
              <button
                @click="showTagView = false"
                class="text-gray-400 hover:text-white"
              >
                <Icon name="X" class="h-5 w-5" />
              </button>
            </div>
          </div>
          <!-- 创建新标签 -->
          <div class="p-4 border-b border-white/10">
            <div class="flex gap-2">
              <input
                v-model="newTagName"
                type="text"
                placeholder="新标签名称..."
                class="flex-1 bg-deep-space-100/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-neon-cyan/50"
                @keyup.enter="createTag"
              />
              <button
                @click="createTag"
                class="px-3 py-1.5 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors text-sm"
              >
                添加
              </button>
            </div>
          </div>
          <div class="p-4">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in tags"
                :key="tag.id"
                class="inline-flex items-center gap-1 px-3 py-1 bg-deep-space-100/50 border border-white/10 rounded-full text-sm hover:border-neon-cyan/30 transition-colors cursor-pointer group"
                @click="selectedNode && addTagToNode(selectedNode.id, tag.id)"
              >
                <Icon name="Tag" class="h-3 w-3" />
                {{ tag.name }}
                <button
                  @click.stop="deleteTag(tag.id)"
                  class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 ml-1"
                >
                  <Icon name="X" class="h-3 w-3" />
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 标签选择器模态框 -->
    <transition name="fade">
      <div
        v-if="showTagSelector"
        class="absolute inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-md"
        @click.self="showTagSelector = false"
      >
        <div class="glass-panel w-96 max-h-[500px] overflow-hidden flex flex-col">
          <div class="p-4 border-b border-white/10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="Tag" class="h-4 w-4 text-neon-cyan" />
                <span class="text-sm text-gray-400">为</span>
                <span class="font-semibold text-neon-cyan">{{ selectedNode?.label }}</span>
                <span class="text-sm text-gray-400">添加标签</span>
              </div>
              <button
                @click="showTagSelector = false"
                class="text-gray-400 hover:text-white"
              >
                <Icon name="X" class="h-5 w-5" />
              </button>
            </div>
          </div>
          <div class="p-4 overflow-y-auto flex-1">
            <div class="mb-3">
              <span class="text-xs text-gray-500">已有标签</span>
              <div class="flex flex-wrap gap-2 mt-2">
                <span
                  v-for="tag in nodeTags"
                  :key="tag.id"
                  class="inline-flex items-center gap-1 px-3 py-1 bg-neon-cyan/20 border border-neon-cyan/30 rounded-full text-sm text-neon-cyan"
                >
                  <Icon name="Tag" class="h-3 w-3" />
                  {{ tag.name }}
                  <button
                    @click.stop="selectedNode && removeTagFromNode(selectedNode.id, tag.id)"
                    class="hover:text-red-400 ml-1"
                  >
                    <Icon name="X" class="h-3 w-3" />
                  </button>
                </span>
                <span v-if="nodeTags.length === 0" class="text-sm text-gray-500">暂无标签</span>
              </div>
            </div>
            <div class="border-t border-white/10 pt-3 mb-3">
              <span class="text-xs text-gray-500">选择标签</span>
              <div class="flex flex-wrap gap-2 mt-2">
                <span
                  v-for="tag in tags"
                  :key="tag.id"
                  class="inline-flex items-center gap-1 px-3 py-1 bg-deep-space-100/50 border border-white/10 rounded-full text-sm hover:border-neon-cyan/30 transition-colors cursor-pointer"
                  :class="{'border-neon-cyan/50 bg-neon-cyan/10': isTagSelected(tag.id)}"
                  @click="selectedNode && addTagToNode(selectedNode.id, tag.id)"
                >
                  <Icon name="Tag" class="h-3 w-3" />
                  {{ tag.name }}
                </span>
              </div>
            </div>
            <div class="border-t border-white/10 pt-4">
              <div class="flex gap-2">
                <input
                  v-model="newTagName"
                  type="text"
                  placeholder="创建新标签..."
                  class="flex-1 bg-deep-space-100/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neon-cyan/50"
                  @keyup.enter="createTagAndAddToNode"
                />
                <button
                  @click="createTagAndAddToNode"
                  class="px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors text-sm"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useNotificationStore } from '../stores/notification'
import { nodeApi } from '../api/node'
import type { GraphNode, GraphLink, Galaxy } from '../api/node'
import ForceGraph from '../components/graph/ForceGraph.vue'
import VditorEditor from '../components/editor/VditorEditor.vue'
import UserProfile from '../components/UserProfile.vue'
import Icon from '../components/Icon.vue'

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

// Component refs
const forceGraphRef = ref()

// State
const showSearch = ref(false)
const showTagView = ref(false)
const showUserMenu = ref(false)
const showEditor = ref(false)
const showCreateMenu = ref(false)
const showUserProfile = ref(false)
const showTagSelector = ref(false)
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuNode = ref<GraphNode | null>(null)
const searchQuery = ref('')
const currentPath = ref<Array<{ id: string; name: string }>>(
  JSON.parse(sessionStorage.getItem('currentPath') || '[]')
)
const selectedNode = ref<GraphNode | null>(null)
const editorContent = ref('')
const galaxyDescription = ref('')
const lastSaved = ref<string | null>(null)
const graphWidth = ref(800)
const graphHeight = ref(600)
const isLoading = ref(true)
const loadError = ref<string | null>(null)

// Graph data
const nodes = shallowRef<GraphNode[]>([])
const links = shallowRef<GraphLink[]>([])
const centerNodeId = ref<string>(sessionStorage.getItem('centerNodeId') || '')
const userNode = ref<GraphNode | null>(null)
const newTagName = ref('')

// Tags from API
const tags = ref<Array<{ id: string; name: string; count?: number }>>([])
const tagCategoriesCount = ref(0)

// Tags for selected node (when editing a star)
const nodeTags = ref<Array<{ id: string; name: string }>>([])

const searchResults = ref<Array<{ id: string; title: string; preview: string; type: string }>>([])

// Computed
const userInitials = computed(() => {
  const username = userStore.username
  if (!username) return 'U'
  return username.substring(0, 2).toUpperCase()
})

// Methods
const loadGraphData = async (centerId?: string) => {
  isLoading.value = true
  loadError.value = null

  console.log('[loadGraphData] called with centerId:', centerId, 'currentPath length:', currentPath.value.length)

  try {
    if (!userStore.user) {
      await userStore.fetchUserInfo()
    }

    console.log('[loadGraphData] Calling nodeApi.getUserGraph with centerId:', centerId)
    const response = await nodeApi.getUserGraph(userStore.user?.id, centerId)
    console.log('[Graph] API response:', response)

    if (response.data) {
      const graphData = response.data
      console.log('[Graph] Raw graphData nodes:', graphData.nodes?.map(n => ({id: n.id, type: n.type, label: n.label})))
      console.log('[Graph] Raw graphData links:', graphData.links?.map(l => ({source: l.source, target: l.target, type: l.type})))
      console.log('[Graph] Node count:', graphData.nodes?.length)
      console.log('[Graph] Link count:', graphData.links?.length)

      if (!centerId) {
        // Root level - add user node and use it as center
        const userData = userStore.user
        if (!userData) return

        const userNodeData: GraphNode = {
          id: userData.id,
          type: 'user',
          label: userData.username,
          data: {
            id: userData.id,
            username: userData.username,
            avatar: userData.avatar || ''
          }
        }

        // Remove any existing user nodes from the data to prevent duplicates
        graphData.nodes = graphData.nodes.filter((n: GraphNode) => n.type !== 'user')

        // Keep all links - the user node will be added at the beginning
        // but links will still reference the user by id which is fine for D3

        graphData.nodes.unshift(userNodeData)
        userNode.value = userNodeData
        centerNodeId.value = userNodeData.id
      } else {
        // Sub-level - use centerId as the center node
        centerNodeId.value = centerId
        // Find the center node and set it as userNode temporarily for navigation
        const centerNode = graphData.nodes.find((n: GraphNode) => n.id === centerId)
        if (centerNode) {
          userNode.value = centerNode
        }
      }

      console.log('[Graph] After processing - Node count:', graphData.nodes?.length)
      console.log('[Graph] After processing - Link count:', graphData.links?.length)

      // Transform nodes to proper format - filter out tag nodes from main graph
      nodes.value = graphData.nodes
        .filter((node: GraphNode) => node.type !== 'tag')
        .map((node: GraphNode) => ({
          ...node
        }))

      console.log('[Graph] After filter - nodes.value count:', nodes.value.length)

      // Transform links to ensure source/target are IDs and filter out tag links
      links.value = graphData.links
        .map((link: GraphLink) => ({
          source: typeof link.source === 'string' ? link.source : (link.source as any).id,
          target: typeof link.target === 'string' ? link.target : (link.target as any).id,
          type: link.type,
          distance: link.distance || 100
        }))
        // Filter out HAS_TAG links since tags are not displayed in main graph
        .filter((link: GraphLink) => link.type !== 'HAS_TAG')

      console.log('[Graph] After filter - links.value count:', links.value.length)
      console.log('[Graph] links.value sample:', JSON.stringify(links.value.slice(0, 3)))

      // Force render after data is loaded
      await nextTick()
      if (forceGraphRef.value) {
        setTimeout(() => {
          forceGraphRef.value?.zoomToNode(centerNodeId.value)
        }, 500)
      }
    }
  } catch (error: any) {
    console.error('Failed to load graph data:', error)
    console.error('Error response:', error.response)
    console.error('Error status:', error.response?.status)
    loadError.value = '无法连接到服务器，请确保后端服务正在运行'
  } finally {
    isLoading.value = false
  }
}

const selectNode = (node: GraphNode) => {
  selectedNode.value = node

  if (node.type === 'user') {
    // Single click on user node shows user profile sidebar
    showUserProfile.value = true
    showEditor.value = false
  } else if (node.type === 'star') {
    // Load star content
    showEditor.value = true
    loadStarContent(node.id)
    loadNodeTags(node.id)
  } else if (node.type === 'galaxy') {
    showEditor.value = true
    galaxyDescription.value = (node.data as Galaxy).title || ''
    loadNodeTags(node.id)
  }
}

const handleNodeDoubleClick = async (node: GraphNode) => {
  if (node.type === 'user') {
    // Double-click user shows profile modal
    showUserProfile.value = true
  } else if (node.type === 'galaxy') {
    // Double-click galaxy makes it the new center - but prevent circular navigation
    const isAlreadyInPath = currentPath.value.some(p => p.id === node.id)
    if (!isAlreadyInPath) {
      navigateToGalaxy(node)
    } else {
      // Already in this galaxy, just zoom to it
      if (forceGraphRef.value) {
        forceGraphRef.value.zoomToNode(node.id)
      }
    }
    // Close editor when navigating
    showEditor.value = false
    selectedNode.value = null
  } else if (node.type === 'star') {
    // Double-click star opens editor
    selectNode(node)
    showEditor.value = true
    loadNodeTags(node.id)
  }
}

const handleNodeContextMenu = (node: GraphNode, event: MouseEvent) => {
  // Don't allow deleting user node
  if (node.type === 'user') return

  // Position the context menu at the mouse location
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  contextMenuNode.value = node
  showContextMenu.value = true
}

const closeContextMenu = () => {
  showContextMenu.value = false
  contextMenuNode.value = null
}

const handleGlobalClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement

  // Close context menu when clicking anywhere outside
  if (showContextMenu.value) {
    if (!target.closest('.context-menu')) {
      closeContextMenu()
    }
  }

  // Close user menu when clicking outside
  if (showUserMenu.value) {
    if (!target.closest('.user-menu-container')) {
      showUserMenu.value = false
    }
  }

  // Close create menu when clicking outside
  if (showCreateMenu.value) {
    if (!target.closest('.create-menu-container')) {
      showCreateMenu.value = false
    }
  }
}

// Open tag selector from context menu and select the node first
const openTagSelectorFromContextMenu = () => {
  if (!contextMenuNode.value) return

  // Select the node first so tag operations work on it
  const node = contextMenuNode.value
  selectedNode.value = node
  closeContextMenu()

  // Show tag selector panel
  showTagSelector.value = true

  // Load tags for this node
  loadNodeTags(node.id)
}

const deleteNodeFromMenu = async () => {
  if (!contextMenuNode.value) return

  const node = contextMenuNode.value
  closeContextMenu()

  try {
    await nodeApi.deleteNode(node.id)
    notificationStore.addNotification({
      type: 'success',
      title: '删除成功',
      message: `已删除${node.type === 'galaxy' ? '星系' : '笔记'}`
    })
    // Reload graph - stay in current view
    // Use currentPath to determine if we're inside a galaxy (more reliable than centerNodeId)
    const isInsideGalaxy = currentPath.value.length > 0
    const targetCenterId = isInsideGalaxy ? centerNodeId.value : undefined

    console.log('[deleteNodeFromMenu] Reloading graph - isInsideGalaxy:', isInsideGalaxy, 'centerNodeId:', centerNodeId.value, 'currentPath length:', currentPath.value.length)

    await loadGraphData(targetCenterId)
  } catch (error: any) {
    notificationStore.addNotification({
      type: 'error',
      title: '删除失败',
      message: error.message || '无法删除节点'
    })
  }
}

const navigateToGalaxy = (galaxyNode: GraphNode) => {
  currentPath.value.push({ id: galaxyNode.id, name: galaxyNode.label })
  centerNodeId.value = galaxyNode.id
  sessionStorage.setItem('currentPath', JSON.stringify(currentPath.value))
  sessionStorage.setItem('centerNodeId', galaxyNode.id)

  // Reload graph with galaxy as center
  loadGraphData(galaxyNode.id)

  // Zoom to the galaxy node
  setTimeout(() => {
    if (forceGraphRef.value) {
      forceGraphRef.value.zoomToNode(galaxyNode.id)
    }
  }, 500)
}

const navigateHome = () => {
  currentPath.value = []
  // Use userStore.user.id directly instead of userNode.value?.id
  const userId = userStore.user?.id || ''
  centerNodeId.value = userId
  sessionStorage.setItem('currentPath', '[]')
  sessionStorage.setItem('centerNodeId', userId)
  loadGraphData()
}

const navigateToPath = (index: number) => {
  if (index === -1) {
    navigateHome()
  } else {
    currentPath.value = currentPath.value.slice(0, index + 1)
    const pathItem = currentPath.value[index]
    centerNodeId.value = pathItem.id
    sessionStorage.setItem('currentPath', JSON.stringify(currentPath.value))
    sessionStorage.setItem('centerNodeId', pathItem.id)
    loadGraphData(pathItem.id)
  }
}

const toggleCreateMenu = () => {
  showCreateMenu.value = !showCreateMenu.value
}

const testClick = () => {
  console.log('[TEST] Button clicked! showCreateMenu:', showCreateMenu.value)
  toggleCreateMenu()
}

const createNode = async (type: 'star' | 'galaxy') => {
  showCreateMenu.value = false
  console.log('[createNode] Starting - type:', type)
  console.log('[createNode] centerNodeId:', centerNodeId.value)
  console.log('[createNode] userStore.user?.id:', userStore.user?.id)

  try {
    let response: any

    if (type === 'star') {
      // If we're inside a galaxy (centerNodeId is a galaxy and not the user), create star in that galaxy
      const currentCenter = nodes.value.find(n => n.id === centerNodeId.value)
      console.log('[createNode] currentCenter:', currentCenter)
      const galaxyId = (currentCenter?.type === 'galaxy') ? centerNodeId.value : undefined
      console.log('[createNode] Calling createStar with galaxyId:', galaxyId)
      response = await nodeApi.createStar(galaxyId)
      console.log('[createNode] createStar response:', response)
    } else {
      // Create new galaxy - parent is current center if not at root level (user node)
      const parentId = centerNodeId.value === userStore.user?.id ? undefined : centerNodeId.value
      console.log('[createNode] Calling createGalaxy with parentId:', parentId)
      response = await nodeApi.createGalaxy(parentId ? { parent_id: parentId } : {})
      console.log('[createNode] createGalaxy response:', response)
    }

    console.log('[createNode] response.data:', response?.data)

    if (response?.data) {
      console.log('[createNode] Creating notification')
      notificationStore.addNotification({
        type: 'success',
        title: '创建成功',
        message: `已创建新的${type === 'star' ? '笔记' : '星系'}`
      })

      // Reload graph data - stay in current view
      // Use currentPath to determine if we're inside a galaxy (more reliable than centerNodeId)
      const isInsideGalaxy = currentPath.value.length > 0
      const targetCenterId = isInsideGalaxy ? centerNodeId.value : undefined

      console.log('[createNode] Reloading graph - isInsideGalaxy:', isInsideGalaxy, 'centerNodeId:', centerNodeId.value, 'currentPath length:', currentPath.value.length)

      await loadGraphData(targetCenterId)
    } else {
      console.log('[createNode] No data in response, skipping reload')
    }
  } catch (error: any) {
    console.error('[createNode] Error:', error)
    console.error('[createNode] Error response:', error.response)
    // Don't show error if it's a CORS preflight (204)
    if (!error.response?.status || error.response?.status !== 204) {
      notificationStore.addNotification({
        type: 'error',
        title: '创建失败',
        message: error.message || '无法创建节点，请稍后重试'
      })
    }
  }
}

const loadStarContent = async (starId: string) => {
  try {
    const response = await nodeApi.getStarContent(starId)
    // API returns {code, message, data} where data is the actual content string
    // Since nodeApi methods return response.data directly (after axios interceptor),
    // response is already the ApiResponse object
    if (response.data) {
      editorContent.value = response.data
    } else {
      editorContent.value = '# 新笔记\n\n开始编写内容...'
    }

    // Also load tags for this star
    await loadNodeTags(starId)
  } catch (error) {
    console.error('Failed to load star content:', error)
    editorContent.value = '# 新笔记\n\n开始编写内容...'
  }
}

// Load tags for a node
async function loadNodeTags(nodeId: string) {
  try {
    const response = await nodeApi.getNodeTags(nodeId)
    if (response.data) {
      nodeTags.value = response.data
    }
  } catch (error) {
    console.error('Failed to load node tags:', error)
    nodeTags.value = []
  }
}

const saveNote = async () => {
  if (!selectedNode.value || !editorContent.value) return

  try {
    // Extract title from first line (e.g., "# My Title" -> "My Title")
    const firstLine = editorContent.value.split('\n')[0].trim()
    let title = '未命名笔记'
    if (firstLine.startsWith('# ')) {
      title = firstLine.substring(2).trim()
    } else if (firstLine.startsWith('#')) {
      title = firstLine.replace(/^#+\s*/, '').trim()
    }

    // Update title if changed
    if (selectedNode.value.label !== title) {
      await nodeApi.updateStarTitle(selectedNode.value.id, title)
      selectedNode.value.label = title
      // Update node in graph
      const node = nodes.value.find(n => n.id === selectedNode.value?.id)
      if (node) {
        node.label = title
      }
    }

    // Save content using PUT API
    await nodeApi.updateStarContent(selectedNode.value.id, editorContent.value)

    lastSaved.value = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })

    notificationStore.addNotification({
      type: 'success',
      title: '保存成功',
      message: '笔记已保存'
    })

    // Clear last saved message after 2 seconds
    setTimeout(() => {
      lastSaved.value = null
    }, 2000)
  } catch (error) {
    console.error('Failed to save note:', error)
    notificationStore.addNotification({
      type: 'error',
      title: '保存失败',
      message: '无法保存笔记，请稍后重试'
    })
  }
}

const saveGalaxyDescription = async () => {
  if (!selectedNode.value || !galaxyDescription.value) return

  try {
    // Update galaxy title in Neo4j
    await nodeApi.updateGalaxyTitle(selectedNode.value.id, galaxyDescription.value)
    selectedNode.value.label = galaxyDescription.value
    // Update node in graph and data
    const node = nodes.value.find(n => n.id === selectedNode.value?.id)
    if (node) {
      node.label = galaxyDescription.value
      // Also update the data.title for consistency
      if (node.data && typeof node.data === 'object') {
        (node.data as any).title = galaxyDescription.value
      }
    }
    // Update selectedNode data as well
    if (selectedNode.value.data && typeof selectedNode.value.data === 'object') {
      (selectedNode.value.data as any).title = galaxyDescription.value
    }

    // Reload graph to reflect changes
    await loadGraphData()

    notificationStore.addNotification({
      type: 'success',
      title: '保存成功',
      message: '星系描述已更新'
    })
  } catch (error) {
    console.error('Failed to save galaxy description:', error)
    notificationStore.addNotification({
      type: 'error',
      title: '保存失败',
      message: '无法保存星系描述，请稍后重试'
    })
  }
}

const saveCurrentContent = () => {
  if (selectedNode.value?.type === 'star') {
    saveNote()
  } else if (selectedNode.value?.type === 'galaxy') {
    saveGalaxyDescription()
  }
}

const toggleEditor = () => {
  showEditor.value = !showEditor.value
  if (!showEditor.value) {
    selectedNode.value = null
    editorContent.value = ''
    galaxyDescription.value = ''
  }
}

const handleFullscreenChange = (_fullscreen: boolean) => {
  // Handle editor fullscreen
}

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'user': return 'User'
    case 'galaxy': return 'FolderOpen'
    case 'star': return 'FileText'
    case 'tag': return 'Tag'
    default: return 'Circle'
  }
}

// Clear search results when input changes
const clearSearchResults = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
  }
}

// Clean markdown syntax from text for preview
const cleanMarkdown = (text: string): string => {
  if (!text) return ''
  return text
    .replace(/#{1,6}\s/g, '') // headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold
    .replace(/\*(.+?)\*/g, '$1') // italic
    .replace(/`(.+?)`/g, '$1') // inline code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
    .replace(/!\[.+?\]\(.+?\)/g, '') // images
    .replace(/^\s*[-*+]\s/gm, '') // list items
    .replace(/^\s*\d+\.\s/gm, '') // numbered lists
    .replace(/^\s*>\s/gm, '') // blockquotes
    .replace(/\n+/g, ' ') // newlines
    .replace(/\s+/g, ' ') // multiple spaces
    .trim()
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  try {
    const response = await nodeApi.search(searchQuery.value.trim())
    console.log('[Search] Raw response:', response)
    console.log('[Search] Response.data:', response?.data)
    if (response?.data) {
      searchResults.value = response.data.map((item: any) => ({
        id: item.id,
        title: item.title || item.name,
        preview: cleanMarkdown(item.preview) || (item.type === 'star' ? '笔记' : item.type === 'galaxy' ? '星系' : '标签'),
        type: item.type
      }))
      console.log('[Search] Mapped results:', searchResults.value)
    } else {
      console.log('[Search] No data in response, results:', searchResults.value)
    }
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = []
  }
}

// Load tags from API
async function loadTags() {
  try {
    const response = await nodeApi.getTags()
    if (response.data) {
      tags.value = response.data
    }
    // Load tag categories count
    const countResponse = await nodeApi.getTagCategoriesCount()
    if (countResponse.data) {
      tagCategoriesCount.value = countResponse.data.tagCategoriesCount || 0
    }
  } catch (error) {
    console.error('Failed to load tags:', error)
  }
}

// Create a new tag
async function createTag() {
  if (!newTagName.value.trim()) return
  try {
    await nodeApi.createTag(newTagName.value.trim())
    newTagName.value = ''
    await loadTags()
    notificationStore.addNotification({
      type: 'success',
      title: '标签创建成功',
      message: '新标签已添加到星云'
    })
  } catch (error) {
    notificationStore.addNotification({
      type: 'error',
      title: '标签创建失败',
      message: '无法创建标签'
    })
  }
}

// Delete a tag (from system, not from a node)
async function deleteTag(tagId: string) {
  try {
    await nodeApi.deleteTag(tagId)
    await loadTags()
    notificationStore.addNotification({
      type: 'success',
      title: '标签已删除',
      message: '标签已从系统删除'
    })
  } catch (error) {
    console.error('Failed to delete tag:', error)
    notificationStore.addNotification({
      type: 'error',
      title: '删除失败',
      message: '无法删除标签'
    })
  }
}

// Check if a tag is already selected for the current node
function isTagSelected(tagId: string): boolean {
  return nodeTags.value.some(t => t.id === tagId)
}

// Add tag to node
async function addTagToNode(nodeId: string, tagId: string) {
  try {
    await nodeApi.addTagToNode(nodeId, tagId)
    // Reload node tags to reflect the change
    await loadNodeTags(nodeId)
    notificationStore.addNotification({
      type: 'success',
      title: '标签已添加',
      message: '标签已成功添加到节点'
    })
  } catch (error) {
    notificationStore.addNotification({
      type: 'error',
      title: '添加标签失败',
      message: '无法添加标签到节点'
    })
  }
}

// Remove tag from node
async function removeTagFromNode(nodeId: string, tagId: string) {
  try {
    await nodeApi.removeTagFromNode(nodeId, tagId)
    // Reload node tags to reflect the change
    await loadNodeTags(nodeId)
    notificationStore.addNotification({
      type: 'success',
      title: '标签已移除',
      message: '标签已从节点移除'
    })
  } catch (error) {
    notificationStore.addNotification({
      type: 'error',
      title: '移除标签失败',
      message: '无法从节点移除标签'
    })
  }
}

// Create tag and add to selected node
async function createTagAndAddToNode() {
  if (!newTagName.value.trim() || !selectedNode.value) return
  try {
    const tagResponse = await nodeApi.createTag(newTagName.value.trim())
    newTagName.value = ''
    await loadTags()
    if (tagResponse.data) {
      await addTagToNode(selectedNode.value.id, tagResponse.data.id)
      await loadNodeTags(selectedNode.value.id)
    }
  } catch (error) {
    notificationStore.addNotification({
      type: 'error',
      title: '创建标签失败',
      message: '无法创建标签'
    })
  }
}

const selectSearchResult = (result: any) => {
  // Find and select the node by id
  const node = nodes.value.find(n => n.id === result.id && n.type === result.type)
  if (node) {
    selectNode(node)
    forceGraphRef.value?.zoomToNode(node.id)
  } else {
    // If node not in current view, set selectedNode directly and load content
    selectedNode.value = {
      id: result.id,
      label: result.title || '新笔记',
      type: result.type,
      data: { title: result.title || '新笔记' }
    } as GraphNode
    if (result.type === 'star') {
      loadStarContent(result.id)
    }
  }

  showSearch.value = false
  searchQuery.value = ''
  searchResults.value = []
}

// Keyboard shortcuts
const handleKeyDown = (e: KeyboardEvent) => {
  // Ctrl+K 搜索
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    showSearch.value = true
    searchQuery.value = ''
    searchResults.value = []
  }

  // Escape 关闭模态框
  if (e.key === 'Escape') {
    if (showSearch.value) showSearch.value = false
    if (showTagView.value) showTagView.value = false
    if (showUserMenu.value) showUserMenu.value = false
    if (showCreateMenu.value) showCreateMenu.value = false
    if (showUserProfile.value) showUserProfile.value = false
  }

  // Ctrl+S 保存
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    if (showEditor.value) {
      saveCurrentContent()
    }
  }
}

// Update graph dimensions
const updateGraphDimensions = () => {
  graphWidth.value = window.innerWidth
  graphHeight.value = window.innerHeight - 64 // Subtract header height
}

// Lifecycle
onMounted(async () => {
  console.log('WorkspacePage mounted - user authenticated:', userStore.isAuthenticated)

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', updateGraphDimensions)
  window.addEventListener('scroll', closeContextMenu, { passive: true })
  window.addEventListener('click', handleGlobalClick)
  updateGraphDimensions()

  // Debug: log sessionStorage values
  console.log('[onMounted] sessionStorage currentPath:', sessionStorage.getItem('currentPath'))
  console.log('[onMounted] sessionStorage centerNodeId:', sessionStorage.getItem('centerNodeId'))
  console.log('[onMounted] userStore.user?.id:', userStore.user?.id)

  // Load user info first to ensure we have the correct user ID
  if (!userStore.user) {
    await userStore.fetchUserInfo()
  }

  // Load graph data and tags - use stored centerNodeId if it's not the current user's ID
  const storedCenterId = sessionStorage.getItem('centerNodeId')
  const currentUserId = userStore.user?.id
  const initialCenterId = storedCenterId && storedCenterId !== currentUserId ? storedCenterId : undefined
  console.log('[onMounted] storedCenterId:', storedCenterId, 'currentUserId:', currentUserId, 'initialCenterId:', initialCenterId)
  await Promise.all([loadGraphData(initialCenterId), loadTags()])
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', updateGraphDimensions)
  window.removeEventListener('scroll', closeContextMenu)
  window.removeEventListener('click', handleGlobalClick)
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.glass-panel {
  background: rgba(26, 32, 44, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.glass-card {
  background: rgba(45, 55, 72, 0.5);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.context-menu {
  position: fixed;
  z-index: 50;
  border-radius: 8px;
  animation: contextMenuIn 0.15s ease-out;
}

@keyframes contextMenuIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse-glow {
  0% { box-shadow: 0 0 0 0 rgba(0, 229, 255, 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(0, 229, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 229, 255, 0); }
}

.animate-pulse-glow {
  animation: pulse-glow 2s infinite;
}
</style>