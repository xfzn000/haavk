<script setup lang="ts">
/**
 * ForumPostTable —— 帖子表格（表头 + 内部滚动行区 + 底部固定筛选栏）
 * 列表在容器内部滚动，底栏固定在容器底部，不与整页滚动冲突。
 */
import { AlertCircle, MessageSquare } from 'lucide-vue-next'
import ForumPostRow from '@/components/forum/ForumPostRow.vue'
import ForumFilterBar from '@/components/forum/ForumFilterBar.vue'
import type { ForumFilterKey } from '@/mock/forum'
import type { ForumPost } from '@/types'

defineProps<{
  posts: ForumPost[]
  active: ForumFilterKey | null
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:active', v: ForumFilterKey | null): void
  (e: 'retry'): void
}>()
</script>

<template>
  <section class="post-table">
    <!-- 表头 -->
    <div class="post-table__head">
      <span class="col col--state"></span>
      <span class="col col--title">标题</span>
      <span class="col col--author">发帖人</span>
      <span class="col col--reply">回复</span>
      <span class="col col--last">最后回复</span>
    </div>

    <!-- 行区（内部滚动） -->
    <div class="post-table__body">
      <ForumPostRow v-for="p in posts" :key="p.id" :post="p" />

      <div v-if="loading && !posts.length" class="post-table__state">
        <span class="post-table__spin" aria-hidden="true"></span>
        <p>加载中…</p>
      </div>

      <div v-else-if="error" class="post-table__state is-error">
        <AlertCircle :size="28" />
        <p>{{ error }}</p>
        <button type="button" class="post-table__retry" @click="emit('retry')">重新加载</button>
      </div>

      <div v-else-if="!posts.length" class="post-table__state">
        <MessageSquare :size="28" />
        <p>没有符合条件的帖子</p>
      </div>
    </div>

    <!-- 底部筛选栏 -->
    <ForumFilterBar :active="active" @update:active="emit('update:active', $event)" />
  </section>
</template>

<style scoped>
.post-table {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
}

/* ---- 表头 ---- */
.post-table__head {
  display: grid;
  grid-template-columns: 8.6% 34.6% 24% 13.5% 19.3%;
  align-items: center;
  flex: 0 0 auto;
  height: 50px;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #27343b;
  border-bottom: 3px solid var(--haavk-head-line);
}
.col--title {
  padding-right: 22px;
}
.col--reply,
.col--last {
  text-align: center;
}

/* ---- 行区 ---- */
.post-table__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  /* 为底部筛选栏预留空间，最后一行不会被完全遮住 */
  padding-bottom: 46px;
  overscroll-behavior: contain;
}
.post-table__body::-webkit-scrollbar {
  width: 9px;
}
.post-table__body::-webkit-scrollbar-track {
  background: rgba(185, 200, 216, 0.22);
}
.post-table__body::-webkit-scrollbar-thumb {
  background: rgba(58, 128, 200, 0.55);
  border-radius: 0;
}

/* ---- 加载 / 空 / 错误 ---- */
.post-table__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 0;
  color: #8d9aa6;
}
.post-table__state.is-error {
  color: var(--haavk-red);
}
.post-table__state p {
  margin: 0;
  font-size: 14px;
}
.post-table__retry {
  padding: 6px 16px;
  font-size: 13px;
  color: var(--haavk-blue);
  background: rgba(35, 121, 216, 0.08);
  border: 1px solid rgba(35, 121, 216, 0.35);
  border-radius: 2px;
  cursor: pointer;
  transition: background 160ms ease;
}
.post-table__retry:hover {
  background: rgba(35, 121, 216, 0.16);
}
.post-table__spin {
  width: 22px;
  height: 22px;
  border: 2px solid rgba(35, 121, 216, 0.25);
  border-top-color: var(--haavk-blue);
  border-radius: 50%;
  animation: forum-spin 0.8s linear infinite;
}
@keyframes forum-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ---- 响应式 ---- */
@media (max-width: 1024px) {
  .post-table {
    height: auto;
  }
  .post-table__head {
    grid-template-columns: 8% 1fr 30% 16%;
    height: 44px;
    font-size: 15px;
  }
  /* 窄屏最后一列（最后回复）整体隐藏，表头也要一起隐藏，否则会错位折行 */
  .post-table__head .col--last {
    display: none;
  }
  .post-table__body {
    max-height: none;
    overflow: visible;
    padding-bottom: 0;
  }
}
</style>
