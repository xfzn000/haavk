<script setup lang="ts">
/**
 * HeroCarousel —— 首页全宽轮播 Hero（构图对齐参考图）
 * ------------------------------------------------------------------
 * · 浅色背景带：只负责底色与蓝色箭头装饰（overflow 裁剪在带内）
 * · 人物层：位于右侧，向下延伸（--person-bleed）压进下方深色员工区背后
 *   —— z-index 关系：背景带(自动) < 人物层(1) < 员工区卡片(2)，故人物
 *      会"沉入"深色区背景之上、卡片之下（参考图构图）
 * · 左侧标题 / 副标题 / 指示器为真实 HTML 文本；3 slide 自动轮播（6s）
 * · 遵守 prefers-reduced-motion
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import TopHeader from '@/components/TopHeader.vue'
import { heroSlides } from '@/mock/home'

const INTERVAL = 6000

const current = ref(0)
const active = computed(() => heroSlides[current.value])
let timer: number | undefined

function play() {
  pause()
  // 用户偏好减少动效时不做自动轮播
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  timer = window.setInterval(() => {
    current.value = (current.value + 1) % heroSlides.length
  }, INTERVAL)
}

function pause() {
  if (timer !== undefined) {
    window.clearInterval(timer)
    timer = undefined
  }
}

function goTo(index: number) {
  current.value = index
  play()
}

onMounted(play)
onBeforeUnmount(pause)
</script>

<template>
  <section class="hero">
    <!-- ============ 背景带（裁剪在 Hero 内） ============ -->
    <div class="hero__bg" aria-hidden="true">
      <span class="hero__chevron"></span>
      <span class="hero__chevron hero__chevron--thin"></span>
      <span class="hero__scrim"></span>
    </div>

    <!-- ============ 人物层（向下延伸进员工展示区背后） ============ -->
    <div class="hero__persons" :class="{ 'is-photo-mode': active.masked }" aria-hidden="true">
      <img
        v-for="(s, i) in heroSlides"
        :key="s.id"
        class="hero__person"
        :class="{ 'is-active': i === current, 'is-masked': s.masked }"
        :src="s.person"
        alt=""
      />
    </div>

    <!-- ============ 装饰层 ============ -->
    <div class="hero__deco" aria-hidden="true">
      <span class="hero__grid"></span>
      <span class="hero__ruler"></span>
      <span class="hero__corner"></span>
      <span class="hero__code hud-mono">SYS.HAAVK // 2036.10</span>
    </div>

    <!-- ============ 浮层导航（与论坛/内容页同款 float，含注意力点数） ============ -->
    <TopHeader variant="float" show-points />

    <!-- ============ 左侧文案 + 指示器 ============ -->
    <div class="hero__copy container-haavk">
      <Transition name="copy" mode="out-in">
        <div :key="active.id" class="hero__copy-inner">
          <p class="hero__hud hud-mono">{{ active.hudLabel }}</p>
          <div class="hero__titlerow">
            <h1 class="hero__title">{{ active.title }}</h1>
            <svg class="hero__sign" viewBox="0 0 260 70" fill="none" aria-hidden="true">
              <path
                d="M8 48 C 34 12, 60 8, 68 26 C 76 44, 52 58, 40 49 C 30 42, 54 22, 86 20 C 122 18, 130 42, 154 33 C 174 26, 180 12, 198 16 C 216 20, 218 36, 240 27"
                stroke="#2b6fe0"
                stroke-width="3"
                stroke-linecap="round"
              />
              <path
                d="M198 48 C 216 44, 234 42, 250 44"
                stroke="#2b6fe0"
                stroke-width="2"
                stroke-linecap="round"
                opacity="0.65"
              />
              <circle cx="248" cy="44" r="3" fill="#2b6fe0" />
            </svg>
          </div>
          <p class="hero__sub">{{ active.subtitle }}</p>
        </div>
      </Transition>

      <div class="hero__dots" role="tablist" aria-label="首页轮播切换">
        <button
          v-for="(s, i) in heroSlides"
          :key="s.id"
          type="button"
          role="tab"
          class="hero__dot"
          :class="{ 'is-on': i === current }"
          :aria-selected="i === current"
          :aria-label="`切换到第 ${i + 1} 张：${s.title}`"
          @click="goTo(i)"
        ></button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ============================== 容器 ============================== */
