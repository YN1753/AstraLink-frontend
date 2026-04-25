<template>
  <div class="vditor-wrapper" :class="{ 'is-loading': isLoading }">
    <div class="vditor-tags-bar" v-if="shouldShowTagsBar">
      <div class="vditor-tags">
        <span
          v-for="tag in displayTags"
          :key="tag.id"
          class="vditor-tag"
        >
          {{ tag.name }}
          <button @click.stop="$emit('remove-tag', tag.id)" class="vditor-tag-remove">
            <Icon name="X" class="h-2 w-2" />
          </button>
        </span>
        <span v-if="hiddenCount > 0" class="vditor-tag vditor-tag-more">+{{ hiddenCount }}</span>
      </div>
      <button v-if="showAddTag" @click.stop="$emit('open-tag-selector')" class="vditor-add-tag-btn">
        <Icon name="Plus" class="h-3 w-3" />
      </button>
    </div>
    <div ref="editorContainer" class="vditor-editor-container" :class="{ 'vditor-fullscreen': isFullscreen }"></div>
    <div v-if="isLoading" class="vditor-loading">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-cyan"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onBeforeUnmount, nextTick, computed } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { vditorConfig } from '@/utils/vditor-config'
import Icon from '../Icon.vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  readonly?: boolean
  mode?: 'ir' | 'sv' | 'wysiwyg'
  height?: string
  tags?: Array<{ id: string; name: string }>
  showAddTag?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'save': []
  'fullscreen-change': [isFullscreen: boolean]
  'ready': []
  'open-tag-selector': []
  'remove-tag': [tagId: string]
}>()

const editorContainer = ref<HTMLElement>()
const isLoading = ref(true)
let vditorInstance: Vditor | null = null
let vditorReady = false // Track if Vditor is fully initialized
const isFullscreen = ref(false)

// Computed tags display (max 5)
const displayTags = computed(() => {
  console.log('[VditorEditor] displayTags computed, tags prop:', props.tags, 'length:', props.tags?.length || 0)
  return (props.tags || []).slice(0, 5)
})

const shouldShowTagsBar = computed(() => {
  const show = !!(props.tags && props.tags.length > 0 || props.showAddTag)
  console.log('[VditorEditor] shouldShowTagsBar:', show, 'tags:', props.tags, 'showAddTag:', props.showAddTag)
  return show
})

const hiddenCount = computed(() => {
  return Math.max(0, (props.tags || []).length - 5)
})

// 初始化编辑器
onMounted(async () => {
  await nextTick()

  // Wait for DOM to be fully rendered and dimensions to be calculated
  await new Promise(resolve => setTimeout(resolve, 100))

  if (!editorContainer.value) {
    console.error('编辑器容器未找到')
    return
  }

  // 强制容器有明确的高度
  const containerEl = editorContainer.value
  if (containerEl.clientHeight === 0) {
    console.warn('编辑器容器高度为0，尝试设置默认高度')
    containerEl.style.minHeight = '400px'
  }

  // 确保容器有明确的高度
  const containerHeight = props.height || containerEl.clientHeight || 600
  const numericHeight = typeof containerHeight === 'number' ? containerHeight : parseInt(containerHeight) || 600

  try {
    console.log('开始初始化Vditor，容器高度:', numericHeight)
    vditorInstance = new Vditor(editorContainer.value, {
      ...vditorConfig,
      mode: props.mode || 'ir',
      value: props.modelValue || '',
      placeholder: props.placeholder || '开始书写你的知识...',
      height: numericHeight,
      minHeight: 300,
      input: (value: string) => {
        emit('update:modelValue', value)
      },
      ctrlEnter: () => {
        emit('save')
      },
      error: (error: any) => {
        console.error('Vditor error:', error)
        isLoading.value = false
        vditorReady = false
      },
      ready: () => {
        console.log('Vditor ready event fired')
        isLoading.value = false
      },
      after: () => {
        try {
          console.log('Vditor after callback fired - 编辑器初始化完成')
          isLoading.value = false
          vditorReady = true // Mark Vditor as fully ready
          console.log('Vditor编辑器初始化完成')
          emit('ready')

          // 确保编辑器高度正确设置
          if (vditorInstance && editorContainer.value) {
            const vditorElement = editorContainer.value.querySelector('.vditor')
            if (vditorElement) {
              (vditorElement as HTMLElement).style.height = `${numericHeight}px`
            }
          }

          // 监听全屏状态变化
          if (vditorInstance) {
            const toolbarElement = editorContainer.value?.querySelector('.vditor-toolbar')
            if (toolbarElement) {
              const fullscreenBtn = toolbarElement.querySelector('[data-type="fullscreen"]')
              if (fullscreenBtn) {
                fullscreenBtn.addEventListener('click', () => {
                  setTimeout(() => {
                    isFullscreen.value = !isFullscreen.value
                    emit('fullscreen-change', isFullscreen.value)
                  }, 100)
                })
              }
            }
          }
        } catch (innerError) {
          console.error('Vditor after callback error:', innerError)
          isLoading.value = false
        }
      },
    })
  } catch (error) {
    isLoading.value = false
    vditorReady = false
    console.error('Vditor初始化失败:', error)
  }

  // 安全保护：8秒后强制关闭加载状态并标记为就绪
  setTimeout(() => {
    if (isLoading.value) {
      console.warn('Vditor初始化超时，强制关闭加载状态')
      isLoading.value = false
      vditorReady = true // 允许尝试使用编辑器
    }
  }, 8000)
})

