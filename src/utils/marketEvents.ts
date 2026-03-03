import type { MarketEvent, CompetitorEvent, TrendEvent, FestivalEvent, SocialEvent, MarketEnvironment } from '@/types/market';

// 事件模板库
const eventTemplates = {
  // 竞品事件
  competitor: [
    {
      id: 'competitor_launch',
      name: '竞品新游上线',
      description: '{competitor}今日正式上线，题材为{theme}，可能分流部分玩家',
      baseImpact: -15,
      duration: 7,
      conditions: { minMarketShare: 0 }
    },
    {
      id: 'competitor_event',
      name: '竞品大型活动',
      description: '{competitor}开启周年庆典活动，玩家活跃度大幅提升',
      baseImpact: -10,
      duration: 5,
      conditions: { minMarketShare: 0 }
    },
    {
      id: 'competitor_scandal',
      name: '竞品负面新闻',
      description: '{competitor}因运营问题引发玩家不满，是吸引玩家的好时机',
      baseImpact: 15,
      duration: 3,
      conditions: { minMarketShare: 0 }
    },
    {
      id: 'competitor_update',
      name: '竞品重大更新',
      description: '{competitor}发布大型版本更新，新增大量内容',
      baseImpact: -12,
      duration: 5,
      conditions: { minMarketShare: 0 }
    }
  ],
  // 趋势事件
  trend: [
    {
      id: 'trend_ancient',
      name: '古风题材热潮',
      description: '近期古风仙侠题材大受欢迎，相关游戏收益提升',
      baseImpact: 20,
      duration: 14,
      affectedTags: ['古风', '仙侠', '修真'],
      conditions: { minTrendStrength: 60 }
    },
    {
      id: 'trend_modern',
      name: '现代都市流行',
      description: '现代职场恋爱题材成为新宠，玩家关注度上升',
      baseImpact: 15,
      duration: 10,
      affectedTags: ['现代', '职场', '都市'],
      conditions: { minTrendStrength: 50 }
    },
    {
      id: 'trend_fantasy',
      name: '奇幻风格兴起',
      description: '奇幻异世界题材开始流行，魔法元素受追捧',
      baseImpact: 18,
      duration: 12,
      affectedTags: ['奇幻', '异世界', '魔法'],
      conditions: { minTrendStrength: 55 }
    },
    {
      id: 'trend_decline',
      name: '题材热度下降',
      description: '当前热门题材玩家开始审美疲劳，热度逐渐消退',
      baseImpact: -15,
      duration: 10,
      conditions: { maxTrendStrength: 40 }
    }
  ],
  // 节日事件
  festival: [
    {
      id: 'festival_valentine',
      name: '情人节效应',
      description: '情人节期间，恋爱类游戏消费意愿大幅提升',
      baseImpact: 30,
      duration: 3,
      bonusMultiplier: 2.5,
      affectedTags: ['恋爱', '约会', '情侣'],
      conditions: { festival: 'valentine' }
    },
    {
      id: 'festival_qixi',
      name: '七夕节效应',
      description: '七夕节带动古风恋爱题材游戏热度',
      baseImpact: 25,
      duration: 3,
      bonusMultiplier: 2.0,
      affectedTags: ['古风', '恋爱', '仙侠'],
      conditions: { festival: 'qixi' }
    },
    {
      id: 'festival_christmas',
      name: '圣诞节效应',
      description: '圣诞节期间游戏内活动参与度提升',
      baseImpact: 20,
      duration: 5,
      bonusMultiplier: 1.8,
      affectedTags: ['活动', '限定'],
      conditions: { festival: 'christmas' }
    },
    {
      id: 'festival_newyear',
      name: '新年效应',
      description: '新年期间玩家付费意愿增强',
      baseImpact: 35,
      duration: 7,
      bonusMultiplier: 3.0,
      affectedTags: ['新年', '限定', '活动'],
      conditions: { festival: 'newyear' }
    }
  ],
  // 社会事件
  social: [
    {
      id: 'social_positive',
      name: '正面社会热点',
      description: '某正能量事件引发社会关注，整体游戏市场活跃度提升',
      baseImpact: 10,
      duration: 5,
      conditions: { sentiment: 'positive' }
    },
    {
      id: 'social_negative',
      name: '负面社会新闻',
      description: '社会负面事件影响玩家情绪，游戏消费意愿下降',
      baseImpact: -12,
      duration: 4,
      conditions: { sentiment: 'negative' }
    },
    {
      id: 'social_holiday',
      name: '长假效应',
      description: '长假期间玩家游戏时间增加，活跃度提升',
      baseImpact: 15,
      duration: 7,
      conditions: { isHoliday: true }
    },
    {
      id: 'social_work',
      name: '工作繁忙期',
      description: '节后工作繁忙，玩家游戏时间减少',
      baseImpact: -8,
      duration: 5,
      conditions: { isWorkBusy: true }
    }
  ]
};

