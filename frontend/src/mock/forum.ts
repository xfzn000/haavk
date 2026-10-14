import { avatar } from '@/assets/placeholder'
import type { ForumPost, ForumReply } from '@/types'

/**
 * 论坛 Mock（严格对齐 02/03 阶段截图）
 * 列表列：标题 | 发帖人 | 回复(未读/总数) | 最后回复
 */
export const forumPosts: ForumPost[] = [
  {
    id: 1,
    title: '关于重新规划公司论坛版块的公告',
    authorId: 1,
    authorName: '阿娜伊斯·德穆兰',
    authorAvatar: avatar('阿娜伊斯·德穆兰'),
    department: '安全防卫部',
    tag: '安全总监',
    content: `哈夫克公司 · 安全防卫部

致全体员工及各界人士：

论坛是公司内外沟通的窗口。我们始终相信，信任是员工与公司共同发展的基石，而来自各方的信息，同样是安全防卫部研判形势、守护公司利益的重要资料。

近期论坛环境日趋复杂，无序的交流既无法保障员工表达的安全，也无法完整呈现外部的真实声音。经安全防卫部评估，与其被动放任，不如主动重建秩序。公司决定：暂时关闭论坛，全面调整版块架构：实行内部发言与外部发言严格隔离，并为外部人员设立单独发言空间。

我们相信，清晰、受保护的内部空间，能让员工更全身心信赖公司，安心与公司共同发展；规范、畅通的外部渠道，能让每一份信息被妥善接收与记录，成为公司研判与决策的依据。秩序与安全，是哈夫克在阿萨拉长远发展的根基。

论坛恢复时间另行通知，期间沟通请通过公司指定渠道进行。隔离并非疏远，而是为了让每一次交流都更有价值。`,
    createdAt: '2036-10-06 09:41:00',
    likes: 1158,
    replyCount: 0,
    unreadReplyCount: 0,
    pinned: true,
    unread: false,
    unreadReply: false,
    status: 'ON_SALE',
    lastReplyBy: '',
    lastReplyAt: '',
  },
  {
    id: 2,
    title: '让北极星重新引导方向！',
    authorId: 2,
    authorName: '誓死效忠德穆兰',
    authorAvatar: avatar('誓死效忠德穆兰'),
    department: '安全防卫部',
    content:
      '我们曾用北极星校准每一次航向。现在，我建议重启「北极星」计划，把情报链路重新拉直。\n\n坐标、信号、暗语——一个都不能少。',
    createdAt: '2036-10-05 21:40:00',
    likes: 88,
    replyCount: 17,
    unreadReplyCount: 0,
    pinned: false,
    unread: true,
    unreadReply: false,
    status: 'ON_SALE',
    lastReplyBy: '誓死效忠德穆兰',
    lastReplyAt: '2036-10-06 08:31:00',
  },
  {
    id: 3,
    title: '【表彰】"解决方案"资料涨价已为公司创造可观收益',
    authorId: 3,
    authorName: '首席执行官秘书',
    authorAvatar: avatar('首席执行官秘书'),
    department: '哈德森办公室',
    content:
      '经核算，「解决方案」资料本轮调价后，累计为公司创造超额收益。感谢工程与供应链同事的配合。\n\n装备即战力，价格即门槛。',
    createdAt: '2036-10-05 14:20:00',
    likes: 120,
    replyCount: 2,
    unreadReplyCount: 0,
    pinned: false,
    unread: false,
    unreadReply: true,
    status: 'ON_SALE',
    lastReplyBy: '首席执行官秘书',
    lastReplyAt: '2036-10-05 19:55:00',
  },
  {
    id: 4,
    title: '哈夫克的走狗们，这是最后通牒！',
    authorId: 4,
    authorName: '阿萨拉之光',
    authorAvatar: avatar('阿萨拉之光'),
    department: '员工未注册',
    tag: '阿萨拉本地IP',
    content: '哈夫克的走狗们，你们已经惹怒了阿萨拉的神祇与人民！',
    createdAt: '2036-10-06 16:08:00',
    likes: 135,
    replyCount: 11,
    unreadReplyCount: 0,
    pinned: false,
    unread: true,
    unreadReply: false,
    status: 'ON_SALE',
    lastReplyBy: '阿萨拉之光',
    lastReplyAt: '2036-10-07 09:20:00',
  },
  {
    id: 5,
    title: 'Wagaaaaaaaaaaaaaaaarr!',
    authorId: 5,
    authorName: 'Wagaaaarrr',
    authorAvatar: avatar('Wagaaaarrr'),
    department: '员工未注册',
    content: 'Wagaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaarr!',
    createdAt: '2036-10-04 23:05:00',
    likes: 66,
    replyCount: 9,
    unreadReplyCount: 0,
    pinned: false,
    unread: false,
    unreadReply: false,
    status: 'ON_SALE',
    lastReplyBy: '大坝生态保护家',
    lastReplyAt: '2036-10-05 09:10:00',
  },
  {
    id: 6,
    title: '哈夫克的走狗敢不敢出来正面说话？',
    authorId: 7,
    authorName: '蛋蛋',
    authorAvatar: avatar('蛋蛋'),
    department: '员工未注册',
    content: '躲在屏幕后面的你们，连一次正面的回应都不敢给吗？',
    createdAt: '2036-10-04 12:47:00',
    likes: 54,
    replyCount: 17,
    unreadReplyCount: 0,
    pinned: false,
    unread: true,
    unreadReply: false,
    status: 'ON_SALE',
    lastReplyBy: '金木木',
    lastReplyAt: '2036-10-04 16:40:00',
  },
  {
    id: 7,
    title: '让员工有地方表达意见',
    authorId: 9,
    authorName: '牧羊人',
    authorAvatar: avatar('牧羊人'),
    department: '员工未注册',
    content: '论坛存在的意义，就是让每一个人都能把话说出来。\n\n请保留一个可以正常表达的角落。',
    createdAt: '2036-10-03 20:15:00',
    likes: 47,
    replyCount: 5,
    unreadReplyCount: 0,
    pinned: false,
    unread: false,
    unreadReply: true,
    status: 'ON_SALE',
    lastReplyBy: '上班只为下班',
    lastReplyAt: '2036-10-04 08:02:00',
  },
  {
    id: 8,
    title: '关于本周维护安排的说明',
    authorId: 3,
    authorName: '首席执行官秘书',
    authorAvatar: avatar('首席执行官秘书'),
    department: '哈德森办公室',
    content: '本周将对论坛服务进行例行维护，期间发帖与回复功能可能短时不可用。\n\n维护窗口：每周三 02:00 - 04:00。',
    createdAt: '2036-10-02 10:30:00',
    likes: 31,
    replyCount: 0,
    unreadReplyCount: 0,
    pinned: false,
    unread: false,
    unreadReply: false,
    status: 'ON_SALE',
    lastReplyBy: '',
    lastReplyAt: '',
  },
]

