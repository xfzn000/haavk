<script setup lang="ts">
/**
 * BottomStatusBar —— 底部游戏化 HUD 状态栏
 * 左：Esc 返回 ｜ 中：终端文字 ｜ 右：状态图标
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Signal, Cpu, Wifi, BatteryFull } from 'lucide-vue-next'

const router = useRouter()
const clock = ref('')

function tick() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  clock.value = `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(
    d.getHours(),
  )}:${p(d.getMinutes())}`
}

let timer: number | undefined
onMounted(() => {
  tick()
  timer = window.setInterval(tick, 30_000)
})
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})

function back() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <footer class="bottom-bar hud-mono">
    <div class="bottom-bar__inner">
      <button class="bottom-bar__back" type="button" @click="back">
        <ChevronLeft :size="13" />
        <span>Esc 返回</span>
      </button>

      <div class="bottom-bar__term">
        <span class="dot"></span>
        // G.T.I 7 20 9 // DF 199 3 &lt;2035&gt;
      </div>

      <div class="bottom-bar__right">
        <Signal :size="13" />
        <Cpu :size="13" />
        <Wifi :size="13" />
        <BatteryFull :size="13" />
        <span class="bottom-bar__clock">{{ clock }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 45;
  height: var(--haavk-bottom-h);
  background: linear-gradient(180deg, #20252b, #14181c);
  border-top: 1px solid rgba(88, 184, 244, 0.25);
  color: #c9d4de;
}

.bottom-bar__inner {
  height: 100%;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 11px;
  letter-spacing: 0.1em;
}

.bottom-bar__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  color: #c9d4de;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 2px;
  cursor: pointer;
  transition: all 180ms ease;
}
.bottom-bar__back:hover {
  color: #fff;
  border-color: rgba(88, 184, 244, 0.55);
  background: rgba(88, 184, 244, 0.14);
}

.bottom-bar__term {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #8fa3b5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dot {
  width: 6px;
  height: 6px;
  background: #58b8f4;
  border-radius: 50%;
  box-shadow: 0 0 8px #58b8f4;
}

.bottom-bar__right {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #7c8b99;
}
.bottom-bar__clock {
  color: #c9d4de;
}

@media (max-width: 640px) {
  .bottom-bar__term {
    display: none;
  }
  .bottom-bar__right :deep(svg):not(:last-child) {
    display: none;
  }
}
</style>
