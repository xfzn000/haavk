/**
 * HAAVK 全局数据类型定义
 * 与后端 04-后端与数据库.md 中的表结构保持一致（驼峰命名）。
 */

/** 业务状态机：草稿 / 上架 / 下架 / 已删除 */
export type BizStatus = 'DRAFT' | 'ON_SALE' | 'OFF_SALE' | 'DELETED'

/** 员工 / 发帖人 */
export interface Employee {
  id: number
  name: string
  avatar: string
  department: string
  role: string
  /** 注意力点数 */
  attentionPoints: number
  status: number
  createdAt?: string
  updatedAt?: string
}

/** 论坛帖子 */
export interface ForumPost {
  id: number
  title: string
  authorId: number
  authorName: string
  authorAvatar: string
  department: string
  tag?: string
  content: string
  /** 配图地址列表（由后端 /api/upload 返回的 /uploads/... 组成；后端保证是数组） */
  images?: string[]
  createdAt: string
  likes: number
  replyCount: number
  /** 未读回复数（列表列显示为 `未读/总数`） */
  unreadReplyCount?: number
  pinned: boolean
  unread: boolean
  /** 有未读回复 */
  unreadReply?: boolean
  status?: BizStatus
  /** 最后回复人 */
  lastReplyBy?: string
  lastReplyAt?: string
}

/** 论坛回复 */
export interface ForumReply {
  id: number
  postId: number
  authorId: number
  authorName: string
  authorAvatar: string
  department: string
  tag?: string
  content: string
  /** 配图地址列表 */
  images?: string[]
  createdAt: string
}

/** 商品（解决方案） */
export interface Product {
  id: number
  name: string
  /** 展示用图片：可能是后台填的地址，也可能是按商品名命中的本地素材/占位图（由 enrich 解析） */
  image: string
  /** 后台真正填的图片地址（未解析的原始值），后台表单回填用，避免把解析结果写回数据库 */
  rawImage?: string
  description: string
  /** 物品详情（多行） */
  details: string[]
  price: number
  /** 限购上限 */
  purchaseLimit: number
  /** 已售数量 */
  soldCount: number
  status: BizStatus
  sort: number
  createdAt?: string
  updatedAt?: string
}

/** 寻人启事 */
export interface MissingPerson {
  id: number
  name: string
  code: string
  /** 展示用图片：可能是后台填的地址，也可能是按姓名命中的本地素材/占位图（由 enrich 解析） */
  image: string
  /** 后台真正填的图片地址（未解析的原始值），后台表单回填用，避免把解析结果写回数据库 */
  rawImage?: string
  subtitle: string
  description: string
  rewardType: string
  rewardText: string
  rewardAmount: number
  /** 线索是否已提交（后端字段，落库持久） */
  submitted?: boolean
  status: BizStatus
  sort: number
}

/** 操作日志 */
export interface OperationLog {
  id: number
  admin: string
  /** 操作类型：登录/新增/编辑/删除/上架/下架/置顶/恢复 */
  action: string
  target: string
  ip: string
  createdAt: string
}

/** 优秀员工（关于我们） */
export interface StarEmployee {
  id: number
  name: string
  avatar: string
  department: string
  quote: string[]
  theme: 'blue' | 'dark'
}

/** 员工之声 */
export interface EmployeeVoice {
  id: number
  name: string
  department: string
  avatar: string
  quote: string
}

/* ------------------------- 后端统一返回结构 ------------------------- */

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  page: number
  pageSize: number
}

/** 分页查询参数 */
export interface PageQuery {
  page?: number
  pageSize?: number
  keyword?: string
  status?: BizStatus | ''
}

/**
 * 注意力点数（右上角展示）
 * 后端约定接口：`GET /api/me/attention-points` → `Result<AttentionPoints>`
 * （登录态取自 JWT，无需传参；后端已实现 —— 每日重置：普通用户 10000 / 管理员 1000000）
 */
export interface AttentionPoints {
  points: number
  updatedAt?: string
}

/** 后台登录响应 */
export interface LoginResult {
  token: string
  username: string
  nickname?: string
  /** 角色：ADMIN=管理员（可进后台）/ USER=普通用户（默认，只能看前台） */
  role?: string
}

/** 后台统计数据 */
export interface DashboardStats {
  postTotal: number
  postToday: number
  productTotal: number
  productOnSale: number
  missingPersonTotal: number
  employeeTotal: number
}
