/**
 * 运营事件模板
 */

import type { IncidentTemplate } from '@/types/template';

export const incidentTemplates: IncidentTemplate[] = [
  {
    id: 'incident_droprate_001',
    type: 'dropRate',
    name: '爆率争议',
    description: '大量玩家反馈新卡池爆率过低，社区出现负面舆论',
    severity: '高',
    triggerCondition: '卡池开启后3天内，负面评论超过50条',
    playerReactions: ['要求公开爆率', '威胁退游', '集体抵制充值'],
    solutions: [
      { action: '公开爆率并道歉', cost: '低', effect: '满意度+10，信任度恢复', successRate: 0.8 },
      { action: '发放补偿并调整爆率', cost: '高', effect: '满意度+20，收入短期下降', successRate: 0.9 },
      { action: '冷处理', cost: '低', effect: '满意度-20，信任度下降', successRate: 0.2 }
    ]
  },
  {
    id: 'incident_plot_001',
    type: 'plotIssue',
    name: '剧情雷点',
    description: '新剧情出现争议情节，引发玩家强烈不满',
    severity: '中',
    triggerCondition: '剧情发布后，负面评论超过30条',
    playerReactions: ['要求修改剧情', '质疑编剧水平', '担心后续发展'],
    solutions: [
      { action: '紧急修改剧情', cost: '中', effect: '满意度+15，开发成本增加', successRate: 0.7 },
      { action: '发布编剧解释', cost: '低', effect: '满意度+5，部分玩家理解', successRate: 0.5 },
      { action: '承诺后续改进', cost: '低', effect: '满意度不变，观望态度', successRate: 0.4 }
    ]
  },
  {
    id: 'incident_bug_001',
    type: 'bug',
    name: '严重BUG',
    description: '游戏出现严重BUG，影响玩家正常游戏',
    severity: '高',
    triggerCondition: 'BUG导致玩家数据异常或无法游戏',
    playerReactions: ['要求修复', '要求补偿', '威胁退游'],
    solutions: [
      { action: '紧急修复并补偿', cost: '中', effect: '满意度+10，BUG解决', successRate: 0.9 },
      { action: '仅修复不补偿', cost: '低', effect: '满意度-5，玩家不满', successRate: 0.6 },
      { action: '回滚版本', cost: '高', effect: '满意度+5，数据可能丢失', successRate: 0.7 }
    ]
  },
  {
    id: 'incident_welfare_001',
    type: 'welfare',
    name: '福利争议',
    description: '玩家认为福利发放不公平或过少',
    severity: '低',
    triggerCondition: '福利活动后，负面评论超过20条',
    playerReactions: ['要求增加福利', '抱怨抠门', '对比其他游戏'],
    solutions: [
      { action: '追加福利', cost: '中', effect: '满意度+15，玩家满意', successRate: 0.9 },
      { action: '解释福利设计', cost: '低', effect: '满意度+2，部分理解', successRate: 0.4 },
      { action: '无视', cost: '低', effect: '满意度-10，持续抱怨', successRate: 0.1 }
    ]
  },
  {
    id: 'incident_scandal_001',
    type: 'scandal',
    name: '声优丑闻',
    description: '角色声优爆出负面新闻',
    severity: '高',
    triggerCondition: '声优负面新闻登上热搜',
    playerReactions: ['要求换声优', '抵制该角色', '担心游戏形象'],
    solutions: [
      { action: '更换声优', cost: '高', effect: '满意度+10，成本增加', successRate: 0.8 },
      { action: '发布声明切割', cost: '低', effect: '满意度+5，暂时平息', successRate: 0.6 },
      { action: '冷处理', cost: '低', effect: '满意度-15，持续发酵', successRate: 0.2 }
    ]
  },
  {
    id: 'incident_competition_001',
    type: 'competition',
    name: '竞品冲击',
    description: '竞品游戏上线，玩家流失严重',
    severity: '中',
    triggerCondition: '竞品上线后，DAU下降超过20%',
    playerReactions: ['尝试竞品', '对比两款游戏', '观望态度'],
    solutions: [
      { action: '推出大型更新', cost: '高', effect: '满意度+20，挽回玩家', successRate: 0.7 },
      { action: '增加福利活动', cost: '中', effect: '满意度+10，短期回流', successRate: 0.6 },
      { action: '差异化营销', cost: '中', effect: '满意度+5，稳定用户', successRate: 0.5 }
    ]
  },
  {
    id: 'incident_event_001',
    type: 'eventIssue',
    name: '活动事故',
    description: '活动出现严重问题，玩家无法正常参与',
    severity: '中',
    triggerCondition: '活动期间，参与率低于预期50%',
    playerReactions: ['抱怨活动难', '要求补偿', '放弃参与'],
    solutions: [
      { action: '降低难度并延长', cost: '中', effect: '满意度+10，参与率回升', successRate: 0.8 },
      { action: '直接发放奖励', cost: '高', effect: '满意度+15，活动意义丧失', successRate: 0.7 },
      { action: '取消活动', cost: '低', effect: '满意度-10，玩家失望', successRate: 0.3 }
    ]
  },
  {
    id: 'incident_chargeback_001',
    type: 'chargeback',
    name: '退款潮',
    description: '大量玩家申请退款',
    severity: '高',
    triggerCondition: '单日退款申请超过100单',
    playerReactions: ['申请退款', '传播负面信息', '集体维权'],
    solutions: [
      { action: '优化游戏体验', cost: '高', effect: '满意度+15，退款减少', successRate: 0.6 },
      { action: '提供额外补偿', cost: '高', effect: '满意度+10，部分撤销', successRate: 0.5 },
      { action: '加强客服沟通', cost: '中', effect: '满意度+5，部分挽留', successRate: 0.4 }
    ]
  }
];

// 根据严重程度获取事件
export const getIncidentsBySeverity = (severity: '低' | '中' | '高'): IncidentTemplate[] => {
  return incidentTemplates.filter(incident => incident.severity === severity);
};

// 根据类型获取事件
export const getIncidentsByType = (type: string): IncidentTemplate[] => {
  return incidentTemplates.filter(incident => incident.type === type);
};

// 获取随机事件
export const getRandomIncident = (): IncidentTemplate => {
  return incidentTemplates[Math.floor(Math.random() * incidentTemplates.length)];
};

// 获取事件解决方案
export const getIncidentSolutions = (incidentId: string) => {
  const incident = incidentTemplates.find(i => i.id === incidentId);
  return incident?.solutions || [];
};
