<script setup lang="ts">
/**
 * 后台 · 操作日志 /admin/logs
 */
import { computed, ref } from 'vue'
import { useLogStore } from '@/stores/log'
import { formatDateTime } from '@/assets/format'

const log = useLogStore()
log.ensureLoaded()

const filter = ref('')

const actions = ['登录', '新增', '编辑', '删除', '上架', '下架', '置顶', '取消置顶', '恢复']

const rows = computed(() =>
  log.list.filter((l) => !filter.value || l.action === filter.value),
)
</script>

<template>
  <div class="page">
    <div class="page__bar hud-panel">
      <div class="filters">
        <button
          type="button"
          class="chip"
          :class="{ 'is-on': filter === '' }"
          @click="filter = ''"
        >
          全部
        </button>
        <button
          v-for="a in actions"
          :key="a"
          type="button"
          class="chip"
          :class="{ 'is-on': filter === a }"
          @click="filter = a"
        >
          {{ a }}
        </button>
      </div>
      <span class="page__count hud-mono">{{ rows.length }} 条</span>
    </div>

    <div class="hud-panel table-wrap">
      <table class="hud-table">
        <thead>
          <tr>
            <th>管理员</th>
            <th>操作类型</th>
            <th>目标</th>
            <th>IP</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in rows" :key="l.id">
            <td class="cell-admin">{{ l.admin }}</td>
            <td><span class="hud-tag hud-tag--outline">{{ l.action }}</span></td>
            <td class="cell-target">{{ l.target }}</td>
            <td class="hud-mono">{{ l.ip }}</td>
            <td class="hud-mono nowrap">{{ formatDateTime(l.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!rows.length" class="empty">暂无日志</div>
    </div>
  </div>
</template>

<style scoped>
.page__bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  padding: 5px 12px;
  font-size: 13px;
  color: var(--haavk-muted);
  background: transparent;
  border: 1px solid var(--haavk-border);
  border-radius: 2px;
  cursor: pointer;
  transition: all 160ms ease;
}
.chip:hover {
  color: var(--haavk-blue);
  border-color: var(--haavk-blue);
}
.chip.is-on {
  color: #fff;
  background: var(--haavk-blue);
  border-color: var(--haavk-blue);
}
.page__count {
  margin-left: auto;
  font-size: 13px;
  color: var(--haavk-muted);
}
.table-wrap {
  overflow-x: auto;
}
.cell-admin {
  font-weight: 600;
}
.cell-target {
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nowrap {
  white-space: nowrap;
  color: var(--haavk-muted);
  font-size: 12px;
}
.empty {
  padding: 46px;
  text-align: center;
  color: var(--haavk-muted);
}
</style>