.hero {
  /* 浅色带高度 = 基础高度 + 标题行高度。
     即「黑色渐变」（深色员工区）的顶边整体下移一个标题行，
     正好落在员工卡顶边（用户指定高度）。 */
  --hero-h: calc(var(--haavk-hero-h) + var(--haavk-title-row));
  /* 人物向下延伸的深度：与「优秀员工」卡片底边对齐。
     （展示区已被上提 --haavk-title-row，故此处只需等于卡片高度） */
  --person-bleed: var(--haavk-card-h);
  position: relative;
  width: 100%;
  height: var(--hero-h);
  /* 注意：不裁剪 —— 人物层要向下出界 */
}

/* ============================== 背景带 ============================== */
.hero__bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  /* z-index:1 —— 必须高于 .showcase（同为 position:relative，且在文档流后面）
     的背景，否则浅色带向下延伸的那一段会被深色展示区盖住。
     仍低于人物层（同 z-index，文档序在后）与卡片层（z-index:2）。 */
  z-index: 1;
  background: linear-gradient(105deg, #f0f3f7 0%, #e9eef4 45%, #dbe4ee 100%);
}
/* 大蓝色箭头装饰（人物身后） */
.hero__chevron {
  position: absolute;
  top: -14%;
  right: -6%;
  width: 48%;
  height: 128%;
  background: linear-gradient(
    115deg,
    rgba(43, 111, 224, 0.66) 0%,
    rgba(43, 111, 224, 0.36) 48%,
    rgba(43, 111, 224, 0.08) 100%
  );
  clip-path: polygon(64% 0, 100% 0, 100% 100%, 30% 100%);
}
.hero__chevron--thin {
  top: -22%;
  right: 12%;
  width: 30%;
  height: 118%;
  opacity: 0.55;
  clip-path: polygon(72% 0, 100% 0, 100% 100%, 42% 100%);
}
/* 文案侧 readability 渐隐（桌面：左实右透；移动端改为上下渐变） */
.hero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(238, 242, 246, 0.9) 0%,
    rgba(238, 242, 246, 0.42) 38%,
    rgba(238, 242, 246, 0) 62%
  );
}

/* ============================== 人物层 ============================== */
.hero__persons {
  position: absolute;
  top: 0;
  right: 0;
  bottom: calc(-1 * var(--person-bleed));
  width: min(58%, 980px);
  z-index: 1;
  pointer-events: none;
  /* 左缘渐隐（占位矩形照片 / 抠图 PNG 均适用，柔化衔接） */
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 16%);
  mask-image: linear-gradient(90deg, transparent 0, #000 16%);
}
.hero__person {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* 抠图模式（默认）：完整呈现、底对齐 */
  object-fit: contain;
  object-position: bottom center;
  opacity: 0;
  transition: opacity 700ms ease;
  will-change: opacity;
}
.hero__person.is-active {
  opacity: 1;
}
/* 占位矩形照片模式：顶对齐铺满 + 底缘渐隐，"沉入"深色区
   渐隐在图层底部（= 卡片底边）才完全透明，保证深色背景一直延伸到位 */
.hero__person.is-masked {
  object-fit: cover;
  object-position: top center;
  -webkit-mask-image: linear-gradient(
    180deg,
    #000 58%,
    rgba(0, 0, 0, 0.9) 84%,
    rgba(0, 0, 0, 0.45) 95%,
    transparent 100%
  );
  mask-image: linear-gradient(
    180deg,
    #000 58%,
    rgba(0, 0, 0, 0.9) 84%,
    rgba(0, 0, 0, 0.45) 95%,
    transparent 100%
  );
}

/* ------------------------------------------------------------------
   深色区压暗层（仅占位照片模式）
   占位素材是从横幅裁出的"矩形照片"，它自带浅色背景。人物层下探进
   深色员工区时，这块浅色底会露出来，看起来像"黑色背景没降下来"。
   这里从 Hero 底边开始向下压暗，把浅色底融进深色区。
   —— 换成抠图 PNG（masked:false）后本层不生效，人物完整呈现。
   ------------------------------------------------------------------ */
.hero__persons.is-photo-mode::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: var(--hero-h);
  bottom: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(30, 33, 38, 0.55) 0%,
    rgba(26, 29, 34, 0.86) 46%,
    rgba(22, 24, 28, 0.97) 100%
  );
}