/** 回复 Mock（严格对齐帖子详情截图） */
export const forumReplies: ForumReply[] = [
  // ── post 2 ─────────────────────────────────────────
  {
    id: 201,
    postId: 2,
    authorId: 12,
    authorName: '磐石',
    authorAvatar: avatar('磐石'),
    department: '工程部门',
    tag: '高级工程师',
    content: '基建这块我熟，需要搭中继站说一声。',
    createdAt: '2036-10-06 08:31:00',
  },
  {
    id: 202,
    postId: 2,
    authorId: 15,
    authorName: '道长',
    authorAvatar: avatar('道长'),
    department: '后勤部门',
    tag: '后勤主管',
    content: '物资清单先给我，我按三遍算。',
    createdAt: '2036-10-06 07:12:00',
  },
  // ── post 3 ─────────────────────────────────────────
  {
    id: 301,
    postId: 3,
    authorId: 15,
    authorName: '道长',
    authorAvatar: avatar('道长'),
    department: '后勤部门',
    tag: '后勤主管',
    content: '账目已复核，数字对得上。',
    createdAt: '2036-10-05 19:55:00',
  },
  // ── post 4（截图 5 条）──────────────────────────────
  {
    id: 401,
    postId: 4,
    authorId: 4,
    authorName: '阿萨拉之光',
    authorAvatar: avatar('阿萨拉之光'),
    department: '员工未注册',
    tag: '阿萨拉本地IP',
    content: '但最重要的是，你们不该惹怒我——阿萨拉的明日之光！',
    createdAt: '2036-10-06 19:26:00',
  },
  {
    id: 402,
    postId: 4,
    authorId: 4,
    authorName: '阿萨拉之光',
    authorAvatar: avatar('阿萨拉之光'),
    department: '员工未注册',
    tag: '阿萨拉本地IP',
    content: '这份讯息是我向你们发出的最后通牒！',
    createdAt: '2036-10-07 06:05:00',
  },
  {
    id: 403,
    postId: 4,
    authorId: 10,
    authorName: '上班只为下班',
    authorAvatar: avatar('上班只为下班'),
    department: '后勤保障部',
    tag: '守护采购员',
    content: '能先炸我工位这栋楼吗',
    createdAt: '2036-10-07 06:34:00',
  },
  {
    id: 404,
    postId: 4,
    authorId: 11,
    authorName: '哈夫克第一深情',
    authorAvatar: avatar('哈夫克第一深情'),
    department: '技术工程部',
    tag: '中级工程师',
    content: '哪来的中二病？',
    createdAt: '2036-10-07 07:58:00',
  },
  {
    id: 405,
    postId: 4,
    authorId: 4,
    authorName: '阿萨拉之光',
    authorAvatar: avatar('阿萨拉之光'),
    department: '员工未注册',
    tag: '阿萨拉本地IP',
    content:
      '在下一周之前，我要在巴克斯洛谷场出门左转的第二个井盖下头见到装满了一千万哈夫币的钞票的口袋！',
    createdAt: '2036-10-07 09:20:00',
  },
  // ── post 5 ─────────────────────────────────────────
  {
    id: 501,
    postId: 5,
    authorId: 10,
    authorName: '上班只为下班',
    authorAvatar: avatar('上班只为下班'),
    department: '后勤保障部',
    tag: '守护采购员',
    content: '不是，那动静是你能封得住的吗',
    createdAt: '2036-10-05 09:10:00',
  },
  // ── post 6 ─────────────────────────────────────────
  {
    id: 601,
    postId: 6,
    authorId: 8,
    authorName: '金木木',
    authorAvatar: avatar('金木木'),
    department: '员工未注册',
    content: '有本事报个坐标？',
    createdAt: '2036-10-04 16:40:00',
  },
]

