import type { DashboardStats, LoginResult } from '@/types'

/** 开发环境默认后台账号（生产必须修改） */
export const ADMIN_ACCOUNT = { username: 'admin', password: 'admin123' }

export function mockLogin(username: string, password: string): LoginResult | null {
  if (username === ADMIN_ACCOUNT.username && password === ADMIN_ACCOUNT.password) {
    return { token: 'mock-jwt-token-haavk-admin', username, nickname: '集团管理员', role: 'ADMIN' }
  }
  return null
}

export function mockDashboard(): DashboardStats {
  return {
    postTotal: 6,
    postToday: 1,
    productTotal: 3,
    productOnSale: 3,
    missingPersonTotal: 2,
    employeeTotal: 15,
  }
}
