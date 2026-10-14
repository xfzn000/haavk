import { get, USE_MOCK } from '@/api/request'
import { currentUser } from '@/mock/employees'
import type { AttentionPoints } from '@/types'

/**
 * 注意力点数（右上角展示）
 *
 * 后端接口（已实现，MeController）：
 *
 *   GET /api/me/attention-points
 *   → Result<{ points: number; updatedAt?: string }>
 *
 * - 登录态取自请求头 `Authorization: Bearer <token>`，**不需要传参**；
 * - 点数**每天重置**：普通用户 10000 / 管理员 1000000；发帖 -100、回复 -50；
 * - 未登录 / 网络异常时，`stores/session` 保留本地值，界面不报错、不空白。
 */
export async function myAttentionPoints(): Promise<AttentionPoints> {
  if (USE_MOCK) {
    return { points: currentUser.attentionPoints }
  }
  // optional=true：后端未实现该接口时（401/404）不清登录态、不跳登录页
  return get<AttentionPoints>('/me/attention-points', undefined, true)
}
