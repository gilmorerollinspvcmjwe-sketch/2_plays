/**
 * 项目质量评分系统
 * 用于评估角色、剧情和项目的综合质量
 */

// 角色质量评分接口
export interface CharacterQualityScore {
  baseScore: number;        // 基础属性 40%
  popularityScore: number;  // 人气指标 30%
  interactionScore: number; // 互动深度 20%
  artScore: number;         // 美术质量 10%
  totalScore: number;       // 综合评分 0-1
}

// 剧情质量评分接口
export interface PlotQualityScore {
  structureScore: number;  // 结构完整度 30%
  branchScore: number;     // 分支丰富度 25%
  contentScore: number;    // 内容质量 25%
  tagMatchScore: number;   // 标签匹配度 20%
  totalScore: number;      // 综合评分 0-1
}

// 项目整体质量评分接口
export interface ProjectQualityScore {
  characterScore: number;  // 角色质量 40%
  plotScore: number;       // 剧情质量 35%
  operationScore: number;  // 运营配置 25%
  totalScore: number;      // 综合评分 0-1
}

/**
 * 计算角色质量评分
 * @param character 角色数据
 * @returns 角色质量评分
 */
export function calculateCharacterQuality(character: any): CharacterQualityScore {
  // 基础属性评分 (40%) - 基于属性完整度
  const hasAttributes = character.attributes && Object.keys(character.attributes).length > 0;
  const hasBackground = character.background && character.background.length > 10;
  const hasPersonality = character.personality && character.personality.length > 0;
  const baseScore = (hasAttributes ? 0.3 : 0) + (hasBackground ? 0.25 : 0) + (hasPersonality ? 0.25 : 0) + 0.2;
  
  // 人气评分 (30%) - 基于当前人气值
  const popularityValue = character.popularity?.base || character.popularity || 50;
  const popularityScore = Math.min(1, popularityValue / 100);
  
  // 互动深度评分 (20%) - 基于亲密度系统和约会场景
  const intimacyCount = character.intimacy?.length || 0;
  const dateCount = character.dates?.length || 0;
  const voiceCount = character.voices?.length || 0;
  const interactionScore = Math.min(1, (intimacyCount * 0.5 + dateCount * 0.8 + voiceCount * 0.3) / 10);
  
  // 美术质量评分 (10%) - 基于视觉配置
  const hasVisual = character.visual && (character.visual.avatar || character.visual.fullBody);
  const artScore = hasVisual ? (character.visual.quality || 0.7) : 0.4;
  
  // 综合评分
  const totalScore = 
    baseScore * 0.4 + 
    popularityScore * 0.3 + 
    interactionScore * 0.2 + 
    artScore * 0.1;
  
  return { 
    baseScore: Math.min(1, baseScore), 
    popularityScore, 
    interactionScore, 
    artScore, 
    totalScore: Math.min(1, totalScore) 
  };
}

/**
 * 计算剧情质量评分
 * @param plot 剧情数据
 * @param characters 关联角色数据
 * @returns 剧情质量评分
 */
export function calculatePlotQuality(plot: any, characters: any[] = []): PlotQualityScore {
  // 结构完整度 (30%) - 基于章节数量
  const chapterCount = plot.chapters?.length || 0;
  const structureScore = Math.min(1, chapterCount / 8);
  
  // 分支丰富度 (25%) - 基于分支节点数
  const nodeCount = plot.nodes?.length || 0;
  const branchScore = Math.min(1, nodeCount / 15);
  
  // 内容质量 (25%) - 基于AI评分或默认中等
  const contentScore = (plot.quality || 70) / 100;
  
  // 标签匹配度 (20%) - 基于与角色标签的匹配
  const tagMatchScore = calculateTagMatch(plot.tags, characters);
  
  // 综合评分
  const totalScore = 
    structureScore * 0.3 + 
    branchScore * 0.25 + 
    contentScore * 0.25 + 
    tagMatchScore * 0.2;
  
  return { 
    structureScore, 
    branchScore, 
    contentScore, 
    tagMatchScore, 
    totalScore 
  };
}

/**
 * 计算项目整体质量评分
 * @param characters 项目角色列表
 * @param plots 项目剧情列表
 * @returns 项目质量评分
 */
export function calculateProjectQuality(
  characters: any[] = [], 
  plots: any[] = []
): ProjectQualityScore {
  // 角色质量平均分 (40%)
  const characterScores = characters.map(c => calculateCharacterQuality(c).totalScore);
  const characterScore = characterScores.length > 0 
    ? characterScores.reduce((a, b) => a + b, 0) / characterScores.length 
    : 0.5;
  
  // 剧情质量平均分 (35%)
  const plotScores = plots.map(p => calculatePlotQuality(p, characters).totalScore);
  const plotScore = plotScores.length > 0 
    ? plotScores.reduce((a, b) => a + b, 0) / plotScores.length 
    : 0.5;
  
  // 运营配置默认中等 (25%) - 后续根据实际运营配置调整
  const operationScore = 0.6;
  
  // 综合评分
  const totalScore = 
    characterScore * 0.4 + 
    plotScore * 0.35 + 
    operationScore * 0.25;
  
  return { 
    characterScore, 
    plotScore, 
    operationScore, 
    totalScore 
  };
}

/**
 * 计算运营配置合理性评分
 * @param config 运营配置
 * @returns 运营配置评分
 */
