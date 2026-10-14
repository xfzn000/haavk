import { missingPersonImageFor } from '@/assets/missing-person-images'
import type { MissingPerson } from '@/types'

/** 寻人启事 Mock（严格对齐截图；人物名用游戏内叫法：无名 / 乌鲁鲁） */
export const missingPersons: MissingPerson[] = [
  {
    id: 1,
    name: '无名',
    code: '2351',
    image: missingPersonImageFor('无名'),
    subtitle: '不善言语  神出鬼没',
    description: '亟需返回集团接受脑机康复训练',
    rewardType: '悬赏哈夫币总额',
    rewardText: '',
    rewardAmount: 999999999,
    submitted: false,
    status: 'ON_SALE',
    sort: 1,
  },
  {
    id: 2,
    name: '乌鲁鲁',
    code: '7581',
    image: missingPersonImageFor('乌鲁鲁'),
    subtitle: '纵火惯犯  驯养鳄鱼',
    description: '亟需返回集团监狱参加工程建设',
    rewardType: '举报奖励',
    rewardText: '园区鳄鱼喂养体验',
    rewardAmount: 0,
    submitted: false,
    status: 'ON_SALE',
    sort: 2,
  },
]

export function findMissingPerson(id: number): MissingPerson | undefined {
  return missingPersons.find((m) => m.id === id)
}
