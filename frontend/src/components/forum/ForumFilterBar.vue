<script setup lang="ts">
/**
 * ForumFilterBar —— 帖子列表底部固定筛选栏
 * 选项：系统置顶 / 全新未读 / 有未读回复 / 全部已读（可切换，再点一次取消）
 * 固定在「右侧列表容器」底部（不是浏览器窗口底部）。
 */
import { ArrowUp } from 'lucide-vue-next'
import { forumFilters, type ForumFilterKey } from '@/mock/forum'

defineProps<{ active: ForumFilterKey | null }>()
const emit = defineEmits<{ (e: 'update:active', v: ForumFilterKey | null): void }>()

function toggle(key: ForumFilterKey, current: ForumFilterKey | null) {
  emit('update:active', current === key ? null : key)
}
</script>

<template>
  <div class="filter-bar">
    <div class="filter-bar__items">
      <button
        v-for="f in forumFilters"
        :key="f.key"
        class="filter-item"
        :class="{ 'is-on': active === f.key }"
        type="button"
        @click="toggle(f.key, active)"
      >
        <span class="filter-item__mark" aria-hidden="true">
          <ArrowUp v-if="f.key === 'pinned'" :size="15" :stroke-width="3" class="mark-pin" />
          <i v-else class="mark-sq" :class="`mark-sq--${f.key}`"></i>
        </span>
        {{ f.label }}
      </button>
    </div>

    <span class="filter-bar__brand">HAAVK</span>
  </div>
</template>

<style scoped>
.filter-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  background: rgba(246, 248, 250, 0.86);
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
  border-top: 1px solid rgba(163, 185, 206, 0.55);
}

.filter-bar__items {
  display: flex;
  align-items: center;
  height: 100%;
}
.filter-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 100%;
  padding: 0 26px;
  font-size: 16px;
  color: #48545e;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 160ms ease, background 160ms ease;
}
.filter-item:first-child {
  padding-left: 10px;
}
.filter-item:hover {
  color: var(--haavk-blue);
}
.filter-item.is-on {
  color: #1b5fae;
  font-weight: 600;
}
/* 选项之间的细竖线 */
.filter-item + .filter-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 18px;
  background: rgba(74, 96, 120, 0.32);
}

.filter-item__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  flex-shrink: 0;
}
.mark-pin {
  color: var(--haavk-blue);
}
.mark-sq {
  width: 12px;
  height: 12px;
  border: 1.5px solid #a8b6c2;
}
.mark-sq--unread {
  background: var(--haavk-blue);
  border-color: var(--haavk-blue);
}
.mark-sq--unreadReply {
  border-color: #5b9bdd;
}

.filter-bar__brand {
  margin-left: auto;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 3px;
  color: rgba(35, 121, 216, 0.75);
}

@media (max-width: 1024px) {
  /* 窄屏列表不再内部滚动，筛选栏回到文档流 */
  .filter-bar {
    position: static;
    height: auto;
    min-height: 42px;
    margin-top: 4px;
    flex-wrap: wrap;
  }
  .filter-item {
    padding: 0 14px;
    height: 42px;
    font-size: 14px;
  }
  .filter-bar__total {
    display: none;
  }
}
</style>