export function calculateOperationConfigScore(config: {
  ssrRate?: number;
  activityCount?: number;
  recentWelfare?: number;
}): number {
  // 爆率合理性 (40%) - SSR爆率在2%-5%之间为合理
  const ssrRate = config.ssrRate || 0.02;
  const rateScore = ssrRate >= 0.02 && ssrRate <= 0.05 
    ? 1 - Math.abs(ssrRate - 0.03) / 0.03 
    : Math.max(0, 1 - Math.abs(ssrRate - 0.03) / 0.05);
  
  // 活动丰富度 (30%) - 2-4个活动为理想
  const activityCount = config.activityCount || 0;
  const activityScore = activityCount >= 2 && activityCount <= 4 
    ? 0.8 + (activityCount - 2) * 0.1 
    : Math.max(0, 1 - Math.abs(activityCount - 3) / 5);
  
  // 福利满意度 (30%) - 基于近期福利价值
  const welfareValue = config.recentWelfare || 0;
  const welfareScore = Math.min(1, welfareValue / 1000);
  
  return rateScore * 0.4 + activityScore * 0.3 + welfareScore * 0.3;
}

/**
 * 辅助函数：计算标签匹配度
 * @param plotTags 剧情标签
 * @param characters 角色列表
 * @returns 匹配度 0-1
 */
function calculateTagMatch(plotTags: string[] = [], characters: any[] = []): number {
  if (plotTags.length === 0) return 0.5;
  if (characters.length === 0) return 0.5;
  
  // 收集所有角色的标签
  const allCharTags = characters.flatMap(c => c.tags || []);
  if (allCharTags.length === 0) return 0.5;
  
  // 计算匹配的标签数量
  const matchedTags = plotTags.filter(tag => allCharTags.includes(tag));
  const matchRatio = matchedTags.length / plotTags.length;
  
  // 基础分0.3，匹配度越高分数越高
  return 0.3 + matchRatio * 0.7;
}

/**
 * 计算玩家满意度
 * @param params 满意度参数
 * @returns 满意度 0-1
 */
export function calculateSatisfaction(params: {
  plotQuality: number;
  rateFairness: number;
  welfareSatisfaction: number;
}): number {
  const { plotQuality, rateFairness, welfareSatisfaction } = params;
  
  // 基础满意度 0.5
  let satisfaction = 0.5;
  
  // 剧情质量影响 (40%)
  satisfaction += (plotQuality - 0.5) * 0.4;
  
  // 爆率公平性影响 (35%)
  satisfaction += (rateFairness - 0.5) * 0.35;
  
  // 福利满意度影响 (25%)
  satisfaction += (welfareSatisfaction - 0.5) * 0.25;
  
  // 限制在 0-1 范围
  return Math.max(0, Math.min(1, satisfaction));
}

/**
 * 计算留存率
 * @param params 留存率参数
 * @returns 留存率 0-1
 */
export function calculateRetention(params: {
  satisfaction: number;
  characterAppeal: number;
  activityRichness: number;
  communityVibe: number;
}): number {
  const { satisfaction, characterAppeal, activityRichness, communityVibe } = params;
  
  // 基础留存率 60%
  let retention = 0.6;
  
  // 满意度影响 (40%)
  retention += (satisfaction - 0.5) * 0.4;
  
  // 角色吸引力影响 (30%)
  retention += (characterAppeal - 0.5) * 0.3;
  
  // 活动丰富度影响 (20%)
  retention += (activityRichness - 0.5) * 0.2;
  
  // 社区氛围影响 (10%)
  retention += (communityVibe - 0.5) * 0.1;
  
  return Math.max(0.1, Math.min(0.95, retention));
}

/**
 * 计算付费率
 * @param params 付费率参数
 * @returns 付费率 0-1
 */
export function calculatePayRate(params: {
  characterPopularity: number;
  gachaAppeal: number;
  economyBalance?: number;
}): number {
  const { characterPopularity, gachaAppeal, economyBalance = 0.5 } = params;
  
  // 基础付费率 5%
  let payRate = 0.05;
  
  // 角色人气影响 (40%)
  payRate += characterPopularity * 0.15;
  
  // 卡池吸引力影响 (40%)
  payRate += gachaAppeal * 0.15;
  
  // 经济平衡影响 (20%)
  payRate += (economyBalance - 0.5) * 0.05;
  
  return Math.max(0.01, Math.min(0.5, payRate));
}

/**
 * 计算评论情感
 * @param params 情感参数
 * @returns 情感类型
 */
export function calculateCommentSentiment(params: {
  satisfaction: number;
  plotTagMatch?: number;
  recentEvents?: string[];
}): 'positive' | 'neutral' | 'negative' {
  const { satisfaction, plotTagMatch = 0.5, recentEvents = [] } = params;
  
  let sentimentScore = satisfaction;
  
  // 剧情标签匹配加分
  sentimentScore += (plotTagMatch - 0.5) * 0.2;
  
  // 运营事件影响
  recentEvents.forEach(event => {
    if (event === 'good_welfare') sentimentScore += 0.1;
    if (event === 'rate_controversy') sentimentScore -= 0.2;
    if (event === 'plot_backlash') sentimentScore -= 0.15;
    if (event === 'good_event') sentimentScore += 0.08;
    if (event === 'character_birthday') sentimentScore += 0.05;
  });
  
  if (sentimentScore > 0.6) return 'positive';
  if (sentimentScore < 0.4) return 'negative';
  return 'neutral';
}
