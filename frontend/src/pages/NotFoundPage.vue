<script setup lang="ts">
/** 404 */
import { RouterLink } from 'vue-router'
import { Compass } from 'lucide-vue-next'
</script>

<template>
  <div class="container-haavk notfound">
    <div class="hud-panel hud-corners notfound__box">
      <Compass :size="40" />
      <h1 class="hud-mono">404</h1>
      <p>信号丢失：未找到该页面</p>
      <RouterLink to="/" class="hud-btn">返回首页</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.notfound {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}
.notfound__box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 80px;
  color: var(--haavk-muted);
}
.notfound__box h1 {
  margin: 0;
  font-size: 48px;
  color: var(--haavk-blue);
  letter-spacing: 6px;
}
.notfound__box p {
  margin: 0 0 8px;
  font-size: 15px;
}
</style>
