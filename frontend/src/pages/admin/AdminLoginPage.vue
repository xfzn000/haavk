<script setup lang="ts">
/**
 * 后台登录 / 注册  /admin/login
 * 视觉对齐参考截图：浅色菱形底纹 + 居中白色卡片 + 右上语言切换 + 四角 HUD 水印
 */
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ChevronDown, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import logo from '@/assets/logo2.webp'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToastStore()

/* ------------------------- 文案（中 / 英） ------------------------- */
const dict = {
  zh: {
    loginHint: '请输入管理员凭证以继续',
    registerHint: '创建新的管理员凭证',
    username: '用户名 / Username',
    usernamePh: '输入用户名...',
    password: '密码 / Password',
    passwordPh: '输入密码...',
    confirm: '确认密码 / Confirm',
    confirmPh: '再次输入密码...',
    nickname: '昵称 / Nickname',
    nicknamePh: '输入昵称（可选）',
    connect: '连接',
    signup: '注册',
    noAccount: '还没有账号？',
    goRegister: '立即注册',
    hasAccount: '已有账号？',
    goLogin: '返回登录',
    back: '返回首页',
    required: '请输入用户名与密码',
    requiredAll: '请填写完整信息',
    invalidUser: '用户名需 3~32 位，仅含字母、数字、_ - .',
    shortPass: '密码至少 6 位',
    mismatch: '两次输入的密码不一致',
  },
  en: {
    loginHint: 'Please enter administrator credentials to continue',
    registerHint: 'Create a new administrator credential',
    username: 'Username',
    usernamePh: 'Enter username...',
    password: 'Password',
    passwordPh: 'Enter password...',
    confirm: 'Confirm Password',
    confirmPh: 'Re-enter password...',
    nickname: 'Nickname',
    nicknamePh: 'Enter nickname (optional)',
    connect: 'Connect',
    signup: 'Sign up',
    noAccount: "Don't have an account?",
    goRegister: 'Sign up now',
    hasAccount: 'Already have an account?',
    goLogin: 'Back to sign in',
    back: 'Back to home',
    required: 'Please enter username and password',
    requiredAll: 'Please complete all fields',
    invalidUser: 'Username must be 3–32 chars: letters, digits, _ - .',
    shortPass: 'Password must be at least 6 characters',
    mismatch: 'The two passwords do not match',
  },
}

const lang = ref<'zh' | 'en'>('zh')
const langOpen = ref(false)
const t = computed(() => dict[lang.value])

function pickLang(v: 'zh' | 'en') {
  lang.value = v
  langOpen.value = false
}

/* ------------------------- 表单状态 ------------------------- */
const mode = ref<'login' | 'register'>('login')
const isLogin = computed(() => mode.value === 'login')

const form = reactive({
  username: '',
  password: '',
  confirm: '',
  nickname: '',
})

const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

function switchMode() {
  mode.value = isLogin.value ? 'register' : 'login'
  error.value = ''
  form.password = ''
  form.confirm = ''
}

function validate(): boolean {
  error.value = ''
  if (isLogin.value) {
    if (!form.username.trim() || !form.password) {
      error.value = t.value.required
      return false
    }
    return true
  }
  if (!form.username.trim() || !form.password || !form.confirm) {
    error.value = t.value.requiredAll
    return false
  }
  if (!/^[A-Za-z0-9_\-.]+$/.test(form.username.trim()) || form.username.trim().length < 3) {
    error.value = t.value.invalidUser
    return false
  }
  if (form.password.length < 6) {
    error.value = t.value.shortPass
    return false
  }
  if (form.password !== form.confirm) {
    error.value = t.value.mismatch
    return false
  }
  return true
}

