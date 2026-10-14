import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

/**
 * 写操作前的登录检查（发帖 / 回复 / 上传图片 / 提交线索……）
 *
 * - 已登录 → 返回 `true`，调用方继续执行；
 * - 未登录 → 弹一句提示，并跳到后台登录页（带 `redirect`，登录成功后会跳回当前页），返回 `false`。
 *
 * 背景：用户端页面允许匿名浏览（见 `router/index.ts` 守卫），
 * 但**写操作**后端要求认证（`SecurityConfig`），未登录直接调接口只会拿到 401，
 * 所以统一在这里先拦一道，给用户一个明确的「去登录」入口。
 *
 * ⚠️ 必须在组件的 `setup` 之后（事件回调里）调用：内部会用到 Pinia store。
 */
export function requireLogin(router: Router, hint = '请先登录后再操作'): boolean {
  if (useAuthStore().isLoggedIn) return true
  useToastStore().info(hint)
  router.push({
    name: 'admin-login',
    query: { redirect: router.currentRoute.value.fullPath },
  })
  return false
}
