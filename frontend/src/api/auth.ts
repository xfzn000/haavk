import { get, post, put, USE_MOCK } from '@/api/request'
import { mockLogin } from '@/mock/admin'
import type { LoginResult } from '@/types'

export interface RegisterPayload {
  username: string
  password: string
  nickname?: string
}

export interface MeInfo {
  username: string
  nickname: string
  role: string
}

/** 个人中心资料（`GET /api/auth/profile`） */
export interface ProfileInfo {
  id?: number
  username: string
  nickname: string
  /** 头像地址（/uploads/xxx.png 或外链），可能为 null */
  avatar?: string | null
  /** ADMIN=管理员 / USER=普通用户 */
  role: string
  /** 1 启用 / 0 禁用 */
  status?: number
  lastLogin?: string | null
  createdAt?: string | null
}

export interface ProfilePayload {
  nickname?: string
  avatar?: string
}

export interface PasswordPayload {
  oldPassword: string
  newPassword: string
}

/** 登录 */
export async function login(username: string, password: string): Promise<LoginResult> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    const result = mockLogin(username, password)
    if (!result) throw new Error('账号或密码错误')
    return result
  }
  return post<LoginResult>('/auth/login', { username, password })
}

/** 注册（成功后后端直接返回 Token） */
export async function register(payload: RegisterPayload): Promise<LoginResult> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    return {
      token: 'mock-jwt-token-haavk-admin',
      username: payload.username,
      nickname: payload.nickname || payload.username,
      // 与后端一致：新注册账号默认是普通用户
      role: 'USER',
    }
  }
  return post<LoginResult>('/auth/register', payload)
}

/** 当前登录用户 */
export async function me(): Promise<MeInfo> {
  if (USE_MOCK) return { username: 'admin', nickname: '集团管理员', role: 'ADMIN' }
  return get<MeInfo>('/auth/me')
}

/** 个人中心：读取资料 */
export async function getProfile(): Promise<ProfileInfo> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200))
    return {
      id: 1,
      username: 'admin',
      nickname: '集团管理员',
      avatar: null,
      role: 'ADMIN',
      status: 1,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
  }
  return get<ProfileInfo>('/auth/profile')
}

/** 个人中心：修改昵称 / 头像 */
export async function updateProfile(payload: ProfilePayload): Promise<ProfileInfo> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 250))
    return {
      username: 'admin',
      nickname: payload.nickname || '集团管理员',
      avatar: payload.avatar ?? null,
      role: 'ADMIN',
      status: 1,
    }
  }
  return put<ProfileInfo>('/auth/profile', payload)
}

/** 个人中心：修改密码（校验原密码） */
export async function changePassword(payload: PasswordPayload): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 250))
    if (payload.oldPassword !== 'admin123') throw new Error('当前密码不正确')
    return
  }
  await put<void>('/auth/password', payload)
}
