<script setup lang="ts">
/**
 * 优秀员工大卡片（构图对齐参考图）
 * · 人物高度超出卡片顶部（--pop），头像"冲出"边框
 * · masked=true 时为占位矩形照片：自动加顶缘渐隐遮罩，
 *   冲出部分呈"浮现"效果；换抠图 PNG 后（masked=false）即完整头像出框
 */
import type { FeaturedEmployee } from '@/mock/home'

defineProps<{ employee: FeaturedEmployee }>()
</script>

<template>
  <article class="feat" :class="`feat--${employee.theme}`">
    <!-- 卡片底色：白底 + 蓝色 → 透明（左→右） -->
    <span class="feat__bg" aria-hidden="true"></span>

    <!-- 底部压暗（参考图：压在蓝色之上、人物之下 ——
         所以卡片左下角是"被压暗的蓝"，而人像本身不被压暗） -->
    <span class="feat__scrim" aria-hidden="true"></span>

    <!-- 人物：bottom 对齐，高度 = 卡片 + 冲出量 -->
    <img
      class="feat__person"
      :class="{ 'is-masked': employee.masked }"
      :src="employee.image"
      :alt="`${employee.name} 肖像`"
      loading="lazy"
    />

    <!-- 文案可读性：底部压暗已并入卡片底色，不再单独盖层 -->

    <div class="feat__body">
      <header class="feat__head">
        <h3 class="feat__name">{{ employee.name }}</h3>
        <span class="feat__tag">{{ employee.tag }}</span>
      </header>

      <p class="feat__quote">
        <span v-for="(line, i) in employee.quote" :key="i">{{ line }}</span>
      </p>
    </div>
  </article>
</template>

<style scoped>
.feat {
  /* 人物冲出卡片顶部的高度。
     卡片压扁后（见 --haavk-card-h）靠加大上冲量，让人像仍能铺满卡片宽度 */
  --pop: 88px;
  position: relative;
  height: 100%;
  /* 注意：不裁剪 —— 人物要出框 */
}

/* 卡片底色：白底 + 蓝色→透明（从左到右）。
   · 白底：否则渐变透明的一侧会透出页面深色区、卡片发黑
   · 蓝色只占左侧约 1/4：11% 处饱满，25% 处已很淡，50% 处完全透明
   注意：底部压暗**不在这里** —— 它在 .feat__scrim（位于蓝色之上、人物之下），
   否则蓝色会挡住压暗，卡片下沿就"到不了底"（参考图卡片左下角是被压暗的蓝） */
.feat__bg {
  position: absolute;
  inset: 0;
  border-radius: 2px;
  background: linear-gradient(
      90deg,
      #2f6fe0 0%,
      rgba(45, 105, 220, 0.88) 11%,
      rgba(42, 99, 210, 0.3) 25%,
      rgba(38, 88, 196, 0.09) 37%,
      rgba(34, 78, 172, 0) 50%
    ),
    #ffffff;
  box-shadow: 0 20px 44px -24px rgba(6, 12, 20, 0.85);
  transition: filter 220ms ease;
}
.feat:hover .feat__bg {
  filter: brightness(1.08);
}

/* 底部压暗层（参考图的做法）：
   位置在「卡片底色」之上、「人物」之下 —— 因此
   · 卡片左下角的蓝色会被压暗（参考图实测：顶部 rgb(88,142,203) → 底部 rgb(44,97,160)）
   · 人像本身保持通透、不被压暗
   · 底部引语的白色文字仍有足够对比度 */
.feat__scrim {
  position: absolute;
  inset: 0;
  border-radius: 2px;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(10, 22, 44, 0.16) 0%,
    rgba(10, 22, 44, 0.04) 34%,
    rgba(9, 18, 38, 0.24) 62%,
    rgba(8, 16, 42, 0.58) 100%
  );
}

/* 人物（位于底部压暗层之上，故不被压暗） */
.feat__person {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  /* 抠图模式：**按卡片宽度铺满**，高度按图片比例自动 →
     左右不留空隙，且高度自然超过卡片、冲出卡顶（冲出量 = 卡宽/图片宽高比 − 卡高） */
  height: auto;
  object-fit: contain;
  object-position: bottom center;
  z-index: 2;
}
/* 占位矩形照片：铺满整卡（含上冲量）。仅在顶端做极短柔化，防止生硬直边 */
.feat__person.is-masked {
  height: calc(100% + var(--pop));
  object-fit: cover;
  object-position: center 14%;
  -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0, #000 22px);
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0, #000 22px);
}

/* 文案可读性：底部压暗在 .feat__scrim（蓝色之上、人物之下），
   文案层在最上，保证引语始终清晰。 */

.feat__body {
  position: absolute;
  inset: 0;
  z-index: 3;
  padding: 18px 18px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.feat__name {
  margin: 0;
  font-size: clamp(22px, 1.7vw, 27px);
  font-weight: 800;
  letter-spacing: 2px;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
}
.feat__tag {
  display: inline-block;
  margin-top: 10px;
  padding: 3px 9px;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: #dcecfb;
  border: 1px solid rgba(88, 184, 244, 0.5);
  background: rgba(88, 184, 244, 0.16);
}
.feat__quote {
  margin: 0;
  display: flex;
  flex-direction: column;
}
.feat__quote span {
  font-size: clamp(16px, 1.25vw, 20px);
  font-weight: 700;
  line-height: 1.5;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
}
</style>
