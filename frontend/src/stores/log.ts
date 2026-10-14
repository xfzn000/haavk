import { defineStore } from 'pinia'
import { ref } from 'vue'
import { USE_MOCK } from '@/api/request'
import * as dashboardApi from '@/api/dashboard'
import { operationLogs } from '@/mock/logs'
import { nowStamp } from '@/assets/format'
import type { OperationLog } from '@/types'

export const useLogStore = defineStore('log', () => {
  const list = ref<OperationLog[]>([])
  const loaded = ref(false)

  async function ensureLoaded(force = false) {
    if (loaded.value && !force) return
    if (USE_MOCK) {
      list.value = operationLogs.map((l) => ({ ...l }))
    } else {
      const res = await dashboardApi.listLogs({ page: 1, pageSize: 100 })
      list.value = res.records
    }
    loaded.value = true
  }

  /** 追加一条操作日志（仅 Mock 模式本地记录；Real 模式由后端写入） */
  function record(action: string, target: string, admin = 'admin', ip = '192.168.10.24') {
    if (!USE_MOCK) return
    if (!loaded.value) list.value = operationLogs.map((l) => ({ ...l }))
    loaded.value = true
    const id = Math.max(0, ...list.value.map((l) => l.id)) + 1
    list.value.unshift({ id, admin, action, target, ip, createdAt: nowStamp() })
  }

  return { list, loaded, ensureLoaded, record }
})
