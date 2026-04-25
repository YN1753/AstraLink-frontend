/// <reference types="vite/client" />

// 声明全局变量的类型
declare const __APP_VERSION__: string
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_DEMO_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}