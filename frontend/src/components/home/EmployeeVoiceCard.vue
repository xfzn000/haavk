<script setup lang="ts">
/**
 * 员工之声窄卡（构图对齐参考图，矮宽比例约 1:1.9）
 * · 上：姓名 + 部门
 * · 中：人物舞台（蓝色色块衬底，人物可微冲出卡片顶部）
 * · 下：两行短句
 * · masked=true 为占位照片（自动遮罩）；换抠图 PNG 改 false
 */
import type { EmployeeVoice } from '@/mock/home'

defineProps<{ employee: EmployeeVoice }>()
</script>

<template>
  <article class="voice">
    <div class="voice__head">
      <span class="voice__name">{{ employee.name }}</span>
      <span class="voice__dept">{{ employee.department }}</span>
    </div>

    <div class="voice__stage">
      <span class="voice__block" aria-hidden="true"></span>
      <img
        class="voice__img"
        :class="{ 'is-masked': employee.masked }"
        :src="employee.image"
        :alt="`${employee.name} 肖像`"
        loading="lazy"
      />
    </div>

    <p class="voice__quote">{{ employee.quote }}</p>
  </article>
</template>

<style scoped>
.voice {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* 注意：不裁剪 —— 人物头部可微冲出卡片顶部 */
  background: #484a4e; /* 原作实测底色 rgb(72,74,78) —— 灰，不是深蓝黑 */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  transition: border-color 200ms ease;
}
.voice:hover {
  border-color: rgba(88, 184, 244, 0.5);
}

/* ---- 头部：姓名 + 部门 ---- */
.voice__head {
  position: relative;
  z-index: 2;
  padding: 12px 12px 8px;
}
.voice__name {
  display: block;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #fff;
}
.voice__dept {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  /* 灰底上要提亮，否则对比度不足 */
  color: #c2ccd6;
}

/* ---- 人物舞台 ---- */
.voice__stage {
  position: relative;
  flex: 1;
  min-height: 0;
}
/* 蓝色衬底色块（参考图：人物胸前的蓝色矩形） */
.voice__block {
  position: absolute;
  left: 12px;
  bottom: 0;
  width: 56%;
  height: 58%;
  background: linear-gradient(160deg, #2f74e0 0%, #1f57b8 100%);
  opacity: 0.92;
}
.voice__img {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  /* 高出舞台 64px：人物微冲出卡片顶部（抠图模式） */
  height: calc(100% + 64px);
  object-fit: contain;
  object-position: bottom center;
  z-index: 1;
}
/* 占位照片：铺满 + 顶缘渐隐 */
.voice__img.is-masked {
  object-fit: cover;
  object-position: center 24%;
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 74px);
  mask-image: linear-gradient(180deg, transparent 0, #000 74px);
}

/* ---- 底部短句 ---- */
/* 固定 2 行高度（12px × 1.7 × 2 + 上下内边距 24 = 65px）。
   必须固定：引语块是这条卡里唯一高度可变的部分，一旦某条文案多折一行，
   上面 flex:1 的「人物舞台」就会被挤矮 —— 表现为那张卡的人像偏小、
   下方深色区域比其余三张多（2026-10-11 夜枭卡即此问题）。 */
.voice__quote {
  margin: 0;
  flex: 0 0 auto;
  height: 65px;
  overflow: hidden;
  padding: 10px 12px 14px;
  font-size: 12px;
  line-height: 1.7;
  color: #c6cfd8;
  white-space: pre-line;
}
</style>
