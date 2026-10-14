<script setup lang="ts">
/**
 * 个人中心 /profile
 *
 * 版式遵循「身份块置顶 + 资料 / 安全 分区 + 显式保存 + 清晰反馈」的通行做法，
 * 视觉沿用网站主体的 HUD 语言（直角细线、蓝主色、浅灰蓝底），不另起一套皮肤。
 *
 * 数据来源：`GET /api/auth/profile`；保存走 `PUT /api/auth/profile` / `PUT /api/auth/password`。
 * 头像统一走后端 `POST /api/upload`（拿 /uploads/xxx.png），不存 base64。
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  UserRound,
  KeyRound,
  Upload,
  Loader2,
  ShieldCheck,
  LayoutDashboard,
  MessagesSquare,
  UserSearch,
  Package,
  ArrowRight,
  CalendarDays,
  Clock,
} from 'lucide-vue-next'
import * as authApi from '@/api/auth'
import { uploadImage } from '@/api/upload'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const loading = ref(true)
const savingProfile = ref(false)
const savingPassword = ref(false)
const uploadingAvatar = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

const info = reactive({
  username: '',
  nickname: '',
  avatar: '' as string,
  role: 'USER',
  status: 1,
  lastLogin: '' as string | null,
  createdAt: '' as string | null,
})

const pwd = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const roleLabel = computed(() => (info.role.toUpperCase() === 'ADMIN' ? '管理员' : '普通用户'))
const avatarPreview = computed(() => info.avatar || '')
/** 昵称首字，用于无头像时的占位 */
const initial = computed(() => (info.nickname || info.username || 'U').slice(0, 1).toUpperCase())

function fmtTime(v?: string | null): string {
  if (!v) return '—'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

async function load() {
  loading.value = true
  try {
    const p = await authApi.getProfile()
    info.username = p.username
    info.nickname = p.nickname || p.username
    info.avatar = p.avatar || ''
    info.role = p.role || 'USER'
    info.status = p.status ?? 1
    info.lastLogin = p.lastLogin ?? null
    info.createdAt = p.createdAt ?? null
    // 顺手把本地登录态对齐（导航栏昵称/头像）
    auth.setProfile({ nickname: info.nickname, avatar: info.avatar })
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '资料加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(load)

function pickAvatar() {
  if (uploadingAvatar.value) return
  avatarInput.value?.click()
}

async function onAvatarFile(e: Event) {
  const el = e.target as HTMLInputElement
  const file = el.files?.[0]
  el.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.error('请选择图片文件')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error('头像建议小于 5MB')
    return
  }
  uploadingAvatar.value = true
  try {
    const url = await uploadImage(file)
    info.avatar = url
    // 上传后立即落库，避免「只换了预览、刷新又没了」
    await authApi.updateProfile({ avatar: url })
    auth.setProfile({ avatar: url })
    toast.success('头像已更新')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '头像上传失败')
  } finally {
    uploadingAvatar.value = false
  }
}

async function saveProfile() {
  const nickname = info.nickname.trim()
  if (!nickname) {
    toast.error('昵称不能为空')
    return
  }
  savingProfile.value = true
  try {
    const p = await authApi.updateProfile({ nickname, avatar: info.avatar || undefined })
    info.nickname = p.nickname || nickname
    info.avatar = p.avatar || ''
    auth.setProfile({ nickname: info.nickname, avatar: info.avatar })
    toast.success('资料已保存')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '保存失败')
  } finally {
    savingProfile.value = false
  }
}

async function savePassword() {
  if (!pwd.oldPassword) {
    toast.error('请输入当前密码')
    return
  }
  if (pwd.newPassword.length < 6) {
    toast.error('新密码至少 6 个字符')
    return
  }
  if (pwd.newPassword !== pwd.confirmPassword) {
    toast.error('两次输入的新密码不一致')
    return
  }
  savingPassword.value = true
  try {
    await authApi.changePassword({ oldPassword: pwd.oldPassword, newPassword: pwd.newPassword })
    toast.success('密码已修改，请重新登录')
    pwd.oldPassword = ''
    pwd.newPassword = ''
    pwd.confirmPassword = ''
    // 密码已变，旧 Token 的语义不再可信：清登录态回前台，由用户重新登录
    setTimeout(() => {
      auth.logout()
      router.push('/')
    }, 900)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '修改失败')
  } finally {
    savingPassword.value = false
  }
}

