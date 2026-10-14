<script setup lang="ts">
/**
 * 解决方案 /solutions
 * 左：说明面板 ｜ 右：横幅轮播 + 装备商品列表
 *
 * 版式对齐参考图 c11c521d…png（2560 图 → CSS 按 1920 计，换算 ×0.75）：
 *   版心 88..1832（1744）；左栏 377 : 右栏 1300，栏间距 67；横幅高 239；
 *   商品行高 150、行间 11px 暗带；缩略图 118；价格/按钮列 170；右缘一条蓝色强调线。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import SidePanel from '@/components/SidePanel.vue'
import coinIcon from '@/assets/coin-haavk.png'
import { solutionBanners } from '@/mock/products'
import { solutionRules } from '@/mock/forum'
import { useProductStore } from '@/stores/product'
import { useToastStore } from '@/stores/toast'
import type { Product } from '@/types'

const productStore = useProductStore()
productStore.ensureLoaded()
const toast = useToastStore()

const list = computed<Product[]>(() => productStore.onSaleList)
const expanded = ref<number | null>(null)

function toggleDetail(id: number) {
  expanded.value = expanded.value === id ? null : id
}

function onBuy(p: Product) {
  if (productStore.isSoldOut(p)) return
  const ok = productStore.purchase(p.id)
  if (ok) toast.success(`已下单：${p.name}`)
  else toast.error('该商品已售罄')
}

/* -------------------- 横幅轮播（6s，悬停暂停） -------------------- */
const INTERVAL = 6000
const bannerIndex = ref(0)
let timer: number | undefined

function play() {
  stop()
  // 用户偏好减少动效时不做自动轮播
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  timer = window.setInterval(() => {
    bannerIndex.value = (bannerIndex.value + 1) % solutionBanners.length
  }, INTERVAL)
}

function stop() {
  if (timer !== undefined) {
    window.clearInterval(timer)
    timer = undefined
  }
}

function goTo(index: number) {
  bannerIndex.value = index
  play()
}

onMounted(play)
onBeforeUnmount(stop)
</script>

<template>
  <div class="sol-page">
    <div class="sol-page__inner">
      <!-- ============ 左：说明面板 ============ -->
      <SidePanel
        :title="solutionRules.title"
        :desc="solutionRules.desc"
        :tip="solutionRules.tip"
        :keywords="solutionRules.keywords"
      />

      <!-- ============ 右：横幅 + 商品列表 ============ -->
      <section class="sol-main">
        <!-- 横幅轮播 -->
        <div class="banner" @mouseenter="stop" @mouseleave="play">
          <div
            v-for="(s, i) in solutionBanners"
            :key="s.id"
            class="banner__slide"
            :class="{ 'is-on': i === bannerIndex, 'is-wide': s.wide }"
          >
            <img class="banner__bg" :src="s.image" alt="" />
            <img v-if="!s.wide" class="banner__art" :src="s.image" alt="" />
            <span class="banner__veil" aria-hidden="true"></span>
            <div class="banner__content">
              <h2 class="banner__title">{{ s.title }}</h2>
              <p class="banner__sub">{{ s.subtitle }}</p>
              <div class="banner__points">
                <div v-for="sp in s.sellingPoints" :key="sp.name" class="point">
                  <strong>{{ sp.name }}</strong>
                  <span>{{ sp.desc }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 指示器（左下角，可点击切换） -->
          <div class="banner__dots" role="tablist" aria-label="横幅切换">
            <button
              v-for="(s, i) in solutionBanners"
              :key="s.id"
              type="button"
              role="tab"
              class="banner__dot"
              :class="{ 'is-on': i === bannerIndex }"
              :aria-selected="i === bannerIndex"
              :aria-label="`切换到第 ${i + 1} 张：${s.title}`"
              @click="goTo(i)"
            ></button>
          </div>
        </div>

        <!-- 商品列表（连续横向行） -->
        <div class="goods">
          <article v-for="p in list" :key="p.id" class="good">
            <div class="good__thumb">
              <img class="good__img" :src="p.image" :alt="p.name" />
            </div>

            <div class="good__info">
              <div class="good__head">
                <h3 class="good__name">{{ p.name }}</h3>
                <span class="good__limit">限购：{{ p.purchaseLimit }}/{{ p.purchaseLimit }}</span>
              </div>
              <p class="good__desc">{{ p.description }}</p>
              <button class="good__toggle" type="button" @click="toggleDetail(p.id)">
                <component :is="expanded === p.id ? ChevronDown : ChevronRight" :size="14" />
                物品详情
              </button>
              <ul v-show="expanded === p.id" class="good__details">
                <li v-for="(d, i) in p.details" :key="i">{{ d }}</li>
              </ul>
            </div>

            <div class="good__right">
              <div class="good__price">
                <img class="good__coin" :src="coinIcon" alt="哈夫币" />
                <span class="hud-mono">{{ p.price }}</span>
              </div>
              <button
                class="good__buy"
                type="button"
                :disabled="productStore.isSoldOut(p)"
                @click="onBuy(p)"
              >
                {{ productStore.isSoldOut(p) ? '已售罄' : '购买' }}
              </button>
            </div>
          </article>

          <div v-if="!list.length" class="goods__empty">暂无在售商品</div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ==========================================================================
   解决方案页
   参考图实测（CSS）：版心 1744、左栏 377 : 右栏 1300（间距 67）
   横幅 239 高、商品行 150 高（行间 11px 暗带）、缩略图 118、价格/按钮列 170
   ========================================================================== */
.sol-page {
  --sol-line: rgba(63, 128, 193, 0.42);
  --sol-blue: #2879c9;
}

.sol-page__inner {
  width: var(--haavk-content-w);
  max-width: 1760px;
  margin: 0 auto;
  display: grid;
  /* 377 : 1300 —— 左栏含栏间距约占内容宽 25.5% */
  grid-template-columns: minmax(300px, 377fr) minmax(0, 1300fr);
  column-gap: clamp(24px, 3.8%, 67px);
  align-items: start;
}

.sol-main {
  position: relative;
  min-width: 0;
}

/* 右缘蓝色强调线（贯穿横幅与列表） */
.sol-main::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 3px;
  background: rgba(63, 128, 193, 0.5);
  pointer-events: none;
}