/**
 * 生成随机市场事件
 */
export function generateRandomEvent(
  environment: MarketEnvironment,
  gameTags: string[] = []
): MarketEvent | null {
  const eventTypes: Array<'competitor' | 'trend' | 'festival' | 'social'> = 
    ['competitor', 'trend', 'festival', 'social'];
  
  // 根据环境选择合适的事件类型
  const weights = calculateEventWeights(environment);
  const selectedType = weightedRandom(eventTypes, weights);
  
  const templates = eventTemplates[selectedType];
  if (!templates || templates.length === 0) return null;
  
  // 筛选符合条件的事件模板
  const validTemplates = templates.filter(template => 
    checkEventConditions(template, environment)
  );
  
  if (validTemplates.length === 0) return null;
  
  // 随机选择一个模板
  const template = validTemplates[Math.floor(Math.random() * validTemplates.length)];
  
  // 计算实际影响值（基于游戏标签匹配度）
  const tagMatchBonus = calculateTagMatchBonus(template, gameTags);
  const actualImpact = template.baseImpact * (1 + tagMatchBonus);
  
  // 生成事件对象
  const event: MarketEvent = {
    id: `${template.id}_${Date.now()}`,
    type: selectedType,
    name: template.name,
    description: generateEventDescription(template, environment),
    impact: {
      revenue: Math.round(actualImpact),
      downloads: Math.round(actualImpact * 0.8),
      retention: Math.round(actualImpact * 0.3),
      rating: Math.round(actualImpact * 0.1)
    },
    duration: template.duration,
    startDate: new Date(),
    endDate: new Date(Date.now() + template.duration * 24 * 60 * 60 * 1000),
    isActive: true
  };
  
  // 添加特定类型字段
  if (selectedType === 'competitor') {
    (event as CompetitorEvent).competitorId = environment.competitors[0]?.id;
    (event as CompetitorEvent).competitorName = environment.competitors[0]?.name;
  } else if (selectedType === 'trend') {
    (event as TrendEvent).trendId = environment.trend?.id;
    (event as TrendEvent).trendName = environment.trend?.name;
  } else if (selectedType === 'festival') {
    (event as FestivalEvent).festivalId = template.id;
    (event as FestivalEvent).bonusMultiplier = template.bonusMultiplier || 1.5;
  } else if (selectedType === 'social') {
    (event as SocialEvent).sentiment = template.conditions?.sentiment || 'neutral';
  }
  
  return event;
}

/**
 * 计算事件类型权重
 */
function calculateEventWeights(environment: MarketEnvironment): number[] {
  const weights = [1, 1, 1, 1]; // competitor, trend, festival, social
  
  // 如果有活跃的节日，提高节日事件权重
  if (environment.festivals?.some(f => f.startDate <= new Date() && f.endDate >= new Date())) {
    weights[2] = 2.5;
  }
  
  // 如果市场趋势强烈，提高趋势事件权重
  if (environment.trend?.strength && environment.trend.strength > 70) {
    weights[1] = 2;
  }
  
  // 如果有强势竞品，提高竞品事件权重
  if (environment.competitors?.some(c => c.threatLevel >= 4)) {
    weights[0] = 1.8;
  }
  
  return weights;
}

/**
 * 加权随机选择
 */
function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
}

/**
 * 检查事件条件
 */
function checkEventConditions(template: any, environment: MarketEnvironment): boolean {
  const conditions = template.conditions || {};
  
  if (conditions.minMarketShare !== undefined && environment.marketShare < conditions.minMarketShare) {
    return false;
  }
  
  if (conditions.minTrendStrength !== undefined && 
      (!environment.trend?.strength || environment.trend.strength < conditions.minTrendStrength)) {
    return false;
  }
  
  if (conditions.maxTrendStrength !== undefined && 
      environment.trend?.strength && environment.trend.strength > conditions.maxTrendStrength) {
    return false;
  }
  
  return true;
}

/**
 * 计算标签匹配加成
 */
function calculateTagMatchBonus(template: any, gameTags: string[]): number {
  if (!template.affectedTags || !gameTags.length) return 0;
  
  const matchingTags = template.affectedTags.filter((tag: string) => 
    gameTags.some(gameTag => gameTag.includes(tag) || tag.includes(gameTag))
  );
  
  return (matchingTags.length / template.affectedTags.length) * 0.5;
}

/**
 * 生成事件描述
 */