/** 快捷入口：管理员可见后台，所有人可见前台写操作入口 */
const shortcuts = computed(() => {
  const list = [
    { to: '/forum', label: '员工论坛', desc: '发帖 / 回复', icon: MessagesSquare },
    { to: '/missing-persons', label: '寻人启事', desc: '提交线索', icon: UserSearch },
    { to: '/solutions', label: '解决方案', desc: '浏览物资', icon: Package },
  ]
  if (auth.isAdmin) {
    list.unshift({ to: '/admin', label: '后台管理', desc: '数据与内容维护', icon: LayoutDashboard })
  }
  return list
})
</script>

<template>
  <div class="profile container-haavk">
    <!-- 载入中 -->
    <div v-if="loading" class="profile__loading hud-mono">
      LOADING PROFILE<span class="dots">...</span>
    </div>

    <template v-else>
      <!-- ============ 顶部身份块 ============ -->
      <section class="ident hud-panel hud-corners">
        <div class="ident__avatar" :class="{ 'is-empty': !avatarPreview }">
          <img v-if="avatarPreview" :src="avatarPreview" alt="头像" />
          <span v-else>{{ initial }}</span>
          <button
            class="ident__avatar-btn"
            type="button"
            :disabled="uploadingAvatar"
            title="更换头像"
            @click="pickAvatar"
          >
            <Loader2 v-if="uploadingAvatar" class="spin" :size="15" />
            <Upload v-else :size="15" />
          </button>
          <input
            ref="avatarInput"
            class="ident__file"
            type="file"
            accept="image/*"
            @change="onAvatarFile"
          />
        </div>

        <div class="ident__meta">
          <div class="ident__name-row">
            <h1 class="ident__name">{{ info.nickname || info.username }}</h1>
            <span class="hud-tag" :class="{ 'hud-tag--blue': info.role.toUpperCase() === 'ADMIN' }">
              <ShieldCheck :size="12" />
              {{ roleLabel }}
            </span>
            <span class="hud-tag hud-tag--outline">@{{ info.username }}</span>
          </div>
          <p class="ident__hint">
            头像与昵称会显示在论坛帖子、回复以及导航栏上；登录名不可修改。
          </p>
          <div class="ident__facts">
            <span class="ident__fact">
              <CalendarDays :size="13" />
              注册于 {{ fmtTime(info.createdAt) }}
            </span>
            <span class="ident__sep" aria-hidden="true"></span>
            <span class="ident__fact">
              <Clock :size="13" />
              上次登录 {{ fmtTime(info.lastLogin) }}
            </span>
          </div>
        </div>
      </section>

      <!-- ============ 主体两栏 ============ -->
      <div class="grid">
        <!-- 左：资料 + 安全 -->
        <div class="col-main">
          <!-- 基本资料 -->
          <section class="card hud-panel">
            <header class="card__head">
              <h2 class="card__title hud-bar">基本资料</h2>
              <span class="card__sub hud-mono">PROFILE.EDIT</span>
            </header>

            <div class="field">
              <label class="field__label" for="pf-nick">登录名</label>
              <input id="pf-nick" class="hud-input" :value="info.username" disabled />
              <span class="field__tip">登录名由系统分配，不可修改</span>
            </div>

            <div class="field">
              <label class="field__label" for="pf-name">昵称</label>
              <input
                id="pf-name"
                v-model="info.nickname"
                class="hud-input"
                type="text"
                maxlength="32"
                placeholder="请输入昵称"
              />
              <span class="field__tip">最长 32 个字符，将展示在论坛与导航栏</span>
            </div>

            <div class="field">
              <label class="field__label">头像</label>
              <button class="avatar-line" type="button" :disabled="uploadingAvatar" @click="pickAvatar">
                <span class="avatar-line__thumb" :class="{ 'is-empty': !avatarPreview }">
                  <img v-if="avatarPreview" :src="avatarPreview" alt="" />
                  <UserRound v-else :size="16" />
                </span>
                <span class="avatar-line__text">
                  {{ uploadingAvatar ? '上传中…' : '点击上传新头像' }}
                  <em>建议方形图片，小于 5MB</em>
                </span>
                <Upload :size="15" />
              </button>
            </div>

            <footer class="card__foot">
              <button class="hud-btn" type="button" :disabled="savingProfile" @click="saveProfile">
                <Loader2 v-if="savingProfile" class="spin" :size="14" />
                {{ savingProfile ? '保存中…' : '保存修改' }}
              </button>
            </footer>
          </section>

          <!-- 安全设置 -->
          <section class="card hud-panel">
            <header class="card__head">
              <h2 class="card__title hud-bar">安全设置</h2>
              <span class="card__sub hud-mono">SECURITY.PWD</span>
            </header>

            <div class="field">
              <label class="field__label" for="pf-old">当前密码</label>
              <input
                id="pf-old"
                v-model="pwd.oldPassword"
                class="hud-input"
                type="password"
                autocomplete="current-password"
                placeholder="请输入当前密码"
              />
            </div>
            <div class="field-row">
              <div class="field">
                <label class="field__label" for="pf-new">新密码</label>
                <input
                  id="pf-new"
                  v-model="pwd.newPassword"
                  class="hud-input"
                  type="password"
                  autocomplete="new-password"
                  placeholder="至少 6 位"
                />
              </div>
              <div class="field">
                <label class="field__label" for="pf-new2">确认新密码</label>
                <input
                  id="pf-new2"
                  v-model="pwd.confirmPassword"
                  class="hud-input"
                  type="password"
                  autocomplete="new-password"
                  placeholder="再输入一次"
                />
              </div>
            </div>
            <p class="field__tip field__tip--block">
              修改成功后需要重新登录；新密码长度 6~64 个字符。
            </p>

            <footer class="card__foot">
              <button class="hud-btn" type="button" :disabled="savingPassword" @click="savePassword">
                <KeyRound :size="14" />
                {{ savingPassword ? '提交中…' : '修改密码' }}
              </button>
            </footer>
          </section>
        </div>

        <!-- 右：账号信息 + 快捷入口 -->
        <aside class="col-side">
          <section class="card hud-panel">
            <header class="card__head">
              <h2 class="card__title hud-bar">账号信息</h2>
            </header>
            <dl class="facts">
              <div class="facts__row">
                <dt>账号状态</dt>
                <dd>
                  <span class="hud-tag" :class="info.status === 1 ? 'hud-tag--outline' : ''">
                    {{ info.status === 1 ? '正常' : '已禁用' }}
                  </span>
                </dd>
              </div>
              <div class="facts__row">
                <dt>角色权限</dt>
                <dd>{{ roleLabel }}</dd>
              </div>
              <div class="facts__row">
                <dt>登录名</dt>
                <dd class="hud-mono">@{{ info.username }}</dd>
              </div>
              <div class="facts__row">
                <dt>注册时间</dt>
                <dd>{{ fmtTime(info.createdAt) }}</dd>
              </div>
              <div class="facts__row">
                <dt>上次登录</dt>
                <dd>{{ fmtTime(info.lastLogin) }}</dd>
              </div>
            </dl>
            <p v-if="!auth.isAdmin" class="facts__note">
              普通账号仅可浏览前台内容；如需管理权限，请联系管理员。
            </p>
          </section>

          <section class="card hud-panel">
            <header class="card__head">
              <h2 class="card__title hud-bar">快捷入口</h2>
            </header>
            <nav class="links">
              <RouterLink v-for="s in shortcuts" :key="s.to" class="links__item" :to="s.to">
                <span class="links__icon"><component :is="s.icon" :size="16" /></span>
                <span class="links__text">
                  <strong>{{ s.label }}</strong>
                  <em>{{ s.desc }}</em>
                </span>
                <ArrowRight :size="15" class="links__arrow" />
              </RouterLink>
            </nav>
          </section>
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
.profile {
  padding-top: 8px;
  padding-bottom: 12px;
}

