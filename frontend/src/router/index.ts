import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 路由表
 * 用户端：AppShell 包裹
 * 后台：AdminShell 包裹，需登录
 */
const routes: RouteRecordRaw[] = [
  // ---------------- 用户端 ----------------
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: { title: '关于我们' },
  },
  {
    path: '/forum',
    name: 'forum',
    component: () => import('@/pages/ForumListPage.vue'),
    // headerVariant=float：透明浮层导航（不占文档流）；showPoints：导航右侧显示注意力点数
    meta: { title: '员工论坛', headerVariant: 'float', showPoints: true, flush: true },
  },
  {
    path: '/forum/:id',
    name: 'forum-detail',
    component: () => import('@/pages/ForumDetailPage.vue'),
    props: true,
    // 与论坛列表页同款浮层导航（不 flush：内容位置由 AppShell 自动补偿）
    meta: { title: '帖子详情', headerVariant: 'float', showPoints: true },
  },
  {
    path: '/solutions',
    name: 'solutions',
    component: () => import('@/pages/SolutionsPage.vue'),
    meta: { title: '解决方案', headerVariant: 'float', showPoints: true },
  },
  {
    path: '/missing-persons',
    name: 'missing-persons',
    component: () => import('@/pages/MissingPersonsPage.vue'),
    meta: { title: '寻人启事', headerVariant: 'float', showPoints: true },
  },
  {
    // 个人中心：改头像 / 昵称 / 密码。需要登录（未登录由页面内引导去登录）
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/ProfilePage.vue'),
    meta: { title: '个人中心', headerVariant: 'float', showPoints: true },
  },

  // ---------------- 后台 ----------------
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/pages/admin/AdminLoginPage.vue'),
    meta: { title: '后台登录', public: true },
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/pages/admin/AdminDashboardPage.vue'),
    meta: { title: '控制台' },
  },
  {
    path: '/admin/posts',
    name: 'admin-posts',
    component: () => import('@/pages/admin/AdminPostsPage.vue'),
    meta: { title: '帖子管理' },
  },
  {
    path: '/admin/posts/:id',
    name: 'admin-post-edit',
    component: () => import('@/pages/admin/AdminPostEditPage.vue'),
    props: true,
    meta: { title: '帖子编辑' },
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: () => import('@/pages/admin/AdminProductsPage.vue'),
    meta: { title: '商品管理' },
  },
  {
    path: '/admin/missing-persons',
    name: 'admin-missing-persons',
    component: () => import('@/pages/admin/AdminMissingPersonsPage.vue'),
    meta: { title: '寻人启事管理' },
  },
  {
    path: '/admin/employees',
    name: 'admin-employees',
    component: () => import('@/pages/admin/AdminEmployeesPage.vue'),
    meta: { title: '员工管理' },
  },
  {
    path: '/admin/logs',
    name: 'admin-logs',
    component: () => import('@/pages/admin/AdminLogsPage.vue'),
    meta: { title: '操作日志' },
  },

  // ---------------- 404 ----------------
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

/** 登录态 Token 键名（与 stores/auth、api/request 保持一致） */
const TOKEN_KEY = 'haavk_admin_token'
/** 角色键名（与 stores/auth 保持一致）：只有 ADMIN 能进后台 */
const ROLE_KEY = 'haavk_admin_role'
const ROLE_ADMIN = 'ADMIN'

/**
 * 全局登录守卫
 * - 用户端页面（首页 / 员工论坛 / 帖子详情 / 解决方案 / 寻人启事）**匿名可访问**；
 * - 后台 `/admin/**` 需要**登录且角色为 ADMIN**（Handbook 05 §3：「未登录访问 /admin/** 自动跳转登录」）；
 *   普通用户（默认角色 USER）即使登录了也进不去后台，会被送回前台首页。
 */
router.beforeEach((to) => {
  const token = localStorage.getItem(TOKEN_KEY)
  const role = (localStorage.getItem(ROLE_KEY) || '').toUpperCase()
  const isLoginPage = to.name === 'admin-login'
  const isAdminArea = to.path === '/admin' || to.path.startsWith('/admin/')

  if (isLoginPage) {
    // 已登录还访问登录页：管理员回后台，普通用户回前台
    if (token) {
      const redirect = to.query.redirect as string | undefined
      if (redirect && redirect.startsWith('/')) return redirect
      return { path: role === ROLE_ADMIN ? '/admin' : '/' }
    }
    return true
  }

  if (isAdminArea) {
    // 未登录：去登录页并记住原目标
    if (!token) return { name: 'admin-login', query: { redirect: to.fullPath } }
    // 已登录但不是管理员：只能看前台
    if (role !== ROLE_ADMIN) return { path: '/' }
  }

  // 用户端页面匿名可访问
  return true
})

router.afterEach((to) => {
  const base = 'HAAVK · 哈夫克集团'
  const t = (to.meta.title as string) || ''
  document.title = t ? `${t} · ${base}` : base
})

export default router
