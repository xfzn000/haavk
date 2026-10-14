/**
 * 商品 / 横幅图片映射（本地素材注册表）
 * ------------------------------------------------------------------
 * 规则：**后端给的图优先，后端没给才用本地素材**。
 *  - 前台/后台拿到的商品若 `image` 为空，就按「商品名」在 BY_NAME 里取本地素材；
 *    取不到时回退到占位图，绝不出现破图。
 *  - 名字写法不一致（H89/H09、HVK-2/HVK2 之类）由 ALIAS 兜底。
 *
 * 后台要新增商品：
 *  1) 商品记录照常建。想用**外链/自己上传的图** → 把 `product.image` 填成图片 URL
 *     （http(s)://… 或 /uploads/xxx.png 均可），前端原样使用，不走这里；
 *  2) 想用**本地素材** → 在本文件 import 新图并加进 BY_NAME，商品名写成同名即可。
 *  3) 现成可用的素材名见 PRODUCT_IMAGE_NAMES。
 */
import bannerMhs from '@/assets/solution-banner.jpg'
import productTuring from '@/assets/product-turing.png'
import productH09 from '@/assets/product-h09.png'
import productMhs from '@/assets/product-mhs.png'
import productHmp from '@/assets/product-hmp.png'
import productHvk2 from '@/assets/product-hvk2.png'
import productAssault from '@/assets/product-assault.png'
import productAwm from '@/assets/product-awm.png'
import productM14 from '@/assets/product-m14.png'
import productM7 from '@/assets/product-m7.png'
import { productImage } from '@/assets/placeholder'

/** 商品名 → 本地素材 */
const BY_NAME: Record<string, string> = {
  图灵砖: productTuring,
  H09防爆头盔: productH09,
  MHS战术头盔: productMhs,
  HMP特勤防弹衣: productHmp,
  'Hvk-2防弹衣': productHvk2,
  突击手防弹背心: productAssault,
  AWM狙击步枪: productAwm,
  M14射手步枪: productM14,
  M7战斗步枪: productM7,
}

/** 别名 → BY_NAME 里的规范名（后台商品名写法不统一时兜底） */
const ALIAS: Record<string, string> = {
  H89防爆头盔: 'H09防爆头盔',
  H09防暴头盔: 'H09防爆头盔',
  HVK2防弹衣: 'Hvk-2防弹衣',
  'HVK-2防弹衣': 'Hvk-2防弹衣',
  HVK2: 'Hvk-2防弹衣',
}

/** 已有本地素材的商品名清单（后台加商品时可对照） */
export const PRODUCT_IMAGE_NAMES: string[] = Object.keys(BY_NAME)

/** 按商品名取本地素材；未知商品回退到占位图（不会出现破图） */
export function productImageFor(name: string): string {
  const key = (name ?? '').trim()
  return BY_NAME[key] ?? BY_NAME[ALIAS[key]] ?? productImage(key)
}

/** 横幅素材：MHS 战术头盔装备大图（已裁掉文字与指示器，5.44:1） */
export const bannerMhsImage = bannerMhs
