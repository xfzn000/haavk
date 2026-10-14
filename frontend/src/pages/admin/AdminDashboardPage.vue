<script setup lang="ts">
/**
 * 后台控制台 /admin
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { MessagesSquare, Package, UserSearch, Users, TrendingUp, CheckCircle2 } from 'lucide-vue-next'
import { useForumStore } from '@/stores/forum'
import { useProductStore } from '@/stores/product'
import { useMissingPersonStore } from '@/stores/missingPerson'
import { employees } from '@/mock/employees'

const forum = useForumStore()
const product = useProductStore()
const missing = useMissingPersonStore()
forum.ensureLoaded()
product.ensureLoaded()
missing.ensureLoaded()

const activePosts = computed(() => forum.posts.filter((p) => p.status !== 'DELETED'))

const stats = computed(() => [
  { label: '帖子总数', value: activePosts.value.length, icon: MessagesSquare, to: '/admin/posts', tone: 'blue' },
  { label: '今日新增帖子', value: 1, icon: TrendingUp, to: '/admin/posts', tone: 'green' },
  { label: '商品总数', value: product.list.filter((p) => p.status !== 'DELETED').length, icon: Package, to: '/admin/products', tone: 'blue' },
  { label: '上架商品', value: product.onSaleList.length, icon: CheckCircle2, to: '/admin/products', tone: 'green' },
  { label: '寻人启事数量', value: missing.list.filter((m) => m.status !== 'DELETED').length, icon: UserSearch, to: '/admin/missing-persons', tone: 'amber' },
  { label: '员工数量', value: employees.length, icon: Users, to: '/admin/employees', tone: 'blue' },
])

const recentPosts = computed(() => activePosts.value.slice(0, 5))
</script>

<template>
  <div class="dash">
    <!-- 统计卡片 -->
    <div class="dash__grid">
      <RouterLink v-for="s in stats" :key="s.label" :to="s.to" class="stat hud-panel">
        <span class="stat__icon" :class="`stat__icon--${s.tone}`">
          <component :is="s.icon" :size="20" />
        </span>
        <div class="stat__body">
          <span class="stat__value hud-mono">{{ s.value }}</span>
          <span class="stat__label">{{ s.label }}</span>
        </div>
      </RouterLink>
    </div>

    <!-- 最近帖子 -->
    <section class="hud-panel recent">
      <div class="recent__head">
        <h2>最近帖子</h2>
        <RouterLink to="/admin/posts" class="recent__more">查看全部 →</RouterLink>
      </div>
      <table class="hud-table">
        <thead>
          <tr>
            <th>标题</th>
            <th>发帖人</th>
            <th>回复</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in recentPosts" :key="p.id">
            <td class="cell-title">{{ p.title }}</td>
            <td>{{ p.authorName }}</td>
            <td class="hud-mono">{{ p.replyCount }}</td>
            <td>
              <span v-if="p.pinned" class="hud-tag hud-tag--blue">置顶</span>
              <span v-else class="hud-tag">普通</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.dash__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}
.stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  transition: transform 180ms ease, box-shadow 180ms ease;
}
.stat:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 26px -16px rgba(24, 32, 39, 0.5);
}
.stat__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 2px;
}
.stat__icon--blue {
  color: var(--haavk-blue);
  background: rgba(35, 121, 216, 0.1);
  border: 1px solid rgba(35, 121, 216, 0.25);
}
.stat__icon--green {
  color: var(--haavk-green);
  background: rgba(46, 163, 107, 0.1);
  border: 1px solid rgba(46, 163, 107, 0.25);
}
.stat__icon--amber {
  color: var(--haavk-amber);
  background: rgba(217, 144, 43, 0.1);
  border: 1px solid rgba(217, 144, 43, 0.25);
}
.stat__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.stat__value {
  font-size: 24px;
  font-weight: 800;
  color: var(--haavk-text);
  line-height: 1.1;
}
.stat__label {
  font-size: 12px;
  color: var(--haavk-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent {
  overflow: hidden;
}
.recent__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--haavk-border);
}
.recent__head h2 {
  margin: 0;
  font-size: 16px;
  color: var(--haavk-text);
}
.recent__more {
  font-size: 13px;
  color: var(--haavk-blue);
}
.cell-title {
  max-width: 420px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .dash__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .dash__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .recent {
    overflow-x: auto;
  }
}
</style>
