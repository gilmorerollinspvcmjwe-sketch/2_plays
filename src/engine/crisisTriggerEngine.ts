/**
 * 危机触发引擎
 * 基于模拟数据自动触发危机事件
 */

import type { 
  CrisisType, 
  CrisisLevel, 
  Crisis,
  CrisisTemplate,
  CRISIS_TEMPLATES,
  initCrisis
} from '@/types/crisis';

// 危机触发条件接口
export interface CrisisTriggerCondition {
  /** 舆情热度阈值 */
  heatThreshold: number;
  /** 声誉值低于阈值 */
  reputationThreshold: number;
  /** 连续负面事件数量阈值 */
  consecutiveNegativeEventsThreshold: number;
  /** 玩家流失率阈值 */
  churnRateThreshold: number;
  /** 满意度阈值 */
  satisfactionThreshold: number;
}

// 默认触发条件配置
export const DEFAULT_CRISIS_TRIGGER_CONDITION: CrisisTriggerCondition = {
  heatThreshold: 70,
  reputationThreshold: 50,
  consecutiveNegativeEventsThreshold: 3,
  churnRateThreshold: 0.1,
  satisfactionThreshold: 40
};

// 触发结果接口
export interface CrisisTriggerResult {
  triggered: boolean;
  probability: number;
  level?: CrisisLevel;
  crisisType?: CrisisType;
  crisis?: Crisis;
  reason?: string;
}

/**
 * 计算危机触发概率
 * @param heat 舆情热度 (0-100)
 * @param reputation 声誉值 (0-100)
 * @param recentNegativeEvents 近期负面事件数量
 * @param satisfaction 玩家满意度 (0-100)
 * @returns 触发概率 (0-1) 和危机等级
 */
export function calculateCrisisTriggerProbability(
  heat: number,
  reputation: number,
  recentNegativeEvents: number,
  satisfaction: number
): { probability: number; level: CrisisLevel } {
  // 热度因子 (0-1)
  const heatFactor = Math.min(1, heat / 100);
  
  // 声誉因子 (0-1)，声誉越低因子越高
  const reputationFactor = Math.max(0, (50 - reputation) / 50);
  
  // 近期负面事件因子 (每增加一个事件增加 0.2，最高 1.0)
  const eventFactor = Math.min(1, recentNegativeEvents * 0.2);
  
  // 满意度因子 (0-1)，满意度越低因子越高
  const satisfactionFactor = Math.max(0, (40 - satisfaction) / 40);
  
  // 计算总概率
  const probability = Math.min(0.8, 
    heatFactor * 0.3 + 
    reputationFactor * 0.3 + 
    eventFactor * 0.2 + 
    satisfactionFactor * 0.2
  );
  
  // 根据概率和热度确定危机等级
  const level = determineCrisisLevel(probability, heat);
  
  return { probability, level };
}

/**
 * 确定危机等级
 * @param probability 触发概率
 * @param heat 舆情热度
 * @returns 危机等级
 */
export function determineCrisisLevel(
  probability: number,
  heat: number
): CrisisLevel {
  // 高概率 + 高热度 → 致命危机
  if (probability > 0.6 && heat > 80) {
    return 'critical';
  }
  
  // 中高概率 + 中高热度 → 严重危机
  if ((probability > 0.4 && heat > 60) || heat > 85) {
    return 'severe';
  }
  
  // 中等概率 + 中等热度 → 中等危机
  if ((probability > 0.25 && heat > 40) || heat > 70) {
    return 'moderate';
  }
  
  // 其他情况 → 轻微危机
  return 'minor';
}

/**
 * 根据条件选择危机类型
 * @param heat 舆情热度
 * @param reputation 声誉值
 * @param recentNegativeEvents 近期负面事件
 * @param projectQuality 项目质量
 * @returns 危机类型
 */
