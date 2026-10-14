<script setup lang="ts">
/**
 * SidePanel —— 左栏说明面板（论坛 / 解决方案 / 寻人启事 共用）
 */
import { BadgePercent, ShieldCheck, Target, Equal } from 'lucide-vue-next'

export interface SideKeyword {
  name: string
  desc: string
}

defineProps<{
  title: string
  desc: string[]
  tip?: string
  keywords?: SideKeyword[]
}>()

/** 图标风格统一（线性、无 emoji），按序取用 */
const icons = [ShieldCheck, BadgePercent, Target, Equal]
</script>

<template>
  <aside class="side-panel hud-panel">
    <!-- 顶部标题 + HUD 刻度装饰 -->
    <div class="side-panel__head">
      <h2 class="side-panel__title">{{ title }}</h2>
      <span class="side-panel__ticks" aria-hidden="true">
        <i v-for="i in 5" :key="i" :class="{ on: i <= 3 }"></i>
      </span>
    </div>

    <p v-for="(d, i) in desc" :key="i" class="side-panel__desc">{{ d }}</p>

    <p v-if="tip" class="side-panel__tip">{{ tip }}</p>

    <!-- 关键字卡片 -->
    <div v-if="keywords && keywords.length" class="side-panel__keywords">
      <div v-for="(k, i) in keywords" :key="k.name" class="kw">
        <span class="kw__icon">
          <component :is="icons[i % icons.length]" :size="24" :stroke-width="1.7" />
        </span>
        <div class="kw__body">
          <div class="kw__name">{{ k.name }}</div>
          <div class="kw__desc">{{ k.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 底部插槽（如发帖按钮） -->
    <div v-if="$slots.footer" class="side-panel__footer">
      <slot name="footer"></slot>
    </div>

    <!-- 装饰：左下斜线 -->
    <span class="side-panel__stripe" aria-hidden="true"></span>
  </aside>
</template>

<style scoped>
.side-panel {
  position: relative;
  padding: 20px 18px 22px;
  align-self: start;
  overflow: hidden;
  min-width: 0;
}

.side-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 14px;
  border-bottom: 1px solid rgba(185, 200, 216, 0.75);
}
/* 字号按参考图墨迹高度校准（CJK ink ≈ 0.96 × 字号）：标题 ink 25.5 → 26px；正文 ink 17 → 17px */
.side-panel__title {
  position: relative;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--haavk-text);
  padding-left: 14px;
}
.side-panel__title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 4px;
  background: var(--haavk-blue);
}
.side-panel__ticks {
  display: inline-flex;
  gap: 3px;
}
.side-panel__ticks i {
  width: 8px;
  height: 3px;
  background: rgba(185, 200, 216, 0.9);
}
.side-panel__ticks i.on {
  background: var(--haavk-blue);
}

.side-panel__desc {
  margin: 0 0 12px;
  font-size: 17px;
  line-height: 1.7;
  color: var(--haavk-muted);
  overflow-wrap: anywhere;
  word-break: break-word;
}

.side-panel__tip {
  margin: 16px 0 14px;
  font-size: 17px;
  line-height: 1.7;
  color: var(--haavk-muted);
  padding-top: 16px;
  border-top: 1px dashed rgba(185, 200, 216, 0.9);
  overflow-wrap: anywhere;
  word-break: break-word;
}

.side-panel__keywords {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}
.kw {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(185, 200, 216, 0.8);
  border-left: 3px solid var(--haavk-blue);
  border-radius: 2px;
}
.kw__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  color: #2f3d47;
}
.kw__body {
  min-width: 0;
  flex: 1;
}
.kw__name {
  font-size: 17px;
  font-weight: 700;
  color: var(--haavk-text);
}
.kw__desc {
  margin-top: 3px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--haavk-muted);
  overflow-wrap: anywhere;
  word-break: break-word;
}

.side-panel__footer {
  margin-top: 18px;
}

.side-panel__stripe {
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 90px;
  height: 90px;
  background: repeating-linear-gradient(
    135deg,
    rgba(35, 121, 216, 0.12) 0 5px,
    transparent 5px 10px
  );
  transform: rotate(0deg);
  pointer-events: none;
}
</style>
