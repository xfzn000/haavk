<script setup lang="ts">
/**
 * 寻人启事 /missing-persons
 * 左：说明面板 ｜ 右：两张大型人物启事海报
 *
 * 版式对齐参考图 39bda7cb…png（2560 图 → CSS 按 1920 计，换算 ×0.75）：
 *   版心 1744；左栏（含栏距）494 = 面板 444(25.5%) + 栏距 50；
 *   卡片区 1250 = 600 + 50 + 600；卡片 800×973 → CSS 600×730（比例 0.822）
 * 卡片内部全部用容器查询单位 cqw / 百分比，随卡片尺寸等比缩放，不写死像素。
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import SidePanel from '@/components/SidePanel.vue'
import { missingRules } from '@/mock/forum'
import { useMissingPersonStore } from '@/stores/missingPerson'
import { useToastStore } from '@/stores/toast'
import { requireLogin } from '@/utils/requireLogin'
import { formatMoney } from '@/assets/format'
import type { MissingPerson } from '@/types'

const store = useMissingPersonStore()
store.ensureLoaded()
const toast = useToastStore()
const router = useRouter()

const list = computed<MissingPerson[]>(() => store.onSaleList)

/** 顶部标签：subtitle 用空白切分成两枚 */
function badges(m: MissingPerson): string[] {
  return m.subtitle.split(/\s+/).filter(Boolean)
}

async function onSubmit(m: MissingPerson) {
  if (m.submitted) return
  // 提交线索是写操作，需要登录（游客先引导去登录，登录后自动跳回本页）
  if (!requireLogin(router, '请先登录后再提交线索')) return
  const ok = await store.submit(m.id)
  if (ok) toast.success('线索已提交，感谢您的协助')
  else toast.error('提交失败，请确认后端服务已启动')
}
</script>

<template>
  <div class="mp-page">
    <div class="mp-page__inner">
      <!-- ============ 左：说明面板 ============ -->
      <SidePanel class="mp-page__side" :title="missingRules.title" :desc="missingRules.desc" />

      <!-- ============ 右：两列启事海报 ============ -->
      <section class="mp-cards">
        <article
          v-for="m in list"
          :key="m.id"
          class="poster"
          :class="{ 'is-submitted': m.submitted }"
        >
          <img class="poster__photo" :src="m.image" :alt="m.name" />
          <span class="poster__veil" aria-hidden="true"></span>

          <!-- 顶部终端条：编号 + 分类标签 -->
          <header class="poster__bar">
            <span class="poster__code hud-mono">HAAVK / {{ m.code }}</span>
            <span class="poster__tags">
              <span v-for="b in badges(m)" :key="b" class="poster__tag">{{ b }}</span>
            </span>
          </header>

          <!-- 姓名 + 说明 -->
          <div class="poster__head">
            <h2 class="poster__name">{{ m.name }}</h2>
            <p class="poster__desc">{{ m.description }}</p>
          </div>

          <!-- 悬赏 / 奖励 -->
          <div class="poster__reward">
            <span class="reward__label">{{ m.rewardType }}</span>
            <strong v-if="m.rewardAmount" class="reward__amount hud-mono">
              {{ formatMoney(m.rewardAmount) }}
            </strong>
            <strong v-else class="reward__text">{{ m.rewardText }}</strong>
          </div>

          <!-- 底部状态按钮 -->
          <button
            class="poster__btn"
            type="button"
            :disabled="!!m.submitted"
            @click="onSubmit(m)"
          >
            {{ m.submitted ? '已提交' : '提交线索' }}
          </button>
        </article>

        <div v-if="!list.length" class="mp-cards__empty">暂无寻人启事</div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ==========================================================================
   参考图实测（2560 → CSS ×0.75）：版心 1744、面板 444 + 栏距 50 + 卡片区 1250
   卡片 600×730（原图 800×973）；卡片内部位置全部按原图比例换算
   ========================================================================== */
.mp-page__inner {
  width: var(--haavk-content-w);
  max-width: 1760px;
  margin: 0 auto;
  display: grid;
  /* 面板 444 : 卡片区 1250 —— 面板约占内容宽 25.5% */
  grid-template-columns: minmax(260px, 444fr) minmax(0, 1250fr);
  column-gap: clamp(20px, 2.87%, 50px);
  align-items: stretch;
}

/* 左栏面板与右侧卡片等高 */
.mp-page__side {
  height: 100%;
}

.mp-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(16px, 4%, 50px);
  min-width: 0;
}

/* ---------------- 海报卡片 ---------------- */
.poster {
  position: relative;
  aspect-ratio: 800 / 973;
  overflow: hidden;
  /* 卡片内所有尺寸以卡片宽度为基准等比缩放（cqw = 卡片宽度的 1%） */
  container-type: inline-size;
  border: 1px solid rgba(63, 128, 193, 0.35);
  background: #16283c;
}

.poster__photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

