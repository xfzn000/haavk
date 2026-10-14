<script setup lang="ts">
/**
 * 后台 · 帖子编辑 /admin/posts/:id
 * id = 'new' 表示新增
 */
import { computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Save, ArrowLeft, Trash2 } from 'lucide-vue-next'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ImageUploader from '@/components/forum/ImageUploader.vue'
import { ref } from 'vue'
import { useForumStore } from '@/stores/forum'
import { useLogStore } from '@/stores/log'
import { useToastStore } from '@/stores/toast'
import { employees } from '@/mock/employees'
import { formatDateTime } from '@/assets/format'
import type { BizStatus } from '@/types'

const props = defineProps<{ id: string }>()
const router = useRouter()
const forum = useForumStore()
const log = useLogStore()
const toast = useToastStore()
forum.ensureLoaded()

const isNew = computed(() => props.id === 'new')
const postId = computed(() => Number(props.id))

const form = reactive({
  title: '',
  content: '',
  images: [] as string[],
  authorId: employees[0].id,
  pinned: false,
  status: 'ON_SALE' as BizStatus,
})

const replies = computed(() => (isNew.value ? [] : forum.getReplies(postId.value)))

function fill() {
  if (isNew.value) {
    form.title = ''
    form.content = ''
    form.images = []
    form.authorId = employees[0].id
    form.pinned = false
    form.status = 'ON_SALE'
    return
  }
  const p = forum.getPost(postId.value)
  if (p) {
    form.title = p.title
    form.content = p.content
    form.images = (p.images ?? []).slice()
    form.authorId = p.authorId
    form.pinned = p.pinned
    form.status = (p.status || 'ON_SALE') as BizStatus
  }
}

watch(
  () => props.id,
  (v) => {
    fill()
    if (v !== 'new') forum.loadReplies(Number(v))
  },
  { immediate: true },
)

const confirmOpen = ref(false)
const pendingReplyId = ref<number | null>(null)

async function onSubmit() {
  if (!form.title.trim()) {
    toast.error('标题不能为空')
    return
  }
  if (!form.content.trim() && !form.images.length) {
    toast.error('正文内容和图片不能同时为空')
    return
  }
  const author = employees.find((e) => e.id === form.authorId) || employees[0]
  try {
    const saved = await forum.savePost({
      id: isNew.value ? undefined : postId.value,
      title: form.title.trim(),
      content: form.content,
      images: form.images.slice(),
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      department: author.department,
      tag: author.role,
      pinned: form.pinned,
      status: form.status,
    })
    log.record(isNew.value ? '新增' : '编辑', `帖子《${saved.title}》`)
    toast.success(isNew.value ? '帖子已创建' : '帖子已保存')
    router.push('/admin/posts')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '保存失败')
  }
}

function askDeleteReply(id: number) {
  pendingReplyId.value = id
  confirmOpen.value = true
}

async function doDeleteReply() {
  if (pendingReplyId.value != null) {
    try {
      await forum.deleteReply(pendingReplyId.value, postId.value)
      log.record('删除', '帖子回复')
      toast.success('回复已删除')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败')
    }
  }
  confirmOpen.value = false
  pendingReplyId.value = null
}
</script>

