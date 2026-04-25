# 🌌 AstraLink 前端应用

基于 Vue 3 + TypeScript + Tailwind CSS 构建的分形图谱知识管理系统前端。

## 功能特性

- ✅ **星际登录页面** - 精美的星尘动画与径向轨道UI
- ✅ **主星图工作区** - 动态同心圆轨道布局
- ✅ **分形钻取编辑** - 双击星系节点展开子节点
- ✅ **虫洞编辑器** - 右侧滑出式编辑器面板
- ✅ **星云检索器** - Ctrl+K 全局搜索标签和笔记
- ✅ **用户认证系统** - 完整的注册/登录/登出流程
- ✅ **用户设置中心** - 资料、密码、主题、数据管理
- ✅ **玻璃拟态设计** - 符合白皮书要求的透明全息UI
- ✅ **响应式通知系统** - 全局消息提示
- ✅ **模拟数据演示** - 主星图页面使用模拟数据进行展示

## 技术栈

- **核心框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5
- **编程语言**: TypeScript
- **样式方案**: Tailwind CSS
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **HTTP客户端**: Axios
- **图标库**: Lucide Vue
- **代码规范**: ESLint, Prettier

## 用户API对接

已完全对接的后端API端点：

1. **用户注册** - `POST /api/user/register`
2. **用户登录** - `POST /api/user/login`
3. **获取用户信息** - `GET /api/user/info`
4. **修改密码** - `POST /api/user/password`
5. **上传头像** - `POST /api/user/avatar`

## 项目结构

```
frontend/
├── src/
│   ├── api/           # API接口封装
│   │   └── user.ts    # 用户API
│   ├── assets/        # 静态资源
│   ├── components/    # 可复用组件
│   │   ├── Icon.vue              # 图标组件
│   │   └── NotificationContainer.vue # 通知组件
│   ├── composables/   # Composition函数
│   ├── router/        # 路由配置
│   ├── stores/        # Pinia状态管理
│   │   ├── user.ts            # 用户状态
│   │   └── notification.ts    # 通知状态
│   ├── utils/         # 工具函数
│   │   └── api.ts     # Axios配置
│   ├── views/         # 页面组件
│   │   ├── LoginPage.vue      # 登录页
│   │   ├── WorkspacePage.vue  # 主工作区
│   │   └── SettingsPage.vue   # 设置页
│   ├── App.vue        # 根组件
│   ├── main.ts        # 应用入口
│   └── style.css      # 全局样式
├── index.html         # HTML入口
├── package.json       # 依赖管理
├── vite.config.ts     # Vite配置
├── tailwind.config.js # Tailwind配置
└── tsconfig.json      # TypeScript配置
```

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 环境配置

复制环境变量文件：

```bash
cp .env.example .env.development
```

根据实际情况修改后端API地址：

```env
VITE_API_BASE_URL=http://localhost:8181
VITE_DEMO_MODE=true
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

## 设计特色

### 1. 视觉风格
- **极深太空黑** (`#0B0E14`)
- **霓虹青色** (`#00E5FF`) 和 **霓虹蓝** (`#0077FF`)
- **玻璃拟态** (`backdrop-blur-xl`)
- **径向轨道布局** (同心圆定位算法)

### 2. 交互效果
- **星尘动画背景** - 动态粒子效果
- **分形钻取** - 双击星系节点展开子节点
- **节点悬浮** - 发光效果和高亮连线
- **平滑过渡** - 页面切换和模态框动画

### 3. 用户体验
- **全局快捷键** - Ctrl+K 搜索, Ctrl+S 保存
- **响应式通知** - 操作反馈及时清晰
- **表单验证** - 客户端验证和错误提示
- **加载状态** - 按钮加载动画和骨架屏

## 开发指南

### 添加新页面
1. 在 `src/views/` 创建新组件
2. 在 `src/router/index.ts` 配置路由
3. 如果需要API，在 `src/api/` 添加相应方法

### 状态管理
使用 Pinia 管理全局状态：
- `useUserStore` - 用户认证和信息
- `useNotificationStore` - 全局通知

### API调用
统一使用 `api.ts` 中的配置：
```typescript
import { userApi } from '@/api/user'

const response = await userApi.login({
  username: 'user',
  password: 'pass'
})
```

### 样式开发
采用 Tailwind CSS 原子类：
```html
<div class="glass-panel p-6 max-w-md mx-auto">
  <h2 class="neon-text text-2xl mb-4">标题</h2>
</div>
```

## 部署

### 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录。

### 注意事项
- 确保后端服务正在运行
- 生产环境修改 `.env.production` 配置
- 建议启用 HTTPS

## 技术细节

### 径向布局算法
节点位置计算基于极坐标系统：
```typescript
const angleRad = (node.angle * Math.PI) / 180
const x = centerX + node.radius * Math.cos(angleRad)
const y = centerY + node.radius * Math.sin(angleRad)
```

### 玻璃拟态实现
```css
.glass-panel {
  @apply bg-deep-space/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl;
}
```

### SVG连接线
使用 SVG `<line>` 元素绘制节点间的连接线。

## 未来计划

1. **实时协作** - WebSocket 同步
2. **离线支持** - PWA 和 Service Worker
3. **AI辅助** - 自动标签和关联建议
4. **移动端适配** - 响应式设计优化
5. **插件系统** - 可扩展的第三方集成

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！