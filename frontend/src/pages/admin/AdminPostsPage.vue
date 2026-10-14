<script setup lang="ts">
/**
 * 后台 · 帖子管理 /admin/posts
 */
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Plus, Pencil, Trash2, Pin, PinOff, Eye } from 'lucide-vue-next'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useForumStore } from '@/stores/forum'
import { useLogStore } from '@/stores/log'
import { useToastStore } from '@/stores/toast'
import { formatDateTime } from '@/assets/format'
import type { ForumPost } from '@/types'

const forum = useForumStore()
const log = useLogStore()
const toast = useToastStore()
forum.ensureLoaded()

const keyword = ref('')
const confirmOpen = ref(false)
const pending = ref<ForumPost | null>(null)

const rows = computed<ForumPost[]>(() => {
  const kw = keyword.value.trim().toLowerCase()
  return forum.posts
    .filter((p) => p.status !== 'DELETED')
    .filter((p) => !kw || p.title.toLowerCase().includes(kw) || p.authorName.toLowerCase().includes(kw))
    .slice()
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt))
})

async function togglePin(p: ForumPost) {
  try {
    await forum.togglePin(p.id)
    log.record(p.pinned ? '置顶' : '取消置顶', `帖子《${p.title}》`)
    toast.success(p.pinned ? '已置顶' : '已取消置顶')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '操作失败')
  }
}

function askDelete(p: ForumPost) {
  pending.value = p
  confirmOpen.value = true
}

async function doDelete() {
  if (pending.value) {
    try {
      await forum.removePost(pending.value.id)
      log.record('删除', `帖子《${pending.value.title}》`)
      toast.success('帖子已删除（软删除）')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败')
    }
  }
  confirmOpen.value = false
  pending.value = null
}
</script>

<template>
  <div class="page">
    <!-- 工具条 -->
    <div class="page__bar hud-panel">
      <input v-model="keyword" class="hud-input page__search" type="search" placeholder="搜索标题 / 发帖人…" />
      <span class="page__count hud-mono">共 {{ rows.length }} 条</span>
      <RouterLink to="/admin/posts/new" class="hud-btn">
        <Plus :size="15" />
        新增帖子
      </RouterLink>
    </div>

    <!-- 表格 -->
    <div class="hud-panel table-wrap">
      <table class="hud-table">
        <thead>
          <tr>
            <th>标题</th>
            <th>发帖人</th>
            <th>回复</th>
            <th>状态</th>
            <th>置顶</th>
            <th>创建时间</th>
            <th class="ta-r">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in rows" :key="p.id">
            <td class="cell-title">{{ p.title }}</td>
            <td>
              <div class="author">
                <img :src="p.authorAvatar" :alt="p.authorName" />
                <span>{{ p.authorName }}</span>
              </div>
            </td>
            <td class="hud-mono">{{ p.replyCount }}</td>
            <td>
              <span class="hud-tag" :class="{ 'hud-tag--outline': p.status === 'ON_SALE' }">
                {{ p.status === 'ON_SALE' ? '已发布' : p.status === 'DRAFT' ? '草稿' : '已下架' }}
              </span>
            </td>
            <td>
              <span v-if="p.pinned" class="hud-tag hud-tag--blue">置顶</span>
              <span v-else class="muted">—</span>
            </td>
            <td class="hud-mono nowrap">{{ formatDateTime(p.createdAt) }}</td>
            <td>
              <div class="ops">
                <RouterLink :to="`/forum/${p.id}`" class="op" target="_blank" title="查看">
                  <Eye :size="15" />
                </RouterLink>
                <RouterLink :to="`/admin/posts/${p.id}`" class="op" title="编辑">
                  <Pencil :size="15" />
                </RouterLink>
                <button class="op" type="button" :title="p.pinned ? '取消置顶' : '置顶'" @click="togglePin(p)">
                  <component :is="p.pinned ? PinOff : Pin" :size="15" />
                </button>
                <button class="op op--danger" type="button" title="删除" @click="askDelete(p)">
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!rows.length" class="empty">暂无帖子</div>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      title="删除帖子"
      message="确定删除这条帖子吗？&#10;删除后前台将不再显示。"
      @confirm="doDelete"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<style scoped>
.page__bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  margin-bottom: 16px;
}
.page__search {
  max-width: 320px;
}
.page__count {
  font-size: 13px;
  color: var(--haavk-muted);
}
.page__count + .hud-btn {
  margin-left: auto;
}

.table-wrap {
  overflow-x: auto;
}
.cell-title {
  max-width: 380px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}
.author {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.author img {
  width: 26px;
  height: 26px;
  border: 1px solid var(--haavk-border);
}
.muted {
  color: #9aa7b4;
}
.nowrap {
  white-space: nowrap;
  font-size: 12px;
  color: var(--haavk-muted);
}
.ta-r {
  text-align: right;
}
.ops {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}
.op {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: var(--haavk-muted);
  background: transparent;
  border: 1px solid var(--haavk-border);
  border-radius: 2px;
  cursor: pointer;
  transition: all 160ms ease;
}
.op:hover {
  color: var(--haavk-blue);
  border-color: var(--haavk-blue);
  background: rgba(35, 121, 216, 0.07);
}
.op--danger:hover {
  color: var(--haavk-red);
  border-color: var(--haavk-red);
  background: rgba(229, 59, 59, 0.07);
}
.empty {
  padding: 46px;
  text-align: center;
  color: var(--haavk-muted);
}

@media (max-width: 768px) {
  .page__bar {
    flex-wrap: wrap;
  }
  .page__search {
    max-width: none;
    flex-basis: 100%;
  }
}
</style>
