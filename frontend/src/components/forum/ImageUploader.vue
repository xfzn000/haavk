<script setup lang="ts">
/**
 * ImageUploader —— 论坛配图上传（发帖 / 回复共用）
 *
 * 行为：选图 → 先调 POST /api/upload 拿到 /uploads/xxx.png → 存进 v-model 数组。
 * 只存地址（不存 base64），所以刷新/换浏览器都能正常显示。
 * 支持多张、可删、上传中有状态、超大小/非图片会提示。
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ImagePlus, Loader2, X } from 'lucide-vue-next'
import { uploadImage } from '@/api/upload'
import { useToastStore } from '@/stores/toast'
import { requireLogin } from '@/utils/requireLogin'

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    /** 最多几张 */
    max?: number
    /** 紧凑模式（回复框用） */
    compact?: boolean
    /** 单张大小上限（MB） */
    maxSizeMB?: number
    disabled?: boolean
  }>(),
  { max: 4, compact: false, maxSizeMB: 20, disabled: false },
)

const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void }>()

const toast = useToastStore()
const router = useRouter()
const input = ref<HTMLInputElement | null>(null)
const uploading = ref(0)

function pick() {
  if (props.disabled) return
  // 上传接口需要登录（游客点了先引导去登录，别白跑一趟 401）
  if (!requireLogin(router, '请先登录后再上传图片')) return
  if (props.modelValue.length >= props.max) {
    toast.error(`最多上传 ${props.max} 张图片`)
    return
  }
  input.value?.click()
}

async function onFile(e: Event) {
  const el = e.target as HTMLInputElement
  const files = Array.from(el.files ?? [])
  el.value = ''
  if (!files.length) return

  const room = props.max - props.modelValue.length
  if (room <= 0) {
    toast.error(`最多上传 ${props.max} 张图片`)
    return
  }
  if (files.length > room) toast.error(`最多还能上传 ${room} 张，已自动截取`)

  for (const file of files.slice(0, room)) {
    if (!file.type.startsWith('image/')) {
      toast.error(`「${file.name}」不是图片文件`)
      continue
    }
    if (file.size > props.maxSizeMB * 1024 * 1024) {
      toast.error(`「${file.name}」超过 ${props.maxSizeMB}MB`)
      continue
    }
    uploading.value += 1
    try {
      const url = await uploadImage(file)
      emit('update:modelValue', [...props.modelValue, url])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '图片上传失败（请确认后端已启动）')
    } finally {
      uploading.value -= 1
    }
  }
}

function remove(index: number) {
  if (props.disabled) return
  const next = props.modelValue.slice()
  next.splice(index, 1)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="uploader" :class="{ 'is-compact': compact }">
    <input
      ref="input"
      class="uploader__input"
      type="file"
      accept="image/*"
      multiple
      :disabled="disabled"
      @change="onFile"
    />

    <div v-if="modelValue.length" class="uploader__list">
      <figure v-for="(src, i) in modelValue" :key="src + i" class="uploader__item">
        <img class="uploader__thumb" :src="src" alt="配图" />
        <button
          v-if="!disabled"
          class="uploader__del"
          type="button"
          :title="`移除第 ${i + 1} 张`"
          @click="remove(i)"
        >
          <X :size="12" />
        </button>
      </figure>
    </div>

    <button
      class="uploader__add"
      type="button"
      :disabled="disabled || uploading > 0 || modelValue.length >= max"
      @click="pick"
    >
      <Loader2 v-if="uploading > 0" class="uploader__spin" :size="compact ? 13 : 15" />
      <ImagePlus v-else :size="compact ? 13 : 15" />
      <span v-if="uploading > 0">上传中…</span>
      <span v-else-if="modelValue.length >= max">已达上限 {{ max }} 张</span>
      <span v-else>添加图片（{{ modelValue.length }}/{{ max }}）</span>
    </button>
  </div>
</template>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.uploader__input {
  display: none;
}

.uploader__list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.uploader__item {
  position: relative;
  margin: 0;
  width: 96px;
  height: 96px;
  border: 1px solid rgba(35, 121, 216, 0.25);
  background: rgba(255, 255, 255, 0.6);
}
.is-compact .uploader__item {
  width: 62px;
  height: 62px;
}
.uploader__thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.uploader__del {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 19px;
  height: 19px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #fff;
  background: #2c3a48;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  cursor: pointer;
  transition: background 160ms ease;
}
.uploader__del:hover {
  background: var(--haavk-red, #c0392b);
}

.uploader__add {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  font-size: 13px;
  color: var(--haavk-blue);
  background: transparent;
  border: 1px dashed rgba(35, 121, 216, 0.45);
  border-radius: 2px;
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease;
}
.uploader__add:hover:not(:disabled) {
  background: rgba(35, 121, 216, 0.07);
  border-color: var(--haavk-blue);
}
.uploader__add:disabled {
  color: #9aa7b4;
  border-color: rgba(154, 167, 180, 0.5);
  cursor: not-allowed;
}
.is-compact .uploader__add {
  padding: 5px 9px;
  font-size: 12px;
}

.uploader__spin {
  animation: uploader-spin 900ms linear infinite;
}
@keyframes uploader-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
