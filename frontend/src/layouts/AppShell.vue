<script setup lang="ts">
/**
 * AppShell —— 用户端公共布局
 * TechBackground + TopHeader + 内容区 + BottomStatusBar
 *
 * 注意：首页（/）的导航是 Hero 的浮层（由 HeroCarousel 内部渲染），
 * 这里不再输出普通吸顶导航，也不给内容区加顶部内边距，
 * 以保证 Hero 从视口最顶端开始且全宽铺满。
 */
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TechBackground from '@/components/TechBackground.vue'
import TopHeader from '@/components/TopHeader.vue'
import BottomStatusBar from '@/components/BottomStatusBar.vue'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const session = useSessionStore()

/** 启动时同步一次「注意力点数」（后端接口未就绪时静默保留本地值） */
onMounted(() => {
  void session.refreshAttentionPoints()
})
const isHome = computed(() => route.name === 'home')
/** 导航形态：首页自带浮层；论坛用 float 浮层；其余页面用吸顶条 */
const headerVariant = computed<'default' | 'float'>(() =>
  route.meta.headerVariant === 'float' ? 'float' : 'default',
)
const showPoints = computed(() => route.meta.showPoints === true)
/** flush：内容区自管上下留白（首页/论坛列表要精确铺满一屏） */
const isFlush = computed(() => isHome.value || route.meta.flush === true)
/**
 * float 导航但未 flush 的页面（帖子详情/解决方案/寻人启事）：
 * 浮层导航不占文档流，内容若不补偿会顶到视口最上方被导航盖住 —— 补回「导航高 + 原上内边距」
 */
const needsFloatPad = computed(() => headerVariant.value === 'float' && !isFlush.value)
</script>

<template>
  <div class="app-shell">
    <TechBackground />
    <TopHeader v-if="!isHome" :variant="headerVariant" :show-points="showPoints" />
    <main
      class="app-shell__main"
      :class="{
        'app-shell__main--home': isHome,
        'app-shell__main--flush': isFlush,
        'app-shell__main--float-pad': needsFloatPad,
      }"
    >
      <slot />
    </main>
    <BottomStatusBar />
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.app-shell__main {
  position: relative;
  z-index: 10;
  flex: 1;
  padding: 28px 0 calc(var(--haavk-bottom-h) + 36px);
}

/* 首页：Hero 需要从视口顶部开始，去掉上内边距；
   下内边距也去掉 —— 首页的深色员工区会自己铺满到「底部状态栏」上沿，
   否则会在深色区与 HUD 之间露出一条页面底色的白边（参考图里是深色一路到底） */
.app-shell__main--home {
  padding-top: 0;
  padding-bottom: 0;
}

/* 内容页自管留白（论坛：导航是贴顶浮层，正文顶边由页面自己按 --haavk-body-top 定位） */
.app-shell__main--flush {
  padding: 0;
}

/* float 浮层导航页（详情/解决方案/寻人启事）：导航不占文档流，补回其高度 + 原上内边距 */
.app-shell__main--float-pad {
  padding-top: calc(var(--haavk-header-h) + 28px);
}

@media (max-width: 768px) {
  .app-shell__main {
    padding-top: 20px;
  }
  .app-shell__main--float-pad {
    padding-top: calc(var(--haavk-header-h) + 20px);
  }
  .app-shell__main--home,
  .app-shell__main--flush {
    padding-top: 0;
  }
}
</style>
