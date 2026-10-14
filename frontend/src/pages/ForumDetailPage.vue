<script setup lang="ts">
/**
 * 帖子详情 /forum/:id
 * 版式（对齐参考图 23cb0f96…png）：
 *   左 60.8% 帖子主体（作者栏 + 蓝色细线 + 标题 + 正文 + 面板内底部互动栏）
 *   右 39.2% 员工论坛回复流（标题 + 细分隔线 + 连续回复列表 + 右缘蓝色强调线 + 弱化输入框）
 * 两栏相邻无空隙；导航栏由 AppShell 统一提供，本页不动。
 */
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ThumbsUp, MessageSquare, Trash2, Send, ArrowLeft } from 'lucide-vue-next'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ImageUploader from '@/components/forum/ImageUploader.vue'
import { useForumStore } from '@/stores/forum'
import { useToastStore } from '@/stores/toast'
import { requireLogin } from '@/utils/requireLogin'

const props = defineProps<{ id: string }>()

const forum = useForumStore()
const toast = useToastStore()
const router = useRouter()

/** 加载失败信息（后端未启动 / 接口异常）——不抛出，界面走错误态而不是白屏 */
const loadError = ref<string | null>(null)
/** 帖子是否已从后端取回（区分「加载中」「接口失败」「帖子真不存在」） */
const listReady = ref(false)

forum.ensureLoaded()
  .then(() => {
    listReady.value = true
  })
  .catch((e) => {
    loadError.value = e instanceof Error ? e.message : '帖子加载失败'
  })

/** 重试：列表与回复都强制重新拉取 */
async function retry() {
  loadError.value = null
  try {
    await forum.ensureLoaded(true)
    listReady.value = true
    await forum.loadReplies(postId.value, true)
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '帖子加载失败'
  }
}

const postId = computed(() => Number(props.id))
const post = computed(() => forum.getPost(postId.value))
const replies = computed(() => forum.getReplies(postId.value))

/** 2026-10-06 16:08:00 → 2036.10.06 16:08（参考图的点分格式） */
function fmtFull(s?: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(s || '')
  return m ? `${m[1]}.${m[2]}.${m[3]} ${m[4]}:${m[5]}` : s || ''
}
/** 回复时间：只留 MM.DD HH:mm */
function fmtShort(s?: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(s || '')
  return m ? `${m[2]}.${m[3]} ${m[4]}:${m[5]}` : s || ''
}

const replyText = ref('')
/** 回复配图（走 /api/upload 拿到的地址） */
const replyImages = ref<string[]>([])
const submitting = ref(false)
const confirmOpen = ref(false)
const pendingDeleteId = ref<number | null>(null)

/** 图片点开看大图（用新窗口，避免为了灯箱再引依赖） */
function openImage(src: string) {
  window.open(src, '_blank', 'noopener')
}

watch(
  postId,
  (id) => {
    replyText.value = ''
    replyImages.value = []
    // 回复拉取失败同样走错误态，不产生未捕获异常
    forum.loadReplies(id).catch((e) => {
      loadError.value = e instanceof Error ? e.message : '回复加载失败'
    })
  },
  { immediate: true },
)

// 进入详情标记为已读（内存态 + 本地持久化，供列表页筛选使用）
const READ_KEY = 'haavk_forum_read'
watch(
  post,
  (p) => {
    if (!p) return
    p.unread = false
    p.unreadReply = false
    p.unreadReplyCount = 0
    try {
      const ids: number[] = JSON.parse(localStorage.getItem(READ_KEY) || '[]')
      if (!ids.includes(p.id)) {
        localStorage.setItem(READ_KEY, JSON.stringify([...ids, p.id]))
      }
    } catch {
      /* 忽略本地存储异常 */
    }
  },
  { immediate: true },
)

function onLike() {
  if (!post.value) return
  forum.toggleLike(postId.value)
  toast.success(forum.isLiked(postId.value) ? '已点赞' : '已取消点赞')
}