/* ---------------- 横幅轮播 ---------------- */
.banner {
  position: relative;
  height: 239px;
  overflow: hidden;
  background: #12181e;
  border: 1px solid rgba(63, 128, 193, 0.35);
}
.banner__slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 500ms ease;
  pointer-events: none;
}
.banner__slide.is-on {
  opacity: 1;
}
.banner__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left center;
}
/* 宽幅素材直接铺满；竖长素材用「模糊放大底 + 居中清晰图」避免拉伸糊成一片 */
.banner__slide:not(.is-wide) .banner__bg {
  filter: blur(18px) saturate(0.85);
  transform: scale(1.18);
  opacity: 0.8;
}
.banner__art {
  position: absolute;
  left: 5%;
  top: 50%;
  height: 80%;
  transform: translateY(-50%);
  object-fit: contain;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.5));
}
.banner__veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(8, 12, 16, 0.06) 0%,
    rgba(8, 12, 16, 0.42) 46%,
    rgba(8, 12, 16, 0.8) 74%,
    rgba(8, 12, 16, 0.88) 100%
  );
}
.banner__content {
  position: absolute;
  top: 32px;
  right: 30px;
  text-align: right;
  color: #fff;
}
.banner__title {
  margin: 0;
  font-size: 27px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 2px;
  text-shadow: 0 3px 14px rgba(0, 0, 0, 0.6);
  white-space: nowrap;
}
.banner__sub {
  margin: 6px 0 0;
  font-size: 17px;
  letter-spacing: 1px;
  color: #6fc0f5;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}
.banner__points {
  display: flex;
  justify-content: flex-end;
  gap: 30px;
  margin-top: 30px;
}
.point {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.point strong {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
}
.point span {
  font-size: 11px;
  color: #a9c6e0;
  white-space: nowrap;
}

/* 指示器：左下角小方块 */
.banner__dots {
  position: absolute;
  left: 22px;
  bottom: 16px;
  display: flex;
  gap: 6px;
  z-index: 2;
}
.banner__dot {
  width: 14px;
  height: 14px;
  padding: 0;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.75);
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease;
}
.banner__dot:hover {
  background: rgba(255, 255, 255, 0.35);
}
.banner__dot.is-on {
  background: #4fa8f0;
  border-color: #4fa8f0;
}

/* ---------------- 商品列表 ---------------- */
.goods {
  display: flex;
  flex-direction: column;
  /* 行间 11px：露出底色形成暗带（参考图如此） */
  gap: 11px;
  margin-top: 20px;
}
.good {
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr) 170px;
  align-items: center;
  gap: 20px;
  /* 折叠时就是参考图的 150px 行高；展开「物品详情」时行随内容长高，不溢出 */
  min-height: 150px;
  padding: 14px 24px;
  background: rgba(252, 253, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.6);
}
.good__thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 118px;
  height: 118px;
  background: rgba(222, 232, 243, 0.5);
  border: 1px solid rgba(196, 210, 224, 0.6);
}
.good__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.good__info {
  min-width: 0;
}
.good__head {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.good__name {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--haavk-text);
}
.good__limit {
  padding: 5px 10px;
  font-size: 16px;
  line-height: 1;
  color: #fff;
  background: var(--sol-blue);
  border-radius: 1px;
}
.good__desc {
  margin: 10px 0 8px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--haavk-muted);
}
.good__toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  font-size: 15px;
  color: var(--sol-blue);
  background: transparent;
  border: none;
  cursor: pointer;
}
.good__toggle:hover {
  text-decoration: underline;
}
.good__details {
  margin: 8px 0 0;
  padding: 2px 0 2px 12px;
  list-style: none;
  border-left: 2px solid rgba(63, 128, 193, 0.35);
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--haavk-muted);
}

