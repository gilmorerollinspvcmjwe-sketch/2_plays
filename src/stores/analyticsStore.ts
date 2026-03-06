import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { TickContext } from './projectOperationStore';

// ==================== 类型定义 ====================

/** 情绪趋势 */
export type SentimentTrend = 'positive' | 'neutral' | 'negative';

/** 趋势线数据点 */
export interface TrendPoint {
  day: number;
  value: number;
}

/** 趋势线 */
export type TrendLine = TrendPoint[];

/** 分析数据 */
export interface AnalyticsData {
  // 全局留存率
  retention: {
    d1: number;
    d7: number;
    d30: number;
    trend: 'up' | 'stable' | 'down';
  };
  
  // 情绪分布
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    trend: SentimentTrend;
  };
  
  // 趋势数据
  trends: {
    dauTrend: TrendLine;
    revenueTrend: TrendLine;
    satisfactionTrend: TrendLine;
  };
  
  // 热门项目排行
  topProjects: {
    projectId: string;
    projectName: string;
    rank: number;
    score: number;
  }[];
}

// ==================== Store 定义 ====================

export const useAnalyticsStore = defineStore('analytics', () => {
  // 数据
  const analyticsData = ref<AnalyticsData>({
    retention: { d1: 0, d7: 0, d30: 0, trend: 'stable' },
    sentiment: { positive: 0, neutral: 0, negative: 0, trend: 'neutral' },
    trends: { dauTrend: [], revenueTrend: [], satisfactionTrend: [] },
    topProjects: []
  });
  
  // 历史情绪数据（用于计算趋势）
  const sentimentHistory = ref<{ day: number; positive: number; neutral: number; negative: number }[]>([]);
  
  // ==================== 计算属性 ====================
  
  /** 全局指标 */
  const globalMetrics = computed(() => {
    return {
      totalProjects: analyticsData.value.topProjects.length,
      averageSatisfaction: analyticsData.value.trends.satisfactionTrend.length > 0
        ? analyticsData.value.trends.satisfactionTrend[analyticsData.value.trends.satisfactionTrend.length - 1].value
        : 0,
      totalDau: analyticsData.value.trends.dauTrend.length > 0
        ? analyticsData.value.trends.dauTrend[analyticsData.value.trends.dauTrend.length - 1].value
        : 0,
    };
  });
  
  // ==================== 核心方法 ====================
  
  /**
   * 重新计算所有分析数据
   */
  function recalculate(ctx: TickContext): void {
    calculateRetention(ctx);
    calculateSentiment();
    calculateTrends(ctx);
    calculateTopProjects(ctx);
  }
  
  /**
   * 计算留存率
   */
  function calculateRetention(ctx: TickContext): void {
    // 简化计算：使用项目平均留存率
    // 实际应该从 playerStore 获取真实数据
    const avgRetention = {
      d1: 50 + Math.random() * 10,
      d7: 30 + Math.random() * 10,
      d30: 15 + Math.random() * 5,
    };
    
    // 计算趋势
    const prevRetention = analyticsData.value.retention;
    const dauChange = avgRetention.d1 - prevRetention.d1;
    
    let trend: 'up' | 'stable' | 'down' = 'stable';
    if (dauChange > 2) trend = 'up';
    else if (dauChange < -2) trend = 'down';
    
    analyticsData.value.retention = {
      ...avgRetention,
      trend,
    };
  }
  
  /**
   * 计算情绪分布
   */
  function calculateSentiment(): void {
    // 从 commentStore/confessionStore 等获取情绪数据
    // 这里使用模拟数据
    const sentiment = {
      positive: 0.6 + Math.random() * 0.2,
      neutral: 0.2 + Math.random() * 0.1,
      negative: 0.1 + Math.random() * 0.1,
    };
    
    // 归一化
    const total = sentiment.positive + sentiment.neutral + sentiment.negative;
    sentiment.positive /= total;
    sentiment.neutral /= total;
    sentiment.negative /= total;
    
    // 记录历史
    sentimentHistory.value.push({
      day: sentimentHistory.value.length > 0 ? sentimentHistory.value[sentimentHistory.value.length - 1].day + 1 : 1,
      positive: sentiment.positive,
      neutral: sentiment.neutral,
      negative: sentiment.negative,
    });
    
    // 保留最近 30 天
    if (sentimentHistory.value.length > 30) {
      sentimentHistory.value.shift();
    }
    
    // 计算趋势
    let trend: SentimentTrend = 'neutral';
    if (sentiment.positive > 0.7) trend = 'positive';
    else if (sentiment.negative > 0.3) trend = 'negative';
    
    analyticsData.value.sentiment = {
      positive: Math.round(sentiment.positive * 100),
      neutral: Math.round(sentiment.neutral * 100),
      negative: Math.round(sentiment.negative * 100),
      trend,
    };
  }
  
  /**
   * 计算趋势数据
   */
  function calculateTrends(ctx: TickContext): void {
    const currentDay = ctx.day;
    
    // DAU 趋势
    analyticsData.value.trends.dauTrend.push({
      day: currentDay,
      value: ctx.globalMetrics.totalPlayers,
    });
    
    // 收入趋势
    analyticsData.value.trends.revenueTrend.push({
      day: currentDay,
      value: ctx.globalMetrics.totalRevenue,
    });
    
    // 满意度趋势
    analyticsData.value.trends.satisfactionTrend.push({
      day: currentDay,
      value: ctx.globalMetrics.averageSatisfaction,
    });
    
    // 保留最近 30 天
    const maxHistory = 30;
    if (analyticsData.value.trends.dauTrend.length > maxHistory) {
      analyticsData.value.trends.dauTrend.shift();
      analyticsData.value.trends.revenueTrend.shift();
      analyticsData.value.trends.satisfactionTrend.shift();
    }
  }
  
  /**
   * 计算热门项目排行
   */
  function calculateTopProjects(ctx: TickContext): void {
    // 从 projectOperationStore 获取数据并排序
    const { useProjectOperationStore } = require('./projectOperationStore');
    const projectOpStore = useProjectOperationStore();
    const allProjects = projectOpStore.getAllProjectsData();
    
    // 计算每个项目的综合得分
    const scored = allProjects.map(project => ({
      projectId: project.projectId,
      projectName: project.projectName,
      score: calculateProjectScore(project),
    }));
    
    // 排序并取前 10
    scored.sort((a, b) => b.score - a.score);
    const top10 = scored.slice(0, 10).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
    
    analyticsData.value.topProjects = top10;
  }
  
  /**
   * 计算项目得分
   */
  function calculateProjectScore(project: any): number {
    const weights = {
      dau: 0.3,
      revenue: 0.3,
      satisfaction: 0.2,
      rating: 0.2,
    };
    
    // 归一化各指标
    const normalizedDau = Math.min(100, project.metrics.dau / 100);
    const normalizedRevenue = Math.min(100, project.metrics.revenue / 1000);
    const normalizedSatisfaction = project.metrics.satisfaction * 100;
    const normalizedRating = project.metrics.rating * 10;
    
    return (
      normalizedDau * weights.dau +
      normalizedRevenue * weights.revenue +
      normalizedSatisfaction * weights.satisfaction +
      normalizedRating * weights.rating
    );
  }
  
  /**
   * 获取留存率
   */
  function getRetention(): AnalyticsData['retention'] {
    return analyticsData.value.retention;
  }
  
  /**
   * 获取情绪分布
   */
  function getSentimentDistribution(): AnalyticsData['sentiment'] {
    return analyticsData.value.sentiment;
  }
  
  /**
   * 获取趋势
   */
  function getTrends(): AnalyticsData['trends'] {
    return analyticsData.value.trends;
  }
  
  /**
   * 获取热门项目
   */
  function getTopProjects(limit: number = 10): AnalyticsData['topProjects'] {
    return analyticsData.value.topProjects.slice(0, limit);
  }
  
  return {
    // 状态
    analyticsData,
    sentimentHistory,
    globalMetrics,
    
    // 方法
    recalculate,
    getRetention,
    getSentimentDistribution,
    getTrends,
    getTopProjects,
  };
});
