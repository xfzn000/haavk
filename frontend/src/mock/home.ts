import heroPhoto1 from '@/assets/hero-photo-1.jpg'
import heroPhoto2 from '@/assets/hero-photo-2.jpg'
import heroPhoto3 from '@/assets/hero-photo-3.jpg'
import featurePhoto1 from '@/assets/employee-feature-1.webp'
import featurePhoto2 from '@/assets/employee-feature-2.webp'
import voicePhoto1 from '@/assets/employee-voice-1.webp'
import voicePhoto2 from '@/assets/employee-voice-2.webp'
import voicePhoto3 from '@/assets/employee-voice-3.webp'
import voicePhoto4 from '@/assets/employee-voice-4.webp'

/**
 * 首页展示数据（集中维护，方便后续替换素材与文案）
 * ------------------------------------------------------------------
 * 构图对齐参考图：
 * · Hero = 浅色背景带 + 人物立绘；人物向下延伸，压在员工展示区背后
 * · 优秀员工卡片：人物冲出卡片顶部
 * · 标题 / 副标题一律 HTML 文本（规范 §4.2 / §6.8）
 *
 * ⚠️ 素材替换说明：
 * · 优秀员工（克莱尔 / 莉娜）✅ **已换真实透明底立绘**（`employee-feature-1/2.webp`），
 *   `masked: false` → 人物完整、头部冲出卡片顶部。
 * · 员工之声 4 张 ✅ **已换真实透明底立绘**（`employee-voice-1..4.webp`），
 *   `masked: false` → 抠图模式（无遮罩）。四张已做「等大归一化」，见下方 `voiceSource` 注释。
 */

export interface HeroSlide {
  id: number
  /** 主标题（HTML 文本） */
  title: string
  /** 副标题（HTML 文本） */
  subtitle: string
  /**
   * 人物立绘图。占位阶段用带底色的横幅裁剪图；
   * 换成透明底抠图 PNG（人物完整、头顶留白）后效果最佳。
   */
  person: string
  /** true = 矩形占位照片（自动加底缘/侧缘渐隐遮罩）；抠图后改 false */
  masked: boolean
  /** 左下角 HUD 微标签 */
  hudLabel: string
}

export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: '天空属于哈夫克',
    subtitle: '执掌天穹，让人的文明在庇护之下繁荣昌盛。',
    person: heroPhoto1,
    masked: true,
    hudLabel: 'HAAVK // AIR DOMINION',
  },
  {
    id: 2,
    title: '力量，服务于人',
    subtitle: '每一次装备与流程的迭代，都为了让执行者平安归来。',
    person: heroPhoto2,
    masked: true,
    hudLabel: 'HAAVK // FIELD OPERATION',
  },
  {
    id: 3,
    title: '效率，铸就未来',
    subtitle: '让每一项资源归于效率，让每一个变量服从未来。',
    person: heroPhoto3,
    masked: true,
    hudLabel: 'HAAVK // RESOURCE CONTROL',
  },
]

/* ---------------------------- 员工展示区 ---------------------------- */

export interface FeaturedEmployee {
  id: number
  name: string
  /** 短标签 */
  tag: string
  /** 员工寄语（1~2 行） */
  quote: string[]
  /** 人物图（建议透明底抠图 PNG，人物完整、头顶留白） */
  image: string
  /** true = 矩形占位照片（自动遮罩）；抠图后改 false → 人物冲出卡片顶部 */
  masked: boolean
  theme: 'blue' | 'steel'
}

export interface EmployeeVoice {
  id: number
  name: string
  department: string
  quote: string
  image: string
  /** 同上：占位照片 true，抠图 PNG 改 false */
  masked: boolean
}

export const featuredEmployees: FeaturedEmployee[] = [
  {
    id: 101,
    name: '克莱尔',
    tag: '坚守本心',
    quote: ['知道我是谁', '才知为何而战'],
    image: featurePhoto1,
    masked: false,
    theme: 'blue',
  },
  {
    id: 102,
    name: '莉娜',
    tag: '科研投资回报案例',
    quote: ['个人表现灵感', '集团栽培进步'],
    image: featurePhoto2,
    masked: false,
    theme: 'steel',
  },
]

/**
 * 员工之声
 * ✅ **已换真实透明底立绘**（`employee-voice-1..4.webp`，来源 `Handbook/{磐石,夜枭,雷霆,道长}.png`），
 *    四张均为 `masked: false` → 抠图模式（人物完整、底对齐，无遮罩）。
 *
 * ⚠️ 素材统一规则（换图时必须遵守，否则「一个人大一个人小」）：
 *   处理脚本 `/tmp/prep_voices_final.py`：
 *   1. 取 alpha>32 的主体 bbox；
 *   2. **四张统一把主体高度缩放到 940px**（等大关键）；
 *   3. 贴进 **统一画布 780×1000**（宽高比 0.78，与卡片图片框 118×210 匹配）：
 *      水平居中、底边贴画布底；
 *   4. 存 WebP q88（带透明通道，40~64KB/张）。
 *   画布比例一致 → `object-fit: contain` 时四张渲染比例相同，人物自然等大。
 */
const voiceSource = [
  {
    id: 201,
    name: '磐石',
    department: '工程部门',
    quote: '不同职位大小\n奉献总有回报',
    image: voicePhoto1,
    masked: false,
  },
  {
    id: 202,
    name: '夜枭',
    department: '情报部门',
    quote: '先理解后执行\n理解越深越好',
    image: voicePhoto2,
    masked: false,
  },
  {
    id: 203,
    name: '雷霆',
    department: '安保部门',
    quote: '你们已经安全了\n剩下的交给我们',
    image: voicePhoto3,
    masked: false,
  },
  {
    id: 204,
    name: '道长',
    department: '后勤部门',
    quote: '敬畏未知的力量\n守护大家的平静',
    image: voicePhoto4,
    masked: false,
  },
]

export const employeeVoices: EmployeeVoice[] = voiceSource
