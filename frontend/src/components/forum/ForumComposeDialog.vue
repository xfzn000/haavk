<script setup lang="ts">
/**
 * ForumComposeDialog —— 发帖弹窗（论坛页「发帖」按钮的落点）
 * 标题 + 正文 + 配图（可多张，走 /api/upload）；提交后由父组件调用 forum store 落库并跳转详情。
 */
import { ref, watch } from 'vue'
import { X, Send } from 'lucide-vue-next'
import ImageUploader from '@/components/forum/ImageUploader.vue'

const props = defineProps<{ open: boolean; submitting?: boolean }>()
const emit = defineEmits<{
  (e: 'submit', v: { title: string; content: string; images: string[] }): void
  (e: 'cancel'): void
}>()

const title = ref('')
const content = ref('')
const images = ref<string[]>([])

watch(
  () => props.open,
  (v) => {
    if (v) {
      title.value = ''
      content.value = ''
      images.value = []
    }
  },
)

/** 标题必填；正文与配图至少要有一个 */
function canSubmit(): boolean {
  return !!title.value.trim() && (!!content.value.trim() || images.value.length > 0)
}

function submit() {
  if (!canSubmit()) return
  emit('submit', {
    title: title.value.trim(),
    content: content.value.trim(),
    images: images.value.slice(),
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="compose">
      <!-- 刻意不响应「点背景关闭」：写到一半被误关会丢内容，只能用 ✕ / 取消 关 -->
      <div v-if="open" class="compose">
        <div class="compose__box" role="dialog" aria-modal="true" aria-label="发布新帖">
          <header class="compose__head">
            <h3>发布新帖</h3>
            <button class="compose__close" type="button" aria-label="关闭" @click="emit('cancel')">
              <X :size="17" />
            </button>
          </header>

          <label class="compose__field">
            <span class="compose__label hud-mono">标题</span>
            <input
              v-model="title"
              class="hud-input"
              type="text"
              maxlength="60"
              placeholder="请输入帖子标题…"
            />
          </label>

          <label class="compose__field">
            <span class="compose__label hud-mono">正文</span>
            <textarea
              v-model="content"
              class="hud-input compose__area"
              rows="7"
              placeholder="请输入帖子内容…（发布将扣除 100 注意力点数）"
            ></textarea>
          </label>

          <div class="compose__field">
            <span class="compose__label hud-mono">配图</span>
            <ImageUploader v-model="images" :max="4" :disabled="submitting" />
          </div>

          <footer class="compose__foot">
            <span class="compose__hint hud-mono">发布将扣除 100 注意力点数</span>
            <span class="compose__acts">
              <button class="hud-btn hud-btn--ghost" type="button" @click="emit('cancel')">取消</button>
              <button
                class="hud-btn"
                type="button"
                :disabled="submitting || !canSubmit()"
                @click="submit"
              >
                <Send :size="14" />
                发布
              </button>
            </span>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.compose {
  position: fixed;
  inset: 0;
  z-index: 92;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(20, 24, 28, 0.42);
  backdrop-filter: blur(2px);
}
.compose__box {
  width: 100%;
  max-width: 520px;
  padding: 20px 22px 18px;
  background: #f4f8fc;
  border: 1px solid var(--haavk-border);
  border-radius: 2px;
  box-shadow: 0 24px 60px -30px rgba(16, 24, 32, 0.6);
}
.compose__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(185, 200, 216, 0.85);
}
.compose__head h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--haavk-text);
}
.compose__close {
  display: inline-flex;
  padding: 4px;
  color: var(--haavk-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 150ms ease;
}
.compose__close:hover {
  color: var(--haavk-red);
}
.compose__field {
  display: block;
  margin-bottom: 14px;
}
.compose__label {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--haavk-muted);
  text-transform: uppercase;
}
.compose__area {
  resize: vertical;
  line-height: 1.7;
}
.compose__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
}
.compose__acts {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.compose__hint {
  font-size: 11px;
  color: #9aa7b4;
}

.compose-enter-active,
.compose-leave-active {
  transition: opacity 180ms ease;
}
.compose-enter-from,
.compose-leave-to {
  opacity: 0;
}
</style>