.profile__loading {
  padding: 120px 0;
  text-align: center;
  font-size: 13px;
  letter-spacing: 0.3em;
  color: var(--haavk-muted);
}
.dots {
  animation: pf-blink 1.2s steps(4, end) infinite;
}

/* ---------------- 身份块 ---------------- */
.ident {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 22px 26px;
}
.ident__avatar {
  position: relative;
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--haavk-border);
  background: linear-gradient(150deg, #e3edf8, #cfdcec);
  overflow: visible;
}
.ident__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ident__avatar.is-empty span {
  font-size: 34px;
  font-weight: 800;
  color: var(--haavk-blue-deep);
  letter-spacing: 1px;
}
.ident__avatar-btn {
  position: absolute;
  right: -9px;
  bottom: -9px;
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--haavk-blue);
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: pointer;
  transition: background 160ms ease;
}
.ident__avatar-btn:hover:not(:disabled) {
  background: var(--haavk-blue-deep);
}
.ident__avatar-btn:disabled {
  opacity: 0.75;
  cursor: progress;
}
.ident__file {
  display: none;
}

.ident__meta {
  min-width: 0;
  flex: 1;
}
.ident__name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.ident__name {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--haavk-text);
}
.ident__hint {
  margin-top: 6px;
  font-size: 13.5px;
  color: var(--haavk-muted);
}
.ident__facts {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: var(--haavk-muted);
}
.ident__fact {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ident__sep {
  width: 1px;
  height: 13px;
  background: var(--haavk-border);
}

/* ---------------- 两栏 ---------------- */
.grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 336px;
  gap: 18px;
  align-items: start;
}
.col-main {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}
.col-side {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ---------------- 卡片 ---------------- */
.card {
  padding: 20px 24px 22px;
}
.card__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding-bottom: 14px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--haavk-border);
}
.card__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--haavk-text);
}
.card__sub {
  margin-left: auto;
  font-size: 11px;
  color: var(--haavk-muted);
}
.card__foot {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--haavk-border);
  display: flex;
  justify-content: flex-end;
}

