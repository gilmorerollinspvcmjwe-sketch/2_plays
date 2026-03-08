import type { NewsImpact } from '@/engine/market/competitorNewsSystem';

/**
 * 影响等级类型
 */
export type ImpactLevel = 'low' | 'medium' | 'high';

/**
 * 影响趋势类型
 */
export type ImpactTrend = 'improving' | 'worsening' | 'stable';

/**
 * 判定影响等级
 * 根据影响值的绝对值判断影响程度
 * 
 * @param value - 影响值
 * @param thresholds - 可选，自定义阈值配置
 * @returns 影响等级
 */
export function getImpactLevel(value: number, thresholds?: { low: number; medium: number }): ImpactLevel {
  const lowThreshold = thresholds?.low ?? 0.3;
  const mediumThreshold = thresholds?.medium ?? 0.6;
  
  const absValue = Math.abs(value);
  
  if (absValue >= mediumThreshold) {
    return 'high';
  }
  if (absValue >= lowThreshold) {
    return 'medium';
  }
  return 'low';
}

/**
 * 分析影响趋势
 * 比较当前值和历史值，判断趋势变化
 * 
 * @param currentValue - 当前影响值
 * @param previousValue - 历史影响值
 * @param threshold - 可选，变化阈值，默认为 0.1
 * @returns 影响趋势
 */
export function analyzeImpactTrend(currentValue: number, previousValue: number, threshold: number = 0.1): ImpactTrend {
  const diff = currentValue - previousValue;
  
  if (diff > threshold) {
    return 'improving';
  }
  if (diff < -threshold) {
    return 'worsening';
  }
  return 'stable';
}

/**
 * 计算综合影响分数
 * 将 NewsImpact 的各个维度加权计算出一个综合分数
 * 
 * @param impact - 新闻影响对象
 * @param weights - 可选，各维度权重配置
 * @returns 综合影响分数 (-1 到 1)
 */
export function calculateCompositeScore(
  impact: NewsImpact,
  weights?: {
    marketSentiment: number;
    competitionIntensity: number;
    playerMigrationRisk: number;
    revenueImpact: number;
    reputationImpact: number;
  }
): number {
  const w = weights ?? {
    marketSentiment: 0.25,
    competitionIntensity: 0.15,
    playerMigrationRisk: 0.20,
    revenueImpact: 0.25,
    reputationImpact: 0.15,
  };
  
  // 将 competitionIntensity 和 playerMigrationRisk 转换为负向影响
  const normalizedCompetition = -impact.competitionIntensity;
  const normalizedMigration = -impact.playerMigrationRisk;
  
  const score =
    impact.marketSentiment * w.marketSentiment +
    normalizedCompetition * w.competitionIntensity +
    normalizedMigration * w.playerMigrationRisk +
    impact.revenueImpact * w.revenueImpact +
    impact.reputationImpact * w.reputationImpact;
  
  // 确保分数在 -1 到 1 之间
  return Math.max(-1, Math.min(1, score));
}

/**
 * 合并多个影响对象
 * 用于将多个新闻的影响进行叠加
 * 
 * @param impacts - 影响对象数组
 * @param strategy - 合并策略：'sum' | 'max' | 'latest'
 * @returns 合并后的影响对象
 */
export function mergeImpacts(impacts: NewsImpact[], strategy: 'sum' | 'max' | 'latest' = 'sum'): NewsImpact {
  if (impacts.length === 0) {
    return {
      marketSentiment: 0,
      competitionIntensity: 0,
      playerMigrationRisk: 0,
      revenueImpact: 0,
      reputationImpact: 0,
    };
  }
  
  if (strategy === 'latest') {
    return impacts[impacts.length - 1];
  }
  
  if (strategy === 'max') {
    return impacts.reduce((acc, impact) => ({
      marketSentiment: Math.max(acc.marketSentiment, impact.marketSentiment),
      competitionIntensity: Math.max(acc.competitionIntensity, impact.competitionIntensity),
      playerMigrationRisk: Math.max(acc.playerMigrationRisk, impact.playerMigrationRisk),
      revenueImpact: Math.max(acc.revenueImpact, impact.revenueImpact),
      reputationImpact: Math.max(acc.reputationImpact, impact.reputationImpact),
    }));
  }
  
  // sum 策略
  return impacts.reduce((acc, impact) => ({
    marketSentiment: acc.marketSentiment + impact.marketSentiment,
    competitionIntensity: Math.max(acc.competitionIntensity, impact.competitionIntensity),
    playerMigrationRisk: Math.max(acc.playerMigrationRisk, impact.playerMigrationRisk),
    revenueImpact: acc.revenueImpact + impact.revenueImpact,
    reputationImpact: acc.reputationImpact + impact.reputationImpact,
  }));
}

