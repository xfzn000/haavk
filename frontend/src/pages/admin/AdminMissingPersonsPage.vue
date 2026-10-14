<script setup lang="ts">
/**
 * 后台 · 寻人启事管理 /admin/missing-persons
 */
import { computed, reactive, ref } from 'vue'
import { Plus, Pencil, Trash2, Upload, X, RotateCcw } from 'lucide-vue-next'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useMissingPersonStore } from '@/stores/missingPerson'
import { useLogStore } from '@/stores/log'
import { useToastStore } from '@/stores/toast'
import { formatMoney } from '@/assets/format'
import { uploadImage } from '@/api/upload'
import type { BizStatus, MissingPerson } from '@/types'

const store = useMissingPersonStore()
const log = useLogStore()
const toast = useToastStore()
store.ensureLoaded()

const rows = computed(() => store.list.filter((m) => m.status !== 'DELETED'))

const confirmOpen = ref(false)
const pendingDelete = ref<MissingPerson | null>(null)

const editorOpen = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  name: '',
  code: '',
  image: '',
  subtitle: '',
  description: '',
  rewardType: '悬赏哈夫币总额',
  rewardText: '',
  rewardAmount: 0,
  status: 'OFF_SALE' as BizStatus,
  sort: 1,
})

function reset() {
  Object.assign(form, {
    name: '',
    code: '',
    image: '',
    subtitle: '',
    description: '',
    rewardType: '悬赏哈夫币总额',
    rewardText: '',
    rewardAmount: 0,
    status: 'OFF_SALE' as BizStatus,
    sort: rows.value.length + 1,
  })
}

function openCreate() {
  editingId.value = null
  reset()
  editorOpen.value = true
}
function openEdit(m: MissingPerson) {
  editingId.value = m.id
  Object.assign(form, {
    name: m.name,
    code: m.code,
    // 用 rawImage（后台真正填的地址）回填，不要把「按姓名解析出来的素材/占位图」写回数据库
    image: m.rawImage ?? '',
    subtitle: m.subtitle,
    description: m.description,
    rewardType: m.rewardType,
    rewardText: m.rewardText,
    rewardAmount: m.rewardAmount,
    status: m.status,
    sort: m.sort,
  })
  editorOpen.value = true
}

/** 上传图片：走后端 /api/upload，拿回 /uploads/xxx.png 存库（不要存 base64，字段只有 512 长） */
async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    form.image = await uploadImage(file)
    toast.success('图片已上传')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '图片上传失败')
  } finally {
    input.value = ''
  }
}

async function onSave() {
  if (!form.name.trim()) {
    toast.error('姓名不能为空')
    return
  }
  try {
    await store.save({
      id: editingId.value ?? undefined,
      name: form.name.trim(),
      code: form.code.trim(),
      image: form.image,
      subtitle: form.subtitle,
      description: form.description,
      rewardType: form.rewardType,
      rewardText: form.rewardText,
      rewardAmount: Number(form.rewardAmount) || 0,
      status: form.status,
      sort: Number(form.sort) || 1,
    })
    log.record(editingId.value ? '编辑' : '新增', `寻人启事 ${form.name}`)
    toast.success(editingId.value ? '已保存' : '已新增')
    editorOpen.value = false
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '保存失败')
  }
}

async function setStatus(m: MissingPerson, status: BizStatus) {
  try {
    await store.setStatus(m.id, status)
    log.record(status === 'ON_SALE' ? '上架' : '下架', `寻人启事 ${m.name}`)
    toast.success(status === 'ON_SALE' ? '已上架' : '已下架')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '操作失败')
  }
}

/** 重置提交态：前台按钮回到「提交线索」 */
async function onResetSubmit(m: MissingPerson) {
  try {
    await store.resetSubmit(m.id)
    log.record('重置线索提交态', `寻人启事 ${m.name}`)
    toast.success('已重置提交态')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '操作失败')
  }
}