async function onSubmit() {
  // 回复是写操作，需要登录（游客先引导去登录，登录后自动跳回本页）
  if (!requireLogin(router, '请先登录后再回复')) return
  if (!replyText.value.trim() && !replyImages.value.length) {
    toast.error('回复内容和图片不能同时为空')
    return
  }
  if (submitting.value) return
  submitting.value = true
  try {
    const created = await forum.addReply(postId.value, replyText.value, replyImages.value)
    if (!created) {
      toast.error('注意力点数不足，无法回复')
      return
    }
    replyText.value = ''
    replyImages.value = []
    toast.success('回复已提交，扣除 50 注意力点数')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '提交失败')
  } finally {
    submitting.value = false
  }
}

function askDelete(replyId: number) {
  pendingDeleteId.value = replyId
  confirmOpen.value = true
}

async function doDelete() {
  if (pendingDeleteId.value != null) {
    try {
      await forum.deleteReply(pendingDeleteId.value, postId.value)
      toast.success('回复已删除')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败')
    }
  }
  confirmOpen.value = false
  pendingDeleteId.value = null
}
</script>

<template>
  <div class="detail-page">
    <!-- 背景层 HUD 装饰（不拦交互） -->
    <div class="detail-page__hud" aria-hidden="true">
      <span class="hud-cross hud-cross--a"></span>
      <span class="hud-cross hud-cross--b"></span>
    </div>

    <div class="detail-page__inner">
      <!-- 加载中 -->
      <div v-if="!post && !loadError && !listReady" class="dp-state hud-mono">LINKING&nbsp;·&nbsp;·&nbsp;·</div>

      <!-- 不存在 / 加载失败 -->
      <div v-else-if="!post" class="dp-state dp-state--missing">
        <MessageSquare :size="32" />
        <h2>{{ loadError ? '帖子加载失败' : '帖子不存在或已被删除' }}</h2>
        <p v-if="loadError" class="dp-state__hint">
          {{ loadError }}（请确认后端服务已启动）
        </p>
        <div class="dp-state__actions">
          <button v-if="loadError" type="button" class="dp-btn" @click="retry">重新加载</button>
          <RouterLink to="/forum" class="dp-btn">
            <ArrowLeft :size="15" />
            返回论坛
          </RouterLink>
        </div>
      </div>

      <template v-else>
        <!-- ============ 左：帖子主体 ============ -->
        <article class="post">
          <header class="post__head">
            <img class="post__avatar" :src="post.authorAvatar" :alt="post.authorName" />
            <div class="post__ident">
              <span class="post__name">{{ post.authorName || '未知用户' }}</span>
              <span class="post__status">{{ post.department || '员工未注册' }}</span>
              <span v-if="post.tag" class="post__tag">{{ post.tag }}</span>
            </div>
            <div class="post__permit" aria-hidden="true">
              <span class="permit__code hud-mono">OPERATION PERMIT</span>
              <span class="permit__wm">HAAVK</span>
            </div>
          </header>
          <span class="post__rule" aria-hidden="true"></span>

          <h1 class="post__title">{{ post.title }}</h1>

          <!-- 正文 + 配图当作一个整体撑满，图库紧跟在正文后面（不会被顶到面板底部） -->
          <div class="post__content">
            <div v-if="post.content.trim()" class="post__body">
              <p
                v-for="(line, i) in post.content.split('\n')"
                :key="i"
                :class="{ 'is-gap': !line.trim() }"
              >
                {{ line || '\u00a0' }}
              </p>
            </div>

            <!-- 帖子配图（点击看大图） -->
            <div v-if="post.images?.length" class="post__gallery">
              <button
                v-for="(src, i) in post.images"
                :key="src + i"
                class="shot"
                type="button"
                :title="`查看第 ${i + 1} 张（共 ${post.images.length} 张）`"
                @click="openImage(src)"
              >
                <img class="shot__img" :src="src" :alt="`配图 ${i + 1}`" />
              </button>
            </div>
          </div>

          <!-- 底部互动栏：位于面板内部，不固定视口 -->
          <footer class="post__bar">
            <span class="bar__time hud-mono">{{ fmtFull(post.createdAt) }}</span>
            <span class="bar__sep" aria-hidden="true"></span>
            <button
              class="bar__act bar__act--btn"
              :class="{ 'is-on': forum.isLiked(postId) }"
              type="button"
              @click="onLike"
            >
              <ThumbsUp :size="16" />
              <span class="hud-mono">{{ post.likes }}</span>
            </button>
            <span class="bar__sep" aria-hidden="true"></span>
            <span class="bar__act">
              <MessageSquare :size="16" />
              <span class="hud-mono">{{ post.replyCount }}</span>
            </span>
          </footer>
          <span class="post__micro hud-mono" aria-hidden="true">HAAVK · CH 07 · FREQ 118.9 · ARCHIVE INTEL</span>
        </article>

        <!-- ============ 右：回复流 ============ -->
        <aside class="thread">
          <div class="thread__head">
            <h2>员工论坛</h2>
            <span class="thread__code hud-mono">D 4E 100X · P 6T 31XX</span>
          </div>

          <div class="thread__list">
            <article v-for="r in replies" :key="r.id" class="reply">
              <img class="reply__avatar" :src="r.authorAvatar" :alt="r.authorName" />
              <div class="reply__main">
                <div class="reply__meta">
                  <span class="reply__name">{{ r.authorName || '未知用户' }}</span>
                  <span class="reply__status">{{ r.department || '员工未注册' }}</span>
                  <span v-if="r.tag" class="reply__tag">{{ r.tag }}</span>
                </div>
                <p v-if="r.content.trim()" class="reply__text">{{ r.content }}</p>
                <div v-if="r.images?.length" class="reply__gallery">
                  <button
                    v-for="(src, i) in r.images"
                    :key="src + i"
                    class="shot shot--sm"
                    type="button"
                    title="点击看大图"
                    @click="openImage(src)"
                  >
                    <img class="shot__img" :src="src" :alt="`回复配图 ${i + 1}`" />
                  </button>
                </div>
                <div class="reply__foot">
                  <span class="reply__time hud-mono">{{ fmtShort(r.createdAt) }}</span>
                  <button
                    v-if="forum.isMine(r)"
                    class="reply__del"
                    type="button"
                    title="删除我的回复"
                    @click="askDelete(r.id)"
                  >
                    <Trash2 :size="13" />
                  </button>
                </div>
              </div>
            </article>

            <div v-if="!replies.length" class="thread__empty">
              <span class="thread__empty-mark" aria-hidden="true">◇</span>
              <p>暂无回复</p>
            </div>
          </div>
          <!-- 右缘蓝色强调线由 .thread__list 的 border-right 绘制 -->

          <div class="thread__compose">
            <textarea
              v-model="replyText"
              class="thread__textarea"
              rows="3"
              placeholder="发表回复…（扣除 50 注意力点数）"
              :disabled="submitting"
              @keydown.ctrl.enter="onSubmit"
            ></textarea>
            <ImageUploader
              v-model="replyImages"
              class="thread__uploader"
              :max="3"
              compact
              :disabled="submitting"
            />
            <div class="thread__compose-foot">
              <span class="thread__hint hud-mono">Ctrl + Enter 发送</span>
              <button
                class="thread__submit"
                type="button"
                :disabled="submitting || (!replyText.trim() && !replyImages.length)"
                @click="onSubmit"
              >
                <Send :size="14" />
                提交回复
              </button>
            </div>
          </div>
        </aside>
      </template>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      title="删除回复"
      message="确定删除这条回复吗？删除后不可恢复。"
      @confirm="doDelete"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<style scoped>
