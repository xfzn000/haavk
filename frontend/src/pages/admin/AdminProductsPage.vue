<script setup lang="ts">
/**
 * 后台 · 商品管理 /admin/products
 */
import { computed, reactive, ref } from 'vue'
import { Plus, Pencil, Trash2, Upload, ArrowUp, ArrowDown, X } from 'lucide-vue-next'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useProductStore } from '@/stores/product'
import { useLogStore } from '@/stores/log'
import { useToastStore } from '@/stores/toast'
import { formatMoney } from '@/assets/format'
import { resolveProductImage } from '@/api/products'
import { uploadImage } from '@/api/upload'
import type { BizStatus, Product } from '@/types'

const store = useProductStore()
const log = useLogStore()
const toast = useToastStore()
store.ensureLoaded()

const rows = computed(() => store.list.filter((p) => p.status !== 'DELETED'))

const confirmOpen = ref(false)
const pendingDelete = ref<Product | null>(null)

/* -------- 弹窗表单 -------- */
const editorOpen = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  name: '',
  image: '',
  description: '',
  detailsText: '',
  price: 0,
  purchaseLimit: 1,
  soldCount: 0,
  status: 'OFF_SALE' as BizStatus,
  sort: 1,
})

function openCreate() {
  editingId.value = null
  Object.assign(form, {
    name: '',
    image: '',
    description: '',
    detailsText: '',
    price: 0,
    purchaseLimit: 1,
    soldCount: 0,
    status: 'OFF_SALE' as BizStatus,
    sort: rows.value.length + 1,
  })
  editorOpen.value = true
}

function openEdit(p: Product) {
  editingId.value = p.id
  Object.assign(form, {
    name: p.name,
    // 用 rawImage（后台真正填的地址）回填，不要把「按商品名解析出的素材/占位图」写回数据库
    image: p.rawImage ?? '',
    description: p.description,
    detailsText: p.details.join('\n'),
    price: p.price,
    purchaseLimit: p.purchaseLimit,
    soldCount: p.soldCount,
    status: p.status,
    sort: p.sort,
  })
  editorOpen.value = true
}

/** 上传图片：走后端 /api/upload，拿回 /uploads/xxx.png 存库（不要存 base64，字段只有 512 长） */
async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 20 * 1024 * 1024) {
    toast.error('图片不能超过 20MB')
    input.value = ''
    return
  }
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
    toast.error('商品名称不能为空')
    return
  }
  try {
    await store.save({
      id: editingId.value ?? undefined,
      name: form.name.trim(),
      image: form.image,
      description: form.description,
      details: form.detailsText.split('\n').map((s) => s.trim()).filter(Boolean),
      price: Number(form.price) || 0,
      purchaseLimit: Number(form.purchaseLimit) || 1,
      soldCount: Number(form.soldCount) || 0,
      status: form.status,
      sort: Number(form.sort) || 1,
    })
    log.record(editingId.value ? '编辑' : '新增', `商品《${form.name}》`)
    toast.success(editingId.value ? '商品已保存' : '商品已新增')
    editorOpen.value = false
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '保存失败')
  }
}

async function setStatus(p: Product, status: BizStatus) {
  try {
    await store.setStatus(p.id, status)
    log.record(status === 'ON_SALE' ? '上架' : '下架', `商品《${p.name}》`)
    toast.success(status === 'ON_SALE' ? '已上架' : '已下架')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '操作失败')
  }
}

function move(p: Product, dir: -1 | 1) {
  p.sort = Math.max(1, p.sort + dir)
}

function askDelete(p: Product) {
  pendingDelete.value = p
  confirmOpen.value = true
}