function askDelete(m: MissingPerson) {
  pendingDelete.value = m
  confirmOpen.value = true}

async function doDelete() {
  if (pendingDelete.value) {
    try {
      await store.remove(pendingDelete.value.id)
      log.record('删除', `寻人启事 ${pendingDelete.value.name}`)
      toast.success('已删除（软删除）')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败')
    }
  }
  confirmOpen.value = false
  pendingDelete.value = null
}
</script>

<template>
  <div class="page">
    <div class="page__bar hud-panel">
      <span class="page__count hud-mono">共 {{ rows.length }} 条</span>
      <button class="hud-btn page__add" type="button" @click="openCreate">
        <Plus :size="15" />
        新增寻人启事
      </button>
    </div>

    <div class="hud-panel table-wrap">
      <table class="hud-table">
        <thead>
          <tr>
            <th>编号</th>
            <th>姓名</th>
            <th>图片</th>
            <th>奖励</th>
            <th>状态</th>
            <th>排序</th>
            <th class="ta-r">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in rows" :key="m.id">
            <td class="hud-mono">{{ m.code }}</td>
            <td class="cell-name">
              {{ m.name }}
              <span v-if="m.submitted" class="hud-tag hud-tag--outline">已提交</span>
            </td>
            <td><img class="thumb" :src="m.image" :alt="m.name" /></td>
            <td class="hud-mono">
              {{ m.rewardAmount ? formatMoney(m.rewardAmount) : m.rewardText }}
            </td>
            <td>
              <span class="hud-tag" :class="{ 'hud-tag--outline': m.status === 'ON_SALE' }">
                {{ m.status === 'ON_SALE' ? '已上架' : m.status === 'OFF_SALE' ? '已下架' : '草稿' }}
              </span>
            </td>
            <td class="hud-mono">{{ m.sort }}</td>
            <td>
              <div class="ops">
                <button
                  v-if="m.status !== 'ON_SALE'"
                  class="hud-btn hud-btn--sm"
                  type="button"
                  @click="setStatus(m, 'ON_SALE')"
                >
                  上架
                </button>
                <button
                  v-else
                  class="hud-btn hud-btn--sm hud-btn--ghost"
                  type="button"
                  @click="setStatus(m, 'OFF_SALE')"
                >
                  下架
                </button>
                <button
                  v-if="m.submitted"
                  class="op"
                  type="button"
                  title="重置提交态"
                  @click="onResetSubmit(m)"
                >
                  <RotateCcw :size="15" />
                </button>
                <button class="op" type="button" title="编辑" @click="openEdit(m)"><Pencil :size="15" /></button>
                <button class="op op--danger" type="button" title="删除" @click="askDelete(m)">
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!rows.length" class="empty">暂无寻人启事</div>
    </div>

    <!-- 刻意不响应「点背景关闭」：填一半被误关会丢内容，只能用 ✕ / 取消 关 -->
    <Teleport to="body">
      <div v-if="editorOpen" class="modal">
        <div class="modal__box hud-panel">
          <div class="modal__head">
            <h3>{{ editingId ? '编辑寻人启事' : '新增寻人启事' }}</h3>
            <button class="modal__close" type="button" @click="editorOpen = false"><X :size="16" /></button>
          </div>
          <div class="modal__body">
            <div class="modal__row">
              <label class="field">
                <span class="field__label">姓名</span>
                <input v-model="form.name" class="hud-input" type="text" />
              </label>
              <label class="field">
                <span class="field__label">编号</span>
                <input v-model="form.code" class="hud-input" type="text" placeholder="如 H42" />
              </label>
            </div>
            <label class="field">
              <span class="field__label">人物图（留空则按姓名自动配图）</span>
              <div class="upload">
                <input
                  v-model="form.image"
                  class="hud-input"
                  type="text"
                  placeholder="留空自动配图；内置素材名：无名 / 乌鲁鲁"
                />
                <label class="upload__btn">
                  <Upload :size="14" />
                  <input type="file" accept="image/*" hidden @change="onFile" />
                </label>
              </div>
            </label>
            <label class="field">
              <span class="field__label">副标题（空格分隔两个标签）</span>
              <input v-model="form.subtitle" class="hud-input" type="text" placeholder="不善言语  神出鬼没" />
            </label>
            <label class="field">
              <span class="field__label">描述</span>
              <input v-model="form.description" class="hud-input" type="text" />
            </label>
            <div class="modal__row">
              <label class="field">
                <span class="field__label">奖励类型</span>
                <input v-model="form.rewardType" class="hud-input" type="text" />
              </label>
              <label class="field">
                <span class="field__label">奖励文本</span>
                <input v-model="form.rewardText" class="hud-input" type="text" />
              </label>
              <label class="field">
                <span class="field__label">奖励金额</span>
                <input v-model.number="form.rewardAmount" class="hud-input" type="number" min="0" />
              </label>
            </div>
            <div class="modal__row">
              <label class="field">
                <span class="field__label">排序</span>
                <input v-model.number="form.sort" class="hud-input" type="number" min="1" />
              </label>
              <label class="field">
                <span class="field__label">状态</span>
                <select v-model="form.status" class="hud-input">
                  <option value="ON_SALE">已上架</option>
                  <option value="OFF_SALE">已下架</option>
                  <option value="DRAFT">草稿</option>
                </select>
              </label>
            </div>
          </div>
          <div class="modal__foot">
            <button class="hud-btn hud-btn--ghost" type="button" @click="editorOpen = false">取消</button>
            <button class="hud-btn" type="button" @click="onSave">保存</button>
          </div>
        </div>
      </div>
    </Teleport>

    <ConfirmDialog
      :open="confirmOpen"
      title="删除寻人启事"
      message="确定删除该条寻人启事吗？&#10;删除后前台将不再显示。"
      @confirm="doDelete"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<style scoped>
