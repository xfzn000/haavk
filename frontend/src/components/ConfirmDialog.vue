<script setup lang="ts">
/** 二次确认弹窗（危险操作） */
import { AlertTriangle } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    open: boolean
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    danger?: boolean
  }>(),
  {
    title: '操作确认',
    confirmText: '确认删除',
    cancelText: '取消',
    danger: true,
  },
)

const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="dlg">
      <div v-if="open" class="dlg" @click.self="emit('cancel')">
        <div class="dlg__box hud-panel hud-corners" role="dialog" aria-modal="true">
          <div class="dlg__head">
            <AlertTriangle :size="18" :class="danger ? 'dlg__icon--danger' : 'dlg__icon'" />
            <h3>{{ title }}</h3>
          </div>
          <p class="dlg__msg">{{ message }}</p>
          <div class="dlg__actions">
            <button class="hud-btn hud-btn--ghost" type="button" @click="emit('cancel')">
              {{ cancelText }}
            </button>
            <button
              class="hud-btn"
              :class="{ 'hud-btn--danger': danger }"
              type="button"
              @click="emit('confirm')"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dlg {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(20, 24, 28, 0.5);
  backdrop-filter: blur(2px);
}
.dlg__box {
  width: 100%;
  max-width: 400px;
  padding: 20px 22px;
  background: #f7fafd;
}
.dlg__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.dlg__head h3 {
  margin: 0;
  font-size: 17px;
  color: var(--haavk-text);
}
.dlg__icon {
  color: var(--haavk-blue);
}
.dlg__icon--danger {
  color: var(--haavk-red);
}
.dlg__msg {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--haavk-muted);
  white-space: pre-line;
}
.dlg__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dlg-enter-active,
.dlg-leave-active {
  transition: opacity 180ms ease;
}
.dlg-enter-from,
.dlg-leave-to {
  opacity: 0;
}
</style>
