import { del, get, patch, post, put, USE_MOCK } from '@/api/request'
import { productImageFor } from '@/assets/product-images'
import { products } from '@/mock/products'
import type { PageQuery, PageResult, Product } from '@/types'

/**
 * 商品图片解析（前台 / 后台共用）
 * 后端 `product.image` 有值 → 原样使用（外链或 /uploads/xxx.png 都行，方便后台自己加商品）；
 * 为空 → 按商品名取本地素材注册表；再取不到 → 占位图。任何情况都不会破图。
 */
export function resolveProductImage(p: Pick<Product, 'name' | 'image'>): string {
  const img = typeof p.image === 'string' ? p.image.trim() : ''
  return img || productImageFor(p.name)
}

/**
 * 归一化商品详情
 * 后端 `product.details` 是**字符串**（多条用 \n 拼接），而前端类型是 string[]；
 * 不转换的话 `v-for` 会把字符串按单个字符拆开（每个字一行）。
 * 这里统一成数组，并兼容「数组 / 字符串 / 空值」三种形态。
 */
function normalizeDetails(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.map((x) => String(x).trim()).filter(Boolean)
  }
  if (typeof v === 'string') {
    return v
      .split(/\r?\n|\\n/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

function enrich(p: Product): Product {
  // 保留后台真正填的地址（表单回填用），image 换成解析后的展示图
  p.rawImage = typeof p.image === 'string' ? p.image.trim() : ''
  p.image = resolveProductImage(p)
  p.details = normalizeDetails(p.details)
  return p
}

export async function pageProducts(query: PageQuery = {}): Promise<PageResult<Product>> {
  if (USE_MOCK) {
    const records = products.filter((p) => p.status !== 'DELETED')
    return { records, total: records.length, page: 1, pageSize: records.length }
  }
  const res = await get<PageResult<Product>>('/products', query as Record<string, unknown>)
  res.records = res.records.map(enrich)
  return res
}

/** 前台：仅上架 */
export async function listOnSale(): Promise<Product[]> {
  if (USE_MOCK) return products.filter((p) => p.status === 'ON_SALE')
  const list = await get<Product[]>('/products/on-sale')
  return list.map(enrich)
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  if (USE_MOCK) throw new Error('Mock 模式下请在本地 store 操作')
  return post<Product>('/products', data)
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product> {
  if (USE_MOCK) throw new Error('Mock 模式下请在本地 store 操作')
  return put<Product>(`/products/${id}`, data)
}

export async function deleteProduct(id: number): Promise<void> {
  if (USE_MOCK) return
  return del<void>(`/products/${id}`)
}

export async function changeProductStatus(id: number, status: string): Promise<void> {
  if (USE_MOCK) return
  return patch<void>(`/products/${id}/status`, { status })
}