<template>
  <div class="edit">
    <div class="edit__head">
      <button class="hud-btn hud-btn--ghost hud-btn--sm" type="button" @click="router.back()">
        <ArrowLeft :size="14" />
        返回
      </button>
      <h2>{{ isNew ? '新增帖子' : `编辑帖子 #${id}` }}</h2>
    </div>

    <div class="edit__grid">
      <!-- 表单 -->
      <section class="hud-panel form">
        <label class="field">
          <span class="field__label">标题</span>
          <input v-model="form.title" class="hud-input" type="text" placeholder="请输入帖子标题" />
        </label>

        <label class="field">
          <span class="field__label">正文</span>
          <textarea v-model="form.content" class="hud-input form__area" rows="12" placeholder="请输入正文"></textarea>
        </label>

        <div class="field">
          <span class="field__label">配图（可多张；正文与配图至少填一个）</span>
          <ImageUploader v-model="form.images" :max="6" />
        </div>

        <div class="form__row">
          <label class="field">
            <span class="field__label">作者</span>
            <select v-model.number="form.authorId" class="hud-input">
              <option v-for="e in employees" :key="e.id" :value="e.id">
                {{ e.name }}（{{ e.department }}）
              </option>
            </select>
          </label>

          <label class="field">
            <span class="field__label">状态</span>
            <select v-model="form.status" class="hud-input">
              <option value="DRAFT">草稿</option>
              <option value="ON_SALE">已发布</option>
              <option value="OFF_SALE">已下架</option>
            </select>
          </label>

          <label class="field field--check">
            <span class="field__label">是否置顶</span>
            <span class="check">
              <input v-model="form.pinned" type="checkbox" />
              <span>置顶该帖</span>
            </span>
          </label>
        </div>

        <div class="form__actions">
          <button class="hud-btn" type="button" @click="onSubmit">
            <Save :size="15" />
            保存
          </button>
        </div>
      </section>

      <!-- 回复管理 -->
      <section v-if="!isNew" class="hud-panel replies">
        <div class="replies__head">
          <h3>回复管理</h3>
          <span class="hud-mono">{{ replies.length }} 条</span>
        </div>
        <div class="replies__list">
          <div v-for="r in replies" :key="r.id" class="reply">
            <img :src="r.authorAvatar" :alt="r.authorName" />
            <div class="reply__body">
              <div class="reply__meta">
                <strong>{{ r.authorName }}</strong>
                <span>{{ formatDateTime(r.createdAt) }}</span>
              </div>
              <p>{{ r.content }}</p>
            </div>
            <button class="op op--danger" type="button" title="删除" @click="askDeleteReply(r.id)">
              <Trash2 :size="14" />
            </button>
          </div>
          <div v-if="!replies.length" class="replies__empty">暂无回复</div>
        </div>
      </section>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      title="删除回复"
      message="确定删除这条回复吗？删除后不可恢复。"
      @confirm="doDeleteReply"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<style scoped>
.edit__head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.edit__head h2 {
  margin: 0;
  font-size: 18px;
  color: var(--haavk-text);
}
.edit__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.form {
  padding: 20px;
}
.field {
  display: block;
  margin-bottom: 16px;
}
.field__label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--haavk-muted);
}
.form__area {
  resize: vertical;
  line-height: 1.8;
  font-size: 14px;
}
.form__row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.field--check .check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  font-size: 14px;
  color: var(--haavk-text);
}
.form__actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid rgba(185, 200, 216, 0.7);
}

.replies {
  overflow: hidden;
}
.replies__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--haavk-border);
}
.replies__head h3 {
  margin: 0;
  font-size: 15px;
}
.replies__head span {
  font-size: 12px;
  color: var(--haavk-muted);
}
.replies__list {
  max-height: 520px;
  overflow-y: auto;
  padding: 6px 12px;
}
.reply {
  display: flex;
  gap: 10px;
  padding: 12px 4px;
  border-bottom: 1px dashed rgba(185, 200, 216, 0.8);
}
.reply img {
  width: 30px;
  height: 30px;
  border: 1px solid var(--haavk-border);
  flex-shrink: 0;
}
.reply__body {
  flex: 1;
  min-width: 0;
}
.reply__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}
.reply__meta strong {
  font-size: 13px;
  color: var(--haavk-text);
}
.reply__meta span {
  font-size: 11px;
  color: #9aa7b4;
}
.reply__body p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--haavk-muted);
  word-break: break-word;
}
.op {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--haavk-muted);
  background: transparent;
  border: 1px solid var(--haavk-border);
  border-radius: 2px;
  cursor: pointer;
  flex-shrink: 0;
}
.op--danger:hover {
  color: var(--haavk-red);
  border-color: var(--haavk-red);
}
.replies__empty {
  padding: 40px;
  text-align: center;
  color: var(--haavk-muted);
  font-size: 14px;
}

@media (max-width: 900px) {
  .edit__grid {
    grid-template-columns: 1fr;
  }
  .form__row {
    grid-template-columns: 1fr;
  }
}
</style>