/* ==========================================================================
   帖子详情页 —— 浅蓝灰玻璃面板 + 双栏阅读界面（对齐参考图 23cb0f96…png）
   参考图实测（2560px 图，视口按 1920 CSS 计，换算 ×0.75）：
     版心 88..1824（1736 = 90.4%）、左栏 1055 : 右栏 681（相邻无空隙）
     作者头像 ~76、作者名 ~20、蓝标签 24 高、蓝线 2px（距头像底 14）
     标题 ink 25.5、正文 ink 16、底部互动栏 39 高（右对齐：时间｜赞｜评）
     右栏回复头像 ~54、回复节奏 116/条、右缘蓝色强调线距面板右 ~46
   ========================================================================== */
.detail-page {
  --p-panel: rgba(245, 249, 253, 0.76);
  --p-panel2: rgba(232, 240, 248, 0.72);
  --p-line: rgba(63, 128, 193, 0.42);
  --p-line-soft: rgba(63, 128, 193, 0.26);
  --p-blue: #2879c9;
  --p-ink: #26343d;
  --p-muted: #65737d;
  --p-mono-ink: #3f5a72;
  /* 面板高度：铺满视口（= 视口 − 导航 60 − 上间距 28 − 底部 HUD 34 − 下间距 36） */
  --p-minh: calc(100vh - var(--haavk-header-h) - 28px - var(--haavk-bottom-h) - 36px);
  position: relative;
}

