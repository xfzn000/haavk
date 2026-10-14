import { del, get, patch, post, put, USE_MOCK } from '@/api/request'
import { avatar } from '@/assets/placeholder'
import { forumPosts } from '@/mock/forum'
import type { ForumPost, PageQuery, PageResult } from '@/types'

/** 补齐缺失的头像（后端种子数据可能不带图） */
function enrich(post: ForumPost): ForumPost {
  if (!post.authorAvatar) post.authorAvatar = avatar(post.authorName || 'HAAVK')
  return post
}

/** 列表（后台分页） */
export async function pagePosts(query: PageQuery = {}): Promise<PageResult<ForumPost>> {
  if (USE_MOCK) {
    const records = forumPosts.filter((p) => p.status !== 'DELETED')
    return { records, total: records.length, page: 1, pageSize: records.length }
  }
  const res = await get<PageResult<ForumPost>>('/posts', query as Record<string, unknown>)
  res.records = res.records.map(enrich)
  return res
}

/** 前台列表：仅已发布 */
export async function listPublished(): Promise<ForumPost[]> {
  if (USE_MOCK) return forumPosts.filter((p) => p.status !== 'DELETED')
  const list = await get<ForumPost[]>('/posts/published')
  return list.map(enrich)
}

export async function getPost(id: number): Promise<ForumPost> {
  if (USE_MOCK) {
    const p = forumPosts.find((x) => x.id === id)
    if (!p) throw new Error('帖子不存在')
    return enrich(p)
  }
  return enrich(await get<ForumPost>(`/posts/${id}`))
}

export async function createPost(data: Partial<ForumPost>): Promise<ForumPost> {
  if (USE_MOCK) throw new Error('Mock 模式下请在本地 store 操作')
  return post<ForumPost>('/posts', data)
}

export async function updatePost(id: number, data: Partial<ForumPost>): Promise<ForumPost> {
  if (USE_MOCK) throw new Error('Mock 模式下请在本地 store 操作')
  return put<ForumPost>(`/posts/${id}`, data)
}

export async function deletePost(id: number): Promise<void> {
  if (USE_MOCK) return
  return del<void>(`/posts/${id}`)
}

export async function pinPost(id: number, pinned: boolean): Promise<void> {
  if (USE_MOCK) return
  return patch<void>(`/posts/${id}/pin`, { pinned })
}
