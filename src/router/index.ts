import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import type { RouteRecordRaw } from 'vue-router'

// 懒加载路由组件
const LoginPage = () => import('../views/LoginPage.vue')
const WorkspacePage = () => import('../views/WorkspacePage.vue')
const SettingsPage = () => import('../views/SettingsPage.vue')
const VerifyPage = () => import('../views/VerifyPage.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/verify'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/verify',
    name: 'Verify',
    component: VerifyPage
  },
  {
    path: '/workspace',
    name: 'Workspace',
    component: WorkspacePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  // 等待认证检查完成
  const userStore = useUserStore()

  // 如果还没有检查过认证状态，先等待
  if (!userStore.authChecked) {
    await userStore.init()
  }

  console.log('Route guard check:', {
    to: to.path,
    from: _from.path,
    requiresAuth: to.meta.requiresAuth,
    requiresGuest: to.meta.requiresGuest,
    isAuthenticated: userStore.isAuthenticated,
    hasToken: userStore.hasToken,
    hasUser: !!userStore.user,
    authChecked: userStore.authChecked,
    token: userStore.token ? 'exists' : 'none'
  })

  // 检查认证要求
  if (to.meta.requiresAuth) {
    if (!userStore.isAuthenticated) {
      console.log('Route guard: authentication required but not authenticated')
      console.log('Redirecting to login with redirect:', to.fullPath)
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
    console.log('Route guard: authentication passed for', to.path)
  }

  // 检查访客页面（登录/注册）
  if (to.meta.requiresGuest && userStore.isAuthenticated) {
    console.log('Route guard: guest page but authenticated, redirecting to workspace')
    next('/workspace')
    return
  }

  // 处理 /verify 页面
  if (to.path === '/verify') {
    if (userStore.isAuthenticated) {
      console.log('Route guard: /verify - authenticated, redirecting to workspace')
      next('/workspace')
    } else {
      console.log('Route guard: /verify - not authenticated, redirecting to login')
      next('/login')
    }
    return
  }

  console.log('Route guard: allowing navigation to', to.path)
  next()
})

export default router