/**
 * 模拟系统类型定义
 * 用于重构后的 simulationStore
 */

import type { ProjectQualityScore } from '@/engine/qualityScoring';

/**
 * 项目运营数据
 * 每个已发布项目都有独立的运营数据
 */
export interface ProjectOperationData {
  projectId: string;

  // 基础指标
  satisfaction: number; // 玩家满意度 0-1
  retentionRate: number; // 留存率 0-1
  payRate: number; // 付费率 0-1

  // 玩家数据
  activePlayers: number; // 活跃玩家数
  newPlayers: number; // 新增玩家数
  lostPlayers: number; // 流失玩家数
  payingPlayers: number; // 付费玩家数

  // 收入数据
  dailyRevenue: number; // 日收入
  totalRevenue: number; // 总收入
  gachaRevenue: number; // 抽卡收入

  // 运营数据
  totalDraws: number; // 总抽卡次数
  ssrCount: number; // SSR获得次数
  srCount: number; // SR获得次数

  // 历史数据（用于趋势分析）
  history: {
    date: string;
    revenue: number;
    activePlayers: number;
    satisfaction: number;
  }[];
}

/**
 * 模拟配置
 */
export interface SimulationConfig {
  // 基础玩家数（根据项目质量调整）
  basePlayerCount: number;

  // 市场系数（根据市场趋势调整）
  marketMultiplier: number;

  // 竞争系数（根据竞品表现调整）
  competitionFactor: number;

  // 时间衰减（长期运营的自然衰减）
  timeDecay: number;
}

/**
 * 项目模拟结果
 */
export interface ProjectSimulationResult {
  projectId: string;
  operationData: ProjectOperationData;
  comments: ProjectComment[];
  confessions: ProjectConfession[];
}

/**
 * 项目评论
 */
export interface ProjectComment {
  id: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  characterId?: string;
  plotId?: string;
  platform: string;
  likes: number;
  createdAt: string;
}

/**
 * 项目告白
 */
export interface ProjectConfession {
  id: string;
  characterId: string;
  characterName: string;
  content: string;
  likes: number;
  createdAt: string;
}

/**
 * 全局运营指标
 */
export interface GlobalMetrics {
  totalRevenue: number;
  totalActivePlayers: number;
  averageSatisfaction: number;
  totalDraws: number;
}

/**
 * 运营效果追踪
 */
export interface OperationEffectTracking {
  operationId: string;
  operationType: 'gacha' | 'event' | 'welfare';
  predicted: {
    revenueChange: number;
    satisfactionChange: number;
    retentionChange: number;
  };
  actual: {
    revenueChange: number;
    satisfactionChange: number;
    retentionChange: number;
  };
  date: string;
}

/**
 * 基础指标计算结果
 */
export interface BaseMetrics {
  satisfaction: number;
  retentionRate: number;
  payRate: number;
}

/**
 * 运营操作影响结果
 */
export interface OperationImpacts extends BaseMetrics {
  revenueMultiplier: number;
}

/**
 * 玩家行为数据
 */
export interface PlayerBehavior {
  activePlayers: number;
  newPlayers: number;
  lostPlayers: number;
  payingPlayers: number;
  dailyRevenue: number;
  totalDraws: number;
  ssrCount: number;
  srCount: number;
}

/**
 * 评论情感分布
 */
export interface CommentSentiment {
  positive: number;
  neutral: number;
  negative: number;
}

/**
 * 内容生成统计
 */
export interface ContentGenerationStats {
  comments: number;
  confessions: number;
  fanworks: number;
}

/**
 * 模拟结果
 */
export interface SimulationTickResult {
  day: number;
  projectResults: ProjectSimulationResult[];
  globalMetrics: GlobalMetrics;
  contentStats?: ContentGenerationStats;
}