/* ---------------- 表单 ---------------- */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.field:last-child {
  margin-bottom: 0;
}
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.field-row .field {
  margin-bottom: 16px;
}
.field__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--haavk-text);
}
.field__tip {
  font-size: 12px;
  color: var(--haavk-muted);
}
.field__tip--block {
  display: block;
  margin-top: 4px;
}
.hud-input:disabled {
  color: var(--haavk-muted);
  background: rgba(185, 200, 216, 0.22);
  cursor: not-allowed;
}

.avatar-line {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  text-align: left;
  background: rgba(255, 255, 255, 0.55);
  border: 1px dashed rgba(35, 121, 216, 0.45);
  border-radius: 2px;
  color: var(--haavk-blue);
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease;
}
.avatar-line:hover:not(:disabled) {
  background: rgba(35, 121, 216, 0.07);
  border-color: var(--haavk-blue);
}
.avatar-line:disabled {
  opacity: 0.7;
  cursor: progress;
}
.avatar-line__thumb {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--haavk-border);
  background: #e8eef6;
  overflow: hidden;
}
.avatar-line__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-line__text {
  display: flex;
  flex-direction: column;
  font-size: 13.5px;
  color: var(--haavk-text);
}
.avatar-line__text em {
  font-size: 12px;
  font-style: normal;
  color: var(--haavk-muted);
}

/* ---------------- 账号信息 ---------------- */
.facts {
  display: flex;
  flex-direction: column;
}
.facts__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(185, 200, 216, 0.7);
  font-size: 13px;
}
.facts__row:last-child {
  border-bottom: none;
}
.facts__row dt {
  color: var(--haavk-muted);
}
.facts__row dd {
  color: var(--haavk-text);
  font-weight: 600;
  text-align: right;
}
.facts__note {
  margin-top: 12px;
  padding: 10px 12px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--haavk-muted);
  background: rgba(35, 121, 216, 0.06);
  border-left: 3px solid var(--haavk-blue);
}

/* ---------------- 快捷入口 ---------------- */
.links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.links__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--haavk-border);
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.4);
  transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
}
.links__item:hover {
  border-color: var(--haavk-blue);
  background: rgba(35, 121, 216, 0.07);
  transform: translateX(2px);
}
.links__icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--haavk-blue);
  background: rgba(35, 121, 216, 0.1);
  border: 1px solid rgba(35, 121, 216, 0.28);
}
.links__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.links__text strong {
  font-size: 13.5px;
  color: var(--haavk-text);
}
.links__text em {
  font-size: 12px;
  font-style: normal;
  color: var(--haavk-muted);
}
.links__arrow {
  margin-left: auto;
  color: var(--haavk-muted);
}
.links__item:hover .links__arrow {
  color: var(--haavk-blue);
}

.spin {
  animation: pf-spin 900ms linear infinite;
}
@keyframes pf-spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes pf-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}

/* ---------------- 响应式 ---------------- */
@media (max-width: 1080px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .ident {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 18px;
  }
  .field-row {
    grid-template-columns: 1fr;
  }
  .card {
    padding: 16px 16px 18px;
  }
}
</style>
