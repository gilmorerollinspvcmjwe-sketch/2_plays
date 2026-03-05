/**
 * 运营操作预测类型定义
 * Phase 3: 运营操作与数据关联
 */

import type { ProjectOperationData } from './simulation';

/**
 * 运营操作预测结果
 */
export interface OperationPrediction {
  operationId: string;
  operationType: 'gacha' | 'event' | 'welfare' | 'incident';

  // 预测指标
  predicted: {
    revenueChange: number;        // 收入变化 (绝对值)
    revenueChangePercent: number; // 收入变化百分比
    satisfactionChange: number;   // 满意度变化 (-1 to 1)
    retentionChange: number;      // 留存率变化 (-1 to 1)
    payRateChange: number;        // 付费率变化 (-1 to 1)
    activePlayersChange: number;  // 活跃玩家变化
  };

  // 预测依据
  basis: {
    characterPopularity?: number; // 角色人气 (卡池)
    rateFairness?: number;        // 爆率合理性 (卡池)
    activityType?: string;        // 活动类型 (活动)
    rewardValue?: number;         // 奖励价值 (活动/福利)
    welfareType?: string;         // 福利类型 (福利)
    incidentType?: string;        // 事件类型 (事件)
  };

  // 置信度 (基于数据完整性)
  confidence: number; // 0-1

  // 风险提示
  risks: string[];

  createdAt: string;
}

/**
 * 预测与实际对比
 */
export interface PredictionVsActual {
  operationId: string;
  operationType: string;

  predicted: OperationPrediction['predicted'];
  actual: {
    revenueChange: number;
    satisfactionChange: number;
    retentionChange: number;
    payRateChange: number;
    activePlayersChange: number;
  };

  // 准确度评分
  accuracy: {
    revenue: number;      // |1 - |预测-实际|/|预测||
    satisfaction: number;
    retention: number;
    overall: number;      // 平均准确度
  };

  // 分析总结
  analysis: string;

  createdAt: string;
  completedAt: string;
}

/**
 * 进行中的运营操作效果追踪
 */
export interface ActiveOperationEffect {
  type: 'gacha' | 'event' | 'welfare';
  prediction: OperationPrediction;
  startData: ProjectOperationData;
  startDay: number;
}

/**
 * 卡池配置（用于预测）
 */
export interface GachaPoolConfig {
  id: string;
  projectId: string;
  name: string;
  upCharacters: string[];
  ssrRate: number;
  srRate: number;
  rRate: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'ended';
}

/**
 * 活动配置（用于预测）
 */
export interface EventConfig {
  id: string;
  projectId: string;
  name: string;
  type: 'login' | 'gacha' | 'story' | 'limited' | 'welfare';
  rewards?: { value?: number }[];
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'ended';
}

/**
 * 福利配置（用于预测）
 */
export interface WelfareConfig {
  id: string;
  projectId: string;
  type: string;
  value: number;
  description?: string;
}