.detail-page__inner {
  width: var(--haavk-content-w);
  max-width: 1760px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1055fr 681fr;
  align-items: stretch;
}

/* ---------- 加载 / 错误状态 ---------- */
.dp-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: var(--p-minh);
  color: #7d8b98;
  font-size: 13px;
  letter-spacing: 0.18em;
}
.dp-state--missing h2 {
  margin: 0;
  font-size: 18px;
  letter-spacing: 0;
  color: #26343d;
}
.dp-state__hint {
  margin: 0;
  max-width: 34em;
  font-size: 13px;
  letter-spacing: 0;
  line-height: 1.6;
  color: var(--haavk-red);
  text-align: center;
}
.dp-state__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.dp-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  color: var(--p-blue);
  background: rgba(40, 121, 201, 0.08);
  border: 1px solid rgba(40, 121, 201, 0.4);
  border-radius: 2px;
  cursor: pointer;
  text-decoration: none;
}
.dp-btn:hover {
  background: rgba(40, 121, 201, 0.16);
}

/* ---------- 左：帖子主体 ---------- */
.post {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: var(--p-minh);
  padding: clamp(26px, 2.6vw, 50px) clamp(26px, 2.7vw, 52px) clamp(18px, 1.5vw, 28px);
  background: var(--p-panel);
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-right: none;
  border-radius: 2px 0 0 2px;
}

.post__head {
  display: flex;
  align-items: flex-start;
  gap: 18px;
}
.post__avatar {
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  object-fit: cover;
  border: 1px solid rgba(63, 128, 193, 0.35);
  background: rgba(255, 255, 255, 0.7);
}
.post__ident {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding-top: 3px;
  min-width: 0;
}
.post__name {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.5px;
  color: var(--p-ink);
}
.post__status {
  font-size: 17px;
  line-height: 1.4;
  color: var(--p-muted);
}
.post__tag {
  margin-top: 3px;
  padding: 5px 10px;
  font-size: 15px;
  line-height: 1;
  color: #fff;
  background: var(--p-blue);
  border-radius: 1px;
}
.post__permit {
  position: relative;
  margin-left: auto;
  padding: 4px 2px 0 0;
  text-align: right;
  flex-shrink: 0;
}
.permit__code {
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--p-blue);
}
.permit__wm {
  position: absolute;
  top: 12px;
  right: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 4px;
  color: rgba(40, 121, 201, 0.09);
  pointer-events: none;
}
/* 作者栏底部的蓝色细线（横向贯穿内容宽度） */
.post__rule {
  display: block;
  height: 2px;
  margin-top: 14px;
  background: var(--p-blue);
}

.post__title {
  margin: 42px 0 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.5px;
  color: var(--p-ink);
  overflow-wrap: anywhere;
}
/* 正文 + 配图整体：撑满面板剩余高度（互动栏仍固定在面板底部） */
.post__content {
  flex: 1 1 auto;
  min-height: 0;
  margin-top: 34px;
}
.post__body {
  min-height: 0;
}
.post__body p {
  margin: 0 0 18px;
  font-size: 18px;
  line-height: 1.9;
  color: #2f3d47;
  overflow-wrap: anywhere;
}
.post__body p.is-gap {
  height: 10px;
  margin: 0;
}

