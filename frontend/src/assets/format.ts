/**
 * 通用格式化工具（放在 assets 下以保持既定目录结构不新增顶层文件夹）
 */

/** 2036-10-06 16:08:00 -> 2036.10.06 16:08 */
export function formatDateTime(input: string | undefined | null): string {
  if (!input) return '—'
  const normalized = input.replace('T', ' ').replace(/-/g, '.')
  // 若含秒则去掉秒（后端 LocalDateTime 会带秒，Mock 数据不带）
  const parts = normalized.split(':')
  if (parts.length >= 3) return parts.slice(0, 2).join(':')
  return normalized.trim()
}

/** 仅日期：2036-10-06 -> 2036.10.06 */
export function formatDate(input: string | undefined | null): string {
  if (!input) return '—'
  return input.slice(0, 10).replace(/-/g, '.')
}

/** 千分位金额 */
export function formatMoney(n: number): string {
  return n.toLocaleString('en-US')
}

/** 相对时间：刚刚 / x分钟前 / x小时前 / x天前 */
export function fromNow(input: string): string {
  const t = new Date(input.replace(' ', 'T')).getTime()
  if (Number.isNaN(t)) return formatDateTime(input)
  const diff = Date.now() - t
  if (diff < 0) return formatDateTime(input)
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour} 小时前`
  return `${Math.floor(hour / 24)} 天前`
}

/** 生成本地时间戳字符串（用于新增记录） */
export function nowStamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}:${p(d.getSeconds())}`
}
