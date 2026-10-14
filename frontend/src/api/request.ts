import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import type { ApiResponse } from '@/types'

/** 自定义请求配置：axios 会把未识别字段原样透传到 `error.config` */
interface OptionalConfig extends AxiosRequestConfig {
  /** 可选用接口：失败（含 401）不清登录态、不跳登录页 */
  __optional?: boolean
}

/**
 * Axios 统一封装
 * - baseURL / timeout
 * - 自动携带 JWT
 * - 统一解包 { code, message, data, timestamp }
 * - 401 清理登录态并跳转登录
 * - 错误提示由调用方通过 Toast 呈现（这里只抛出可读错误）
 */

/** 是否使用本地 Mock 数据 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const TOKEN_KEY = 'haavk_admin_token'

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 12000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const body = response.data
    // 后端统一返回 code=0 为成功
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 0) return response
      throw new Error(body.message || '请求失败')
    }
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    const status = error.response?.status
    // 可选用接口（后端尚未实现、失败也不能影响登录态）：跳过 401 清登录逻辑
    const optional = (error.config as { __optional?: boolean } | undefined)?.__optional === true
    if (status === 401 && !optional) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('haavk_admin_name')
      if (location.pathname.startsWith('/admin') && !location.pathname.includes('/admin/login')) {
        location.href = '/admin/login'
      }
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }
    const msg =
      error.response?.data?.message ||
      (status === 404
        ? '接口不存在（404）'
        : status === 500
          ? '服务器异常（500）'
          : error.code === 'ECONNABORTED'
            ? '请求超时'
            : '网络连接失败')
    return Promise.reject(new Error(msg))
  },
)

/**
 * GET，返回 data 字段
 * @param optional 标记为「可选用接口」：失败（含 401）时不清理登录态、不跳登录页。
 *                 用于后端尚未实现、前端先预留的接口（如注意力点数）。
 */
export async function get<T>(
  url: string,
  params?: Record<string, unknown>,
  optional = false,
): Promise<T> {
  const config: OptionalConfig = { params, __optional: optional }
  const res = await http.get<ApiResponse<T>>(url, config)
  return res.data.data
}

/** POST */
export async function post<T>(url: string, data?: unknown): Promise<T> {
  const res = await http.post<ApiResponse<T>>(url, data)
  return res.data.data
}

/** PUT */
export async function put<T>(url: string, data?: unknown): Promise<T> {
  const res = await http.put<ApiResponse<T>>(url, data)
  return res.data.data
}

/** PATCH */
export async function patch<T>(url: string, params?: Record<string, unknown>, data?: unknown): Promise<T> {
  const res = await http.patch<ApiResponse<T>>(url, data, { params })
  return res.data.data
}

/** DELETE */
export async function del<T>(url: string): Promise<T> {
  const res = await http.delete<ApiResponse<T>>(url)
  return res.data.data
}

export default http
