/**
 * 活动模板库
 * 节日活动、角色生日、联动活动模板
 */

import type { EventType, BudgetLevel } from '@/types/template';

export interface EventTemplate {
  id: string;
  type: EventType;
  name: string;
  description: string;
  rewards: string[];
  mechanics: string[];
  duration: number; // 活动持续天数
  budget: BudgetLevel;
}

// 节日活动模板
const festivalTemplates: Omit<EventTemplate, 'id'>[] = [
  {
    type: 'festival',
    name: '情人节限定活动',
    description: '与心爱的他共度浪漫情人节，解锁专属剧情和限定礼物',
    rewards: ['情人节限定卡', '巧克力礼盒', '专属头像框', '钻石×500'],
    mechanics: ['登录送礼', '限时剧情', '礼物交换'],
    duration: 7,
    budget: '高'
  },
  {
    type: 'festival',
    name: '七夕鹊桥会',
    description: '七夕佳节，牛郎织女相会，你的他又会给你带来什么惊喜？',
    rewards: ['七夕限定服装', '鹊桥头像框', '缘分值×100', '钻石×300'],
    mechanics: ['许愿活动', '缘分测试', '限时抽卡'],
    duration: 5,
    budget: '中'
  },
  {
    type: 'festival',
    name: '圣诞狂欢夜',
    description: '白雪皑皑的圣诞节，和他一起度过温馨的冬日时光',
    rewards: ['圣诞限定CG', '雪人宠物', '圣诞装扮', '钻石×400'],
    mechanics: ['登录签到', '限时剧情', '收集活动'],
    duration: 10,
    budget: '高'
  },
  {
    type: 'festival',
    name: '新年庆典',
    description: '辞旧迎新，和他一起迎接新年的第一缕阳光',
    rewards: ['新年限定卡', '红包×10', '新年头像框', '钻石×1000'],
    mechanics: ['登录送礼', '新年剧情', '抽奖活动'],
    duration: 14,
    budget: '高'
  },
  {
    type: 'festival',
    name: '白色情人节回礼',
    description: '收到他的回礼，感受满满的爱意',
    rewards: ['回礼礼盒', '专属语音', '白色头像框', '钻石×300'],
    mechanics: ['回礼活动', '限时剧情'],
    duration: 3,
    budget: '中'
  },
  {
    type: 'festival',
    name: '万圣节派对',
    description: '不给糖就捣蛋！和他一起参加万圣节化妆派对',
    rewards: ['万圣节装扮', '南瓜灯宠物', '限定CG', '钻石×300'],
    mechanics: ['化妆舞会', '糖果收集', '限时剧情'],
    duration: 5,
    budget: '中'
  },
  {
    type: 'festival',
    name: '春季樱花祭',
    description: '樱花盛开的季节，和他一起去赏樱吧',
    rewards: ['樱花限定卡', '野餐套装', '樱花头像框', '钻石×400'],
    mechanics: ['赏樱活动', '拍照打卡', '限时剧情'],
    duration: 7,
    budget: '中'
  },
  {
    type: 'festival',
    name: '夏日海滩派对',
    description: '炎炎夏日，和他一起去海边消暑吧',
    rewards: ['泳装限定', '沙滩排球', '夏日CG', '钻石×400'],
    mechanics: ['海滩活动', '限时剧情', '收集贝壳'],
    duration: 7,
    budget: '中'
  },
  {
    type: 'festival',
    name: '中秋赏月会',
    description: '月圆人团圆，和他一起赏月吃月饼',
    rewards: ['月饼礼盒', '玉兔宠物', '中秋头像框', '钻石×300'],
    mechanics: ['赏月活动', '猜灯谜', '限时剧情'],
    duration: 5,
    budget: '中'
  },
  {
    type: 'festival',
    name: '双十一单身节',
    description: '谁说单身节只能一个人过？有他陪伴就够了',
    rewards: ['安慰礼盒', '专属语音', '限定卡', '钻石×200'],
    mechanics: ['登录送礼', '限时折扣', '特别剧情'],
    duration: 3,
    budget: '低'
  }
];

