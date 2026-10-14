import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as authApi from '@/api/auth'
import type { LoginResult } from '@/types'

const TOKEN_KEY = 'haavk_admin_token'
const NAME_KEY = 'haavk_admin_name'
const ROLE_KEY = 'haavk_admin_role'
const NICK_KEY = 'haavk_admin_nickname'
const AVATAR_KEY = 'haavk_admin_avatar'

/** 管理员角色（能进后台 /admin/**）；其余（含默认 USER）只能浏览前台 */
export const ROLE_ADMIN = 'ADMIN'

/**
 * 登录态 Store
 * Token / 用户名 / **角色** 同时放入 state 与 localStorage（持久化）
 *
 * 角色来源于 `admin_user.role`（后端登录接口返回）：
 * 只有 `ADMIN` 才能看见并进入后台管理；新注册账号默认是 `USER`，
 * 要提权只能直接改数据库，改完重新登录生效。
 */
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '')
  const username = ref<string>(localStorage.getItem(NAME_KEY) || '')
  const role = ref<string>(localStorage.getItem(ROLE_KEY) || '')
  const nickname = ref<string>(localStorage.getItem(NICK_KEY) || '')
  /** 头像地址（/uploads/xxx.png 或外链），无则为空 */
  const avatar = ref<string>(localStorage.getItem(AVATAR_KEY) || '')

  const isLoggedIn = computed(() => !!token.value)
  /** 是否管理员（决定「后台管理」入口是否显示、能否进 /admin/**） */
  const isAdmin = computed(() => isLoggedIn.value && role.value.toUpperCase() === ROLE_ADMIN)

  function setLogin(result: LoginResult) {
    token.value = result.token
    username.value = result.username
    nickname.value = result.nickname || result.username
    role.value = result.role || 'USER'
    localStorage.setItem(TOKEN_KEY, result.token)
    localStorage.setItem(NAME_KEY, result.username)
    localStorage.setItem(ROLE_KEY, role.value)
    localStorage.setItem(NICK_KEY, nickname.value)
  }

  /**
   * 更新本地昵称 / 头像（个人中心保存成功后调用，让导航栏立刻反映最新资料）
   * 两个参数都是可选的：只传哪个就改哪个。
   */
  function setProfile(patch: { nickname?: string; avatar?: string | null }) {
    if (patch.nickname) {
      nickname.value = patch.nickname
      localStorage.setItem(NICK_KEY, patch.nickname)
    }
    if (patch.avatar !== undefined) {
      avatar.value = patch.avatar || ''
      if (avatar.value) localStorage.setItem(AVATAR_KEY, avatar.value)
      else localStorage.removeItem(AVATAR_KEY)
    }
  }

  /** 登录（Mock 或 Real） */
  async function login(user: string, password: string) {
    const result = await authApi.login(user, password)
    setLogin(result)
    return result
  }

  /** 注册（成功后直接登录） */
  async function register(payload: authApi.RegisterPayload) {
    const result = await authApi.register(payload)
    setLogin(result)
    return result
  }

  /**
   * 用后端 `GET /api/auth/me` 刷新角色（DB 改过 role 后，刷新页面即生效，不必重新登录）
   * 失败（过期/后端不可用）时保持原值，不影响界面。
   */
  async function refreshRole() {
    if (!token.value) return
    try {
      const info = await authApi.me()
      if (info?.role) {
        role.value = info.role
        localStorage.setItem(ROLE_KEY, info.role)
      }
      if (info?.nickname) {
        nickname.value = info.nickname
        localStorage.setItem(NICK_KEY, info.nickname)
      }
    } catch {
      /* 静默：保持本地值 */
    }
  }

  function logout() {
    token.value = ''
    username.value = ''
    nickname.value = ''
    role.value = ''
    avatar.value = ''
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(NAME_KEY)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(NICK_KEY)
    localStorage.removeItem(AVATAR_KEY)
  }

  return {
    token,
    username,
    nickname,
    role,
    avatar,
    isLoggedIn,
    isAdmin,
    setLogin,
    setProfile,
    login,
    register,
    refreshRole,
    logout,
  }
})
