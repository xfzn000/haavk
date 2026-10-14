<script setup lang="ts">
/**
 * TopHeader —— 全站顶部导航
 * variant="default"：普通页面的吸顶导航条（半透明浅色底）
 * variant="float"  ：内容页 + 首页 Hero 的浮层导航 —— 贴页面顶端（不占文档流），
 *                    版心更宽（约 90.7%），可选显示「注意力点数」
 */
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  Menu,
  X,
  UserRound,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Network,
  Settings,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useSessionStore } from '@/stores/session'

withDefaults(defineProps<{ variant?: 'default' | 'float'; showPoints?: boolean }>(), {
  variant: 'default',
  showPoints: false,
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const session = useSessionStore()

const mobileOpen = ref(false)
const userOpen = ref(false)

const displayName = computed(() => auth.nickname || auth.username || '管理员')

const navs = [
  { to: '/', label: '关于我们' },
  { to: '/forum', label: '员工论坛' },
  { to: '/solutions', label: '解决方案' },
  { to: '/missing-persons', label: '寻人启事' },
]

function isActive(to: string): boolean {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(to + '/')
}

function closeMobile() {
  mobileOpen.value = false
}

function goAdmin() {
  userOpen.value = false
  router.push('/admin')
}

/** 个人中心（改头像 / 昵称 / 密码） */
function goProfile() {
  userOpen.value = false
  mobileOpen.value = false
  router.push('/profile')
}

/** 游客（未登录）：去后台登录页 */
function goLogin() {
  userOpen.value = false
  mobileOpen.value = false
  router.push('/admin/login')
}

function logout() {
  userOpen.value = false
  mobileOpen.value = false
  auth.logout()
  // 退出登录后回前台首页（用户端页面匿名可访问）
  if (route.path !== '/') router.push('/')
}
</script>

<template>
  <header class="top-header" :class="[`top-header--${variant}`]">
    <div class="top-header__inner container-haavk">
      <!-- Logo -->
      <RouterLink to="/" class="brand" @click="closeMobile">
        <img class="brand__mark" src="@/assets/logo2.webp" alt="" width="30" height="30" />
        <span class="brand__name">HAAVK</span>
      </RouterLink>

      <!-- 桌面导航 -->
      <nav class="nav" aria-label="主导航">
        <RouterLink
          v-for="n in navs"
          :key="n.to"
          :to="n.to"
          class="nav__item"
          :class="{ 'is-active': isActive(n.to) }"
        >
          {{ n.label }}
        </RouterLink>
      </nav>

      <!-- 右侧：个人中心 + 注意力点数（内容页，靠最右，与参考图一致） -->
      <div class="top-header__right">
        <div class="user">
          <!-- 游客：只显示「登录」入口（点了去后台登录页） -->
          <RouterLink v-if="!auth.isLoggedIn" class="user__btn" to="/admin/login">
            <UserRound :size="15" />
            <span class="user__name">登录</span>
          </RouterLink>
          <template v-else>
            <button class="user__btn" type="button" :aria-expanded="userOpen" @click="userOpen = !userOpen">
              <UserRound :size="15" />
              <span class="user__name">{{ displayName }}</span>
              <ChevronDown :size="13" class="user__caret" />
            </button>
            <div v-if="userOpen" class="user__menu">
              <!-- 个人中心：改头像 / 昵称 / 密码 -->
              <button type="button" @click="goProfile">
                <Settings :size="14" />
                个人中心
              </button>
              <!-- 只有管理员才看得见「后台管理」入口（角色取自 admin_user.role） -->
              <button v-if="auth.isAdmin" type="button" @click="goAdmin">
                <LayoutDashboard :size="14" />
                后台管理
              </button>
              <button type="button" class="user__menu--danger" @click="logout">
                <LogOut :size="14" />
                退出登录
              </button>
            </div>
          </template>
        </div>

        <!-- 注意力点数：登录员工才有，游客不显示（避免展示 mock 兜底值） -->
        <div v-if="showPoints && auth.isLoggedIn" class="points">
          <Network class="points__icon" :size="26" :stroke-width="1.4" />
          <span class="points__label">注意力点数</span>
          <span class="points__bar" aria-hidden="true"></span>
          <span class="points__value">{{ session.displayPoints }}</span>
        </div>
      </div>

      <!-- 移动端菜单按钮 -->
      <button class="menu-btn" type="button" :aria-expanded="mobileOpen" @click="mobileOpen = !mobileOpen">
        <component :is="mobileOpen ? X : Menu" :size="20" />
      </button>
    </div>

    <!-- 移动端展开导航 -->
    <nav v-show="mobileOpen" class="nav-mobile" aria-label="移动导航">
      <RouterLink
        v-for="n in navs"
        :key="n.to"
        :to="n.to"
        class="nav-mobile__item"
        :class="{ 'is-active': isActive(n.to) }"
        @click="closeMobile"
      >
        {{ n.label }}
      </RouterLink>
      <div class="nav-mobile__actions">
        <template v-if="auth.isLoggedIn">
          <button type="button" @click="goProfile">个人中心</button>
          <button v-if="auth.isAdmin" type="button" @click="goAdmin">后台管理</button>
          <button type="button" class="danger" @click="logout">退出登录</button>
        </template>
        <button v-else type="button" @click="goLogin">登录</button>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.top-header {
  z-index: 40;
}
/* ---------- 普通模式：吸顶 ---------- */
.top-header--default {
  position: sticky;
  top: 0;
  background: rgba(238, 243, 249, 0.88);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(185, 200, 216, 0.7);
}
/* ---------- 内容页浮层（论坛/首页 Hero 等）：透明、不占文档流、版心更宽 ----------
   位置与其它页面一致：贴页面顶端（不要下沉） */
.top-header--float {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: transparent;
}
.top-header--float .top-header__inner {
  width: var(--haavk-content-w);
  max-width: none;
  margin: 0 auto;
  padding: 0;
  gap: 0;
}

.top-header__inner {
  height: var(--haavk-header-h);
  display: flex;
  align-items: center;
  gap: 22px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
}
.brand__mark {
  display: block;
  width: 30px;
  height: 30px;
  object-fit: contain;
}
.brand__name {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 3px;
  color: var(--haavk-blue-deep);
}

.nav {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 26px;
}
.nav__item {
  position: relative;
  padding: 8px 17px;
  font-size: 15px;
  font-weight: 500;
  color: #2b3440;
  transition: color 180ms ease;
}
.nav__item:hover {
  color: var(--haavk-blue);
}
.nav__item.is-active {
  color: var(--haavk-blue);
  font-weight: 600;
}
.nav__item.is-active::after {
  content: '';
  position: absolute;
  left: 17px;
  right: 17px;
  bottom: 0;
  height: 2px;
  background: var(--haavk-blue);
  box-shadow: 0 0 8px rgba(35, 121, 216, 0.6);
}

/* 内容页浮层：Logo 与导航项按参考图放大/拉开 */
.top-header--float .brand__mark {
  width: 34px;
  height: 34px;
}
.top-header--float .brand__name {
  font-size: 25px;
  letter-spacing: 3.5px;
}
.top-header--float .nav {
  margin-left: 112px;
  gap: 100px;
}
.top-header--float .nav__item {
  padding: 8px 14px;
  font-size: 16px;
}
.top-header--float .nav__item.is-active::after {
  left: 14px;
  right: 14px;
}

/* 注意力点数 + 用户菜单 的右侧组合 */
.top-header__right {
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* 注意力点数（内容页导航右侧，对齐参考图） */
.points {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
}
.points__icon {
  color: #2f3a44;
}
.points__label {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #27343b;
  white-space: nowrap;
}
.points__bar {
  width: 2px;
  height: 20px;
  background: rgba(39, 52, 59, 0.65);
}
.points__value {
  font-size: 21px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #1f2a33;
}

/* 个人中心：低存在感，默认近乎透明，仅在悬停/展开时显形 */
.user {
  position: relative;
  flex-shrink: 0;
  margin-right: 22px;
}
.user__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  font-size: 13.5px;
  color: rgba(43, 52, 64, 0.62);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  transition: color 180ms ease, background 180ms ease, border-color 180ms ease;
}
.user__btn:hover,
.user__btn[aria-expanded='true'] {
  color: var(--haavk-blue);
  background: rgba(255, 255, 255, 0.42);
  border-color: rgba(35, 121, 216, 0.26);
}
/* 游客态：`<RouterLink>` 渲染成 <a>，去掉下划线 */
a.user__btn {
  text-decoration: none;
}
.user__caret {
  opacity: 0.55;
}
.user__name {
  max-width: 118px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user__menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 50;
  min-width: 148px;
  padding: 5px;
  background: #fff;
  border: 1px solid var(--haavk-border);
  border-radius: 2px;
  box-shadow: 0 12px 28px -16px rgba(24, 32, 39, 0.45);
}
.user__menu button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 10px;
  font-size: 13.5px;
  text-align: left;
  color: var(--haavk-text);
  background: transparent;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}
.user__menu button:hover {
  color: var(--haavk-blue);
  background: rgba(35, 121, 216, 0.08);
}
.user__menu button.user__menu--danger:hover {
  color: var(--haavk-red);
  background: rgba(229, 59, 59, 0.08);
}

.menu-btn {
  display: none;
  margin-left: auto;
  padding: 6px;
  color: #2b3440;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(120, 140, 162, 0.45);
  border-radius: 2px;
  cursor: pointer;
}

.nav-mobile {
  display: none;
  flex-direction: column;
  padding: 8px 24px 16px;
  border-top: 1px solid rgba(185, 200, 216, 0.6);
  background: rgba(245, 248, 252, 0.98);
}
.nav-mobile__item {
  padding: 12px 4px;
  font-size: 15px;
  border-bottom: 1px solid rgba(185, 200, 216, 0.45);
}
.nav-mobile__item.is-active {
  color: var(--haavk-blue);
  font-weight: 600;
}
.nav-mobile__actions {
  display: flex;
  gap: 10px;
  padding-top: 12px;
}
.nav-mobile__actions button {
  flex: 1;
  padding: 9px;
  font-size: 14px;
  color: var(--haavk-blue);
  background: rgba(35, 121, 216, 0.08);
  border: 1px solid rgba(35, 121, 216, 0.35);
  border-radius: 2px;
  cursor: pointer;
}
.nav-mobile__actions button.danger {
  color: var(--haavk-red);
  background: rgba(229, 59, 59, 0.07);
  border-color: rgba(229, 59, 59, 0.35);
}

/* ---------- 响应式 ---------- */
@media (max-width: 1280px) {
  /* 浮层导航在中等宽度下收回部分间距，避免与右侧「注意力点数」相撞 */
  .top-header--float .nav {
    margin-left: 44px;
    gap: 34px;
  }
  .top-header--float .nav__item {
    font-size: 15px;
    padding: 8px 12px;
  }
  .top-header--float .nav__item.is-active::after {
    left: 12px;
    right: 12px;
  }
}
@media (max-width: 1200px) {
  .nav__item {
    padding: 8px 12px;
    font-size: 14px;
  }
}

@media (max-width: 900px) {
  .nav {
    display: none;
  }
  .menu-btn {
    display: inline-flex;
  }
  .nav-mobile {
    display: flex;
  }
  /* 移动端收进汉堡菜单，右上整块隐藏 */
  .top-header__right {
    display: none;
  }
}

@media (max-width: 480px) {
  .brand__name {
    font-size: 18px;
    letter-spacing: 2px;
  }
  .top-header__inner {
    gap: 12px;
  }
}
</style>
