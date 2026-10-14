<script setup lang="ts">
/**
 * 员工论坛 /forum
 * 版式：浮层导航 + 「左侧说明栏 ｜ 右侧帖子表格」双栏
 * 左栏：标题/说明/三条信息卡/发帖按钮；右栏：表头 + 内部滚动的行区 + 底部固定筛选栏
 */
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ForumInfoPanel from '@/components/forum/ForumInfoPanel.vue'
import ForumPostTable from '@/components/forum/ForumPostTable.vue'
import ForumComposeDialog from '@/components/forum/ForumComposeDialog.vue'
import { forumRules, type ForumFilterKey } from '@/mock/forum'
import { useForumStore } from '@/stores/forum'
import { useSessionStore } from '@/stores/session'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { requireLogin } from '@/utils/requireLogin'
import type { ForumPost } from '@/types'

const router = useRouter()
const forum = useForumStore()
const session = useSessionStore()
const auth = useAuthStore()
const toast = useToastStore()

/** 加载失败时保留错误信息，界面给出一致的错误态而不是崩溃 */
const loadError = ref<string | null>(null)

async function load(force = false) {
  loadError.value = null
  try {
    await forum.ensureLoaded(force)
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '帖子加载失败，请稍后重试'
  }
}

load()

/** 底部筛选栏当前选中项（null = 不筛选） */
const activeFilter = ref<ForumFilterKey | null>(null)
const composeOpen = ref(false)
const submitting = ref(false)

/** 置顶优先，其余保持数据源顺序（与参考图列表顺序一致） */
const ordered = computed<ForumPost[]>(() => {
  const list = forum.posts.filter((p) => p.status !== 'DELETED')
  return [...list.filter((p) => p.pinned), ...list.filter((p) => !p.pinned)]
})

/**
 * 已读状态：优先用数据里的 unread 字段（Mock）；
 * 后端表没有该字段时，用本地「已看过的帖子 id」兜底 —— 保证筛选栏不是死按钮。
 */
const READ_KEY = 'haavk_forum_read'
const readIds = ref<number[]>(readIdsFromStorage())

function readIdsFromStorage(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(READ_KEY) || '[]')
    return Array.isArray(raw) ? raw.filter((n) => typeof n === 'number') : []
  } catch {
    return []
  }
}

function isRead(p: ForumPost): boolean {
  if (p.unread === false) return true
  if (p.unread === true) return false
  return readIds.value.includes(p.id)
}

function matched(p: ForumPost, key: ForumFilterKey): boolean {
  if (key === 'pinned') return p.pinned
  const read = isRead(p)
  if (key === 'unread') return !read && p.replyCount === 0
  if (key === 'unreadReply') return !read && p.replyCount > 0
  return read
}

const posts = computed<ForumPost[]>(() =>
  activeFilter.value ? ordered.value.filter((p) => matched(p, activeFilter.value as ForumFilterKey)) : ordered.value,
)

const canPost = computed(() => auth.isLoggedIn && session.canPost)

function onPost() {
  // 发帖是写操作，需要登录（游客先引导去登录，登录后自动跳回本页）
  if (!requireLogin(router, '请先登录后再发帖')) return
  if (!session.canPost) {
    toast.error('注意力点数不足，禁止发帖')
    return
  }
  composeOpen.value = true
}

async function onSubmitPost(payload: { title: string; content: string; images: string[] }) {
  if (submitting.value) return
  submitting.value = true
  try {
    const created = await forum.savePost({
      title: payload.title,
      content: payload.content,
      images: payload.images,
    })
    composeOpen.value = false
    toast.success('帖子已发布，扣除 100 注意力点数')
    router.push(`/forum/${created.id}`)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '发布失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="forum-page">
    <div class="forum-page__inner">
      <ForumInfoPanel
        :title="forumRules.title"
        :desc="forumRules.desc"
        :tip="forumRules.tip"
        :keywords="forumRules.keywords"
        :can-post="canPost"
        @post="onPost"
      />

      <ForumPostTable
        :posts="posts"
        :active="activeFilter"
        :loading="forum.loading"
        :error="loadError"
        @update:active="activeFilter = $event"
        @retry="load(true)"
      />
    </div>

    <ForumComposeDialog
      :open="composeOpen"
      :submitting="submitting"
      @submit="onSubmitPost"
      @cancel="composeOpen = false"
    />
  </div>
</template>

<style scoped>
.forum-page {
  width: 100%;
}

.forum-page__inner {
  width: var(--haavk-content-w);
  max-width: 1760px;
  margin: 0 auto;
  /* 正文顶边 = --haavk-body-top（导航贴顶后为 12.3vh，保持导航→正文间距 ≈52px） */
  height: calc(var(--haavk-body-top) + var(--haavk-body-h));
  padding-top: var(--haavk-body-top);
  display: grid;
  grid-template-columns: minmax(280px, 23fr) minmax(0, 75fr);
  column-gap: 2.7%;
  align-items: stretch;
}

/* 矮视口下按固定值收紧正文顶边 */
@media (max-height: 620px) {
  .forum-page__inner {
    padding-top: 88px;
  }
}

@media (max-width: 1024px) {
  .forum-page__inner {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 20px;
    height: auto;
    padding-top: 104px;
    padding-bottom: 24px;
  }
}

@media (max-width: 768px) {
  .forum-page__inner {
    width: 92%;
    padding-top: 92px;
  }
}
</style>