.good__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
}
.good__price {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--haavk-text);
}
/* 价格前的哈夫币图标（取自游戏内图标） */
.good__coin {
  width: 19px;
  height: 19px;
  display: block;
  flex: 0 0 auto;
  object-fit: contain;
}
.good__buy {
  width: 138px;
  height: 40px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #fff;
  background: var(--sol-blue);
  border: 1px solid var(--sol-blue);
  border-radius: 1px;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease;
}
.good__buy:hover:not(:disabled) {
  background: #1f61a6;
  border-color: #1f61a6;
}
/* 已售罄：低饱和灰蓝 + 禁用 */
.good__buy:disabled {
  color: #eef2f7;
  background: #98a2ac;
  border-color: #98a2ac;
  cursor: not-allowed;
}
.goods__empty {
  padding: 40px;
  text-align: center;
  color: var(--haavk-muted);
  font-size: 15px;
}

/* ---------------- 响应式 ---------------- */
@media (max-width: 1440px) {
  .banner__title {
    font-size: 28px;
  }
  .banner__sub {
    font-size: 18px;
  }
  .banner__points {
    gap: 24px;
    margin-top: 20px;
  }
  .good__name {
    font-size: 21px;
  }
  .good {
    grid-template-columns: 108px minmax(0, 1fr) 160px;
    gap: 16px;
  }
  .good__thumb {
    width: 108px;
    height: 108px;
  }
}

@media (max-width: 1024px) {
  .sol-page__inner {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 18px;
  }
  .sol-main::after {
    display: none;
  }
  .banner {
    height: 200px;
  }
  .banner__content {
    top: 26px;
    right: 20px;
  }
  .banner__title {
    font-size: 24px;
  }
  .banner__sub {
    font-size: 16px;
  }
  .banner__points {
    gap: 18px;
    margin-top: 16px;
  }
  .point strong {
    font-size: 13px;
  }
  .point span {
    font-size: 10px;
  }
}

@media (max-width: 768px) {
  .banner {
    height: 176px;
  }
  .banner__title {
    font-size: 20px;
    letter-spacing: 1px;
  }
  .banner__points {
    display: none;
  }
  .good {
    grid-template-columns: 92px minmax(0, 1fr);
    gap: 14px;
    height: auto;
    padding: 16px;
  }
  .good__thumb {
    width: 92px;
    height: 92px;
  }
  .good__name {
    font-size: 19px;
  }
  .good__limit {
    font-size: 14px;
  }
  .good__right {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
  }
}
</style>
