import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as attentionApi from '@/api/attention'
import { currentUser } from '@/mock/employees'

/**
 * 会话 Store：前台当前用户 / 注意力点数
 * （后台登录态在 authStore 中维护）
 *
 * 注意力点数以后端为准：`refreshAttentionPoints()` 拉 `GET /me/attention-points`。
 * 后端接口未就绪时**保留本地值**，不抛错、不影响界面 —— 前端已按契约预留好位置。
 */
export const useSessionStore = defineStore('session', () => {
  const user = ref(currentUser)
  const attentionPoints = ref(currentUser.attentionPoints)
  /** 是否已成功从后端取过值（UI 可据此决定是否显示"同步中"等状态） */
  const pointsSynced = ref(false)
  const pointsLoading = ref(false)

  /** 消耗注意力点数（发帖 / 回复时扣除） */
  function consume(points: number): boolean {
    if (attentionPoints.value < points) return false
    attentionPoints.value -= points
    return true
  }

  /** 从后端拉取注意力点数；失败时静默保留本地值 */
  async function refreshAttentionPoints(): Promise<number> {
    if (pointsLoading.value) return attentionPoints.value
    pointsLoading.value = true
    try {
      const res = await attentionApi.myAttentionPoints()
      if (typeof res?.points === 'number') attentionPoints.value = res.points
      pointsSynced.value = true
    } catch {
      // 后端接口尚未提供（404）或网络异常：保留本地值，不打断界面
      pointsSynced.value = false
    } finally {
      pointsLoading.value = false
    }
    return attentionPoints.value
  }

  const displayPoints = computed(() => attentionPoints.value.toLocaleString('en-US'))
  const canPost = computed(() => attentionPoints.value > 0)

  return {
    user,
    attentionPoints,
    displayPoints,
    canPost,
    consume,
    refreshAttentionPoints,
    pointsSynced,
    pointsLoading,
  }
})
