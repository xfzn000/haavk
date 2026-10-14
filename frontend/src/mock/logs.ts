import type { OperationLog } from '@/types'

/** 操作日志 Mock（后台） */
export const operationLogs: OperationLog[] = [
  { id: 1, admin: 'admin', action: '登录', target: '系统', ip: '192.168.10.24', createdAt: '2036-10-07 09:12:00' },
  { id: 2, admin: 'admin', action: '置顶', target: '帖子《关于重新规划公司论坛版块的公告》', ip: '192.168.10.24', createdAt: '2036-10-06 09:45:00' },
  { id: 3, admin: 'admin', action: '新增', target: '商品《MHS战术头盔》', ip: '192.168.10.24', createdAt: '2036-10-05 15:20:00' },
  { id: 4, admin: 'admin', action: '下架', target: '商品《图灵砖》', ip: '192.168.10.24', createdAt: '2036-10-05 15:31:00' },
  { id: 5, admin: 'admin', action: '编辑', target: '寻人启事 H42', ip: '192.168.10.24', createdAt: '2036-10-04 11:08:00' },
  { id: 6, admin: 'admin', action: '删除', target: '帖子《测试帖》', ip: '192.168.10.24', createdAt: '2036-10-03 18:02:00' },
  { id: 7, admin: 'admin', action: '上架', target: '寻人启事 大卫·费莱尔', ip: '192.168.10.24', createdAt: '2036-10-03 10:47:00' },
  { id: 8, admin: 'admin', action: '恢复', target: '帖子《让北极星重新引导方向！》', ip: '192.168.10.24', createdAt: '2036-10-02 16:33:00' },
]
