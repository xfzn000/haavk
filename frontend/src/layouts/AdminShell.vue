<script setup lang="ts">
/**
 * AdminShell —— 后台公共布局
 * 左侧导航（科技风）+ 顶部栏 + 内容区
 *
 * 视觉与网站主体一致：同一套 TechBackground 冷色底 + 底部 HUD 状态条 +
 * HUD 直角细线面板语言（hud-panel / hud-corners / hud-bar / hud-btn / hud-tag），
 * 不另起一套「后台皮肤」，避免前台后台割裂。
 */
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  LayoutDashboard,
  MessagesSquare,
  Package,
  UserSearch,
  Users,
  ScrollText,
  Menu,
  X,
  Settings,
} from 'lucide-vue-next'
import TechBackground from '@/components/TechBackground.vue'
import BottomStatusBar from '@/components/BottomStatusBar.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const sideOpen = ref(false)

const navs = [
  { to: '/admin', label: '控制台', icon: LayoutDashboard, exact: true },
  { to: '/admin/posts', label: '帖子管理', icon: MessagesSquare },
  { to: '/admin/products', label: '商品管理', icon: Package },
  { to: '/admin/missing-persons', label: '寻人启事', icon: UserSearch },
  { to: '/admin/employees', label: '员工管理', icon: Users },
  { to: '/admin/logs', label: '操作日志', icon: ScrollText },
]

const pageTitle = computed(() => (route.meta.title as string) || '控制台')

function isActive(to: string, exact = false) {
  if (exact) return route.path === to
  return route.path === to || route.path.startsWith(to + '/')
}

/**
 * 退出后台 —— **只离开后台，保留登录身份**，回到前台首页。
 * （真正「退出登录」是清空登录态，入口在用户端导航栏右上角的「退出登录」。）
 */
function exitAdmin() {
  router.push('/')
}

/** 去个人中心（改头像 / 昵称 / 密码） */
function goProfile() {
  router.push('/profile')
}
</script>

<template>
  <div class="admin">
    <TechBackground />

    <!-- 侧边栏 -->
    <aside class="admin__side" :class="{ 'is-open': sideOpen }">
      <div class="admin__brand">
        <img class="admin__brand-mark" src="@/assets/logo2.webp" alt="" width="26" height="26" />
        <div class="admin__brand-text">
          <strong>HAAVK</strong>
          <span>集团管理控制台</span>
        </div>
        <button class="admin__side-close" type="button" @click="sideOpen = false">
          <X :size="18" />
        </button>
      </div>

      <nav class="admin__nav">
        <RouterLink
          v-for="n in navs"
          :key="n.to"
          :to="n.to"
          class="admin__nav-item"
          :class="{ 'is-active': isActive(n.to, n.exact) }"
          @click="sideOpen = false"
        >
          <component :is="n.icon" :size="16" />
          <span>{{ n.label }}</span>
        </RouterLink>
      </nav>

      <div class="admin__side-foot hud-mono">
        SYS.STATUS // ONLINE
        <br />
        BUILD 2036.10
      </div>
    </aside>

    <!-- 遮罩（移动端） -->
    <div v-if="sideOpen" class="admin__mask" @click="sideOpen = false"></div>

    <!-- 主区 -->
    <div class="admin__main">
      <header class="admin__top">
        <button class="admin__menu-btn" type="button" @click="sideOpen = true">
          <Menu :size="18" />
        </button>
        <h1 class="admin__title hud-bar">{{ pageTitle }}</h1>
        <div class="admin__user">
          <button class="admin__user-name admin__user-link" type="button" title="个人中心" @click="goProfile">
            <Settings :size="14" />
            {{ auth.nickname || auth.username || 'admin' }}
          </button>
          <button class="hud-btn hud-btn--ghost hud-btn--sm" type="button" @click="exitAdmin">
            <ArrowLeft :size="14" />
            退出后台
          </button>
        </div>
      </header>

      <section class="admin__content">
        <slot />
      </section>
    </div>

    <BottomStatusBar />
  </div>
</template>

<style scoped>
.admin {
  position: relative;
  min-height: 100vh;
  display: flex;
  /* 与用户端同底色（TechBackground 铺在其后），底部留出 HUD 状态条高度 */
  background: transparent;
  padding-bottom: var(--haavk-bottom-h);
}
/* 后台内容浮在 TechBackground 之上 */
.admin__side,
.admin__main {
  position: relative;
  z-index: 10;
}

/* ---------- 侧边栏 ---------- */
.admin__side {
  width: 232px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #232a31, #1a1f25);
  border-right: 1px solid rgba(88, 184, 244, 0.2);
  color: #c9d4de;
}
.admin__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
  color: #58b8f4;
  border-bottom: 1px solid rgba(88, 184, 244, 0.18);
}
/* 侧栏 logo：与用户端导航同一枚哈夫克标 */
.admin__brand-mark {
  display: block;
  width: 26px;
  height: 26px;
  object-fit: contain;
  flex-shrink: 0;
}
.admin__brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}
.admin__brand-text strong {
  font-size: 16px;
  letter-spacing: 3px;
  color: #fff;
}
.admin__brand-text span {
  font-size: 11px;
  color: #8fa3b5;
  letter-spacing: 1px;
}
.admin__side-close {
  display: none;
  margin-left: auto;
  color: #c9d4de;
  background: transparent;
  border: none;
  cursor: pointer;
}

.admin__nav {
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.admin__nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  font-size: 14px;
  color: #b6c3cf;
  border-left: 2px solid transparent;
  transition: all 180ms ease;
}
.admin__nav-item:hover {
  color: #fff;
  background: rgba(88, 184, 244, 0.09);
}
.admin__nav-item.is-active {
  color: #fff;
  background: rgba(88, 184, 244, 0.16);
  border-left-color: #58b8f4;
}
.admin__side-foot {
  padding: 14px 16px;
  font-size: 10px;
  line-height: 1.7;
  color: #6b7b89;
  border-top: 1px solid rgba(88, 184, 244, 0.14);
}

/* ---------- 主区 ---------- */
.admin__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.admin__top {
  height: 58px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  background: rgba(245, 248, 252, 0.86);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--haavk-border);
}
.admin__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--haavk-text);
}
.admin__user {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}
.admin__user-name {
  font-size: 14px;
  color: var(--haavk-muted);
}
/* 顶部栏用户名做成可点入口，直达个人中心 */
.admin__user-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 13.5px;
  color: var(--haavk-text);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  transition: color 160ms ease, background 160ms ease, border-color 160ms ease;
}
.admin__user-link:hover {
  color: var(--haavk-blue);
  background: rgba(35, 121, 216, 0.08);
  border-color: rgba(35, 121, 216, 0.28);
}
.admin__menu-btn {
  display: none;
  padding: 6px;
  color: var(--haavk-text);
  background: transparent;
  border: 1px solid var(--haavk-border);
  border-radius: 2px;
  cursor: pointer;
}
.admin__content {
  flex: 1;
  padding: 20px;
  min-width: 0;
}

.admin__mask {
  display: none;
}

/* ---------- 响应式 ---------- */
@media (max-width: 900px) {
  .admin__side {
    position: fixed;
    z-index: 60;
    top: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    transition: transform 220ms ease;
  }
  .admin__side.is-open {
    transform: translateX(0);
  }
  .admin__side-close {
    display: inline-flex;
  }
  .admin__menu-btn {
    display: inline-flex;
  }
  .admin__mask {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 55;
    background: rgba(20, 24, 28, 0.45);
  }
  .admin__content {
    padding: 14px;
  }
}
</style>
