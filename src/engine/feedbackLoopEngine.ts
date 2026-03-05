/**
 * 数据反馈闭环引擎
 * 实现数据收集 → 分析 → 建议 → 执行 → 追踪的完整闭环
 */

import type { Project } from '@/types/project';
import type { Character } from '@/types/character';
import type { LinkageEffect, OperationModule } from './linkageEngine';

// 数据收集层
export interface DataCollection {
  timestamp: number;
  projectId: string;
  playerBehavior: PlayerBehaviorData;
  contentConsumption: ContentConsumptionData;
  socialFeedback: SocialFeedbackData;
  marketData: MarketData;
}

export interface PlayerBehaviorData {
  dau: number;
  mau: number;
  newPlayers: number;
  churnedPlayers: number;
  avgSessionDuration: number;
  retention: { d1: number; d7: number; d30: number };
}

export interface ContentConsumptionData {
  plotCompletion: { plotId: string; rate: number }[];
  characterPopularity: { characterId: string; score: number }[];
  gachaStats: { totalPulls: number; ssrRate: number; revenue: number };
}

export interface SocialFeedbackData {
  sentiment: number; // -100 到 100
  hotTopics: string[];
  complaintCount: number;
  praiseCount: number;
}

export interface MarketData {
  marketShare: number;
  competitorActivities: string[];
  trendChanges: { genre: string; change: number }[];
}

// 问题诊断
export interface ProblemDiagnosis {
  id: string;
  type: 'retention' | 'revenue' | 'satisfaction' | 'completion' | 'balance';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedMetrics: string[];
  rootCauses: string[];
}

// 改进建议
export interface ImprovementSuggestion {
  id: string;
  problemId: string;
  title: string;
  description: string;
  expectedImpact: {
    metric: string;
    change: number;
    confidence: number;
  }[];
  cost: {
    development: number;
    time: number;
  };
  priority: 'high' | 'medium' | 'low';
  actions: string[];
}

// 执行追踪
export interface ExecutionTracking {
  suggestionId: string;
  executedAt: number;
  executedBy: string;
  baselineMetrics: Record<string, number>;
  currentMetrics: Record<string, number>;
  improvements: Record<string, number>;
  roi: number;
  status: 'in_progress' | 'completed' | 'failed';
}

// 分析报告
export interface AnalysisReport {
  id: string;
  projectId: string;
  generatedAt: number;
  period: { start: number; end: number };
  summary: string;
  keyMetrics: Record<string, { current: number; previous: number; change: number }>;
  problems: ProblemDiagnosis[];
  suggestions: ImprovementSuggestion[];
  trends: { metric: string; direction: 'up' | 'down' | 'stable' }[];
}

export class FeedbackLoopEngine {
  private dataHistory: DataCollection[] = [];
  private executionHistory: ExecutionTracking[] = [];
  private maxHistorySize = 90; // 保留90天数据

  // 收集数据
  collectData(data: DataCollection): void {
    this.dataHistory.push(data);
    
    // 限制历史数据大小
    if (this.dataHistory.length > this.maxHistorySize) {
      this.dataHistory = this.dataHistory.slice(-this.maxHistorySize);
    }
  }

  // 生成分析报告
  generateReport(projectId: string, days: number = 7): AnalysisReport {
    const endTime = Date.now();
    const startTime = endTime - days * 24 * 60 * 60 * 1000;
    
    const relevantData = this.dataHistory.filter(
      d => d.projectId === projectId && d.timestamp >= startTime && d.timestamp <= endTime
    );

    const keyMetrics = this.calculateKeyMetrics(relevantData);
    const problems = this.diagnoseProblems(relevantData, keyMetrics);
    const suggestions = this.generateSuggestions(problems);
    const trends = this.analyzeTrends(relevantData);

    return {
      id: `report_${Date.now()}`,
      projectId,
      generatedAt: endTime,
      period: { start: startTime, end: endTime },
      summary: this.generateSummary(keyMetrics, problems),
      keyMetrics,
      problems,
      suggestions,
      trends
    };
  }