/* 极轻的压暗，只为保证文字对比度（原图自带的蓝渐变已在照片里） */
.poster__veil {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(4, 12, 22, 0.3) 0%, rgba(4, 12, 22, 0) 20%),
    linear-gradient(0deg, rgba(4, 12, 22, 0.36) 0%, rgba(4, 12, 22, 0) 32%),
    linear-gradient(96deg, rgba(8, 22, 38, 0.34) 0%, rgba(8, 22, 38, 0) 50%);
  pointer-events: none;
}

/* 顶部终端条：高 99/973 = 10.17% */
.poster__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 10.17%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2cqw;
  padding: 0 3.2cqw;
  background:
    repeating-linear-gradient(
      -60deg,
      rgba(255, 255, 255, 0.035) 0 2px,
      rgba(255, 255, 255, 0) 2px 9px
    ),
    linear-gradient(180deg, #102943 0%, #0d2440 100%);
  border-bottom: 1px solid rgba(63, 128, 193, 0.45);
}
.poster__code {
  font-size: 1.9cqw;
  letter-spacing: 0.08em;
  color: rgba(146, 183, 216, 0.8);
  white-space: nowrap;
}
.poster__tags {
  display: flex;
  gap: 1.2cqw;
  min-width: 0;
}
.poster__tag {
  padding: 0.6cqw 1.3cqw;
  font-size: 2.9cqw; /* 17.4 / 600 —— 对齐参考图徽章宽度（两枚共约 185px） */
  line-height: 1.15;
  color: #dfeaf6;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(158, 190, 222, 0.3);
  white-space: nowrap;
}

/* 姓名区：原图姓名墨迹顶 y=199 → 149/730 = 20.4% */
.poster__head {
  position: absolute;
  left: 4.6%;
  top: 20.4%;
  right: 6%;
}
.poster__name {
  margin: 0;
  font-size: 42px;
  font-size: 7cqw; /* 42 / 600 */
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.03em;
  color: #fff;
  text-shadow: 0 0.35cqw 0.9cqw rgba(5, 14, 26, 0.6);
}
.poster__desc {
  margin: 2.2cqw 0 0;
  font-size: 3.3cqw; /* 20 / 600 */
  line-height: 1.35;
  color: #eef6ff;
  text-shadow: 0 0.25cqw 0.7cqw rgba(5, 14, 26, 0.65);
}

/* 悬赏区：原图说明标签墨迹顶 y=709 → 532/730 = 72.9% */
.poster__reward {
  position: absolute;
  left: 4.5%;
  top: 72.9%;
  right: 5%;
}
.reward__label {
  display: block;
  font-size: 4.2cqw; /* 25 / 600 */
  font-weight: 600;
  line-height: 1.1;
  color: #fff;
  text-shadow: 0 0.3cqw 0.8cqw rgba(5, 14, 26, 0.6);
}
.reward__amount {
  display: block;
  margin-top: 1cqw;
  font-size: 8.4cqw; /* 50 / 600 */
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.01em;
  color: #fff;
  text-shadow: 0 0.4cqw 1cqw rgba(5, 14, 26, 0.65);
}
.reward__text {
  display: block;
  margin-top: 0.4cqw;
  font-size: 5.6cqw; /* 33 / 600 —— 长奖励标题，按原图比例 */
  font-weight: 800;
  line-height: 1.15;
  color: #fff;
  text-shadow: 0 0.4cqw 1cqw rgba(5, 14, 26, 0.65);
}

/* 底部按钮：原图实测 x 37..427 / y 864..926 → 左 4.4%、宽 49.6%、高 6.7%、距底 4.6%
   （比原图略大 2px，完整盖住照片里烘焙的按钮） */
.poster__btn {
  position: absolute;
  left: 4.4%;
  bottom: 4.6%;
  width: 49.6%;
  height: 6.7%;
  min-height: 32px;
  padding: 0;
  font-size: 2.7cqw; /* 16 / 600 */
  letter-spacing: 0.16em;
  text-indent: 0.16em;
  color: #a9bccd;
  background: rgba(19, 37, 57, 0.66);
  border: 1px solid rgba(150, 182, 214, 0.3);
  border-radius: 1px;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
}
.poster__btn:hover:not(:disabled) {
  color: #fff;
  background: var(--haavk-blue);
  border-color: var(--haavk-blue);
}
.poster__btn:disabled {
  cursor: not-allowed;
}

.mp-cards__empty {
  grid-column: 1 / -1;
  padding: 60px;
  text-align: center;
  color: var(--haavk-muted);
}

/* ---------------- 响应式 ---------------- */
@media (max-width: 1280px) {
  .poster__name {
    font-size: 8cqw;
  }
  .poster__tag {
    font-size: 2.6cqw;
    padding: 0.5cqw 1cqw;
  }
  .poster__code {
    font-size: 2.1cqw;
  }
}

@media (max-width: 1024px) {
  .mp-page__inner {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 18px;
  }
  .mp-page__side {
    height: auto;
  }
  .poster {
    max-width: 560px;
  }
}

@media (max-width: 640px) {
  .mp-cards {
    grid-template-columns: minmax(0, 1fr);
  }
  .poster {
    max-width: none;
  }
}
</style>
