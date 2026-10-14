<script setup lang="ts">
/**
 * 后台 · 员工管理 /admin/employees （第一版只读）
 */
import { computed, ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { employees } from '@/mock/employees'

const keyword = ref('')

const rows = computed(() =>
  employees.filter(
    (e) =>
      !keyword.value.trim() ||
      e.name.includes(keyword.value.trim()) ||
      e.department.includes(keyword.value.trim()),
  ),
)
</script>

<template>
  <div class="page">
    <div class="page__bar hud-panel">
      <span class="search">
        <Search :size="15" />
        <input v-model="keyword" class="hud-input" type="search" placeholder="搜索姓名 / 部门…" />
      </span>
      <span class="page__count hud-mono">共 {{ rows.length }} 名员工</span>
    </div>

    <div class="hud-panel table-wrap">
      <table class="hud-table">
        <thead>
          <tr>
            <th>头像</th>
            <th>姓名</th>
            <th>部门</th>
            <th>角色</th>
            <th>注意力点数</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in rows" :key="e.id">
            <td><img class="thumb" :src="e.avatar" :alt="e.name" /></td>
            <td class="cell-name">{{ e.name }}</td>
            <td>{{ e.department }}</td>
            <td>{{ e.role }}</td>
            <td class="hud-mono">{{ e.attentionPoints.toLocaleString('en-US') }}</td>
            <td>
              <span class="hud-tag" :class="{ 'hud-tag--outline': e.status === 1 }">
                {{ e.status === 1 ? '在职' : '未注册' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!rows.length" class="empty">没有匹配的员工</div>
    </div>
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
.search {
  position: relative;
  display: inline-flex;
  align-items: center;
  max-width: 320px;
  width: 100%;
}
.search svg {
  position: absolute;
  left: 11px;
  color: #9aa7b4;
}
.search .hud-input {
  padding-left: 34px;
}
.page__count {
  margin-left: auto;
  font-size: 13px;
  color: var(--haavk-muted);
}
.table-wrap {
  overflow-x: auto;
}
.thumb {
  width: 36px;
  height: 36px;
  border: 1px solid var(--haavk-border);
}
.cell-name {
  font-weight: 600;
  white-space: nowrap;
}
.empty {
  padding: 46px;
  text-align: center;
  color: var(--haavk-muted);
}
</style>
