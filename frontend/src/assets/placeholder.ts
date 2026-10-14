/**
 * HUD 占位视觉生成器
 * ------------------------------------------------------------
 * 规则（来自 01-视觉规范）：不依赖必须联网的图片，
 * 用 CSS 渐变 / 本地占位图 / 伪元素模拟截图中的科技背景。
 * 这里用纯 SVG data-URI 生成头像与人物立绘占位，保证离线可用。
 */

/** 由字符串稳定派生一个整数种子 */
function seedOf(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

const HUES = [210, 200, 222, 195, 232, 205]

/** 头像占位：HUD 风格纯 SVG，取名字首字 */
export function avatar(name: string, size = 64): string {
  const seed = seedOf(name)
  const hue = HUES[seed % HUES.length]
  const initial = (name || '?').trim().charAt(0)
  const light = 62 - (seed % 10)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue} 60% ${light}%)"/>
<stop offset="1" stop-color="hsl(${hue} 55% ${light - 22}%)"/>
</linearGradient>
<pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
<path d="M6 0H0V6" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1"/>
</pattern></defs>
<rect width="64" height="64" fill="url(#g)"/>
<rect width="64" height="64" fill="url(#grid)"/>
<circle cx="32" cy="25" r="11" fill="rgba(255,255,255,.92)"/>
<path d="M11 60c2-13 11-19 21-19s19 6 21 19z" fill="rgba(255,255,255,.92)"/>
<text x="32" y="60" font-family="sans-serif" font-size="0" fill="#fff">${initial}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/**
 * 人物立绘占位：竖向大图，用于 Hero / 优秀员工 / 寻人启事。
 * 用「半身剪影 + HUD 装饰」表现，保证离线可用且比例自然。
 * @param label 图上显示的文字（如姓名）
 * @param tone  色调 blue | dark
 */
export function portrait(
  label: string,
  tone: 'blue' | 'dark' = 'blue',
  w = 420,
  h = 560,
): string {
  const seed = seedOf(label)
  const hue = tone === 'dark' ? 214 : HUES[seed % HUES.length]
  const c1 = tone === 'dark' ? 'hsl(214 24% 26%)' : `hsl(${hue} 62% 54%)`
  const c2 = tone === 'dark' ? 'hsl(214 28% 13%)' : `hsl(${hue} 60% 30%)`
  const code = String(1000 + (seed % 8999))

  const cx = w / 2
  const headR = w * 0.108
  const headCy = h * 0.3
  const shoulder = headCy + headR * 1.55
  const halfShoulder = w * 0.3
  const bodyTop = shoulder + h * 0.05

  const bust =
    `M${cx - halfShoulder} ${h} ` +
    `C${cx - halfShoulder} ${bodyTop} ${cx - halfShoulder * 0.55} ${shoulder} ${cx} ${shoulder} ` +
    `C${cx + halfShoulder * 0.55} ${shoulder} ${cx + halfShoulder} ${bodyTop} ${cx + halfShoulder} ${h} Z`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" fill="none" stroke="rgba(255,255,255,.10)" stroke-width="1"/></pattern>
<linearGradient id="sil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,255,255,.95)"/><stop offset="1" stop-color="rgba(255,255,255,.72)"/></linearGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<rect width="${w}" height="${h}" fill="url(#grid)"/>
<path d="M0 ${h * 0.66} L${w} ${h * 0.46} L${w} ${h} L0 ${h} Z" fill="rgba(255,255,255,.08)"/>
<path d="M0 ${h * 0.8} L${w} ${h * 0.64} L${w} ${h} L0 ${h} Z" fill="rgba(0,0,0,.16)"/>
<path d="${bust}" fill="url(#sil)"/>
<rect x="${cx - headR * 0.42}" y="${headCy + headR * 0.7}" width="${headR * 0.84}" height="${headR * 1.1}" fill="rgba(255,255,255,.9)"/>
<circle cx="${cx}" cy="${headCy}" r="${headR}" fill="rgba(255,255,255,.95)"/>
<line x1="${cx - halfShoulder * 1.12}" y1="${headCy}" x2="${cx - halfShoulder * 1.02}" y2="${headCy}" stroke="rgba(255,255,255,.5)" stroke-width="2"/>
<line x1="${cx + halfShoulder * 1.02}" y1="${headCy}" x2="${cx + halfShoulder * 1.12}" y2="${headCy}" stroke="rgba(255,255,255,.5)" stroke-width="2"/>
<text x="20" y="32" font-family="monospace" font-size="15" letter-spacing="2" fill="rgba(255,255,255,.7)">HAAVK / ${code}</text>
<text x="${w / 2}" y="${h - 24}" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="700" letter-spacing="5" fill="rgba(255,255,255,.9)">${label}</text>
<path d="M14 14 h24 M14 14 v24" stroke="rgba(255,255,255,.55)" stroke-width="2" fill="none"/>
<path d="M${w - 14} ${h - 14} h-24 M${w - 14} ${h - 14} v-24" stroke="rgba(255,255,255,.55)" stroke-width="2" fill="none"/>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** 商品图占位：方形，带器械质感 */
export function productImage(label: string, w = 480, h = 300): string {
  const seed = seedOf(label)
  const hue = 205 + (seed % 24)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue} 30% 88%)"/><stop offset="1" stop-color="hsl(${hue} 32% 72%)"/></linearGradient>
<pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="rgba(24,32,39,.08)" stroke-width="1"/></pattern></defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<rect width="${w}" height="${h}" fill="url(#grid)"/>
<g transform="translate(${w / 2} ${h / 2})">
<path d="M-90 -34 h180 v46 a24 24 0 0 1 -24 24 h-132 a24 24 0 0 1 -24 -24 z" fill="rgba(35,121,216,.30)" stroke="rgba(24,32,39,.35)" stroke-width="2"/>
<path d="M-64 36 q64 34 128 0" fill="none" stroke="rgba(24,32,39,.35)" stroke-width="2"/>
<rect x="-30" y="-58" width="60" height="20" rx="3" fill="rgba(24,32,39,.28)"/>
</g>
<text x="${w / 2}" y="${h - 18}" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="700" letter-spacing="4" fill="rgba(24,32,39,.72)">${label}</text>
<path d="M12 12 h22 M12 12 v22" stroke="rgba(24,32,39,.4)" stroke-width="2" fill="none"/>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** 通用横幅占位（Banner / Hero 背景） */
export function banner(label: string, w = 1000, h = 360): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1B5FAE"/><stop offset="1" stop-color="#252A30"/></linearGradient>
<pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M34 0H0V34" fill="none" stroke="rgba(88,184,244,.18)" stroke-width="1"/></pattern>
</defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<rect width="${w}" height="${h}" fill="url(#grid)"/>
<path d="M0 ${h} L${w * 0.4} ${h * 0.35} L${w} ${h} Z" fill="rgba(88,184,244,.12)"/>
<text x="40" y="${h / 2 - 6}" font-family="sans-serif" font-size="42" font-weight="800" letter-spacing="6" fill="rgba(255,255,255,.95)">${label}</text>
<path d="M16 16 h30 M16 16 v30" stroke="rgba(88,184,244,.8)" stroke-width="2" fill="none"/>
<path d="M${w - 16} ${h - 16} h-30 M${w - 16} ${h - 16} v-30" stroke="rgba(88,184,244,.8)" stroke-width="2" fill="none"/>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