async function onSubmit() {
  if (loading.value) return
  if (!validate()) return
  loading.value = true
  try {
    if (isLogin.value) {
      await auth.login(form.username.trim(), form.password)
      toast.success(lang.value === 'zh' ? '登录成功' : 'Signed in')
    } else {
      await auth.register({
        username: form.username.trim(),
        password: form.password,
        nickname: form.nickname.trim() || undefined,
      })
      toast.success(lang.value === 'zh' ? '注册成功，已自动登录' : 'Account created')
    }
    // 登录/注册成功后：回到原本想去的页面，否则进首页
    const redirect = route.query.redirect as string | undefined
    router.replace(redirect && redirect.startsWith('/') ? redirect : '/')
  } catch (e) {
    error.value = e instanceof Error ? e.message : '操作失败'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login">
    <!-- ===== 背景：浅色菱形底纹 ===== -->
    <div class="bg" aria-hidden="true">
      <span class="bg__dia bg__dia--1"></span>
      <span class="bg__dia bg__dia--2"></span>
      <span class="bg__dia bg__dia--3"></span>
      <span class="bg__dia bg__dia--4"></span>
      <span class="bg__dia bg__dia--5"></span>
      <span class="bg__dia bg__dia--6"></span>
      <span class="bg__band"></span>
    </div>

    <!-- ===== 四角 HUD 水印 ===== -->
    <div class="note note--tl hud-mono">
      <p>CN UID182869898117337342880</p>
      <p>ACCESS TERMINAL / HAAVK-NET</p>
      <p>LINK: SECURE</p>
    </div>
    <div class="note note--br hud-mono">
      <p>DEV ACCOUNT // admin / admin123</p>
      <p>BUILD 2036.10 // HAAVK GROUP</p>
      <p>ALL RIGHTS RESERVED</p>
    </div>

    <!-- ===== 右上语言切换 ===== -->
    <div class="lang">
      <button class="lang__btn" type="button" @click="langOpen = !langOpen">
        <span>{{ lang === 'zh' ? '中文' : 'English' }}</span>
        <ChevronDown :size="14" />
      </button>
      <ul v-if="langOpen" class="lang__menu">
        <li>
          <button type="button" :class="{ on: lang === 'zh' }" @click="pickLang('zh')">中文</button>
        </li>
        <li>
          <button type="button" :class="{ on: lang === 'en' }" @click="pickLang('en')">English</button>
        </li>
      </ul>
    </div>

    <!-- ===== 登录 / 注册卡片 ===== -->
    <section class="card">
      <RouterLink to="/" class="card__back">
        <ArrowLeft :size="13" />
        {{ t.back }}
      </RouterLink>

      <!-- Logo -->
      <div class="card__logo">
        <img :src="logo" alt="HAAVK" width="62" height="62" />
      </div>
      <div class="card__brand">HAAVK</div>

      <!-- 分隔线 + 提示 -->
      <div class="card__divider">
        <span>{{ isLogin ? t.loginHint : t.registerHint }}</span>
      </div>

      <form class="form" @submit.prevent="onSubmit">
        <label class="field">
          <span class="field__label">{{ t.username }}</span>
          <input
            v-model="form.username"
            class="field__input"
            type="text"
            autocomplete="username"
            :placeholder="t.usernamePh"
          />
        </label>

        <label class="field">
          <span class="field__label">{{ t.password }}</span>
          <span class="field__wrap">
            <input
              v-model="form.password"
              class="field__input"
              :type="showPassword ? 'text' : 'password'"
              :autocomplete="isLogin ? 'current-password' : 'new-password'"
              :placeholder="t.passwordPh"
            />
            <button class="field__eye" type="button" @click="showPassword = !showPassword">
              <component :is="showPassword ? EyeOff : Eye" :size="15" />
            </button>
          </span>
        </label>

        <template v-if="!isLogin">
          <label class="field">
            <span class="field__label">{{ t.confirm }}</span>
            <input
              v-model="form.confirm"
              class="field__input"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              :placeholder="t.confirmPh"
            />
          </label>

          <label class="field">
            <span class="field__label">{{ t.nickname }}</span>
            <input v-model="form.nickname" class="field__input" type="text" :placeholder="t.nicknamePh" />
          </label>
        </template>

        <p v-if="error" class="form__error">{{ error }}</p>

        <button class="submit" type="submit" :disabled="loading">
          <span class="submit__main">
            <Loader2 v-if="loading" :size="16" class="spin" />
            {{ loading ? '…' : isLogin ? t.connect : t.signup }}
          </span>
          <span class="submit__sub">{{ isLogin ? 'CONNECT' : 'SIGN UP' }}</span>
        </button>
      </form>

      <div class="card__switch">
        <span>{{ isLogin ? t.noAccount : t.hasAccount }}</span>
        <button type="button" @click="switchMode">
          {{ isLogin ? t.goRegister : t.goLogin }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ============================ 页面 ============================ */
.login {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  overflow: hidden;
  background: #eef1f7;
}

/* ---------- 背景菱形 ---------- */
.bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.bg__dia {
  position: absolute;
  border: 1px solid rgba(35, 121, 216, 0.1);
  transform: rotate(45deg);
}
.bg__dia--1 {
  width: 460px;
  height: 460px;
  left: -160px;
  top: -190px;
}
.bg__dia--2 {
  width: 620px;
  height: 620px;
  left: 8%;
  top: 12%;
  border-color: rgba(35, 121, 216, 0.07);
}
.bg__dia--3 {
  width: 380px;
  height: 380px;
  left: 26%;
  bottom: -140px;
  border-color: rgba(35, 121, 216, 0.08);
}
.bg__dia--4 {
  width: 720px;
  height: 720px;
  right: -220px;
  top: -160px;
  border-color: rgba(35, 121, 216, 0.07);
}
.bg__dia--5 {
  width: 420px;
  height: 420px;
  right: 6%;
  bottom: -120px;
}
.bg__dia--6 {
  width: 260px;
  height: 260px;
  right: 24%;
  top: 34%;
  border-color: rgba(35, 121, 216, 0.06);
}
.bg__band {
  position: absolute;
  inset: 0;
  background: radial-gradient(900px 520px at 50% 42%, rgba(255, 255, 255, 0.9), transparent 68%);
}

/* ---------- HUD 水印 ---------- */
.note {
  position: absolute;
  font-size: 10px;
  line-height: 1.75;
  color: #c2ccd8;
  letter-spacing: 0.05em;
  user-select: none;
}
.note p {
  margin: 0;
}
.note--tl {
  top: 18px;
  left: 22px;
}
.note--br {
  bottom: 18px;
  right: 22px;
  text-align: right;
}

/* ---------- 语言切换 ---------- */
.lang {
  position: absolute;
  top: 26px;
  right: 34px;
  z-index: 5;
}
.lang__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 84px;
  justify-content: center;
  padding: 8px 14px;
  font-size: 13px;
  color: #2b3440;
  background: #fff;
  border: 1px solid #dfe5ec;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 180ms ease, color 180ms ease;
}
.lang__btn:hover {
  color: #1c6fd6;
  border-color: #b9cde6;
}
.lang__menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  margin: 0;
  padding: 4px;
  list-style: none;
  min-width: 100px;
  background: #fff;
  border: 1px solid #dfe5ec;
  border-radius: 4px;
  box-shadow: 0 8px 24px -12px rgba(24, 32, 39, 0.3);
}
.lang__menu button {
  width: 100%;
  padding: 7px 10px;
  font-size: 13px;
  text-align: left;
  color: #2b3440;
  background: transparent;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
.lang__menu button:hover {
  background: rgba(35, 121, 216, 0.08);
}
.lang__menu button.on {
  color: #1c6fd6;
  font-weight: 600;
}

/* ---------- 卡片 ---------- */
.card {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 352px;
  padding: 34px 34px 26px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 18px 48px -20px rgba(24, 32, 39, 0.28), 0 2px 8px rgba(24, 32, 39, 0.05);
  animation: fade-in 260ms ease-out both;
}

.card__back {
  position: absolute;
  top: 14px;
  left: 16px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #a8b2be;
  transition: color 160ms ease;
}
.card__back:hover {
  color: #1c6fd6;
}

.card__logo {
  display: flex;
  justify-content: center;
  margin-top: 6px;
  filter: drop-shadow(0 5px 12px rgba(26, 98, 196, 0.2));
}
.card__logo img {
  display: block;
  width: 62px;
  height: 62px;
  object-fit: contain;
}
.card__brand {
  margin-top: 10px;
  text-align: center;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: 6px;
  color: #2c6fd1;
  text-indent: 6px;
}

.card__divider {
  position: relative;
  margin: 20px 0 22px;
  border-top: 1px solid #e8ecf1;
}
.card__divider span {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0 10px;
  font-size: 11px;
  white-space: nowrap;
  color: #9aa5b1;
  background: #fff;
}

/* ---------- 表单 ---------- */
.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.field {
  display: block;
}
.field__label {
  display: block;
  margin-bottom: 7px;
  font-size: 13px;
  font-weight: 600;
  color: #2b3440;
}
.field__wrap {
  position: relative;
  display: block;
}
.field__input {
  width: 100%;
  padding: 11px 12px;
  font-size: 14px;
  font-family: inherit;
  color: #1f2833;
  background: #f1f3f6;
  border: 1px solid #e6e9ee;
  border-radius: 4px;
  outline: none;
  transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
}
.field__input::placeholder {
  color: #b2bac4;
}
.field__input:focus {
  background: #fff;
  border-color: #1c6fd6;
  box-shadow: 0 0 0 3px rgba(28, 111, 214, 0.12);
}
.field__wrap .field__input {
  padding-right: 38px;
}
.field__eye {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  display: inline-flex;
  padding: 4px;
  color: #a8b2be;
  background: transparent;
  border: none;
  cursor: pointer;
}
.field__eye:hover {
  color: #1c6fd6;
}

.form__error {
  margin: -4px 0 0;
  font-size: 12px;
  color: #e0493b;
}

/* ---------- 提交按钮 ---------- */
.submit {
  margin-top: 6px;
  padding: 9px 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  color: #fff;
  background: #1c6fd6;
  border: 1px solid #1c6fd6;
  border-radius: 4px;
  cursor: pointer;
  transition: background 180ms ease, border-color 180ms ease;
}
.submit:hover:not(:disabled) {
  background: #175db8;
  border-color: #175db8;
}
.submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.submit__main {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
}
.submit__sub {
  font-size: 8px;
  letter-spacing: 3px;
  opacity: 0.8;
  text-indent: 3px;
}
.spin {
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ---------- 底部切换 ---------- */
.card__switch {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #f0f3f7;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12.5px;
  color: #9aa5b1;
}
.card__switch button {
  padding: 0;
  font-size: 12.5px;
  color: #1c6fd6;
  background: transparent;
  border: none;
  cursor: pointer;
}
.card__switch button:hover {
  text-decoration: underline;
}

/* ---------- 响应式 ---------- */
@media (max-width: 640px) {
  .note--tl,
  .note--br {
    display: none;
  }
  .lang {
    top: 16px;
    right: 16px;
  }
  .card {
    padding: 30px 22px 22px;
    max-width: 100%;
  }
  .card__brand {
    letter-spacing: 5px;
  }
}
</style>
