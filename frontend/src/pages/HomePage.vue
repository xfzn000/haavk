<script setup lang="ts">
/**
 * 关于我们（首页）
 * ------------------------------------------------------------------
 * 构图对齐参考图：
 * · Hero 浅色带的人物立绘向下延伸，压进本区深色背景的背后
 * · 优秀员工（左，两张大卡）＋ 员工之声（右，四张矮宽窄卡）
 * · 层级：深色背景(文档流) < Hero人物层(z1) < 本区内容(z2)
 */
import HeroCarousel from '@/components/home/HeroCarousel.vue'
import FeaturedEmployeeCard from '@/components/home/FeaturedEmployeeCard.vue'
import EmployeeVoiceCard from '@/components/home/EmployeeVoiceCard.vue'
import { employeeVoices, featuredEmployees } from '@/mock/home'
</script>

<template>
  <div class="home">
    <!-- ============ Hero：全宽轮播 + 浮层导航 ============ -->
    <HeroCarousel />

    <!-- ============ 员工展示区：全宽深色背景 ============ -->
    <section class="showcase">
      <div class="container-haavk showcase__inner">
        <!-- 左：优秀员工 -->
        <div class="showcase__col">
          <h2 class="band-title">优秀员工</h2>
          <div class="featured__list">
            <FeaturedEmployeeCard
              v-for="emp in featuredEmployees"
              :key="emp.id"
              :employee="emp"
            />
          </div>
        </div>

        <!-- 右：员工之声（中间留出的空隙正好透出 Hero 人物） -->
        <div class="showcase__col">
          <h2 class="band-title band-title--over-person">员工之声</h2>
          <div class="voices__list">
            <EmployeeVoiceCard v-for="emp in employeeVoices" :key="emp.id" :employee="emp" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: block;
}

/* ============================== 员工展示区 ============================== */
.showcase {
  position: relative;
  /* 不设 z-index —— 让 Hero 人物层（z1）能压在深色背景之上 */
  background: linear-gradient(180deg, #24272c 0%, #191b1f 100%);
  padding: 34px 0 64px;
  /* 上提一个标题行高度：配合 Hero 浅色带下移，
     使「黑色渐变」的顶边正好落在员工卡顶边（用户指定高度） */
  margin-top: calc(-1 * var(--haavk-title-row));
}

/* 桌面端：深色区铺满到「底部状态栏」上沿。
   本区顶边 = --haavk-hero-h（Hero 高度减去上提的标题行），
   故所需高度 = 100vh − 底部 HUD − Hero 基高。
   否则内容不足一屏时，深色区与 HUD 之间会露出一条页面底色的白边。 */
@media (min-width: 901px) {
  .showcase {
    min-height: calc(100vh - var(--haavk-bottom-h) - var(--haavk-hero-h));
  }
}

.showcase__inner {
  display: grid;
  /* 按原作比例：两列几乎等宽（原作 47.3% : 46.5%，中间空当 6.1%）。
     之前是 53fr/37fr，导致「员工之声」四张卡偏窄。 */
  grid-template-columns: minmax(0, 50fr) minmax(0, 47fr);
  column-gap: clamp(46px, 5.4vw, 82px);
  align-items: start;
}

/* 压在 Hero 人物层之上（同一层叠上下文内 z2 > z1） */
.showcase__col {
  position: relative;
  z-index: 2;
}

/* 区标题：**纯文本、无底色**（参考图如此）。
   左列「优秀员工」压在浅色带上 → 深色字；
   右列「员工之声」压在 Hero 人物（深色衣服）上 → 白字 + 轻微文字阴影。
   注意：必须抬高 z-index —— 优秀员工卡的人像是「冲出卡片顶部」的
   定位元素（z-index:1），会盖住静态的标题，导致标题看不见。 */
.band-title {
  position: relative;
  z-index: 3; /* 高于卡片人像（.feat__person z-index:2） */
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 18px;
  padding: 3px 0;
  font-size: 17px;
  /* 固定行高：让标题行高度可确定（26px），
     以保证 --haavk-title-row 能精确对上分界线 */
  line-height: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #171c20;
}
/* 右列标题：压在 Hero 人物身上，改白字保证可读 */
.band-title--over-person {
  color: #fff;
  text-shadow: 0 2px 10px rgba(6, 10, 16, 0.65);
}
.band-title::before {
  content: '';
  width: 3px;
  height: 16px;
  background: var(--haavk-blue-light);
  box-shadow: 0 0 10px rgba(88, 184, 244, 0.7);
}

/* 两张大卡（近方形，人物冲框）—— 高度取共享 token，与人物层下探深度同源 */
.featured__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  height: var(--haavk-card-h);
}

/* 四张矮宽窄卡（参考图比例约 1:1.9，不再细长） */
.voices__list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  height: clamp(230px, 30vh, 275px);
}

/* ============================== 响应式 ============================== */
/* 平板：上下分区 */
@media (max-width: 1024px) {
  .showcase {
    padding: 30px 0 52px;
  }
  .showcase__inner {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 34px;
  }
  /* .featured__list 高度由 --haavk-card-h token 统管（style.css 内按断点覆写）。
     堆叠布局下卡片会占满整行、变得很宽 —— 限一下宽度，
     否则「按宽度铺满」的立绘会被放得过大 */
  .featured__list {
    max-width: 720px;
  }
  .voices__list {
    height: 260px;
  }
}

@media (max-width: 768px) {
  /* 员工之声：横向滚动 */
  .voices__list {
    display: flex;
    gap: 10px;
    height: 250px;
    overflow-x: auto;
    padding-bottom: 6px;
    scroll-snap-type: x proximity;
  }
  .voices__list > * {
    flex: 0 0 152px;
    scroll-snap-align: start;
  }
}

@media (max-width: 560px) {
  .showcase {
    padding: 26px 0 44px;
  }
  .featured__list {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
  }
  .featured__list > * {
    height: 270px;
  }
  .voices__list {
    height: 240px;
  }
}
</style>