// 角色生日模板
const birthdayTemplates: Omit<EventTemplate, 'id'>[] = [
  {
    type: 'birthday',
    name: '霸道总裁的生日派对',
    description: '为他准备一场盛大的生日派对，给他一个难忘的惊喜',
    rewards: ['生日限定卡', '专属礼物', '生日剧情', '钻石×500'],
    mechanics: ['生日剧情', '礼物赠送', '派对活动'],
    duration: 3,
    budget: '高'
  },
  {
    type: 'birthday',
    name: '温柔学长的生日',
    description: '亲手为他制作生日蛋糕，送上最真挚的祝福',
    rewards: ['生日限定CG', '手工蛋糕', '专属语音', '钻石×400'],
    mechanics: ['制作蛋糕', '生日剧情', '许愿活动'],
    duration: 3,
    budget: '中'
  },
  {
    type: 'birthday',
    name: '腹黑少爷的惊喜',
    description: '看似不在意生日的他，其实也在期待你的祝福',
    rewards: ['生日限定卡', '神秘礼物', '反转剧情', '钻石×400'],
    mechanics: ['惊喜策划', '生日剧情', '礼物交换'],
    duration: 3,
    budget: '中'
  },
  {
    type: 'birthday',
    name: '阳光少年的生日会',
    description: '和他一起举办热闹的生日派对，邀请所有朋友',
    rewards: ['生日限定卡', '派对道具', '欢乐剧情', '钻石×300'],
    mechanics: ['派对筹备', '生日剧情', '互动游戏'],
    duration: 3,
    budget: '中'
  },
  {
    type: 'birthday',
    name: '高冷精英的特别日子',
    description: '即使是高冷的他，在你的陪伴下也会露出温柔的笑容',
    rewards: ['生日限定CG', '专属礼物', '温馨剧情', '钻石×400'],
    mechanics: ['生日剧情', '礼物赠送', '特别约会'],
    duration: 3,
    budget: '中'
  }
];

// 联动活动模板
const collaborationTemplates: Omit<EventTemplate, 'id'>[] = [
  {
    type: 'collaboration',
    name: '知名动漫联动',
    description: '与热门动漫联动，推出限定角色和剧情',
    rewards: ['联动限定卡', '联动服装', '联动头像框', '钻石×600'],
    mechanics: ['联动剧情', '限定抽卡', '收集活动'],
    duration: 14,
    budget: '高'
  },
  {
    type: 'collaboration',
    name: '人气声优合作',
    description: '邀请人气声优录制专属语音和剧情',
    rewards: ['声优签名卡', '专属语音包', '限定CG', '钻石×500'],
    mechanics: ['语音收集', '特别剧情', '签名活动'],
    duration: 7,
    budget: '高'
  },
  {
    type: 'collaboration',
    name: '时尚品牌联动',
    description: '与时尚品牌合作，推出限定服装和配饰',
    rewards: ['联动服装', '时尚配饰', '限定卡', '钻石×400'],
    mechanics: ['服装收集', '时尚剧情', '搭配活动'],
    duration: 10,
    budget: '高'
  },
  {
    type: 'collaboration',
    name: '美食品牌合作',
    description: '与美食品牌联动，推出限定道具和剧情',
    rewards: ['美食道具', '限定CG', '联动头像框', '钻石×300'],
    mechanics: ['美食剧情', '收集活动', '兑换奖励'],
    duration: 7,
    budget: '中'
  },
  {
    type: 'collaboration',
    name: '旅游景点联动',
    description: '与知名景点合作，推出旅游主题剧情',
    rewards: ['旅游限定卡', '景点背景', '纪念道具', '钻石×400'],
    mechanics: ['旅游剧情', '拍照打卡', '收集活动'],
    duration: 10,
    budget: '中'
  }
];

// 生成唯一ID
function generateId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 所有活动模板
export const eventTemplates: EventTemplate[] = [
  ...festivalTemplates.map(t => ({ ...t, id: generateId() })),
  ...birthdayTemplates.map(t => ({ ...t, id: generateId() })),
  ...collaborationTemplates.map(t => ({ ...t, id: generateId() }))
];

/**
 * 按类型获取活动模板
 */
export function getEventsByType(type: EventType): EventTemplate[] {
  return eventTemplates.filter(e => e.type === type);
}

/**
 * 按预算等级获取活动模板
 */
export function getEventsByBudget(budget: BudgetLevel): EventTemplate[] {
  return eventTemplates.filter(e => e.budget === budget);
}

/**
 * 随机获取活动模板
 */
export function getRandomEvent(type?: EventType): EventTemplate {
  let pool = eventTemplates;
  if (type) {
    pool = pool.filter(e => e.type === type);
  }
  const template = pool[Math.floor(Math.random() * pool.length)];
  return {
    ...template,
    id: generateId()
  };
}

/**
 * 获取活动类型名称
 */
export function getEventTypeName(type: EventType): string {
  const map: Record<EventType, string> = {
    festival: '节日活动',
    birthday: '角色生日',
    collaboration: '联动活动'
  };
  return map[type];
}

/**
 * 获取预算等级颜色
 */
export function getBudgetColor(budget: BudgetLevel): string {
  const map: Record<BudgetLevel, string> = {
    '低': '#07c160',
    '中': '#ff976a',
    '高': '#ee0a24'
  };
  return map[budget];
}
