import missingUluru from '@/assets/missing-uluru.jpg'
import missingWuming from '@/assets/missing-wuming.jpg'

/**
 * 寻人启事人物图注册表
 * 取图优先级：后台 `image` 有值 → 原样用（外链或 /uploads/xxx.png）；为空 → 按姓名取本地素材；再取不到 → 占位图。
 * 以后在后台新增寻人启事，只要姓名写成下面注册过的名字（或别名），图会自动匹配上，不用改前端。
 */
const BY_NAME: Record<string, string> = {
  无名: missingWuming,
  乌鲁鲁: missingUluru,
}

/** 别名 → 注册表里的规范名（游戏内的原名/代号写法兜底） */
const ALIAS: Record<string, string> = {
  H42: '无名',
  埃利·德·蒙贝尔: '无名',
  Nox: '无名',
  '大卫·费莱尔': '乌鲁鲁',
  '大卫费莱尔': '乌鲁鲁',
  Uluru: '乌鲁鲁',
  大卫: '乌鲁鲁',
}

export function missingPersonImageFor(name: string): string {
  const key = name?.trim()
  if (key && BY_NAME[key]) return BY_NAME[key]
  const alias = key ? ALIAS[key] : undefined
  if (alias && BY_NAME[alias]) return BY_NAME[alias]
  return ''
}

/**
 * 没配图时的竖版占位（卡片比例 620×754）
 * 刻意做成「干净的深蓝面板 + 人物轮廓线」，不写文字 —— 免得跟卡片上真正的姓名/描述打架。
 */
function emptyPortrait(w = 620, h = 754): string {
  const cx = w * 0.5
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
<linearGradient id="g" x1="0" y1="0" x2=".55" y2="1">
<stop offset="0" stop-color="#3a6598"/><stop offset="1" stop-color="#182a40"/>
</linearGradient>
<pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
<path d="M34 0H0V34" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="1"/></pattern>
</defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<rect width="${w}" height="${h}" fill="url(#grid)"/>
<g fill="none" stroke="rgba(226,238,252,.34)" stroke-width="${Math.max(2, w * 0.005)}">
<circle cx="${cx}" cy="${h * 0.4}" r="${w * 0.115}"/>
<path d="M${w * 0.27} ${h * 0.66} q${w * 0.23} -${h * 0.17} ${w * 0.46} 0"/>
</g>
<g fill="rgba(226,238,252,.5)" font-family="monospace" font-size="${w * 0.036}" letter-spacing="${w * 0.006}">
<text x="${w * 0.06}" y="${h * 0.955}">NO PORTRAIT</text>
</g>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/**
 * 前台/后台共用：解析一张寻人启事的展示图
 * ① 后台 `image` 有值 → 原样用（外链或 /uploads/xxx.png）
 * ② 按姓名命中本地注册表 → 用本地素材
 * ③ 都没有 → 深蓝占位面板，**永远不会出现空图/破图**
 */
export function resolveMissingPersonImage(m: { name: string; image?: string | null }): string {
  const img = typeof m.image === 'string' ? m.image.trim() : ''
  if (img) return img
  return missingPersonImageFor(m.name) || emptyPortrait()
}

/** 是否有对应的本地素材（后台可据此提示"该名字可用内置素材"） */
export function hasLocalMissingPersonImage(name: string): boolean {
  return !!missingPersonImageFor(name)
}

/** 已注册的素材名清单（后台可参考） */
export const MISSING_PERSON_IMAGE_NAMES = Object.keys(BY_NAME)
