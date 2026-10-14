<script setup lang="ts">
/**
 * ForumInfoPanel —— 论坛页左栏说明面板
 * 结构（对齐参考图）：标题 + 细横线 → 说明段 → 提示段 → 三条信息卡 → 发帖按钮
 * 纯直角/细线，无大圆角、无卡片阴影。
 */
import { FileText } from 'lucide-vue-next'
import brandLogo from '@/assets/logo2.webp'

export interface InfoKeyword {
  name: string
  desc: string
}

withDefaults(
  defineProps<{
    title: string
    desc: string[]
    tip?: string
    keywords?: InfoKeyword[]
    /** 是否有发帖权限（false 时按钮呈禁用观感） */
    canPost?: boolean
  }>(),
  { tip: '', keywords: () => [], canPost: false },
)

defineEmits<{ (e: 'post'): void }>()

/**
 * 参考图里前两条信息卡用的是 HAAVK 徽标（纯黑），第三条是文档图标。
 * 徽标直接用 logo2.webp + `filter: brightness(0)` 转黑（保留透明通道）。
 */
const BRAND_ICON_COUNT = 2
</script>

<template>
  <aside class="forum-info">
    <h1 class="forum-info__title">{{ title }}</h1>
    <span class="forum-info__rule" aria-hidden="true"></span>

    <div class="forum-info__lead">
      <p v-for="(d, i) in desc" :key="i">{{ d }}</p>
    </div>

    <p v-if="tip" class="forum-info__tip">{{ tip }}</p>

    <div v-if="keywords.length" class="forum-info__cards">
      <div v-for="(k, i) in keywords" :key="k.name" class="info-card">
        <span class="info-card__icon">
          <img v-if="i < BRAND_ICON_COUNT" class="info-card__brand" :src="brandLogo" alt="" />
          <FileText v-else :size="24" :stroke-width="1.8" />
        </span>
        <div class="info-card__body">
          <div class="info-card__name">{{ k.name }}</div>
          <p class="info-card__desc">{{ k.desc }}</p>
        </div>
      </div>
    </div>

    <div class="forum-info__foot">
      <button
        class="post-btn"
        :class="{ 'is-disabled': !canPost }"
        type="button"
        @click="$emit('post')"
      >
        发帖
      </button>
    </div>
  </aside>
</template>

<style scoped>
.forum-info {
  display: flex;
  flex-direction: column;
  padding: 22px 20px 24px;
  background: rgba(246, 249, 252, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 2px;
  backdrop-filter: blur(4px);
  overflow: hidden;
}

/* ---- 标题 + 细线 ---- */
.forum-info__title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 1px;
  color: #27343b;
}
.forum-info__rule {
  display: block;
  width: 100%;
  height: 1px;
  margin: 10px 0 16px;
  background: rgba(58, 70, 82, 0.55);
}

/* ---- 说明文字 ---- */
.forum-info__lead p {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: #47535c;
  overflow-wrap: anywhere;
}
.forum-info__tip {
  margin: 14px 0 0;
  font-size: 15px;
  line-height: 1.5;
  color: #47535c;
  overflow-wrap: anywhere;
}

/* ---- 三条信息卡 ---- */
.forum-info__cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}
.info-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(252, 253, 255, 0.62);
  border: 1px solid rgba(196, 210, 224, 0.7);
  border-radius: 2px;
}
.info-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  flex-shrink: 0;
  padding-top: 2px;
  /* 三张卡的图标统一纯黑（前两张是 HAAVK 徽标转黑 + 文档图标） */
  color: #000;
}
/* HAAVK 徽标：转纯黑（参考图里前两张卡用的就是它） */
.info-card__brand {
  display: block;
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: brightness(0);
}
.info-card__body {
  min-width: 0;
  flex: 1;
}
.info-card__name {
  font-size: 15px;
  font-weight: 700;
  line-height: 20px;
  color: #27343b;
}
.info-card__desc {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 22px;
  color: #5b666f;
  overflow-wrap: anywhere;
}

/* ---- 发帖按钮（默认蓝色主按钮；按下变灰） ---- */
.forum-info__foot {
  margin-top: 22px;
}
.post-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 5px;
  text-indent: 5px;
  color: #eef1f3;
  background: var(--haavk-blue);
  border: 1px solid var(--haavk-blue);
  border-radius: 2px;
  cursor: pointer;
  transition: background 180ms ease, border-color 180ms ease, filter 180ms ease;
}
.post-btn:hover {
  filter: brightness(1.08);
}
/* 按下（点击）时变灰 */
.post-btn:active {
  background: #939a9f;
  border-color: #939a9f;
  filter: none;
}
.post-btn.is-disabled {
  background: #939a9f;
  border-color: #939a9f;
  opacity: 0.9;
  cursor: not-allowed;
}
.post-btn.is-disabled:hover {
  filter: none;
}

/* ---- 响应式 ---- */
@media (max-width: 1024px) {
  .forum-info {
    padding: 18px 18px 20px;
  }
  .forum-info__title {
    font-size: 22px;
  }
  .info-card {
    min-height: 0;
  }
}
</style>
