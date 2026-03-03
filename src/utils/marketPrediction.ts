import type { MarketTrend, Competitor, Festival, RevenueForecast, MarketEnvironment } from '@/types/market';

/**
 * 预测市场趋势
 * 基于历史数据的时间序列分析
 */
export function predictTrend(
  historicalTrends: MarketTrend[],
  days: number = 7
): Array<{
  date: Date;
  predictedStrength: number;
  confidence: number;
}> {
  if (historicalTrends.length < 2) {
    // 数据不足，返回简单预测
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
      predictedStrength: 50,
      confidence: 30
    }));
  }

  // 计算趋势变化率
  const changes: number[] = [];
  for (let i = 1; i < historicalTrends.length; i++) {
    const change = historicalTrends[i].strength - historicalTrends[i - 1].strength;
    changes.push(change);
  }

  // 计算平均变化率
  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  const lastStrength = historicalTrends[historicalTrends.length - 1].strength;

  // 生成预测
  const predictions: Array<{ date: Date; predictedStrength: number; confidence: number }> = [];

  for (let i = 1; i <= days; i++) {
    // 使用指数衰减模拟不确定性增加
    const decayFactor = Math.exp(-i / 10);
    const predictedStrength = Math.max(0, Math.min(100,
      lastStrength + avgChange * i * decayFactor
    ));

    // 置信度随时间递减
    const confidence = Math.round(80 * decayFactor + 20);

    predictions.push({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      predictedStrength: Math.round(predictedStrength),
      confidence
    });
  }

  return predictions;
}

/**
 * 推荐最佳发布时间
 */
export function recommendReleaseTime(
  environment: MarketEnvironment,
  gameTags: string[] = []
): Array<{
  date: Date;
  score: number;
  reason: string;
}> {
  const recommendations: Array<{ date: Date; score: number; reason: string }> = [];
  const now = new Date();

  // 分析未来30天
  for (let i = 7; i <= 30; i++) {
    const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    let score = 50; // 基础分数
    const reasons: string[] = [];

    // 1. 检查节日效应
    const festival = environment.festivals?.find(f =>
      f.startDate <= date && f.endDate >= date
    );
    if (festival) {
      const tagMatch = gameTags.some(tag =>
        festival.specialEvents?.some(event => event.includes(tag))
      );
      if (tagMatch) {
        score += 25;
        reasons.push(`${festival.name}期间，题材匹配度高`);
      } else {
        score += 15;
        reasons.push(`${festival.name}期间，市场活跃度高`);
      }
    }

    // 2. 检查竞品发布
    const competitorLaunch = environment.competitors?.some(c => {
      // 模拟竞品可能在近期发布
      const launchDate = new Date(now.getTime() + (i - 5) * 24 * 60 * 60 * 1000);
      return Math.abs(launchDate.getTime() - date.getTime()) < 3 * 24 * 60 * 60 * 1000;
    });
    if (competitorLaunch) {
      score -= 20;
      reasons.push('近期有竞品发布，竞争激烈');
    }

    // 3. 检查趋势匹配
    if (environment.trend) {
      const trendMatch = gameTags.some(tag =>
        environment.trend?.affectedTags?.includes(tag)
      );
      if (trendMatch && environment.trend.strength > 60) {
        score += 20;
        reasons.push('当前市场趋势与游戏题材高度匹配');
      }
    }

    // 4. 避开周末发布（工作日玩家更关注新游戏）
    const dayOfWeek = date.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 3) { // 周一到周三
      score += 10;
      reasons.push('工作日发布，玩家关注度较高');
    } else if (dayOfWeek === 0 || dayOfWeek === 6) { // 周末
      score -= 5;
      reasons.push('周末发布，关注度可能分散');
    }

    // 5. 市场热度
    if (environment.overallHeat > 70) {
      score += 10;
      reasons.push('当前市场整体热度较高');
    }

    recommendations.push({
      date,
      score: Math.max(0, Math.min(100, score)),
      reason: reasons.length > 0 ? reasons.join('；') : '常规发布窗口'
    });
  }

  // 按分数排序
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 5);
}

/**
 * 计算市场机会指数
 */