/* 底部互动栏（面板内部，右对齐） */
.post__bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  height: 40px;
  margin-top: 26px;
  padding: 0 22px;
  background: rgba(40, 121, 201, 0.16);
  border: 1px solid rgba(63, 128, 193, 0.22);
}
.bar__time {
  font-size: 15px;
  color: var(--p-mono-ink);
}
.bar__sep {
  width: 1px;
  height: 18px;
  background: rgba(63, 128, 193, 0.45);
}
.bar__act {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: var(--p-mono-ink);
  background: transparent;
  border: none;
  padding: 0;
}
.bar__act svg {
  color: var(--p-blue);
}
.bar__act--btn {
  cursor: pointer;
  transition: color 160ms ease;
}
.bar__act--btn:hover,
.bar__act.is-on {
  color: var(--p-blue);
}
.post__micro {
  display: block;
  margin-top: 10px;
  font-size: 10px;
  letter-spacing: 0.2em;
  color: rgba(63, 128, 193, 0.42);
}

/* ---------- 右：回复流 ---------- */
.thread {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: var(--p-minh);
  padding: clamp(24px, 2.4vw, 46px) clamp(22px, 2.3vw, 44px) clamp(16px, 1.4vw, 26px)
    clamp(20px, 2vw, 40px);
  background: var(--p-panel2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-left: 1px solid rgba(63, 128, 193, 0.3);
  border-radius: 0 2px 2px 0;
}
.thread__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--p-line);
}
.thread__head h2 {
  margin: 0;
  font-size: 27px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--p-ink);
}
.thread__code {
  font-size: 10px;
  letter-spacing: 0.18em;
  color: rgba(63, 128, 193, 0.55);
  white-space: nowrap;
}

/* 回复列表：独立滚动 + 右缘蓝色强调线（border-right 画线，勿再叠一层元素） */
.thread__list {
  flex: 1 1 auto;
  min-height: 0;
  /* 上限：回复再多也不撑高整页。
     非列表部分实测占 301.4px（上内边距 46 + 头部 53.5 + 两个外边距 14 + 输入区 159.9 + 下内边距 26 + 边框 2），
     取 304 留出余量，否则面板会比视口多 1~2px 而出现页面滚动条 */
  max-height: calc(var(--p-minh) - 304px);
  margin-top: 2px;
  padding-right: 22px;
  border-right: 3px solid rgba(63, 128, 193, 0.5);
  overflow-y: auto;
  overscroll-behavior: contain;
}
.thread__list::-webkit-scrollbar {
  width: 7px;
}
.thread__list::-webkit-scrollbar-track {
  background: transparent;
}
.thread__list::-webkit-scrollbar-thumb {
  background: rgba(63, 128, 193, 0.42);
}

.reply {
  display: flex;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid var(--p-line-soft);
}
.reply__avatar {
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  object-fit: cover;
  border: 1px solid rgba(63, 128, 193, 0.32);
  background: rgba(255, 255, 255, 0.7);
}
.reply__main {
  flex: 1 1 auto;
  min-width: 0;
}
.reply__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}
.reply__name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--p-ink);
}
.reply__status {
  font-size: 16px;
  color: var(--p-muted);
}
.reply__tag {
  padding: 4px 8px;
  font-size: 14px;
  line-height: 1;
  color: #fff;
  background: var(--p-blue);
  border-radius: 1px;
}
.reply__text {
  margin: 0;
  font-size: 16px;
  line-height: 1.65;
  color: #2f3d47;
  overflow-wrap: anywhere;
  /* 回复里可能带换行（后端存的是原始文本）——保留换行，否则会挤成一整段 */
  white-space: pre-line;
}

