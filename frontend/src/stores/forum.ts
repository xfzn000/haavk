import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { USE_MOCK } from '@/api/request'
import * as postApi from '@/api/posts'
import * as replyApi from '@/api/replies'
import { forumPosts, forumReplies } from '@/mock/forum'
import { avatar } from '@/assets/placeholder'
import { nowStamp } from '@/assets/format'
import { useSessionStore } from '@/stores/session'
import { useAuthStore } from '@/stores/auth'
import type { ForumPost, ForumReply } from '@/types'

interface LikedMap {
  [postId: number]: boolean
}

/**
 * 论坛 Store
 * Mock 模式：读写本地数据；Real 模式：调用 Java API。
 */
export const useForumStore = defineStore('forum', () => {
  const session = useSessionStore()
  const auth = useAuthStore()

  const posts = ref<ForumPost[]>([])
  const repliesByPost = ref<Record<number, ForumReply[]>>({})
  const liked = ref<LikedMap>({})
  const loaded = ref(false)
  const loading = ref(false)

  /** 载入帖子（Mock 或 Real） */
  async function ensureLoaded(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    try {
      const list = USE_MOCK
        ? forumPosts.map((p) => ({ ...p }))
        : await postApi.listPublished()
      posts.value = list.filter((p) => p.status !== 'DELETED')
      if (USE_MOCK) {
        const grouped: Record<number, ForumReply[]> = {}
        forumReplies.forEach((r) => {
          const pid = r.postId
          grouped[pid] = grouped[pid] ? [...grouped[pid], { ...r }] : [{ ...r }]
        })
        repliesByPost.value = grouped
      }
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  /** 载入某帖回复 */
  async function loadReplies(postId: number, force = false) {
    if (!force && repliesByPost.value[postId]) return
    const list = USE_MOCK
      ? forumReplies.filter((r) => r.postId === postId).map((r) => ({ ...r }))
      : await replyApi.listReplies(postId)
    repliesByPost.value = {
      ...repliesByPost.value,
      [postId]: list.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    }
  }

  const sortedPosts = computed<ForumPost[]>(() =>
    posts.value
      .filter((p) => p.status !== 'DELETED')
      .slice()
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return (b.lastReplyAt || b.createdAt).localeCompare(a.lastReplyAt || a.createdAt)
      }),
  )

  function getPost(id: number): ForumPost | undefined {
    return posts.value.find((p) => p.id === id && p.status !== 'DELETED')
  }

  function getReplies(postId: number): ForumReply[] {
    return (repliesByPost.value[postId] || []).slice()
  }

  function isLiked(postId: number): boolean {
    return !!liked.value[postId]
  }

  /** 点赞 / 取消（本地态） */
  function toggleLike(postId: number): number {
    const p = posts.value.find((x) => x.id === postId)
    if (!p) return 0
    if (liked.value[postId]) {
      p.likes = Math.max(0, p.likes - 1)
      liked.value = { ...liked.value, [postId]: false }
    } else {
      p.likes += 1
      liked.value = { ...liked.value, [postId]: true }
    }
    return p.likes
  }

  /** 当前登录账号在论坛里的显示名 */
  const myName = computed(() =>
    USE_MOCK ? session.user.name : auth.nickname || auth.username || '',
  )

  /** 该回复是否属于当前登录用户 */
  function isMine(reply: ForumReply): boolean {
    if (USE_MOCK) return reply.authorId === session.user.id
    const me = auth.username
    return !!me && reply.authorName === me
  }

  /** 提交回复：内容与配图至少有一个；作者由后端按登录态确定（Mock 模式用本地身份） */
  async function addReply(
    postId: number,
    content: string,
    images: string[] = [],
  ): Promise<ForumReply | null> {
    const text = content.trim()
    if (!text && !images.length) return null

    let reply: ForumReply

    if (USE_MOCK) {
      if (!session.consume(50)) return null
      reply = {
        id: Date.now() % 100000,
        postId,
        authorId: session.user.id,
        authorName: session.user.name,
        authorAvatar: session.user.avatar || avatar(session.user.name),
        department: session.user.department,
        tag: session.user.role,
        content: text,
        images: images.slice(),
        createdAt: nowStamp(),
      }
    } else {
      // 真实模式：只提交内容与配图，作者由后端从 JWT 解析（后端已扣回复点数）
      reply = await replyApi.createReply(postId, text, images)
      // 右上角点数立即反映扣减结果
      void session.refreshAttentionPoints()
    }

    const list = repliesByPost.value[postId] || []
    repliesByPost.value = { ...repliesByPost.value, [postId]: [...list, reply] }
    const post = posts.value.find((p) => p.id === postId)
    if (post) {
      post.replyCount += 1
      post.lastReplyBy = reply.authorName
      post.lastReplyAt = reply.createdAt
    }
    return reply
  }

  async function deleteReply(replyId: number, postId?: number) {
    const pid = postId ?? findReplyPostId(replyId)
    if (USE_MOCK) {
      if (pid != null) {
        const list = (repliesByPost.value[pid] || []).filter((r) => r.id !== replyId)
        repliesByPost.value = { ...repliesByPost.value, [pid]: list }
      }
    } else {
      await replyApi.deleteReply(replyId)
      if (pid != null) await loadReplies(pid, true)
    }
    const post = posts.value.find((p) => p.id === pid)
    if (post && post.replyCount > 0) post.replyCount -= 1
  }

  function findReplyPostId(replyId: number): number | undefined {
    for (const [pid, list] of Object.entries(repliesByPost.value)) {
      if (list.some((r) => r.id === replyId)) return Number(pid)
    }
    return undefined
  }

  /* -------------------- 后台操作 -------------------- */

  async function togglePin(postId: number) {
    const p = posts.value.find((x) => x.id === postId)
    if (!p) return
    p.pinned = !p.pinned
    if (!USE_MOCK) await postApi.pinPost(postId, p.pinned)
  }

  async function savePost(payload: Partial<ForumPost> & { id?: number }): Promise<ForumPost> {
    await ensureLoaded()
    if (!USE_MOCK) {
      const saved = payload.id
        ? await postApi.updatePost(payload.id, payload)
        : await postApi.createPost(payload)
      await ensureLoaded(true)
      // 新帖后端扣了注意力点数（编辑不扣），右上角立即刷新
      if (!payload.id) void session.refreshAttentionPoints()
      return saved
    }

    if (payload.id) {
      const p = posts.value.find((x) => x.id === payload.id)
      if (p) {
        Object.assign(p, payload)
        return p
      }
    }
    const id = Math.max(0, ...posts.value.map((p) => p.id)) + 1
    const created: ForumPost = {
      id,
      title: payload.title || '未命名帖子',
      authorId: payload.authorId ?? session.user.id,
      authorName: payload.authorName || session.user.name,
      authorAvatar: payload.authorAvatar || session.user.avatar,
      department: payload.department || session.user.department,
      tag: payload.tag,
      content: payload.content || '',
      images: payload.images ?? [],
      createdAt: nowStamp(),
      likes: 0,
      replyCount: 0,
      unreadReplyCount: 0,
      pinned: payload.pinned ?? false,
      unread: true,
      status: payload.status || 'ON_SALE',
      lastReplyBy: '',
      lastReplyAt: '',
    }
    posts.value.unshift(created)
    return created
  }

  async function removePost(postId: number) {
    const p = posts.value.find((x) => x.id === postId)
    if (p) p.status = 'DELETED'
    if (!USE_MOCK) await postApi.deletePost(postId)
  }

  return {
    posts,
    repliesByPost,
    loaded,
    loading,
    sortedPosts,
    myName,
    ensureLoaded,
    loadReplies,
    getPost,
    getReplies,
    isLiked,
    isMine,
    toggleLike,
    addReply,
    deleteReply,
    togglePin,
    savePost,
    removePost,
  }
})
