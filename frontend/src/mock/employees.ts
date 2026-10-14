import { avatar } from '@/assets/placeholder'
import type { Employee } from '@/types'

/** 全体员工（含发帖人身份信息，部门/标签严格对齐截图） */
export const employees: Employee[] = [
  { id: 1, name: '阿娜伊斯·德穆兰', avatar: avatar('阿娜伊斯·德穆兰'), department: '安全防卫部', role: '安全总监', attentionPoints: 11447, status: 1 },
  { id: 2, name: '誓死效忠德穆兰', avatar: avatar('誓死效忠德穆兰'), department: '安全防卫部', role: '安全专员', attentionPoints: 8120, status: 1 },
  { id: 3, name: '首席执行官秘书', avatar: avatar('首席执行官秘书'), department: '哈德森办公室', role: '秘书', attentionPoints: 9900, status: 1 },
  { id: 4, name: '阿萨拉之光', avatar: avatar('阿萨拉之光'), department: '员工未注册', role: '员工未注册', attentionPoints: 0, status: 0 },
  { id: 5, name: 'Wagaaaarrr', avatar: avatar('Wagaaaarrr'), department: '员工未注册', role: '员工未注册', attentionPoints: 0, status: 0 },
  { id: 6, name: '大坝生态保护家', avatar: avatar('大坝生态保护家'), department: '员工未注册', role: '员工未注册', attentionPoints: 0, status: 0 },
  { id: 7, name: '蛋蛋', avatar: avatar('蛋蛋'), department: '员工未注册', role: '员工未注册', attentionPoints: 0, status: 0 },
  { id: 8, name: '金木木', avatar: avatar('金木木'), department: '员工未注册', role: '员工未注册', attentionPoints: 0, status: 0 },
  { id: 9, name: '牧羊人', avatar: avatar('牧羊人'), department: '员工未注册', role: '员工未注册', attentionPoints: 0, status: 0 },
  { id: 10, name: '上班只为下班', avatar: avatar('上班只为下班'), department: '后勤保障部', role: '守护采购员', attentionPoints: 2044, status: 1 },
  { id: 11, name: '哈夫克第一深情', avatar: avatar('哈夫克第一深情'), department: '技术工程部', role: '中级工程师', attentionPoints: 1889, status: 1 },
  { id: 12, name: '磐石', avatar: avatar('磐石'), department: '工程部门', role: '高级工程师', attentionPoints: 5120, status: 1 },
  { id: 13, name: '夜枭', avatar: avatar('夜枭'), department: '情报部门', role: '情报分析员', attentionPoints: 6310, status: 1 },
  { id: 14, name: '雷霆', avatar: avatar('雷霆'), department: '安保部门', role: '安保专员', attentionPoints: 4775, status: 1 },
  { id: 15, name: '道长', avatar: avatar('道长'), department: '后勤部门', role: '后勤主管', attentionPoints: 3508, status: 1 },
]

/** 当前登录用户（前台） */
export const currentUser: Employee = employees[0]

/* 说明：首页「优秀员工 / 员工之声」的展示数据已集中到 src/mock/home.ts */

export function findEmployee(id: number): Employee | undefined {
  return employees.find((e) => e.id === id)
}
