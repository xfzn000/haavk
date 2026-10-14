<script setup lang="ts">
/** 全局提示宿主 */
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const iconMap = { success: CheckCircle2, error: AlertTriangle, info: Info } as const
</script>

<template>
  <div class="toast-host">
    <TransitionGroup name="toast">
      <div v-for="t in toast.items" :key="t.id" class="toast" :class="`toast--${t.type}`">
        <component :is="iconMap[t.type]" :size="16" class="toast__icon" />
        <span class="toast__msg">{{ t.message }}</span>
        <button class="toast__close" type="button" @click="toast.remove(t.id)">
          <X :size="13" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-host {
  position: fixed;
  top: 76px;
  right: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 240px;
  max-width: 380px;
  padding: 11px 12px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid var(--haavk-border);
  border-left-width: 3px;
  border-radius: 2px;
  box-shadow: 0 8px 24px -12px rgba(24, 32, 39, 0.4);
  pointer-events: auto;
}
.toast--success {
  border-left-color: var(--haavk-green);
}
.toast--success .toast__icon {
  color: var(--haavk-green);
}
.toast--error {
  border-left-color: var(--haavk-red);
}
.toast--error .toast__icon {
  color: var(--haavk-red);
}
.toast--info {
  border-left-color: var(--haavk-blue);
}
.toast--info .toast__icon {
  color: var(--haavk-blue);
}
.toast__icon {
  flex-shrink: 0;
}
.toast__msg {
  flex: 1;
  color: var(--haavk-text);
}
.toast__close {
  color: var(--haavk-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  display: inline-flex;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 240ms ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