/* ============================== 装饰 ============================== */
.hero__deco {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}
.hero__grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(35, 121, 216, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(35, 121, 216, 0.05) 1px, transparent 1px);
  background-size: 46px 46px;
  -webkit-mask-image: linear-gradient(90deg, rgba(0, 0, 0, 0.9), transparent 72%);
  mask-image: linear-gradient(90deg, rgba(0, 0, 0, 0.9), transparent 72%);
}
.hero__ruler {
  position: absolute;
  top: 46%;
  right: 14px;
  width: 20px;
  height: 92px;
  background-image: repeating-linear-gradient(
    180deg,
    rgba(35, 121, 216, 0.45) 0 1px,
    transparent 1px 8px
  );
}
.hero__corner {
  position: absolute;
  left: 18px;
  bottom: 16px;
  width: 34px;
  height: 34px;
  border-left: 1px solid rgba(35, 121, 216, 0.42);
  border-bottom: 1px solid rgba(35, 121, 216, 0.42);
}
.hero__code {
  position: absolute;
  right: 16px;
  bottom: 14px;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: rgba(75, 90, 105, 0.55);
}

/* ============================== 文案 ============================== */
.hero__copy {
  position: relative;
  z-index: 12;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: var(--haavk-header-h);
  /* 透明浮层：不拦截鼠标，避免盖住下方卡片人像 / 标题的悬停与点击 */
  pointer-events: none;
}
.hero__copy-inner {
  max-width: 680px;
}
.hero__hud {
  margin: 0 0 14px;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: rgba(35, 121, 216, 0.75);
}
.hero__titlerow {
  display: flex;
  align-items: flex-end;
  gap: 4px;
}
.hero__title {
  margin: 0;
  font-size: clamp(36px, 3.9vw, 62px);
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: 1px;
  color: #171c20;
}
.hero__sign {
  width: clamp(120px, 12vw, 210px);
  height: auto;
  margin: 0 0 6px -6px;
  opacity: 0.9;
}
.hero__sub {
  margin: 16px 0 0;
  max-width: 32em;
  font-size: clamp(14px, 1.05vw, 17px);
  line-height: 1.75;
  color: #4d5865;
}

/* 指示器（参考图：小方块） */
.hero__dots {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 34px;
  /* 浮层整体 pointer-events:none，这里单独恢复，保证指示器可点 */
  pointer-events: auto;
}
.hero__dot {
  width: 11px;
  height: 11px;
  padding: 0;
  border: 1px solid rgba(35, 121, 216, 0.55);
  background: transparent;
  cursor: pointer;
  transition: width 220ms ease, background 220ms ease;
}
.hero__dot:hover {
  background: rgba(35, 121, 216, 0.35);
}
.hero__dot.is-on {
  width: 30px;
  background: var(--haavk-blue);
  border-color: var(--haavk-blue);
  box-shadow: 0 0 10px rgba(35, 121, 216, 0.5);
}
.hero__dot:focus-visible {
  outline: 2px solid var(--haavk-blue);
  outline-offset: 3px;
}

/* 文案切换淡入淡出 */
.copy-enter-active,
.copy-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.copy-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.copy-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ============================== 响应式 ============================== */
@media (max-width: 1200px) {
  .hero__persons {
    width: 66%;
  }
  .hero__copy-inner {
    max-width: 540px;
  }
}

@media (max-width: 900px) {
  /* 移动端：人物收回背景带内，不再下探 */
  .hero {
    --person-bleed: 0px;
  }
  .hero__persons {
    width: 100%;
    left: 0;
  }
  .hero__person,
  .hero__person.is-masked {
    object-fit: cover;
    object-position: top right;
  }
  .hero__scrim {
    background: linear-gradient(
      180deg,
      rgba(238, 242, 246, 0.6) 0%,
      rgba(236, 241, 246, 0.86) 72%,
      rgba(233, 239, 245, 0.95) 100%
    );
  }
  .hero__copy {
    padding-top: calc(var(--haavk-header-h) + 8px);
  }
}

@media (max-width: 600px) {
  .hero {
    height: auto;
    min-height: 460px;
  }
  .hero__copy {
    justify-content: flex-end;
    padding-top: calc(var(--haavk-header-h) + 96px);
    padding-bottom: 30px;
  }
  .hero__title {
    font-size: clamp(30px, 9vw, 40px);
  }
  .hero__sign {
    width: 92px;
  }
  .hero__sub {
    font-size: 14px;
  }
  .hero__dots {
    margin-top: 24px;
  }
  .hero__ruler {
    display: none;
  }
}
</style>
