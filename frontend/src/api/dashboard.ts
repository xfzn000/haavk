import { get, USE_MOCK } from '@/api/request'
import { operationLogs } from '@/mock/logs'
import type { DashboardStats, OperationLog, PageQuery, PageResult } from '@/types'

export async function listLogs(query: PageQuery = {}): Promise<PageResult<OperationLog>> {
  if (USE_MOCK) {
    return { records: operationLogs, total: operationLogs.length, page: 1, pageSize: operationLogs.length }
  }
  return get<PageResult<OperationLog>>('/logs', query as Record<string, unknown>)
}

export async function dashboard(): Promise<DashboardStats> {
  if (USE_MOCK) {
    const { mockDashboard } = await import('@/mock/admin')
    return mockDashboard()
  }
  return get<DashboardStats>('/dashboard')
}