function generateEventDescription(template: any, environment: MarketEnvironment): string {
  let description = template.description;
  
  // 替换变量
  if (description.includes('{competitor}')) {
    const competitor = environment.competitors[0];
    description = description.replace('{competitor}', competitor?.name || '某竞品');
  }
  
  if (description.includes('{theme}')) {
    const themes = ['古风仙侠', '现代职场', '校园恋爱', '奇幻冒险'];
    description = description.replace('{theme}', themes[Math.floor(Math.random() * themes.length)]);
  }
  
  return description;
}

/**
 * 应用事件效果
 */
export function applyEventEffect(
  event: MarketEvent,
  currentStats: {
    revenue: number;
    downloads: number;
    retention: number;
    rating: number;
  }
): typeof currentStats {
  const multiplier = event.isActive ? 1 : 0;
  
  return {
    revenue: Math.round(currentStats.revenue * (1 + (event.impact.revenue / 100) * multiplier)),
    downloads: Math.round(currentStats.downloads * (1 + (event.impact.downloads / 100) * multiplier)),
    retention: Math.max(0, Math.min(100, currentStats.retention + event.impact.retention * multiplier)),
    rating: Math.max(1, Math.min(5, currentStats.rating + event.impact.rating * multiplier * 0.01))
  };
}

/**
 * 更新事件状态
 */
export function updateEventStatus(events: MarketEvent[]): MarketEvent[] {
  const now = new Date();
  
  return events.map(event => {
    if (event.endDate < now) {
      return { ...event, isActive: false };
    }
    return event;
  });
}

/**
 * 获取活跃事件列表
 */
export function getActiveEvents(events: MarketEvent[]): MarketEvent[] {
  return events.filter(e => e.isActive && e.endDate >= new Date());
}

/**
 * 计算多个事件的综合影响
 */
export function calculateCombinedImpact(events: MarketEvent[]): {
  revenue: number;
  downloads: number;
  retention: number;
  rating: number;
} {
  const activeEvents = getActiveEvents(events);
  
  // 使用加权平均计算综合影响
  const weights = activeEvents.map(() => 1); // 可以基于事件重要性设置不同权重
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
  
  return {
    revenue: activeEvents.reduce((sum, e, i) => sum + e.impact.revenue * weights[i], 0) / totalWeight,
    downloads: activeEvents.reduce((sum, e, i) => sum + e.impact.downloads * weights[i], 0) / totalWeight,
    retention: activeEvents.reduce((sum, e, i) => sum + e.impact.retention * weights[i], 0) / totalWeight,
    rating: activeEvents.reduce((sum, e, i) => sum + e.impact.rating * weights[i], 0) / totalWeight
  };
}

/**
 * 生成节日事件
 */
export function generateFestivalEvent(festival: any): FestivalEvent | null {
  const template = eventTemplates.festival.find(t => 
    t.conditions?.festival === festival.id || t.id.includes(festival.id)
  );
  
  if (!template) return null;
  
  return {
    id: `festival_${festival.id}_${Date.now()}`,
    type: 'festival',
    name: festival.name,
    description: template.description,
    impact: {
      revenue: template.baseImpact,
      downloads: Math.round(template.baseImpact * 0.6),
      retention: Math.round(template.baseImpact * 0.2),
      rating: 0
    },
    duration: template.duration,
    startDate: festival.startDate,
    endDate: festival.endDate,
    isActive: true,
    festivalId: festival.id,
    bonusMultiplier: template.bonusMultiplier || 1.5
  };
}

/**
 * 创建自定义事件
 */
export function createCustomEvent(
  name: string,
  description: string,
  type: MarketEvent['type'],
  impact: MarketEvent['impact'],
  duration: number
): MarketEvent {
  const now = new Date();
  
  return {
    id: `custom_${Date.now()}`,
    type,
    name,
    description,
    impact,
    duration,
    startDate: now,
    endDate: new Date(now.getTime() + duration * 24 * 60 * 60 * 1000),
    isActive: true
  };
}

/**
 * 事件历史记录管理
 */
export class EventHistory {
  private events: MarketEvent[] = [];
  
  addEvent(event: MarketEvent) {
    this.events.push(event);
  }
  
  getEventsByType(type: MarketEvent['type']): MarketEvent[] {
    return this.events.filter(e => e.type === type);
  }
  
  getEventsByDateRange(start: Date, end: Date): MarketEvent[] {
    return this.events.filter(e => 
      e.startDate >= start && e.startDate <= end
    );
  }
  
  getRecentEvents(count: number = 10): MarketEvent[] {
    return [...this.events]
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
      .slice(0, count);
  }
  
  clearOldEvents(days: number = 30) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(e => e.endDate >= cutoff);
  }
  
  getAllEvents(): MarketEvent[] {
    return [...this.events];
  }
}

// 导出事件历史实例
export const eventHistory = new EventHistory();
