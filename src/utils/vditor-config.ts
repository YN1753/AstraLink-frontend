// Vditor编辑器配置
// 由于 Vditor 的类型定义可能不完整，这里使用 any
export const vditorConfig: any = {
  mode: 'ir', // 即时渲染模式 (ir: Instant Rendering)
  theme: 'dark',
  preview: {
    theme: {
      current: 'dark',
    },
    markdown: {
      toc: true,
      mark: true,
      footnote: true,
      autoSpace: true,
      fixTermTypo: true,
      codeBlockPreview: true,
      mathBlockPreview: true,
      linkBase: '',
      linkPrefix: '',
    },
    actions: []
  },
  toolbar: [
    'headings',
    'bold',
    'italic',
    'strike',
    'link',
    '|',
    'list',
    'ordered-list',
    'check',
    'quote',
    '|',
    'code',
    'inline-code',
    'insert-before',
    'insert-after',
    'table',
    '|',
    'undo',
    'redo',
    '|',
    'fullscreen',
    'edit-mode',
    'outline',
    'help'
  ],
  cache: {
    enable: false
  },
  upload: {
    accept: 'image/*,.pdf,.doc,.docx,.txt',
    max: 10 * 1024 * 1024, // 10MB
    handler: (files: File[]) => {
      console.log('上传文件:', files)
      // TODO: 实现文件上传逻辑
      return Promise.resolve([])
    }
  },
  height: '100%',
  placeholder: '开始书写你的知识...支持 Markdown 语法和即时预览',
  counter: {
    enable: true,
    max: 100000
  },
  resize: {
    enable: true,
    position: 'bottom'
  },
  lang: 'en_US',
  typewriterMode: false,
  outline: {
    enable: true,
    position: 'left'
  },
  hint: {
    emoji: {
      '+1': '👍',
      '-1': '👎',
      'heart': '❤️',
      'rocket': '🚀',
      'star': '⭐',
      'lightbulb': '💡',
      'book': '📚',
      'link': '🔗',
      'warning': '⚠️',
      'info': 'ℹ️',
      'check': '✅'
    }
  },
  link: {
    click: (url: string) => {
      console.log('链接点击:', url)
      // 可以在这里处理Astralink的内部链接格式
      // 例如：[[内部链接]] 的解析
    }
  },
  after: () => {
    console.log('Vditor编辑器初始化完成')
  }
}

// Vditor选项配置接口
export interface VditorOptions {
  contentWidth?: number // 内容区域宽度，默认900
  editorPadding?: number // 编辑器内边距，默认20
}

// 获取主题适配的配置
export function getVditorConfig(mode: 'ir' | 'sv' | 'wysiwyg' = 'ir', options?: VditorOptions): any {
  const contentWidth = options?.contentWidth || 900
  const editorPadding = options?.editorPadding || 20

  return {
    ...vditorConfig,
    mode,
    theme: 'dark',
    preview: {
      ...vditorConfig.preview,
      theme: {
        ...vditorConfig.preview?.theme,
        current: 'dark'
      }
    },
    style: `
      .vditor-content { max-width: ${contentWidth}px; margin: 0 auto; }
      .vditor-ir { padding: ${editorPadding}px !important; }
    `
  }
}

// 简化配置（用于移动端或性能优化）
export const vditorLiteConfig: any = {
  ...vditorConfig,
  toolbar: [
    'emoji',
    'headings',
    'bold',
    'italic',
    'strike',
    'link',
    '|',
    'list',
    'ordered-list',
    '|',
    'quote',
    'code',
    '|',
    'undo',
    'redo',
    'preview'
  ],
  counter: {
    enable: false
  },
  resize: {
    enable: false
  }
}

// 深空主题适配
export const vditorDeepSpaceConfig: any = {
  ...vditorConfig,
  preview: {
    ...vditorConfig.preview,
    theme: {
      ...vditorConfig.preview?.theme,
      current: 'dark'
    }
  },
  // 自定义CSS样式适配深空主题
  style: {
    width: '100%',
    height: '100%'
  }
}