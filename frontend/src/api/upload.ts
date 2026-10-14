import { post } from '@/api/request'

/**
 * 上传图片（后台商品 / 寻人启事共用）
 * 走后端 `POST /api/upload`（multipart），返回可访问地址，如 `/uploads/20261014/xxxx.png`
 * —— 不要用 FileReader 转 base64 存库：`image` 字段是 varchar(512)，base64 会被截断。
 */
export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  return post<string>('/upload', fd)
}