  // 计算关键指标
  private calculateKeyMetrics(data: DataCollection[]): Record<string, { current: number; previous: number; change: number }> {
    if (data.length === 0) return {};

    const midPoint = Math.floor(data.length / 2);
    const recent = data.slice(midPoint);
    const previous = data.slice(0, midPoint);

    const metrics: Record<string, { current: number; previous: number; change: number }> = {};

    // DAU
    const currentDAU = recent.reduce((sum, d) => sum + d.playerBehavior.dau, 0) / recent.length;
    const previousDAU = previous.reduce((sum, d) => sum + d.playerBehavior.dau, 0) / previous.length;
    metrics.dau = {
      current: Math.round(currentDAU),
      previous: Math.round(previousDAU),
      change: previousDAU > 0 ? (currentDAU - previousDAU) / previousDAU : 0
    };

    // 留存率
    const currentRetention = recent.reduce((sum, d) => sum + d.playerBehavior.retention.d1, 0) / recent.length;
    const previousRetention = previous.reduce((sum, d) => sum + d.playerBehavior.retention.d1, 0) / previous.length;
    metrics.retention = {
      current: Math.round(currentRetention * 100) / 100,
      previous: Math.round(previousRetention * 100) / 100,
      change: previousRetention > 0 ? (currentRetention - previousRetention) / previousRetention : 0
    };

    // 满意度
    const currentSentiment = recent.reduce((sum, d) => sum + d.socialFeedback.sentiment, 0) / recent.length;
    const previousSentiment = previous.reduce((sum, d) => sum + d.socialFeedback.sentiment, 0) / previous.length;
    metrics.satisfaction = {
      current: Math.round(currentSentiment),
      previous: Math.round(previousSentiment),
      change: previousSentiment !== 0 ? (currentSentiment - previousSentiment) / Math.abs(previousSentiment) : 0
    };

    // 收入
    const currentRevenue = recent.reduce((sum, d) => sum + d.contentConsumption.gachaStats.revenue, 0);
    const previousRevenue = previous.reduce((sum, d) => sum + d.contentConsumption.gachaStats.revenue, 0);
    metrics.revenue = {
      current: currentRevenue,
      previous: previousRevenue,
      change: previousRevenue > 0 ? (currentRevenue - previousRevenue) / previousRevenue : 0
    };

    return metrics;
  }

  // 问题诊断
  private diagnoseProblems(
    data: DataCollection[],
    metrics: Record<string, { current: number; previous: number; change: number }>
  ): ProblemDiagnosis[] {
    const problems: ProblemDiagnosis[] = [];

    // 检查留存率
    if (metrics.retention?.current < 0.3) {
      problems.push({
        id: `problem_${Date.now()}_1`,
        type: 'retention',
        severity: 'critical',
        title: '次日留存率过低',
        description: `当前次日留存率仅${(metrics.retention.current * 100).toFixed(1)}%，远低于行业平均水平`,
        affectedMetrics: ['retention', 'dau'],
        rootCauses: this.inferRetentionCauses(data)
      });
    }

    // 检查满意度
    if (metrics.satisfaction?.current < -20) {
      problems.push({
        id: `problem_${Date.now()}_2`,
        type: 'satisfaction',
        severity: metrics.satisfaction.current < -50 ? 'critical' : 'warning',
        title: '玩家满意度下降',
        description: `玩家情绪指数为${metrics.satisfaction.current}，负面情绪占主导`,
        affectedMetrics: ['satisfaction', 'retention'],
        rootCauses: this.inferSatisfactionCauses(data)
      });
    }

    // 检查收入
    if (metrics.revenue?.change < -0.2) {
      problems.push({
        id: `problem_${Date.now()}_3`,
        type: 'revenue',
        severity: 'warning',
        title: '收入大幅下滑',
        description: `收入环比下降${(Math.abs(metrics.revenue.change) * 100).toFixed(1)}%`,
        affectedMetrics: ['revenue', 'arpu'],
        rootCauses: this.inferRevenueCauses(data)
      });
    }

    // 检查剧情完成率
    const avgCompletion = data.reduce((sum, d) => {
      const rates = d.contentConsumption.plotCompletion.map(p => p.rate);
      return sum + (rates.reduce((s, r) => s + r, 0) / rates.length);
    }, 0) / data.length;

    if (avgCompletion < 0.5) {
      problems.push({
        id: `problem_${Date.now()}_4`,
        type: 'completion',
        severity: 'warning',
        title: '剧情完成率偏低',
        description: `平均剧情完成率仅${(avgCompletion * 100).toFixed(1)}%`,
        affectedMetrics: ['completion', 'engagement'],
        rootCauses: ['剧情难度过高', '缺乏引导', '内容不够吸引人']
      });
    }

    return problems;
  }