async function doDelete() {
  if (pendingDelete.value) {
    try {
      await store.remove(pendingDelete.value.id)
      log.record('删除', `商品《${pendingDelete.value.name}》`)
      toast.success('商品已删除（软删除）')
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
      <span class="page__count hud-mono">共 {{ rows.length }} 件商品</span>
      <button class="hud-btn page__add" type="button" @click="openCreate">
        <Plus :size="15" />
        新增商品
      </button>
    </div>

    <div class="hud-panel table-wrap">
      <table class="hud-table">
        <thead>
          <tr>
            <th>图片</th>
            <th>名称</th>
            <th>价格</th>
            <th>限购</th>
            <th>已售</th>
            <th>状态</th>
            <th>排序</th>
            <th class="ta-r">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in rows" :key="p.id">
            <td><img class="thumb" :src="resolveProductImage(p)" :alt="p.name" /></td>
            <td class="cell-name">{{ p.name }}</td>
            <td class="hud-mono">{{ formatMoney(p.price) }}</td>
            <td class="hud-mono">{{ p.soldCount }}/{{ p.purchaseLimit }}</td>
            <td class="hud-mono">{{ p.soldCount }}</td>
            <td>
              <span class="hud-tag" :class="{ 'hud-tag--outline': p.status === 'ON_SALE' }">
                {{ p.status === 'ON_SALE' ? '已上架' : p.status === 'OFF_SALE' ? '已下架' : '草稿' }}
              </span>
            </td>
            <td>
              <div class="sort">
                <span class="hud-mono">{{ p.sort }}</span>
                <button class="sort__btn" type="button" @click="move(p, -1)"><ArrowUp :size="12" /></button>
                <button class="sort__btn" type="button" @click="move(p, 1)"><ArrowDown :size="12" /></button>
              </div>
            </td>
            <td>
              <div class="ops">
                <button
                  v-if="p.status !== 'ON_SALE'"
                  class="hud-btn hud-btn--sm"
                  type="button"
                  @click="setStatus(p, 'ON_SALE')"
                >
                  上架
                </button>
                <button
                  v-else
                  class="hud-btn hud-btn--sm hud-btn--ghost"
                  type="button"
                  @click="setStatus(p, 'OFF_SALE')"
                >
                  下架
                </button>
                <button class="op" type="button" title="编辑" @click="openEdit(p)"><Pencil :size="15" /></button>
                <button class="op op--danger" type="button" title="删除" @click="askDelete(p)">
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!rows.length" class="empty">暂无商品</div>
    </div>

    <!-- 编辑弹窗（刻意不响应「点背景关闭」：填一半被误关会丢内容，只能用 ✕ / 取消 关） -->
    <Teleport to="body">
      <div v-if="editorOpen" class="modal">
        <div class="modal__box hud-panel">
          <div class="modal__head">
            <h3>{{ editingId ? '编辑商品' : '新增商品' }}</h3>
            <button class="modal__close" type="button" @click="editorOpen = false"><X :size="16" /></button>
          </div>
          <div class="modal__body">
            <label class="field">
              <span class="field__label">名称</span>
              <input v-model="form.name" class="hud-input" type="text" />
            </label>
            <label class="field">
              <span class="field__label">图片（可粘贴 URL 或上传）</span>
              <div class="upload">
                <input v-model="form.image" class="hud-input" type="text" placeholder="https://… 或上传本地图" />
                <label class="upload__btn">
                  <Upload :size="14" />
                  <input type="file" accept="image/*" hidden @change="onFile" />
                </label>
              </div>
            </label>
            <img v-if="form.image" class="preview" :src="form.image" alt="预览" />
            <label class="field">
              <span class="field__label">描述</span>
              <textarea v-model="form.description" class="hud-input" rows="2"></textarea>
            </label>
            <label class="field">
              <span class="field__label">物品详情（每行一条）</span>
              <textarea v-model="form.detailsText" class="hud-input" rows="3"></textarea>
            </label>
            <div class="modal__row">
              <label class="field">
                <span class="field__label">价格</span>
                <input v-model.number="form.price" class="hud-input" type="number" min="0" />
              </label>
              <label class="field">
                <span class="field__label">购买限制</span>
                <input v-model.number="form.purchaseLimit" class="hud-input" type="number" min="1" />
              </label>
              <label class="field">
                <span class="field__label">已售数量</span>
                <input v-model.number="form.soldCount" class="hud-input" type="number" min="0" />
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
      title="删除商品"
      message="确定删除该商品吗？&#10;删除后前台将不再显示。"
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
  width: 64px;
  height: 44px;
  object-fit: cover;
  border: 1px solid var(--haavk-border);
}
.cell-name {
  font-weight: 600;
  white-space: nowrap;
}
.sort {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.sort__btn {
  display: inline-flex;
  padding: 2px;
  color: var(--haavk-muted);
  background: transparent;
  border: 1px solid var(--haavk-border);
  border-radius: 2px;
  cursor: pointer;
}
.sort__btn:hover {
  color: var(--haavk-blue);
  border-color: var(--haavk-blue);
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
  transition: all 160ms ease;
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

/* ---------- 弹窗 ---------- */
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
  max-width: 560px;
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
.modal__row:last-child {
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
.preview {
  width: 120px;
  height: 84px;
  object-fit: cover;
  margin-bottom: 14px;
  border: 1px solid var(--haavk-border);
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
  .modal__row:last-child {
    grid-template-columns: 1fr;
  }
}
</style>