/** 左栏说明文案（三页共用结构；论坛页文案严格对齐参考图） */
export const forumRules = {
  title: '员工论坛',
  desc: [
    '所有的发言都必须扣除员工个人账户中相应的注意力点数。',
    '注意力点数不足者禁止继续使用论坛，违者按无故旷工交效能部严办。',
  ],
  tip: '请注意维护符合集团价值的舆论导向，曼德尔特智能系统将自动检测当前舆情的主要特点并总结如下：',
  keywords: [
    { name: '人效调和', desc: '在本人关切与执行效率之间，我们正努力寻找平衡。' },
    { name: '有限接触', desc: '与阿萨拉的合作是权宜手段，对阿萨拉的警惕是长期原则。' },
    { name: '议论沸腾', desc: '论坛讨论已经在全集团沸腾，表达意见成了新的业务。' },
  ],
}

export const solutionRules = {
  title: '解决方案',
  desc: [
    '集团员工有义务在执行勤务时自费购买集团装备。',
    '所有员工严禁使用来自第三方的不可靠装备。',
  ],
  tip: '集团致力于持续研发优质产品，为复杂的战场提供丰富的解决方案。',
  keywords: [
    { name: '军工品质', desc: '哈夫克制品总能经受战火的考验' },
    { name: '物美价廉', desc: '部分物品价格下调，想必是集团最新的惠民举措' },
    { name: '精益求精', desc: '部分物品价格上涨，更体现了集团精益求精的精神' },
  ],
}

export const missingRules = {
  title: '寻人启事',
  desc: [
    '为保障集团员工与阿萨拉地区居民安全，哈夫克集团对部分失联人员持续加以特别关注。',
    '集团员工或社会人士如能提供这些失联人士的有效信息，集团会发放合理的奖励。',
    '我们相信，每一位失联人员都有回家的权利。让我们一起献出爱心，伸出援手，帮他们早日回家。',
    '哈夫克集团保留对"回家"的全部解释权。',
  ],
  tip: '',
  keywords: [],
}

/** 底部筛选栏选项（与参考图一致；点击切换筛选，列表同步过滤） */
export type ForumFilterKey = 'pinned' | 'unread' | 'unreadReply' | 'read'

export const forumFilters: { key: ForumFilterKey; label: string }[] = [
  { key: 'pinned', label: '系统置顶' },
  { key: 'unread', label: '全新未读' },
  { key: 'unreadReply', label: '有未读回复' },
  { key: 'read', label: '全部已读' },
]

export function findPost(id: number): ForumPost | undefined {
  return forumPosts.find((p) => p.id === id)
}

/** 按时间正序（截图右侧动态为时间递增） */
export function repliesOf(postId: number): ForumReply[] {
  return forumReplies
    .filter((r) => r.postId === postId)
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}
