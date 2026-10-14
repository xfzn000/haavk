import { del, get, patch, post, put, USE_MOCK } from '@/api/request'
import { resolveMissingPersonImage } from '@/assets/missing-person-images'
import { missingPersons } from '@/mock/missingPersons'
import type { MissingPerson, PageQuery, PageResult } from '@/types'

function enrich(m: MissingPerson): MissingPerson {
  // 保留后台真正填的地址（表单回填用），image 换成解析后的展示图
  m.rawImage = typeof m.image === 'string' ? m.image.trim() : ''
  // 后台 image 优先 → 本地素材注册表（按姓名）→ 竖版占位图，任何情况都不会破图
  m.image = resolveMissingPersonImage(m)
  return m
}

export async function pageMissingPersons(query: PageQuery = {}): Promise<PageResult<MissingPerson>> {
  if (USE_MOCK) {
    const records = missingPersons.filter((m) => m.status !== 'DELETED')
    return { records, total: records.length, page: 1, pageSize: records.length }
  }
  const res = await get<PageResult<MissingPerson>>('/missing-persons', query as Record<string, unknown>)
  res.records = res.records.map(enrich)
  return res
}

/** 前台：仅上架 */
export async function listOnSale(): Promise<MissingPerson[]> {
  if (USE_MOCK) return missingPersons.filter((m) => m.status === 'ON_SALE')
  const list = await get<MissingPerson[]>('/missing-persons/on-sale')
  return list.map(enrich)
}

export async function createMissingPerson(data: Partial<MissingPerson>): Promise<MissingPerson> {
  if (USE_MOCK) throw new Error('Mock 模式下请在本地 store 操作')
  return post<MissingPerson>('/missing-persons', data)
}

export async function updateMissingPerson(id: number, data: Partial<MissingPerson>): Promise<MissingPerson> {
  if (USE_MOCK) throw new Error('Mock 模式下请在本地 store 操作')
  return put<MissingPerson>(`/missing-persons/${id}`, data)
}

export async function deleteMissingPerson(id: number): Promise<void> {
  if (USE_MOCK) return
  return del<void>(`/missing-persons/${id}`)
}

export async function changeMissingPersonStatus(id: number, status: string): Promise<void> {
  if (USE_MOCK) return
  return patch<void>(`/missing-persons/${id}/status`, { status })
}

/** 前台「提交线索」：把该启事标为已提交（幂等） */
export async function submitMissingPerson(id: number): Promise<MissingPerson | null> {
  if (USE_MOCK) return null
  return patch<MissingPerson>(`/missing-persons/${id}/submit`)
}

/** 后台：重置提交态（让前台按钮回到「提交线索」） */
export async function resetMissingPersonSubmit(id: number): Promise<void> {
  if (USE_MOCK) return
  return del<void>(`/missing-persons/${id}/submit`)
}