// 清理编辑器实例
onBeforeUnmount(() => {
  vditorReady = false // Mark as not ready before destroying
  if (vditorInstance) {
    try {
      vditorInstance.destroy()
    } catch (error) {
      console.error('Vditor销毁失败:', error)
    }
    vditorInstance = null
  }
})

// 监听外部内容变化
watch(() => props.modelValue, (newValue) => {
  if (!vditorReady || !vditorInstance) return
  try {
    const currentValue = vditorInstance.getValue()
    if (currentValue !== newValue) {
      const isFocused = editorContainer.value?.contains(document.activeElement)
      if (!isFocused || currentValue === '') {
        vditorInstance.setValue(newValue || '')
      }
    }
  } catch (e) {
    console.warn('Vditor getValue/setValue error:', e)
  }
}, { immediate: false })

// 监听只读状态变化
watch(() => props.readonly, (readonly) => {
  if (!vditorReady || !vditorInstance) return
  if (readonly) {
    vditorInstance.disabled()
  } else {
    vditorInstance.enable()
  }
})

// 监听编辑器模式变化
watch(() => props.mode, (mode) => {
  if (!vditorReady || !vditorInstance || !mode) return
  // Vditor 3.x 没有直接的 setMode，通常通过渲染模式切换，
  // 这里如果类型定义没有，我们可以尝试 cast 为 any 或者跳过
  (vditorInstance as any).setMode?.(mode)
})

// 公开方法供父组件调用
defineExpose({
  getEditor: () => vditorInstance,
  getValue: () => vditorInstance?.getValue() || '',
  setValue: (value: string) => vditorInstance?.setValue(value),
  insertValue: (value: string) => vditorInstance?.insertValue(value),
  focus: () => {
    console.log('[VditorEditor] focus() called')
    vditorInstance?.focus()
  },
  blur: () => vditorInstance?.blur(),
  undo: () => (vditorInstance as any)?.undo?.(),
  redo: () => (vditorInstance as any)?.redo?.(),
  getSelection: () => vditorInstance?.getSelection(),
  setSelection: (start: number, end: number) => (vditorInstance as any)?.setSelection?.(start, end),
  enable: () => {
    if (vditorInstance) vditorInstance.enable()
  },
  disable: () => {
    if (vditorInstance) vditorInstance.disabled()
  },
  setTheme: (theme: 'dark' | 'classic') => vditorInstance?.setTheme(theme)
})
</script>

<style scoped>
.vditor-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: transparent;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.vditor-tags-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(11, 14, 20, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.vditor-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
  overflow: hidden;
}

.vditor-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 12px;
  font-size: 11px;
  color: rgba(0, 229, 255, 0.9);
  white-space: nowrap;
}

.vditor-tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  color: rgba(0, 229, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.vditor-tag-remove:hover {
  color: rgba(255, 100, 100, 1);
  background: rgba(255, 100, 100, 0.2);
}

.vditor-tag-more {
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.vditor-add-tag-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.vditor-add-tag-btn:hover {
  color: rgba(0, 229, 255);
  border-color: rgba(0, 229, 255, 0.4);
  background: rgba(0, 229, 255, 0.1);
}

.vditor-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(11, 14, 20, 0.5);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.vditor-editor-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  flex: 1;
  transition: all 0.3s ease;
}

.vditor-editor-container.vditor-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
  background: var(--color-deep-space);
}

/* 深空主题适配 */
:deep(.vditor) {
  --border-color: rgba(255, 255, 255, 0.1);
  --second-color: rgba(255, 255, 255, 0.6);
  --panel-background-color: rgba(11, 14, 20, 0.9);
  --toolbar-background-color: rgba(11, 14, 20, 0.95);
  --textarea-background-color: transparent;
  border: none !important;
  height: 100% !important;
  min-height: 400px !important;
  display: flex;
  flex-direction: column;
}

:deep(.vditor-main) {
  flex: 1;
  display: flex;
  min-height: 0;
}

:deep(.vditor-toolbar) {
  background-color: var(--toolbar-background-color) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color) !important;
  padding: 0 12px !important;
  flex-shrink: 0;
  width: 100%;
}

