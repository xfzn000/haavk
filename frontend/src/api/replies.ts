import { del, get, post, USE_MOCK } from '@/api/request'
import { avatar } from '@/assets/placeholder'
import { forumReplies } from '@/mock/forum'
import type { ForumReply } from '@/types'

function enrich(reply: ForumReply): ForumReply {
  if (!reply.authorAvatar) reply.authorAvatar = avatar(reply.authorName || 'HAAVK')
  return reply
}

export async function listReplies(postId: number): Promise<ForumReply[]> {
  if (USE_MOCK) {
    return forumReplies
      .filter((r) => r.postId === postId)
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }
  const list = await get<ForumReply[]>(`/posts/${postId}/replies`)
  return list.map(enrich)
}

/**
 * 提交回复
 * 内容与配图至少要有一个；作者由后端根据登录态（JWT）确定，前端不参与身份判断。
 */
export async function createReply(
  postId: number,
  content: string,
  images: string[] = [],
): Promise<ForumReply> {
  if (USE_MOCK) throw new Error('Mock 模式下请在本地 store 操作')
  return post<ForumReply>(`/posts/${postId}/replies`, { content, images })
}

export async function deleteReply(id: number): Promise<void> {
  if (USE_MOCK) return
  return del<void>(`/replies/${id}`)
}