/**
 * 格式化影响描述
 * 将影响对象转换为可读的文本描述
 * 
 * @param impact - 新闻影响对象
 * @returns 影响描述字符串
 */
export function formatImpactDescription(impact: NewsImpact): string {
  const descriptions: string[] = [];
  
  if (impact.marketSentiment !== 0) {
    const level = getImpactLevel(impact.marketSentiment);
    const sentiment = impact.marketSentiment > 0 ? '提振' : '打击';
    descriptions.push(`市场情感${sentiment}(${level})`);
  }
  
  if (impact.competitionIntensity > 0) {
    const level = getImpactLevel(impact.competitionIntensity);
    descriptions.push(`竞争强度增加(${level})`);
  }
  
  if (impact.playerMigrationRisk > 0) {
    const level = getImpactLevel(impact.playerMigrationRisk);
    descriptions.push(`玩家流失风险${level}`);
  }
  
  if (impact.revenueImpact !== 0) {
    const level = getImpactLevel(impact.revenueImpact);
    const direction = impact.revenueImpact > 0 ? '收入增长' : '收入下降';
    descriptions.push(`${direction}(${level})`);
  }
  
  if (impact.reputationImpact !== 0) {
    const level = getImpactLevel(impact.reputationImpact);
    const direction = impact.reputationImpact > 0 ? '声誉提升' : '声誉受损';
    descriptions.push(`${direction}(${level})`);
  }
  
  return descriptions.length > 0 ? descriptions.join('，') : '无明显影响';
}

/**
 * 单元测试用例（注释形式）
 * 
 * @example
 * ```typescript
 * // 测试 getImpactLevel
 * console.assert(getImpactLevel(0.1) === 'low', '低影响值应返回 low');
 * console.assert(getImpactLevel(0.4) === 'medium', '中影响值应返回 medium');
 * console.assert(getImpactLevel(0.7) === 'high', '高影响值应返回 high');
 * console.assert(getImpactLevel(-0.7) === 'high', '负高影响值应返回 high');
 * 
 * // 测试 analyzeImpactTrend
 * console.assert(analyzeImpactTrend(0.8, 0.5) === 'improving', '值增加应返回 improving');
 * console.assert(analyzeImpactTrend(0.3, 0.6) === 'worsening', '值减少应返回 worsening');
 * console.assert(analyzeImpactTrend(0.5, 0.48) === 'stable', '值变化小应返回 stable');
 * 
 * // 测试 calculateCompositeScore
 * const impact1: NewsImpact = {
 *   marketSentiment: 0.5,
 *   competitionIntensity: 0.3,
 *   playerMigrationRisk: 0.2,
 *   revenueImpact: 0.4,
 *   reputationImpact: 0.3
 * };
 * const score1 = calculateCompositeScore(impact1);
 * console.assert(score1 > 0 && score1 <= 1, '正面影响应返回正分数');
 * 
 * const impact2: NewsImpact = {
 *   marketSentiment: -0.5,
 *   competitionIntensity: 0.8,
 *   playerMigrationRisk: 0.6,
 *   revenueImpact: -0.3,
 *   reputationImpact: -0.4
 * };
 * const score2 = calculateCompositeScore(impact2);
 * console.assert(score2 < 0 && score2 >= -1, '负面影响应返回负分数');
 * 
 * // 测试 mergeImpacts
 * const impacts: NewsImpact[] = [
 *   { marketSentiment: 0.3, competitionIntensity: 0.2, playerMigrationRisk: 0.1, revenueImpact: 0.2, reputationImpact: 0.1 },
 *   { marketSentiment: 0.5, competitionIntensity: 0.4, playerMigrationRisk: 0.3, revenueImpact: 0.4, reputationImpact: 0.3 }
 * ];
 * const merged = mergeImpacts(impacts, 'sum');
 * console.assert(merged.marketSentiment === 0.8, 'sum 策略应累加 marketSentiment');
 * console.assert(merged.competitionIntensity === 0.4, 'sum 策略应取 competitionIntensity 最大值');
 * 
 * // 测试 formatImpactDescription
 * const impact3: NewsImpact = {
 *   marketSentiment: 0.5,
 *   competitionIntensity: 0.3,
 *   playerMigrationRisk: 0,
 *   revenueImpact: 0,
 *   reputationImpact: 0
 * };
 * const desc = formatImpactDescription(impact3);
 * console.assert(desc.includes('市场情感'), '描述应包含市场情感');
 * console.assert(desc.includes('竞争强度'), '描述应包含竞争强度');
 * ```
 */
