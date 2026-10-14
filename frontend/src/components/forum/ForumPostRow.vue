<script setup lang="ts">
/**
 * ForumPostRow —— 论坛列表单行
 * 列：状态（置顶箭头 / 空心方框）| 标题 | 发帖人（方形头像＋两行）| 回复 | 最后回复
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowUp, Image } from 'lucide-vue-next'
import type { ForumPost } from '@/types'

const props = defineProps<{ post: ForumPost }>()

/**
 * 已读/未读只体现在标题字重与颜色上（参考图里图标均为空心方框）。
 * 后端表结构没有 unread 字段时视为未读 → 深色，避免整页标题发灰。
 */
const titleClass = computed(() => {
  if (props.post.pinned) return 'is-pinned'
  return props.post.unread === false ? 'is-read' : 'is-unread'
})

const replyText = computed(
  () => `${props.post.unreadReplyCount ?? 0}/${props.post.replyCount}`,
)
</script>

<template>
  <RouterLink class="row" :class="{ 'row--pinned': post.pinned }" :to="`/forum/${post.id}`">
    <!-- 状态 -->
    <span class="row__state">
      <span v-if="post.pinned" class="pin" aria-label="置顶">
        <ArrowUp class="pin__arrow" :size="21" :stroke-width="3" />
        <i class="pin__bar"></i>
      </span>
      <i v-else class="sq" aria-hidden="true"></i>
    </span>

    <!-- 标题（带配图的帖子加一个小图标，不占额外列） -->
    <span class="row__title" :class="titleClass">
      {{ post.title }}
      <Image v-if="post.images?.length" class="row__pic" :size="13" aria-label="含配图" />
    </span>

    <!-- 发帖人 -->
    <span class="row__author">
      <img class="row__avatar" :src="post.authorAvatar" :alt="post.authorName" loading="lazy" />
      <span class="row__meta">
        <span class="row__name">{{ post.authorName }}</span>
        <span class="row__dept">{{ post.department }}</span>
      </span>
    </span>

    <!-- 回复 -->
    <span class="row__reply hud-mono">{{ replyText }}</span>

    <!-- 最后回复 -->
    <span class="row__last" :class="{ 'is-empty': !post.lastReplyBy }">
      {{ post.lastReplyBy || '--' }}
    </span>
  </RouterLink>
</template>

<style scoped>
.row {
  display: grid;
  /* 列比例按参考图实测：状态 8.6% / 标题 34.6% / 发帖人 24% / 回复 13.5% / 最后回复 19.3% */
  grid-template-columns: 8.6% 34.6% 24% 13.5% 19.3%;
  align-items: center;
  height: 86px;
  border-bottom: 1px solid var(--haavk-row-line);
  transition: background 150ms ease;
}
/* 置顶行更高（对齐参考图：公告行明显比其他行高） */
.row--pinned {
  height: 103px;
}
.row:hover {
  background: rgba(255, 255, 255, 0.36);
}
.row:hover .row__title {
  color: var(--haavk-blue);
}

/* ---- 状态列 ---- */
.row__state {
  display: flex;
  align-items: center;
  justify-content: center;
}
.pin {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}
.pin__arrow {
  color: var(--haavk-blue);
}
.pin__bar {
  width: 17px;
  height: 2px;
  background: var(--haavk-blue);
}
.sq {
  width: 13px;
  height: 13px;
  border: 1.5px solid #7fb0e0;
}

/* ---- 标题 ---- */
.row__title {
  min-width: 0;
  padding-right: 22px;
  font-size: 18px;
  line-height: 1.3;
  letter-spacing: 0.2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 150ms ease;
}
/* 含配图帖子的标记（行内小图标，不改变行高与列宽） */
.row__pic {
  display: inline-block;
  margin-left: 6px;
  vertical-align: -2px;
  color: var(--haavk-blue);
  opacity: 0.75;
}
.row__title.is-pinned {
  font-weight: 700;
  color: #27343b;
}
.row__title.is-unread {
  font-weight: 650;
  color: #2b3841;
}
.row__title.is-read {
  font-weight: 500;
  color: #79848e;
}

/* ---- 发帖人 ---- */
.row__author {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding-right: 14px;
}
.row__avatar {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  object-fit: cover;
  border: 1px solid rgba(150, 175, 200, 0.8);
  background: #dfe6ee;
}
.row__meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.row__name {
  font-size: 15px;
  font-weight: 700;
  color: #27343b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row__dept {
  font-size: 13px;
  color: #6b7681;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---- 回复 ---- */
.row__reply {
  text-align: center;
  font-size: 17px;
  color: #3f4a54;
}

/* ---- 最后回复 ---- */
.row__last {
  text-align: center;
  font-size: 16px;
  color: #3f4a54;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row__last.is-empty {
  color: #98a4ae;
}

/* ---- 响应式：窄屏隐藏「最后回复」并压缩列 ---- */
@media (max-width: 1024px) {
  .row {
    grid-template-columns: 8% 1fr 30% 16%;
    height: 78px;
  }
  .row__last {
    display: none;
  }
  .row__avatar {
    width: 40px;
    height: 40px;
  }
}
</style>