  // 推断留存问题原因
  private inferRetentionCauses(data: DataCollection[]): string[] {
    const causes: string[] = [];
    const recent = data.slice(-7);

    // 检查新手体验
    const avgSessionDuration = recent.reduce((sum, d) => sum + d.playerBehavior.avgSessionDuration, 0) / recent.length;
    if (avgSessionDuration < 300) {
      causes.push('平均游戏时长过短，新手体验可能存在问题');
    }

    // 检查社交反馈
    const avgSentiment = recent.reduce((sum, d) => sum + d.socialFeedback.sentiment, 0) / recent.length;
    if (avgSentiment < 0) {
      causes.push('玩家负面情绪较多，可能影响留存');
    }

    if (causes.length === 0) {
      causes.push('需要进一步调研玩家流失原因');
    }

    return causes;
  }

  // 推断满意度问题原因
  private inferSatisfactionCauses(data: DataCollection[]): string[] {
    const causes: string[] = [];
    const recent = data.slice(-7);

    // 检查投诉
    const totalComplaints = recent.reduce((sum, d) => sum + d.socialFeedback.complaintCount, 0);
    if (totalComplaints > 100) {
      causes.push('近期投诉数量较多');
    }

    // 检查热门话题
    const allTopics = recent.flatMap(d => d.socialFeedback.hotTopics);
    const complaintTopics = allTopics.filter(t => 
      t.includes('bug') || t.includes('氪金') || t.includes('难度')
    );
    if (complaintTopics.length > 0) {
      causes.push(`玩家热议负面话题：${complaintTopics.slice(0, 3).join('、')}`);
    }

    if (causes.length === 0) {
      causes.push('满意度下降原因不明，建议开展玩家调研');
    }

    return causes;
  }

  // 推断收入问题原因
  private inferRevenueCauses(data: DataCollection[]): string[] {
    const causes: string[] = [];
    const recent = data.slice(-7);

    // 检查卡池数据
    const avgSsrRate = recent.reduce((sum, d) => sum + d.contentConsumption.gachaStats.ssrRate, 0) / recent.length;
    if (avgSsrRate < 0.02) {
      causes.push('SSR爆率过低，玩家付费意愿下降');
    }

    // 检查角色人气
    const characterPopularity = recent.flatMap(d => d.contentConsumption.characterPopularity);
    const avgPopularity = characterPopularity.reduce((sum, c) => sum + c.score, 0) / characterPopularity.length;
    if (avgPopularity < 50) {
      causes.push('角色整体人气不足，影响付费转化');
    }

    if (causes.length === 0) {
      causes.push('收入下降原因需要进一步分析');
    }

    return causes;
  }

  // 生成改进建议
  private generateSuggestions(problems: ProblemDiagnosis[]): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    problems.forEach(problem => {
      switch (problem.type) {
        case 'retention':
          suggestions.push({
            id: `suggestion_${Date.now()}_1`,
            problemId: problem.id,
            title: '优化新手引导',
            description: '简化新手流程，增加奖励，提升前30分钟体验',
            expectedImpact: [
              { metric: 'retention', change: 0.15, confidence: 0.7 },
              { metric: 'satisfaction', change: 10, confidence: 0.6 }
            ],
            cost: { development: 2000, time: 7 },
            priority: 'high',
            actions: ['简化新手教程', '增加新手奖励', '优化首充体验']
          });
          break;

        case 'satisfaction':
          suggestions.push({
            id: `suggestion_${Date.now()}_2`,
            problemId: problem.id,
            title: '发放补偿福利',
            description: '针对近期问题进行补偿，安抚玩家情绪',
            expectedImpact: [
              { metric: 'satisfaction', change: 20, confidence: 0.8 },
              { metric: 'retention', change: 0.05, confidence: 0.6 }
            ],
            cost: { development: 500, time: 1 },
            priority: 'high',
            actions: ['发放全服补偿', '发布公告道歉', '说明改进计划']
          });
          break;

        case 'revenue':
          suggestions.push({
            id: `suggestion_${Date.now()}_3`,
            problemId: problem.id,
            title: '推出限时礼包',
            description: '设计高性价比限时礼包，刺激付费',
            expectedImpact: [
              { metric: 'revenue', change: 0.3, confidence: 0.6 },
              { metric: 'satisfaction', change: -5, confidence: 0.5 }
            ],
            cost: { development: 1000, time: 3 },
            priority: 'medium',
            actions: ['设计限时礼包', '调整定价策略', '增加付费点']
          });
          break;

        case 'completion':
          suggestions.push({
            id: `suggestion_${Date.now()}_4`,
            problemId: problem.id,
            title: '降低剧情难度',
            description: '简化部分章节难度，增加存档点',
            expectedImpact: [
              { metric: 'completion', change: 0.2, confidence: 0.7 },
              { metric: 'satisfaction', change: 8, confidence: 0.6 }
            ],
            cost: { development: 1500, time: 5 },
            priority: 'medium',
            actions: ['增加存档点', '降低战斗难度', '增加提示']
          });
          break;
      }
    });

