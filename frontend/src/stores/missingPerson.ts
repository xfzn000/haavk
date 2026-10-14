import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { USE_MOCK } from '@/api/request'
import * as missingApi from '@/api/missingPersons'
import { missingPersons as mockMissingPersons } from '@/mock/missingPersons'
import type { BizStatus, MissingPerson } from '@/types'

export const useMissingPersonStore = defineStore('missingPerson', () => {
  const list = ref<MissingPerson[]>([])
  const loaded = ref(false)

  async function ensureLoaded(force = false) {
    if (loaded.value && !force) return
    if (USE_MOCK) {
      list.value = mockMissingPersons.map((m) => ({ ...m }))
    } else {
      const res = await missingApi.pageMissingPersons({ page: 1, pageSize: 100 })
      list.value = res.records
    }
    loaded.value = true
  }

  /** 前台只显示上架，按 sort 升序 */
  const onSaleList = computed<MissingPerson[]>(() =>
    list.value
      .filter((m) => m.status === 'ON_SALE')
      .slice()
      .sort((a, b) => a.sort - b.sort),
  )

  /**
   * 提交线索（不可重复提交）
   * 非 mock 模式会落库（PATCH /missing-persons/{id}/submit），刷新后仍然是「已提交」
   */
  async function submit(id: number): Promise<boolean> {
    const m = list.value.find((x) => x.id === id)
    if (!m || m.submitted) return false
    if (!USE_MOCK) {
      try {
        await missingApi.submitMissingPerson(id)
        m.submitted = true
        return true
      } catch {
        return false
      }
    }
    m.submitted = true
    return true
  }

  /** 后台：重置提交态（前台按钮回到「提交线索」） */
  async function resetSubmit(id: number) {
    const m = list.value.find((x) => x.id === id)
    if (!USE_MOCK) {
      await missingApi.resetMissingPersonSubmit(id)
      await ensureLoaded(true)
      return
    }
    if (m) m.submitted = false
  }

  /* ---------------- 后台 ---------------- */

  async function save(payload: Partial<MissingPerson> & { id?: number }): Promise<MissingPerson> {
    await ensureLoaded()
    if (!USE_MOCK) {
      const saved = payload.id
        ? await missingApi.updateMissingPerson(payload.id, payload)
        : await missingApi.createMissingPerson(payload)
      await ensureLoaded(true)
      return saved
    }

    if (payload.id) {
      const m = list.value.find((x) => x.id === payload.id)
      if (m) {
        Object.assign(m, payload)
        return m
      }
    }
    const id = Math.max(0, ...list.value.map((m) => m.id)) + 1
    const created: MissingPerson = {
      id,
      name: payload.name || '未命名',
      code: payload.code || `M-${id}`,
      image: payload.image || '',
      subtitle: payload.subtitle || '',
      description: payload.description || '',
      rewardType: payload.rewardType || '悬赏哈夫币总额',
      rewardText: payload.rewardText || '',
      rewardAmount: payload.rewardAmount ?? 0,
      submitted: payload.submitted ?? false,
      status: payload.status || 'OFF_SALE',
      sort: payload.sort ?? id,
    }
    list.value.push(created)
    return created
  }

  async function remove(id: number) {
    const m = list.value.find((x) => x.id === id)
    if (m) m.status = 'DELETED'
    if (!USE_MOCK) {
      await missingApi.deleteMissingPerson(id)
      await ensureLoaded(true)
    }
  }

  async function setStatus(id: number, status: BizStatus) {
    const m = list.value.find((x) => x.id === id)
    if (m) m.status = status
    if (!USE_MOCK) await missingApi.changeMissingPersonStatus(id, status)
  }

  return { list, loaded, ensureLoaded, onSaleList, submit, resetSubmit, save, remove, setStatus }
})
