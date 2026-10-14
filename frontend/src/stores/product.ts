import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { USE_MOCK } from '@/api/request'
import * as productApi from '@/api/products'
import { products as mockProducts } from '@/mock/products'
import type { BizStatus, Product } from '@/types'

export const useProductStore = defineStore('product', () => {
  const list = ref<Product[]>([])
  const loaded = ref(false)

  async function ensureLoaded(force = false) {
    if (loaded.value && !force) return
    if (USE_MOCK) {
      list.value = mockProducts.map((p) => ({ ...p, details: [...p.details] }))
    } else {
      const res = await productApi.pageProducts({ page: 1, pageSize: 100 })
      list.value = res.records
    }
    loaded.value = true
  }

  /** 前台只显示上架商品，按 sort 升序 */
  const onSaleList = computed<Product[]>(() =>
    list.value
      .filter((p) => p.status === 'ON_SALE')
      .slice()
      .sort((a, b) => a.sort - b.sort),
  )

  const isSoldOut = (p: Product) => p.soldCount >= p.purchaseLimit

  function purchase(id: number): boolean {
    const p = list.value.find((x) => x.id === id)
    if (!p || isSoldOut(p)) return false
    p.soldCount += 1
    return true
  }

  /* ---------------- 后台 ---------------- */

  async function save(payload: Partial<Product> & { id?: number }): Promise<Product> {
    await ensureLoaded()
    if (!USE_MOCK) {
      const saved = payload.id
        ? await productApi.updateProduct(payload.id, payload)
        : await productApi.createProduct(payload)
      await ensureLoaded(true)
      return saved
    }

    if (payload.id) {
      const p = list.value.find((x) => x.id === payload.id)
      if (p) {
        Object.assign(p, payload)
        return p
      }
    }
    const id = Math.max(0, ...list.value.map((p) => p.id)) + 1
    const created: Product = {
      id,
      name: payload.name || '未命名商品',
      image: payload.image || '',
      description: payload.description || '',
      details: payload.details || [],
      price: payload.price ?? 0,
      purchaseLimit: payload.purchaseLimit ?? 1,
      soldCount: payload.soldCount ?? 0,
      status: payload.status || 'OFF_SALE',
      sort: payload.sort ?? id,
    }
    list.value.push(created)
    return created
  }

  async function remove(id: number) {
    const p = list.value.find((x) => x.id === id)
    if (p) p.status = 'DELETED'
    if (!USE_MOCK) {
      await productApi.deleteProduct(id)
      await ensureLoaded(true)
    }
  }

  async function setStatus(id: number, status: BizStatus) {
    const p = list.value.find((x) => x.id === id)
    if (p) p.status = status
    if (!USE_MOCK) await productApi.changeProductStatus(id, status)
  }

  return { list, loaded, ensureLoaded, onSaleList, isSoldOut, purchase, save, remove, setStatus }
})
