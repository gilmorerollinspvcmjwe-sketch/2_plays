/**
 * 节日活动模板
 */

import type { EventTemplate } from '@/types/template';

export const festivalEventTemplates: EventTemplate[] = [
  {
    id: 'event_valentine',
    type: 'festival',
    name: '情人节特别活动',
    description: '与心爱的他共度浪漫情人节，限定剧情和专属礼物等你领取',
    duration: 7,
    rewards: ['限定情人节CG', '专属语音', '限定称号', '钻石×500'],
    mechanics: ['每日登录领取巧克力', '完成约会任务解锁剧情', '赠送礼物提升好感度'],
    budget: '中',
    targetAudience: ['剧情党', '外观党'],
    expectedEffect: { dauIncrease: 0.3, revenueIncrease: 0.5, satisfactionChange: 0.2 }
  },
  {
    id: 'event_qixi',
    type: 'festival',
    name: '七夕鹊桥会',
    description: '牛郎织女相会之日，你们的缘分也将升华',
    duration: 5,
    rewards: ['古风限定服装', '七夕限定剧情', '鹊桥称号'],
    mechanics: ['收集鹊羽兑换奖励', '参与鹊桥搭建小游戏', '邀请好友获得额外奖励'],
    budget: '中',
    targetAudience: ['剧情党', '休闲玩家'],
    expectedEffect: { dauIncrease: 0.25, revenueIncrease: 0.3, satisfactionChange: 0.15 }
  },
  {
    id: 'event_christmas',
    type: 'festival',
    name: '圣诞奇妙夜',
    description: '白雪纷飞的圣诞夜，他为你准备了特别的惊喜',
    duration: 10,
    rewards: ['圣诞限定角色', '雪景背景', '圣诞主题UI', '钻石×1000'],
    mechanics: ['圣诞签到领礼物', '雪仗小游戏', '圣诞树装饰大赛'],
    budget: '高',
    targetAudience: ['外观党', '氪金大佬'],
    expectedEffect: { dauIncrease: 0.4, revenueIncrease: 0.6, satisfactionChange: 0.25 }
  },
  {
    id: 'event_newyear',
    type: 'festival',
    name: '新年庆典',
    description: '辞旧迎新，与他一起迎接新年的第一缕阳光',
    duration: 14,
    rewards: ['新年限定服装', '新年CG', '福袋奖励', '钻石×888'],
    mechanics: ['新年签到', '写春联小游戏', '放烟花活动', '拜年任务'],
    budget: '高',
    targetAudience: ['所有玩家'],
    expectedEffect: { dauIncrease: 0.5, revenueIncrease: 0.7, satisfactionChange: 0.3 }
  },
  {
    id: 'event_halloween',
    type: 'festival',
    name: '万圣惊魂夜',
    description: ' Trick or Treat！穿上 costumes，与他一起度过刺激的万圣节',
    duration: 7,
    rewards: ['万圣节限定服装', '南瓜头称号', '限定背景', '钻石×300'],
    mechanics: ['不给糖就捣蛋', '化妆舞会', '鬼屋探险'],
    budget: '中',
    targetAudience: ['外观党', '休闲玩家'],
    expectedEffect: { dauIncrease: 0.2, revenueIncrease: 0.3, satisfactionChange: 0.15 }
  },
  {
    id: 'event_white_day',
    type: 'festival',
    name: '白色情人节',
    description: '回礼的日子，他会送你什么样的惊喜？',
    duration: 5,
    rewards: ['白色情人节CG', '回礼礼盒', '甜蜜称号'],
    mechanics: ['制作回礼', '约会任务', '甜蜜剧情'],
    budget: '低',
    targetAudience: ['剧情党'],
    expectedEffect: { dauIncrease: 0.15, revenueIncrease: 0.2, satisfactionChange: 0.1 }
  },
  {
    id: 'event_midautumn',
    type: 'festival',
    name: '中秋团圆夜',
    description: '月圆人团圆，与他共赏明月',
    duration: 5,
    rewards: ['中秋限定服装', '月饼道具', '月亮背景'],
    mechanics: ['制作月饼', '赏月活动', '猜灯谜'],
    budget: '中',
    targetAudience: ['剧情党', '休闲玩家'],
    expectedEffect: { dauIncrease: 0.2, revenueIncrease: 0.25, satisfactionChange: 0.15 }
  },
  {
    id: 'event_spring',
    type: 'festival',
    name: '春日祭',
    description: '樱花盛开的季节，与他一起参加春日祭典',
    duration: 7,
    rewards: ['和服限定服装', '樱花背景', '祭典称号'],
    mechanics: ['赏樱花', '捞金鱼', '吃章鱼烧', '看烟花'],
    budget: '中',
    targetAudience: ['外观党', '剧情党'],
    expectedEffect: { dauIncrease: 0.25, revenueIncrease: 0.35, satisfactionChange: 0.2 }
  },
  {
    id: 'event_summer',
    type: 'festival',
    name: '夏日海滩派对',
    description: '炎炎夏日，与他一起去海边度假吧',
    duration: 10,
    rewards: ['泳装限定服装', '海滩背景', '夏日道具'],
    mechanics: ['沙滩排球', '游泳比赛', '堆沙堡', '烧烤派对'],
    budget: '高',
    targetAudience: ['外观党'],
    expectedEffect: { dauIncrease: 0.35, revenueIncrease: 0.5, satisfactionChange: 0.25 }
  },
  {
    id: 'event_anniversary',
    type: 'festival',
    name: '周年庆典',
    description: '游戏上线周年庆，感谢有你一路相伴',
    duration: 14,
    rewards: ['周年限定角色', '纪念CG', '豪华福袋', '钻石×2000'],
    mechanics: ['周年签到', '回忆录', '限定剧情', '感恩回馈'],
    budget: '高',
    targetAudience: ['所有玩家'],
    expectedEffect: { dauIncrease: 0.6, revenueIncrease: 0.8, satisfactionChange: 0.35 }
  }
];

// 生日活动模板
export const birthdayEventTemplates: EventTemplate[] = [
  {
    id: 'birthday_template',
    type: 'birthday',
    name: '角色生日庆典',
    description: '为他准备一场难忘的生日派对吧',
    duration: 3,
    rewards: ['生日限定剧情', '专属生日CG', '生日语音', '限定礼物'],
    mechanics: ['收集生日蛋糕材料', '制作生日礼物', '参加生日派对'],
    budget: '中',
    targetAudience: ['该角色粉丝'],
    expectedEffect: { dauIncrease: 0.2, revenueIncrease: 0.4, satisfactionChange: 0.3 }
  }
];

// 获取所有节日活动
export const getAllFestivalEvents = (): EventTemplate[] => {
  return festivalEventTemplates;
};

// 根据预算等级筛选活动
export const getEventsByBudget = (budget: '低' | '中' | '高'): EventTemplate[] => {
  return festivalEventTemplates.filter(event => event.budget === budget);
};

// 获取高收益活动（DAU增长>30%）
export const getHighImpactEvents = (): EventTemplate[] => {
  return festivalEventTemplates.filter(event => event.expectedEffect.dauIncrease > 0.3);
};
