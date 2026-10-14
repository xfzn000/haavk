<script setup lang="ts">
/**
 * TechBackground —— 全局科技背景层
 * 浅灰蓝底 + 细微网格 + 斜向几何块 + 扫描线 + 边缘 HUD 刻度
 * 固定定位、不拦截交互、不依赖联网图片。
 */
</script>

<template>
  <div class="tech-bg" aria-hidden="true">
    <!-- 底色渐变 -->
    <div class="tech-bg__base"></div>
    <!-- 网格 -->
    <div class="tech-bg__grid"></div>
    <!-- 斜向几何块（右上 / 左下） -->
    <div class="tech-bg__slant tech-bg__slant--tr"></div>
    <div class="tech-bg__slant tech-bg__slant--bl"></div>
    <!-- 扫描线 -->
    <div class="tech-bg__scan"></div>
    <!-- 右侧竖向刻度 -->
    <div class="tech-bg__ruler">
      <span v-for="i in 28" :key="i" :class="{ major: i % 4 === 0 }"></span>
    </div>
    <!-- 四角装饰 -->
    <div class="tech-bg__corner tech-bg__corner--tl"></div>
    <div class="tech-bg__corner tech-bg__corner--br"></div>
    <!-- 左上角 UID 水印 -->
    <div class="tech-bg__uid hud-mono">CN UID182869898117337342880_202610081430</div>
  </div>
</template>

<style scoped>
.tech-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.tech-bg__base {
  position: absolute;
  inset: 0;
  /* 冷调浅蓝灰（对齐参考图实测：顶部约 rgb(194,209,228) → 底部约 rgb(229,233,236)） */
  background:
    radial-gradient(1100px 600px at 78% -10%, rgba(35, 121, 216, 0.16), transparent 62%),
    radial-gradient(900px 500px at -10% 100%, rgba(88, 184, 244, 0.14), transparent 60%),
    linear-gradient(180deg, #c3d2e4 0%, #d8e2ec 46%, #e7ecf2 100%);
}

.tech-bg__grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(35, 121, 216, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(35, 121, 216, 0.055) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.35));
}

.tech-bg__slant {
  position: absolute;
  background: linear-gradient(135deg, rgba(35, 121, 216, 0.1), rgba(35, 121, 216, 0));
  border: 1px solid rgba(35, 121, 216, 0.14);
}
.tech-bg__slant--tr {
  top: -140px;
  right: -120px;
  width: 620px;
  height: 520px;
  transform: rotate(-16deg);
  clip-path: polygon(30% 0, 100% 0, 100% 100%, 0 100%);
}
.tech-bg__slant--bl {
  bottom: -180px;
  left: -140px;
  width: 560px;
  height: 460px;
  transform: rotate(-14deg);
  clip-path: polygon(0 0, 100% 40%, 100% 100%, 0 100%);
  background: linear-gradient(135deg, rgba(88, 184, 244, 0.12), rgba(88, 184, 244, 0));
}

.tech-bg__scan {
  position: absolute;
  left: 0;
  right: 0;
  height: 140px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(88, 184, 244, 0.09),
    transparent
  );
  animation: hud-scan 7s ease-in-out infinite;
}

.tech-bg__ruler {
  position: absolute;
  top: 12%;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tech-bg__ruler span {
  display: block;
  width: 8px;
  height: 1px;
  background: rgba(35, 121, 216, 0.35);
}
.tech-bg__ruler span.major {
  width: 16px;
  background: rgba(35, 121, 216, 0.6);
}

.tech-bg__corner {
  position: absolute;
  width: 34px;
  height: 34px;
  border-color: rgba(35, 121, 216, 0.35);
  border-style: solid;
}
.tech-bg__corner--tl {
  top: 76px;
  left: 14px;
  border-width: 1px 0 0 1px;
}
.tech-bg__corner--br {
  bottom: 52px;
  right: 14px;
  border-width: 0 1px 1px 0;
}

.tech-bg__uid {
  position: absolute;
  /* 内容页导航已贴顶（top:0），左上角会被 logo 压住 —— 移到左下、底部 HUD 上方 */
  bottom: calc(var(--haavk-bottom-h) + 10px);
  left: 10px;
  font-size: 11px;
  color: rgba(104, 114, 124, 0.75);
}
</style>