export function calculateMarketOpportunity(
  environment: MarketEnvironment,
  gameTags: string[] = []
): {
  overallScore: number;
  factors: Array<{ name: string; score: number; weight: number }>;
  analysis: string;
} {
  const factors: Array<{ name: string; score: number; weight: number }> = [];

  // 1. 市场热度 (权重: 25%)
  const heatScore = environment.overallHeat || 50;
  factors.push({ name: '市场热度', score: heatScore, weight: 0.25 });

  // 2. 竞争强度 (权重: 25%) - 反向指标
  const competitorScore = Math.max(0, 100 - (environment.competitors?.length || 0) * 15);
  factors.push({ name: '竞争强度', score: competitorScore, weight: 0.25 });

  // 3. 趋势匹配度 (权重: 20%)
  let trendScore = 50;
  if (environment.trend && gameTags.length > 0) {
    const matchingTags = gameTags.filter(tag =>
      environment.trend?.affectedTags?.includes(tag)
    );
    trendScore = Math.min(100, 50 + (matchingTags.length / gameTags.length) * 50);
  }
  factors.push({ name: '趋势匹配', score: trendScore, weight: 0.20 });

  // 4. 节日效应 (权重: 15%)
  let festivalScore = 50;
  const upcomingFestivals = environment.festivals?.filter(f => f.startDate > new Date()) || [];
  if (upcomingFestivals.length > 0) {
    const nearestFestival = upcomingFestivals[0];
    const daysUntil = Math.ceil((nearestFestival.startDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    if (daysUntil <= 14) {
      festivalScore = 80;
    } else if (daysUntil <= 30) {
      festivalScore = 65;
    }
  }
  factors.push({ name: '节日效应', score: festivalScore, weight: 0.15 });

  // 5. 市场饱和度 (权重: 15%) - 基于竞品数量和质量
  const saturationScore = Math.max(0, 100 - (environment.competitors?.reduce((sum, c) =>
    sum + c.threatLevel * 10, 0) || 0));
  factors.push({ name: '市场饱和度', score: saturationScore, weight: 0.15 });

  // 计算综合得分
  const overallScore = Math.round(
    factors.reduce((sum, f) => sum + f.score * f.weight, 0)
  );

  // 生成分析文本
  let analysis = '';
  if (overallScore >= 80) {
    analysis = '市场机会极佳！当前市场环境非常有利，建议尽快发布。';
  } else if (overallScore >= 60) {
    analysis = '市场机会良好，具备发布条件，建议做好充分准备。';
  } else if (overallScore >= 40) {
    analysis = '市场机会一般，存在一定风险，建议谨慎评估。';
  } else {
    analysis = '市场机会较差，建议等待更好的时机或调整策略。';
  }

  // 添加具体建议
  const lowestFactor = factors.reduce((min, f) => f.score < min.score ? f : min);
  if (lowestFactor.score < 40) {
    analysis += ` 主要短板：${lowestFactor.name}(${lowestFactor.score}分)，建议重点改善。`;
  }

  return { overallScore, factors, analysis };
}

/**
 * 预测收入
 */
export function forecastRevenue(
  environment: MarketEnvironment,
  gameStats: {
    quality: number;
    marketing: number;
    price: number;
  },
  days: number = 30
): RevenueForecast {
  // 基础参数
  const baseUsers = 10000; // 基础用户量
  const marketSize = environment.overallHeat || 50;

  // 计算各因素影响
  const qualityFactor = gameStats.quality / 100; // 0-1
  const marketingFactor = gameStats.marketing / 100; // 0-1
  const priceFactor = Math.max(0.3, 1 - (gameStats.price - 6) / 20); // 价格越高，转化率越低

  // 竞争影响
  const competitionFactor = Math.max(0.3, 1 - (environment.competitors?.length || 0) * 0.1);

  // 趋势匹配加成
  let trendBonus = 1;
  if (environment.trend?.strength && environment.trend.strength > 60) {
    trendBonus = 1.2;
  }

  // 预测总用户数
  const predictedTotalUsers = Math.round(
    baseUsers * (marketSize / 50) * qualityFactor * marketingFactor * competitionFactor * trendBonus
  );

  // 付费转化率 (乙游通常在3-8%)
  const conversionRate = 0.03 + (qualityFactor * 0.05);
  const payingUsers = Math.round(predictedTotalUsers * conversionRate);

  // ARPU (每用户平均收入)
  const arpu = Math.round(gameStats.price * (1 + qualityFactor * 0.5));

  // 预测总收入
  const totalRevenue = payingUsers * arpu;

  // 留存率预测
  const baseRetention = 25; // 基础留存率25%
  const retention = Math.min(50, baseRetention + qualityFactor * 20 + marketingFactor * 5);

  // 计算置信度
  const dataCompleteness = [
    environment.trend ? 1 : 0,
    environment.competitors && environment.competitors.length > 0 ? 1 : 0,
    environment.festivals && environment.festivals.length > 0 ? 1 : 0,
    gameStats.quality > 0 ? 1 : 0,
    gameStats.marketing > 0 ? 1 : 0
  ].reduce((a, b) => a + b, 0) / 5;

  const confidence = Math.round(50 + dataCompleteness * 40 + Math.random() * 10);

  return {
    totalRevenue,
    totalUsers: predictedTotalUsers,
    payingUsers,
    arpu,
    retention: Math.round(retention),
    confidence: Math.min(95, confidence)
  };
}

/**
 * 预测下载量
 */
export function forecastDownloads(
  environment: MarketEnvironment,
  marketingBudget: number,
  days: number = 30
): {
  dailyDownloads: number[];
  totalDownloads: number;
  peakDay: number;
  confidence: number;
} {
  const dailyDownloads: number[] = [];
  let totalDownloads = 0;
  let peakDay = 0;
  let maxDownloads = 0;

  // 基础下载量
  const baseDownloads = 100 + marketingBudget / 10;
  const marketMultiplier = (environment.overallHeat || 50) / 50;

  for (let i = 0; i < days; i++) {
    // 模拟下载曲线：前两天高，然后逐渐下降
    let dayMultiplier: number;
    if (i < 2) {
      dayMultiplier = 2.0 - i * 0.3;
    } else if (i < 7) {
      dayMultiplier = 1.2 - (i - 2) * 0.1;
    } else {
      dayMultiplier = 0.7 - (i - 7) * 0.02;
    }

    // 添加随机波动
    const randomFactor = 0.8 + Math.random() * 0.4;

    const downloads = Math.round(baseDownloads * dayMultiplier * marketMultiplier * randomFactor);
    dailyDownloads.push(downloads);
    totalDownloads += downloads;

    if (downloads > maxDownloads) {
      maxDownloads = downloads;
      peakDay = i;
    }
  }

  // 置信度基于数据完整性
  const confidence = Math.round(60 + (environment.trend ? 15 : 0) + (marketingBudget > 0 ? 15 : 0));

  return { dailyDownloads, totalDownloads, peakDay, confidence };
}

/**
 * 竞品分析报告
 */
export function analyzeCompetitors(
  competitors: Competitor[],
  ourGameTags: string[] = []
): {
  threatLevel: 'low' | 'medium' | 'high' | 'extreme';
  directCompetitors: Competitor[];
  opportunities: string[];
  threats: string[];
} {
  // 识别直接竞品（标签重叠）
  const directCompetitors = competitors.filter(c =>
    c.tags.some(tag => ourGameTags.includes(tag))
  );

  // 计算威胁等级
  const avgThreat = competitors.reduce((sum, c) => sum + c.threatLevel, 0) / competitors.length;
  let threatLevel: 'low' | 'medium' | 'high' | 'extreme';
  if (avgThreat < 2) threatLevel = 'low';
  else if (avgThreat < 3.5) threatLevel = 'medium';
  else if (avgThreat < 4.5) threatLevel = 'high';
  else threatLevel = 'extreme';

  // 识别机会
  const opportunities: string[] = [];

  // 竞品弱点
  const weakCompetitors = competitors.filter(c =>
    c.weaknesses && c.weaknesses.length > 2
  );
  if (weakCompetitors.length > 0) {
    opportunities.push(`${weakCompetitors.length}家竞品存在明显弱点，可针对性竞争`);
  }

  // 市场空白
  const coveredTags = new Set(competitors.flatMap(c => c.tags));
  const uncoveredTags = ourGameTags.filter(tag => !coveredTags.has(tag));
  if (uncoveredTags.length > 0) {
    opportunities.push(`独特题材标签：${uncoveredTags.join('、')}，差异化竞争优势`);
  }

  // 识别威胁
  const threats: string[] = [];

  const strongCompetitors = competitors.filter(c => c.threatLevel >= 4);
  if (strongCompetitors.length > 0) {
    threats.push(`${strongCompetitors.length}家强势竞品，竞争激烈`);
  }

  const highRevenueCompetitors = competitors.filter(c => c.revenue > 50000000);
  if (highRevenueCompetitors.length > 0) {
    threats.push('头部竞品资金雄厚，营销压力大');
  }

  return { threatLevel, directCompetitors, opportunities, threats };
}

/**
 * 生成完整的市场预测报告
 */
export function generateMarketReport(
  environment: MarketEnvironment,
  gameStats: {
    tags: string[];
    quality: number;
    marketing: number;
    price: number;
  },
  historicalTrends: MarketTrend[]
): {
  opportunityIndex: number;
  recommendedReleaseDates: Array<{ date: Date; score: number; reason: string }>;
  revenueForecast: RevenueForecast;
  competitorAnalysis: ReturnType<typeof analyzeCompetitors>;
  trendPrediction: ReturnType<typeof predictTrend>;
  suggestions: string[];
} {
  // 1. 市场机会指数
  const opportunityResult = calculateMarketOpportunity(environment, gameStats.tags);

  // 2. 推荐发布时间
  const recommendedReleaseDates = recommendReleaseTime(environment, gameStats.tags);

  // 3. 收入预测
  const revenueForecast = forecastRevenue(environment, {
    quality: gameStats.quality,
    marketing: gameStats.marketing,
    price: gameStats.price
  });

  // 4. 竞品分析
  const competitorAnalysis = analyzeCompetitors(environment.competitors || [], gameStats.tags);

  // 5. 趋势预测
  const trendPrediction = predictTrend(historicalTrends, 14);

  // 6. 生成建议
  const suggestions: string[] = [];

  if (opportunityResult.overallScore >= 70) {
    suggestions.push('当前市场机会良好，建议尽快启动发布计划');
  }

  if (recommendedReleaseDates.length > 0 && recommendedReleaseDates[0].score >= 80) {
    const bestDate = recommendedReleaseDates[0].date;
    suggestions.push(`最佳发布日期：${bestDate.toLocaleDateString('zh-CN')}，${recommendedReleaseDates[0].reason}`);
  }

  if (competitorAnalysis.threatLevel === 'high' || competitorAnalysis.threatLevel === 'extreme') {
    suggestions.push('竞争激烈，建议加强营销推广，突出差异化优势');
  }

  if (revenueForecast.confidence < 70) {
    suggestions.push('预测置信度较低，建议收集更多市场数据以提高预测准确性');
  }

  const trendDirection = trendPrediction[trendPrediction.length - 1]?.predictedStrength >
    trendPrediction[0]?.predictedStrength ? '上升' : '下降';
  suggestions.push(`未来两周市场趋势预计${trendDirection}，${trendDirection === '上升' ? '把握机会' : '谨慎应对'}`);

  return {
    opportunityIndex: opportunityResult.overallScore,
    recommendedReleaseDates,
    revenueForecast,
    competitorAnalysis,
    trendPrediction,
    suggestions
  };
}

/**
 * 风险评估
 */
export function assessMarketRisk(
  environment: MarketEnvironment,
  gameTags: string[] = []
): {
  overallRisk: 'low' | 'medium' | 'high';
  riskFactors: Array<{ factor: string; level: 'low' | 'medium' | 'high'; description: string }>;
  mitigationStrategies: string[];
} {
  const riskFactors: Array<{ factor: string; level: 'low' | 'medium' | 'high'; description: string }> = [];

  // 1. 竞争风险
  const competitorCount = environment.competitors?.length || 0;
  const highThreatCount = environment.competitors?.filter(c => c.threatLevel >= 4).length || 0;
  let competitionRisk: 'low' | 'medium' | 'high' = 'low';
  if (highThreatCount >= 2) competitionRisk = 'high';
  else if (competitorCount >= 3) competitionRisk = 'medium';
  riskFactors.push({
    factor: '竞争风险',
    level: competitionRisk,
    description: `${competitorCount}家竞品，其中${highThreatCount}家威胁等级较高`
  });

  // 2. 趋势风险
  let trendRisk: 'low' | 'medium' | 'high' = 'low';
  if (environment.trend?.strength && environment.trend.strength < 40) {
    trendRisk = 'high';
  } else if (!environment.trend) {
    trendRisk = 'medium';
  }
  riskFactors.push({
    factor: '趋势风险',
    level: trendRisk,
    description: environment.trend ? `当前趋势强度${environment.trend.strength}分` : '市场趋势不明朗'
  });

  // 3. 时机风险
  let timingRisk: 'low' | 'medium' | 'high' = 'low';
  const upcomingFestivals = environment.festivals?.filter(f =>
    f.startDate > new Date() && f.startDate < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  );
  if (upcomingFestivals && upcomingFestivals.length === 0) {
    timingRisk = 'medium';
  }
  riskFactors.push({
    factor: '时机风险',
    level: timingRisk,
    description: upcomingFestivals && upcomingFestivals.length > 0
      ? `近期有${upcomingFestivals.length}个节日`
      : '近期无重要节日'
  });

  // 计算整体风险
  const riskScore = riskFactors.reduce((sum, r) => {
    return sum + (r.level === 'high' ? 3 : r.level === 'medium' ? 2 : 1);
  }, 0);

  let overallRisk: 'low' | 'medium' | 'high';
  if (riskScore >= 7) overallRisk = 'high';
  else if (riskScore >= 4) overallRisk = 'medium';
  else overallRisk = 'low';

  // 生成应对策略
  const mitigationStrategies: string[] = [];

  if (competitionRisk === 'high') {
    mitigationStrategies.push('加强差异化定位，避免与头部竞品正面竞争');
    mitigationStrategies.push('寻找细分市场，精准定位目标用户');
  }

  if (trendRisk === 'high') {
    mitigationStrategies.push('关注市场动态，灵活调整游戏内容');
    mitigationStrategies.push('考虑多题材融合，降低单一趋势依赖');
  }

  if (timingRisk === 'medium') {
    mitigationStrategies.push('考虑创造营销节点，弥补节日空白');
  }

  mitigationStrategies.push('建立风险预警机制，及时应对市场变化');

  return { overallRisk, riskFactors, mitigationStrategies };
}
