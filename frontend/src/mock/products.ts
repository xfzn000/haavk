import { productImageFor, bannerMhsImage } from '@/assets/product-images'
import type { Product } from '@/types'

/** 横幅轮播单张 */
export interface SolutionBanner {
  id: number
  title: string
  subtitle: string
  image: string
  /** 素材本身足够宽（≥3:1）→ 直接铺满；否则用「模糊底 + 居中清晰图」 */
  wide: boolean
  sellingPoints: { name: string; desc: string }[]
}

/**
 * 解决方案页顶部横幅轮播（3 张，与 3 件商品一一对应）
 * —— 指示器可点击切换，6s 自动轮播、悬停暂停（见 SolutionsPage.vue）
 */
export const solutionBanners: SolutionBanner[] = [
  {
    id: 1,
    title: 'MHS战术头盔',
    subtitle: '长官的指令就戴在您头上',
    image: bannerMhsImage,
    wide: true,
    sellingPoints: [
      { name: '冲击缓释', desc: '保护头部安全' },
      { name: '主动听觉', desc: '强化关键声源' },
      { name: '强制通信', desc: '确保收到命令' },
    ],
  },
  {
    id: 2,
    title: 'H09防爆头盔',
    subtitle: '机航派遣队制式装备',
    image: productImageFor('H09防爆头盔'),
    wide: false,
    sellingPoints: [
      { name: '抗冲击外壳', desc: '复合材料一体成型' },
      { name: '可换护目镜', desc: '快速拆装免工具' },
      { name: '全队配发', desc: '机航派遣队标准制式' },
    ],
  },
  {
    id: 3,
    title: '图灵砖',
    subtitle: '随机算法蕴藏惊喜',
    image: productImageFor('图灵砖'),
    wide: false,
    sellingPoints: [
      { name: '智能平台', desc: '先进智能技术先锋架构' },
      { name: '随机算法', desc: '结果不可预测' },
      { name: '限量发行', desc: '售出不退' },
    ],
  },
]

/** 兼容旧引用：默认（首张）横幅 */
export const solutionBanner = solutionBanners[0]

/** 商品列表 Mock（严格对齐截图） */
export const products: Product[] = [
  {
    id: 1,
    name: '图灵砖',
    image: productImageFor('图灵砖'),
    description: '搭载先进智能技术的先锋平台，随机算法蕴藏惊喜。',
    details: ['内置随机算法模块', '可接入集团终端', '限量发行，售出不退'],
    price: 300000,
    purchaseLimit: 5,
    soldCount: 5,
    status: 'ON_SALE',
    sort: 1,
  },
  {
    id: 2,
    name: 'H09防爆头盔',
    image: productImageFor('H09防爆头盔'),
    description: '机航派遣队制式装备，非机航组员工购买前建议先咨询主管意见。',
    details: ['抗冲击复合材料外壳', '护目镜可更换', '机航派遣队标准配发'],
    price: 350000,
    purchaseLimit: 1,
    soldCount: 1,
    status: 'ON_SALE',
    sort: 2,
  },
  {
    id: 3,
    name: 'MHS战术头盔',
    image: productImageFor('MHS战术头盔'),
    description: '强制听力辅助装置确保您再也不会错过上级的命令。',
    details: ['主动降噪 + 关键声源强化', '内置强制通信模块', '指挥链指令优先'],
    price: 120000,
    purchaseLimit: 2,
    soldCount: 2,
    status: 'ON_SALE',
    sort: 3,
  },
  {
    id: 4,
    name: 'HMP特勤防弹衣',
    image: productImageFor('HMP特勤防弹衣'),
    description: '轻薄耐用，工伤补贴和装备成本的绝佳平衡。',
    details: ['轻量化复合材质，几乎无行动惩罚', '仅防护胸、腹部', '耐久偏低，请及时更换'],
    price: 100000,
    purchaseLimit: 2,
    soldCount: 2,
    status: 'ON_SALE',
    sort: 4,
  },
  {
    id: 5,
    name: 'Hvk-2防弹衣',
    image: productImageFor('Hvk-2防弹衣'),
    description: '此护甲的生命周期往往高于我集团员工平均任职时长，请务必珍惜。',
    details: ['防护胸、腹、肩部', '五级防弹标准，耐久度 115', '移动速度 -7%、瞄准速度 -8%'],
    price: 325000,
    purchaseLimit: 1,
    soldCount: 1,
    status: 'ON_SALE',
    sort: 5,
  },
  {
    id: 6,
    name: '突击手防弹背心',
    image: productImageFor('突击手防弹背心'),
    description: '防御面积升级，推荐执行高危安保任务的员工选购本品。',
    details: ['防护胸、腹部', '四级防弹标准，耐久度 90', '移动速度 -1%、瞄准速度 -2%'],
    price: 129000,
    purchaseLimit: 2,
    soldCount: 2,
    status: 'ON_SALE',
    sort: 6,
  },
  {
    id: 7,
    name: 'AWM狙击步枪',
    image: productImageFor('AWM狙击步枪'),
    description: '采用 .338 Lapua Magnum 弹药，精度与射程俱佳的顶级狙击武器。',
    details: ['口径：.338 Lapua Magnum', '极高精度与超远射程', '建议由资深员工申领'],
    price: 800000,
    purchaseLimit: 1,
    soldCount: 1,
    status: 'ON_SALE',
    sort: 7,
  },
  {
    id: 8,
    name: 'M14射手步枪',
    image: productImageFor('M14射手步枪'),
    description: '7.62×51mm 全威力步枪，切换至全自动射击模式后火力凶猛。',
    details: ['口径：7.62×51mm', '支持全自动射击模式', '经典平台，配件生态成熟'],
    price: 150000,
    purchaseLimit: 1,
    soldCount: 1,
    status: 'ON_SALE',
    sort: 8,
  },
  {
    id: 9,
    name: 'M7战斗步枪',
    image: productImageFor('M7战斗步枪'),
    description: '采用 6.8×51mm 全威力弹药的新式步枪，兼顾威力与操控。',
    details: ['口径：6.8×51mm', '新式枪族平台', '配件拓展性良好'],
    price: 250000,
    purchaseLimit: 1,
    soldCount: 1,
    status: 'ON_SALE',
    sort: 9,
  },
]

export function findProduct(id: number): Product | undefined {
  return products.find((p) => p.id === id)
}