/* ---------------- 配图（帖子正文 / 回复通用） ---------------- */
.post__gallery,
.reply__gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.shot {
  padding: 0;
  width: 168px;
  height: 168px;
  overflow: hidden;
  background: rgba(222, 232, 243, 0.5);
  border: 1px solid rgba(63, 128, 193, 0.28);
  border-radius: 1px;
  cursor: zoom-in;
  transition: border-color 160ms ease, transform 160ms ease;
}
.shot--sm {
  width: 84px;
  height: 84px;
}
.shot:hover {
  border-color: var(--haavk-blue);
  transform: translateY(-2px);
}
.shot__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thread__uploader {
  margin-top: 10px;
}
.reply__foot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
.reply__time {
  font-size: 14px;
  color: #7b8b99;
}
.reply__del {
  display: inline-flex;
  color: #8d9aa6;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 160ms ease;
}
.reply__del:hover {
  color: var(--haavk-red);
}

.thread__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 70px 0;
  color: #93a1ad;
}
.thread__empty-mark {
  font-size: 40px;
  line-height: 1;
  color: rgba(40, 121, 201, 0.3);
}
.thread__empty p {
  margin: 0;
  font-size: 13px;
}

/* 回复输入（弱化视觉权重） */
.thread__compose {
  margin-top: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--p-line-soft);
}
.thread__textarea {
  width: 100%;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.7;
  color: var(--p-ink);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--p-line-soft);
  border-radius: 2px;
  resize: none;
}
.thread__textarea::placeholder {
  color: #93a1ad;
}
.thread__textarea:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.78);
  border-color: rgba(40, 121, 201, 0.6);
}
.thread__compose-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}
.thread__hint {
  font-size: 11px;
  color: #8b99a6;
}
.thread__submit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: var(--p-blue);
  border: 1px solid var(--p-blue);
  border-radius: 2px;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, filter 160ms ease;
}
.thread__submit:hover {
  filter: brightness(1.08);
}
/* 按下变灰（与论坛列表页发帖按钮一致） */
.thread__submit:active {
  background: #7f8b95;
  border-color: #7f8b95;
  filter: none;
}
.thread__submit:disabled {
  background: #9aa6b0;
  border-color: #9aa6b0;
  cursor: not-allowed;
}

/* ---------- 背景 HUD 装饰 ---------- */
.detail-page__hud {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.hud-cross {
  position: absolute;
  width: 13px;
  height: 13px;
}
.hud-cross::before,
.hud-cross::after {
  content: '';
  position: absolute;
  background: rgba(63, 128, 193, 0.4);
}
.hud-cross::before {
  left: 0;
  top: 6px;
  width: 13px;
  height: 1px;
}
.hud-cross::after {
  top: 0;
  left: 6px;
  height: 13px;
  width: 1px;
}
.hud-cross--a {
  top: -6px;
  left: 24px;
}
.hud-cross--b {
  bottom: 6px;
  right: 24px;
}

/* ---------- 响应式 ---------- */
@media (max-width: 1440px) {
  .post__title {
    font-size: 26px;
  }
}

@media (max-width: 1024px) {
  .detail-page__inner {
    grid-template-columns: minmax(0, 1fr);
  }
  .post,
  .thread {
    min-height: 0;
    border-radius: 2px;
  }
  .post {
    border-right: 1px solid rgba(255, 255, 255, 0.62);
  }
  .thread {
    margin-top: 18px;
    border-left: 1px solid rgba(63, 128, 193, 0.3);
  }
  .thread__list {
    max-height: 460px;
  }
  .post__title {
    font-size: 24px;
  }
  .post__avatar {
    width: 64px;
    height: 64px;
  }
  .post__permit {
    display: none;
  }
  .post__bar {
    margin-top: 22px;
  }
}

@media (max-width: 560px) {
  .post__title {
    font-size: 22px;
  }
  .post__body p {
    font-size: 16px;
  }
  .post__bar {
    height: 38px;
    gap: 12px;
    padding: 0 14px;
  }
  .reply__avatar {
    width: 46px;
    height: 46px;
  }
}
</style>