    return suggestions;
  }

  // 分析趋势
  private analyzeTrends(data: DataCollection[]): { metric: string; direction: 'up' | 'down' | 'stable' }[] {
    if (data.length < 7) return [];

    const trends: { metric: string; direction: 'up' | 'down' | 'stable' }[] = [];

    // DAU趋势
    const firstHalfDAU = data.slice(0, Math.floor(data.length / 2)).reduce((sum, d) => sum + d.playerBehavior.dau, 0);
    const secondHalfDAU = data.slice(Math.floor(data.length / 2)).reduce((sum, d) => sum + d.playerBehavior.dau, 0);
    trends.push({
      metric: 'dau',
      direction: secondHalfDAU > firstHalfDAU * 1.1 ? 'up' : secondHalfDAU < firstHalfDAU * 0.9 ? 'down' : 'stable'
    });

    // 满意度趋势
    const firstHalfSentiment = data.slice(0, Math.floor(data.length / 2)).reduce((sum, d) => sum + d.socialFeedback.sentiment, 0);
    const secondHalfSentiment = data.slice(Math.floor(data.length / 2)).reduce((sum, d) => sum + d.socialFeedback.sentiment, 0);
    trends.push({
      metric: 'satisfaction',
      direction: secondHalfSentiment > firstHalfSentiment ? 'up' : secondHalfSentiment < firstHalfSentiment ? 'down' : 'stable'
    });

    return trends;
  }

  // 生成报告摘要
  private generateSummary(
    metrics: Record<string, { current: number; previous: number; change: number }>,
    problems: ProblemDiagnosis[]
  ): string {
    const criticalProblems = problems.filter(p => p.severity === 'critical').length;
    const warningProblems = problems.filter(p => p.severity === 'warning').length;

    if (criticalProblems > 0) {
      return `发现${criticalProblems}个严重问题，需要立即处理。${problems[0]?.title}对游戏影响最大。`;
    } else if (warningProblems > 0) {
      return `发现${warningProblems}个潜在问题，建议关注。整体运营状况需要优化。`;
    } else {
      return '运营状况良好，各项指标正常。继续保持当前策略。';
    }
  }

  // 记录执行
  recordExecution(tracking: ExecutionTracking): void {
    this.executionHistory.push(tracking);
  }

  // 追踪改进效果
  trackImprovement(suggestionId: string, currentMetrics: Record<string, number>): ExecutionTracking | null {
    const execution = this.executionHistory.find(e => e.suggestionId === suggestionId);
    if (!execution) return null;

    execution.currentMetrics = currentMetrics;
    
    // 计算改进幅度
    execution.improvements = {};
    let totalImprovement = 0;
    let metricCount = 0;

    Object.keys(currentMetrics).forEach(key => {
      const baseline = execution.baselineMetrics[key];
      const current = currentMetrics[key];
      if (baseline !== undefined) {
        const improvement = baseline !== 0 ? (current - baseline) / Math.abs(baseline) : 0;
        execution.improvements[key] = improvement;
        totalImprovement += improvement;
        metricCount++;
      }
    });

    // 计算ROI
    const avgImprovement = metricCount > 0 ? totalImprovement / metricCount : 0;
    execution.roi = avgImprovement > 0 ? avgImprovement * 100 : 0;

    return execution;
  }

  // 获取执行历史
  getExecutionHistory(): ExecutionTracking[] {
    return [...this.executionHistory];
  }

  // 获取最佳实践
  getBestPractices(): { action: string; avgRoi: number; successRate: number }[] {
    const actionStats: Map<string, { roi: number[]; success: number; total: number }> = new Map();

    this.executionHistory.forEach(execution => {
      // 这里简化处理，实际应该关联到具体的action
      const action = execution.suggestionId;
      const stats = actionStats.get(action) || { roi: [], success: 0, total: 0 };
      stats.roi.push(execution.roi);
      stats.total++;
      if (execution.roi > 0) stats.success++;
      actionStats.set(action, stats);
    });

    return Array.from(actionStats.entries()).map(([action, stats]) => ({
      action,
      avgRoi: stats.roi.reduce((sum, r) => sum + r, 0) / stats.roi.length,
      successRate: stats.total > 0 ? stats.success / stats.total : 0
    })).sort((a, b) => b.avgRoi - a.avgRoi);
  }
}

// 单例导出
export const feedbackLoopEngine = new FeedbackLoopEngine();