export function selectCrisisTypeByCondition(
  heat: number,
  reputation: number,
  recentNegativeEvents: number,
  projectQuality?: number
): CrisisType {
  // 高热度 + 低声誉 → 运营事故或补偿问题
  if (heat > 80 && reputation < 40) {
    return Math.random() > 0.5 ? 'operation_accident' : 'compensation_issue';
  }
  
  // 连续负面事件多 → 角色争议或角色待遇不均
  if (recentNegativeEvents >= 3) {
    return Math.random() > 0.5 ? 'character_controversy' : 'character_balance';
  }
  
  // 项目质量低 → 剧情翻车或美术质量
  if (projectQuality !== undefined && projectQuality < 0.5) {
    return Math.random() > 0.5 ? 'plot_backlash' : 'art_quality';
  }
  
  // 高热度 → 爆率争议
  if (heat > 75) {
    return 'gacha_rate';
  }
  
  // 默认随机选择
  const types: CrisisType[] = [
    'character_controversy',
    'gacha_rate',
    'plot_backlash',
    'operation_accident',
    'compensation_issue',
    'art_quality',
    'character_balance'
  ];
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * 检查是否应该触发危机
 * @param heat 舆情热度
 * @param reputation 声誉值
 * @param recentNegativeEvents 近期负面事件数量
 * @param satisfaction 玩家满意度
 * @param projectQuality 项目质量（可选）
 * @returns 触发结果
 */
export function checkCrisisTrigger(
  heat: number,
  reputation: number,
  recentNegativeEvents: number,
  satisfaction: number,
  projectQuality?: number
): CrisisTriggerResult {
  // 计算触发概率和等级
  const { probability, level } = calculateCrisisTriggerProbability(
    heat,
    reputation,
    recentNegativeEvents,
    satisfaction
  );
  
  // 随机判断是否触发
  const random = Math.random();
  const triggered = random < probability;
  
  if (!triggered) {
    return {
      triggered: false,
      probability
    };
  }
  
  // 选择危机类型
  const crisisType = selectCrisisTypeByCondition(
    heat,
    reputation,
    recentNegativeEvents,
    projectQuality
  );
  
  // 生成触发原因
  let reason = '';
  if (heat > 80) {
    reason = `舆情热度极高 (${heat.toFixed(0)})`;
  } else if (reputation < 40) {
    reason = `声誉值过低 (${reputation.toFixed(0)})`;
  } else if (recentNegativeEvents >= 3) {
    reason = `近期负面事件过多 (${recentNegativeEvents} 起)`;
  } else if (satisfaction < 40) {
    reason = `玩家满意度极低 (${satisfaction.toFixed(0)})`;
  } else {
    reason = '综合运营指标恶化';
  }
  
  return {
    triggered: true,
    probability,
    level,
    crisisType,
    reason
  };
}

/**
 * 创建危机实例
 * @param crisisType 危机类型
 * @param level 危机等级
 * @returns 危机实例或 null
 */
export function createCrisisInstance(
  crisisType: CrisisType,
  level: CrisisLevel
): Crisis | null {
  // 从模板库中查找匹配的模板
  const templates = CRISIS_TEMPLATES.filter(
    t => t.type === crisisType && t.level === level
  );
  
  if (templates.length === 0) {
    // 如果没有精确匹配，尝试只按类型匹配
    const typeTemplates = CRISIS_TEMPLATES.filter(t => t.type === crisisType);
    if (typeTemplates.length === 0) {
      return null;
    }
    // 使用第一个匹配类型的模板，但修改等级
    const template = { ...typeTemplates[0], level };
    return initCrisis(template);
  }
  
  // 随机选择一个匹配的模板
  const template = templates[Math.floor(Math.random() * templates.length)];
  return initCrisis(template);
}

/**
 * 获取危机预防建议
 * @param heat 舆情热度
 * @param reputation 声誉值
 * @param recentNegativeEvents 近期负面事件数量
 * @param satisfaction 玩家满意度
 * @returns 建议信息
 */
export function getCrisisPreventionAdvice(
  heat: number,
  reputation: number,
  recentNegativeEvents: number,
  satisfaction: number
): string[] {
  const advice: string[] = [];
  
  if (heat > 70) {
    advice.push('舆情热度较高，建议密切关注社区动态，准备应急预案');
  }
  
  if (reputation < 60) {
    advice.push('声誉值偏低，建议通过发福利、优化体验等方式挽回口碑');
  }
  
  if (recentNegativeEvents >= 2) {
    advice.push('近期负面事件较多，建议及时处理玩家反馈，防止事态升级');
  }
  
  if (satisfaction < 50) {
    advice.push('玩家满意度较低，建议调查原因并针对性改进');
  }
  
  if (advice.length === 0) {
    advice.push('当前运营状况良好，继续保持警惕');
  }
  
  return advice;
}

/**
 * 计算危机影响
 * @param crisis 危机实例
 * @returns 影响数值
 */
export function calculateCrisisImpact(crisis: Crisis): {
  reputationChange: number;
  playerChange: number;
  satisfactionChange: number;
} {
  const levelMultipliers: Record<CrisisLevel, number> = {
    minor: 0.5,
    moderate: 1.0,
    severe: 1.5,
    critical: 2.0
  };
  
  const multiplier = levelMultipliers[crisis.level] || 1.0;
  
  return {
    reputationChange: -5 * multiplier,
    playerChange: -50 * multiplier,
    satisfactionChange: -3 * multiplier
  };
}

/**
 * 获取危机等级中文名称
 * @param level 危机等级
 * @returns 中文名称
 */
export function getCrisisLevelName(level: CrisisLevel): string {
  const names: Record<CrisisLevel, string> = {
    minor: '轻微',
    moderate: '中等',
    severe: '严重',
    critical: '致命'
  };
  return names[level] || '未知';
}

/**
 * 获取危机类型中文名称
 * @param type 危机类型
 * @returns 中文名称
 */
export function getCrisisTypeName(type: CrisisType): string {
  const names: Record<CrisisType, string> = {
    character_controversy: '角色争议',
    gacha_rate: '爆率节奏',
    plot_backlash: '剧情翻车',
    operation_accident: '运营事故',
    compensation_issue: '补偿问题',
    art_quality: '美术质量',
    character_balance: '角色待遇不均'
  };
  return names[type] || '未知危机';
}
