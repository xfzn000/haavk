import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
}

let seq = 0

/** 轻量全局提示 */
export const useToastStore = defineStore('toast', () => {
  const items = ref<ToastItem[]>([])

  function push(message: string, type: ToastType = 'success', duration = 2600) {
    const id = ++seq
    items.value.push({ id, type, message })
    window.setTimeout(() => remove(id), duration)
  }

  function remove(id: number) {
    items.value = items.value.filter((t) => t.id !== id)
  }

  const success = (m: string) => push(m, 'success')
  const error = (m: string) => push(m, 'error')
  const info = (m: string) => push(m, 'info')

  return { items, push, remove, success, error, info }
})
