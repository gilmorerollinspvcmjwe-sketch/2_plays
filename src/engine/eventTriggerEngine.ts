/**
 * 运营事件触发引擎
 * 基于模拟数据自动触发运营事件
 */

import type { IncidentType, IncidentSeverity } from '@/data/templates/incidents';

// 运营事件触发条件接口
export interface IncidentTriggerCondition {
  /** 项目质量低于阈值时可能触发质量相关事件 */
  projectQualityThreshold: number;
  /** 玩家满意度低于阈值时可能触发满意度相关事件 */
  satisfactionThreshold: number;
  /** 负面评论比例超过阈值时可能触发舆情事件 */
  negativeCommentRatioThreshold: number;
  /** 卡池爆率偏差阈值 */
  gachaRateDeviation: number;
  /** 基础触发概率 */
  baseProbability: number;
}

// 默认触发条件配置
export const DEFAULT_INCIDENT_TRIGGER_CONDITION: IncidentTriggerCondition = {
  projectQualityThreshold: 0.5,
  satisfactionThreshold: 50,
  negativeCommentRatioThreshold: 0.5,
  gachaRateDeviation: 0.05,
  baseProbability: 0.1
};

// 触发结果接口
export interface IncidentTriggerResult {
  triggered: boolean;
  probability: number;
  incidentType?: IncidentType;
  severity?: IncidentSeverity;
  reason?: string;
}

/**
 * 计算运营事件触发概率
 * @param projectQuality 项目质量 (0-1)
 * @param satisfaction 玩家满意度 (0-100)
 * @param negativeCommentRatio 负面评论比例 (0-1)
 * @param daySinceLaunch 上线天数
 * @returns 触发概率 (0-1)
 */
export function calculateIncidentTriggerProbability(
  projectQuality: number,
  satisfaction: number,
  negativeCommentRatio: number,
  daySinceLaunch: number
): number {
  // 基础概率随时间递减（上线初期问题多）
  const timeFactor = Math.max(0.3, 1 - daySinceLaunch / 100);
  
  // 质量越低，触发概率越高 (最高贡献 0.4)
  const qualityFactor = (1 - projectQuality) * 0.4;
  
  // 满意度越低，触发概率越高 (最高贡献 0.3)
  const satisfactionFactor = (1 - satisfaction / 100) * 0.3;
  
  // 负面评论比例越高，触发概率越高 (最高贡献 0.3)
  const commentFactor = negativeCommentRatio * 0.3;
  
  // 计算总概率，最高不超过 0.5
  const probability = Math.min(0.5, (qualityFactor + satisfactionFactor + commentFactor) * timeFactor);
  
  return probability;
}

/**
 * 根据条件选择事件类型
 * @param negativeCommentRatio 负面评论比例
 * @param satisfaction 玩家满意度
 * @param projectQuality 项目质量
 * @returns 事件类型
 */
export function selectIncidentTypeByCondition(
  negativeCommentRatio: number,
  satisfaction: number,
  projectQuality: number
): IncidentType {
  // 负面评论比例高 → 爆率争议
  if (negativeCommentRatio > 0.5) {
    return 'dropRate';
  }
  
  // 满意度低 → 福利节奏
  if (satisfaction < 50) {
    return 'welfare';
  }
  
  // 项目质量低 → 剧情雷点
  if (projectQuality < 0.5) {
    return 'plotIssue';
  }
  
  // 默认其他事件
  return 'other';
}

/**
 * 判断事件严重程度
 * @param probability 触发概率
 * @param negativeCommentRatio 负面评论比例
 * @param satisfaction 玩家满意度
 * @returns 严重程度
 */
export function determineIncidentSeverity(
  probability: number,
  negativeCommentRatio: number,
  satisfaction: number
): IncidentSeverity {
  // 高概率 + 高负面评论 → 高严重度
  if (probability > 0.3 && negativeCommentRatio > 0.6) {
    return '高';
  }
  
  // 中等概率或中等负面 → 中等严重度
  if (probability > 0.15 || negativeCommentRatio > 0.4 || satisfaction < 40) {
    return '中';
  }
  
  // 其他情况 → 低严重度
  return '低';
}

/**
 * 检查是否应该触发运营事件
 * @param projectQuality 项目质量
 * @param satisfaction 玩家满意度
 * @param negativeCommentRatio 负面评论比例
 * @param daySinceLaunch 上线天数
 * @returns 触发结果
 */
export function checkIncidentTrigger(
  projectQuality: number,
  satisfaction: number,
  negativeCommentRatio: number,
  daySinceLaunch: number
): IncidentTriggerResult {
  // 计算触发概率
  const probability = calculateIncidentTriggerProbability(
    projectQuality,
    satisfaction,
    negativeCommentRatio,
    daySinceLaunch
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
  
  // 选择事件类型
  const incidentType = selectIncidentTypeByCondition(
    negativeCommentRatio,
    satisfaction,
    projectQuality
  );
  
  // 判断严重程度
  const severity = determineIncidentSeverity(
    probability,
    negativeCommentRatio,
    satisfaction
  );
  
  // 生成触发原因
  let reason = '';
  if (negativeCommentRatio > 0.5) {
    reason = `负面评论比例过高 (${(negativeCommentRatio * 100).toFixed(1)}%)`;
  } else if (satisfaction < 50) {
    reason = `玩家满意度较低 (${satisfaction.toFixed(1)})`;
  } else if (projectQuality < 0.5) {
    reason = `项目质量不佳 (${(projectQuality * 100).toFixed(1)}%)`;
  } else {
    reason = '综合运营指标触发';
  }
  
  return {
    triggered: true,
    probability,
    incidentType,
    severity,
    reason
  };
}

/**
 * 获取事件触发建议
 * @param projectQuality 项目质量
 * @param satisfaction 玩家满意度
 * @param negativeCommentRatio 负面评论比例
 * @returns 建议信息
 */
export function getIncidentPreventionAdvice(
  projectQuality: number,
  satisfaction: number,
  negativeCommentRatio: number
): string[] {
  const advice: string[] = [];
  
  if (projectQuality < 0.6) {
    advice.push('建议提升项目质量，优化剧情和角色设计');
  }
  
  if (satisfaction < 60) {
    advice.push('玩家满意度偏低，建议发放福利或优化游戏体验');
  }
  
  if (negativeCommentRatio > 0.3) {
    advice.push('负面评论较多，建议关注玩家反馈并及时回应');
  }
  
  if (advice.length === 0) {
    advice.push('当前运营状况良好，继续保持');
  }
  
  return advice;
}

/**
 * 计算近期负面事件数量
 * @param incidents 事件列表
 * @param days 最近几天内
 * @returns 负面事件数量
 */
export function countRecentNegativeIncidents(
  incidents: Array<{ createdAt: string; severity: IncidentSeverity }>,
  days: number = 7
): number {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  return incidents.filter(incident => {
    const incidentDate = new Date(incident.createdAt);
    return incidentDate >= cutoffDate && (incident.severity === '中' || incident.severity === '高');
  }).length;
}