.page__bar {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 16px;
}
.page__count {
  font-size: 13px;
  color: var(--haavk-muted);
}
.page__add {
  margin-left: auto;
}
.table-wrap {
  overflow-x: auto;
}
.thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border: 1px solid var(--haavk-border);
}
.cell-name {
  font-weight: 600;
  white-space: nowrap;
}
.ops {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
}
.op {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: var(--haavk-muted);
  background: transparent;
  border: 1px solid var(--haavk-border);
  border-radius: 2px;
  cursor: pointer;
}
.op:hover {
  color: var(--haavk-blue);
  border-color: var(--haavk-blue);
}
.op--danger:hover {
  color: var(--haavk-red);
  border-color: var(--haavk-red);
}
.ta-r {
  text-align: right;
}
.empty {
  padding: 46px;
  text-align: center;
  color: var(--haavk-muted);
}

.modal {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
  overflow-y: auto;
  background: rgba(20, 24, 28, 0.5);
}
.modal__box {
  width: 100%;
  max-width: 580px;
  background: #f7fafd;
}
.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--haavk-border);
}
.modal__head h3 {
  margin: 0;
  font-size: 16px;
}
.modal__close {
  display: inline-flex;
  color: var(--haavk-muted);
  background: transparent;
  border: none;
  cursor: pointer;
}
.modal__body {
  padding: 18px 20px;
}
.modal__row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.modal__row:first-child {
  grid-template-columns: repeat(2, 1fr);
}
.field {
  display: block;
  margin-bottom: 14px;
}
.field__label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--haavk-muted);
}
.upload {
  display: flex;
  gap: 8px;
}
.upload__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  font-size: 13px;
  color: var(--haavk-blue);
  background: rgba(35, 121, 216, 0.08);
  border: 1px solid rgba(35, 121, 216, 0.35);
  border-radius: 2px;
  cursor: pointer;
  white-space: nowrap;
}
.modal__foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--haavk-border);
}

@media (max-width: 640px) {
  .modal__row,
  .modal__row:first-child {
    grid-template-columns: 1fr;
  }
}
</style>