:deep(.vditor-toolbar__item) {
  color: var(--second-color) !important;
}

:deep(.vditor-toolbar__item:hover) {
  background-color: rgba(0, 229, 255, 0.1) !important;
  color: var(--color-neon-cyan) !important;
}

:deep(.vditor-content) {
  background-color: var(--panel-background-color) !important;
  flex: 1 1 auto;
  min-width: 500px;
  overflow: auto !important;
  display: flex;
}

:deep(.vditor-ir) {
  background-color: transparent !important;
  padding: 20px !important;
  flex: 1 1 auto;
  min-width: 500px;
  height: auto !important;
}

:deep(.vditor-outline) {
  width: 200px !important;
  min-width: 80px !important;
  max-width: 250px !important;
  flex: 1 1 200px;
  background-color: rgba(11, 14, 20, 0.8) !important;
  border-left: 1px solid var(--border-color) !important;
  overflow-y: auto !important;
  transition: width 0.2s ease;
}

:deep(.vditor-outline.vditor-outline--hidden) {
  display: none !important;
  width: 0 !important;
  min-width: 0 !important;
  flex: 0 0 0 !important;
}

:deep(.vditor-ir__node) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.vditor-panel) {
  background-color: var(--toolbar-background-color) !important;
  border: 1px solid var(--border-color) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
}

:deep(.vditor-resize) {
  border-top: 1px solid var(--border-color) !important;
  flex-shrink: 0;
}

/* 全屏模式优化 */
:deep(.vditor.vditor--fullscreen) {
  width: 100vw !important;
  height: 100vh !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 9999 !important;
}

:deep(.vditor.vditor--fullscreen .vditor-content) {
  height: calc(100vh - 40px) !important;
}

:deep(.vditor.vditor--fullscreen .vditor-ir) {
  min-width: 600px;
  max-width: 900px;
  margin: 0 auto;
}

/* 自定义滚动条 */
:deep(.vditor-content::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(.vditor-content::-webkit-scrollbar-track) {
  background: rgba(255, 255, 255, 0.05);
}

:deep(.vditor-content::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

:deep(.vditor-content::-webkit-scrollbar-thumb:hover) {
  background: rgba(0, 229, 255, 0.3);
}

:deep(.vditor-resize:hover) {
  border-top-color: var(--color-neon-cyan);
}

/* 代码块样式优化 */
:deep(.vditor-ir__marker--pre .language-markdown) {
  color: rgba(0, 229, 255, 0.8);
}

:deep(.vditor-ir__marker--pre .language-javascript) {
  color: rgba(255, 109, 0, 0.8);
}

:deep(.vditor-ir__marker--pre .language-css) {
  color: rgba(0, 183, 255, 0.8);
}

/* 链接样式 */
:deep(.vditor-ir__link) {
  color: var(--color-neon-cyan);
  text-decoration: none;
  border-bottom: 1px dashed rgba(0, 229, 255, 0.3);
}

:deep(.vditor-ir__link:hover) {
  color: var(--color-neon-blue);
  border-bottom-color: rgba(0, 119, 255, 0.5);
}

/* 引用块样式 */
:deep(.vditor-ir__marker--blockquote) {
  border-left: 3px solid var(--color-neon-purple);
  background: rgba(176, 38, 255, 0.05);
  padding-left: 1rem;
}

/* 表格样式 */
:deep(.vditor-ir__table) {
  border: 1px solid var(--border-color);
}

:deep(.vditor-ir__table th) {
  background-color: rgba(0, 119, 255, 0.1);
  border-bottom: 2px solid var(--color-neon-blue);
}

:deep(.vditor-ir__table td) {
  border: 1px solid var(--border-color);
}

/* 列表样式 */
:deep(.vditor-ir__list) {
  color: rgba(255, 255, 255, 0.8);
}

/* 标题样式 */
:deep(.vditor-ir__h1) {
  color: var(--color-neon-cyan);
  border-bottom: 2px solid rgba(0, 229, 255, 0.3);
}

:deep(.vditor-ir__h2) {
  color: var(--color-neon-blue);
}

:deep(.vditor-ir__h3) {
  color: var(--color-neon-purple);
}

/* 代码行内样式 */
:deep(.vditor-ir__marker--code) {
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 109, 0, 0.8);
  border: 1px solid rgba(255, 109, 0, 0.2);
}

/* 强调文本样式 */
:deep(.vditor-ir__marker--em) {
  color: rgba(255, 215, 0, 0.9);
  font-style: italic;
}

:deep(.vditor-ir__marker--strong) {
  color: rgba(255, 69, 0, 0.9);
  font-weight: bold;
}

/* 删除线样式 */
:deep(.vditor-ir__marker--del) {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: line-through;
}
</style>