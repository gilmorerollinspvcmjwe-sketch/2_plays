/**
 * 运营操作预测引擎
 * Phase 3: 运营操作与数据关联
 */

import type {
  OperationPrediction,
  GachaPoolConfig,
  EventConfig,
  WelfareConfig
} from '@/types/operationPrediction';
import type { ProjectOperationData } from '@/types/simulation';
import type { Character } from '@/types';

/**
 * 计算爆率合理性
 */
export function calculateRateFairness(ssrRate: number): number {
  // 2% 是标准爆率
  const standardRate = 0.02;
  const diff = Math.abs(ssrRate - standardRate);

  // 差异越小越合理
  return Math.max(0, 1 - diff / standardRate);
}

/**
 * 预测卡池效果
 */
export function predictGachaPoolImpact(
  poolConfig: GachaPoolConfig,
  projectData: ProjectOperationData,
  character: Character
): OperationPrediction {
  const prediction: OperationPrediction = {
    operationId: poolConfig.id,
    operationType: 'gacha',
    predicted: {
      revenueChange: 0,
      revenueChangePercent: 0,
      satisfactionChange: 0,
      retentionChange: 0,
      payRateChange: 0,
      activePlayersChange: 0
    },
    basis: {},
    confidence: 0.8,
    risks: [],
    createdAt: new Date().toISOString()
  };

  // 1. 角色人气影响
  const charPopularity = character.popularity?.base || 50;
  prediction.basis.characterPopularity = charPopularity;

  // 人气越高，付费率提升越大
  const popularityBonus = (charPopularity / 100) * 0.15;
  prediction.predicted.payRateChange = popularityBonus;

  // 2. 爆率合理性影响
  const ssrRate = poolConfig.ssrRate || 0.02;
  const rateFairness = calculateRateFairness(ssrRate);
  prediction.basis.rateFairness = rateFairness;

  // 合理爆率提升满意度，毒池降低满意度
  if (ssrRate >= 0.015 && ssrRate <= 0.03) {
    prediction.predicted.satisfactionChange = 0.05;
  } else if (ssrRate < 0.01) {
    prediction.predicted.satisfactionChange = -0.15;
    prediction.risks.push('爆率过低可能导致玩家不满');
  } else if (ssrRate > 0.05) {
    prediction.predicted.satisfactionChange = 0.1;
    prediction.risks.push('爆率过高可能影响长期收入');
  }

  // 3. 收入预测
  const payingPlayers = projectData.payingPlayers;
  const avgSpending = 150 * (1 + charPopularity / 100); // 人气越高人均付费越高
  const additionalPaying = Math.floor(projectData.activePlayers * popularityBonus);

  prediction.predicted.revenueChange = Math.floor(
    (payingPlayers * avgSpending * 0.3) + // 现有付费玩家额外消费
    (additionalPaying * avgSpending)      // 新增付费玩家
  );

  prediction.predicted.revenueChangePercent = projectData.dailyRevenue > 0
    ? Math.round((prediction.predicted.revenueChange / projectData.dailyRevenue) * 100)
    : 0;

  // 4. 留存影响
  prediction.predicted.retentionChange = charPopularity > 70 ? 0.03 : 0;

  // 5. 活跃玩家影响 (新玩家被吸引)
  prediction.predicted.activePlayersChange = Math.floor(
    projectData.activePlayers * (charPopularity / 100) * 0.1
  );

  return prediction;
}

/**
 * 预测活动效果
 */
export function predictEventImpact(
  eventConfig: EventConfig,
  projectData: ProjectOperationData
): OperationPrediction {
  const prediction: OperationPrediction = {
    operationId: eventConfig.id,
    operationType: 'event',
    predicted: {
      revenueChange: 0,
      revenueChangePercent: 0,
      satisfactionChange: 0,
      retentionChange: 0,
      payRateChange: 0,
      activePlayersChange: 0
    },
    basis: {
      activityType: eventConfig.type,
      rewardValue: eventConfig.rewards?.reduce((sum, r) => sum + (r.value || 0), 0) || 0
    },
    confidence: 0.75,
    risks: [],
    createdAt: new Date().toISOString()
  };

  switch (eventConfig.type) {
    case 'login':
      // 登录活动主要提升留存
      prediction.predicted.retentionChange = 0.05;
      prediction.predicted.satisfactionChange = 0.03;
      prediction.predicted.activePlayersChange = Math.floor(
        projectData.activePlayers * 0.02
      );
      break;

    case 'gacha':
      // 抽卡活动提升付费
      prediction.predicted.payRateChange = 0.03;
      prediction.predicted.revenueChange = Math.floor(
        projectData.dailyRevenue * 0.15
      );
      prediction.predicted.revenueChangePercent = 15;
      prediction.predicted.satisfactionChange = 0.02;
      break;

    case 'story':
      // 剧情活动提升满意度
      prediction.predicted.satisfactionChange = 0.08;
      prediction.predicted.retentionChange = 0.03;
      prediction.predicted.activePlayersChange = Math.floor(
        projectData.activePlayers * 0.01
      );
      break;

    case 'limited':
      // 限定活动大幅提升付费
      prediction.predicted.payRateChange = 0.05;
      prediction.predicted.revenueChange = Math.floor(
        projectData.dailyRevenue * 0.25
      );
      prediction.predicted.revenueChangePercent = 25;
      prediction.predicted.satisfactionChange = 0.05;
      prediction.predicted.retentionChange = 0.02;
      break;

    case 'welfare':
      // 福利活动提升满意度和留存
      prediction.predicted.satisfactionChange = 0.1;
      prediction.predicted.retentionChange = 0.08;
      const welfareValue = prediction.basis.rewardValue || 0;
      prediction.predicted.satisfactionChange += Math.min(0.1, welfareValue / 5000);
      break;
  }

  // 根据奖励价值调整
  const rewardValue = prediction.basis.rewardValue;
  if (rewardValue < 1000) {
    prediction.risks.push('奖励价值较低，可能吸引力不足');
  }

  return prediction;
}

/**
 * 预测福利效果
 */
export function predictWelfareImpact(
  welfareConfig: WelfareConfig,
  projectData: ProjectOperationData
): OperationPrediction {
  const value = welfareConfig.value || 0;
  const type = welfareConfig.type || 'general';

  const prediction: OperationPrediction = {
    operationId: welfareConfig.id,
    operationType: 'welfare',
    predicted: {
      revenueChange: -Math.floor(value * 0.1), // 福利成本
      revenueChangePercent: projectData.dailyRevenue > 0
        ? -Math.round((value * 0.1 / projectData.dailyRevenue) * 100)
        : 0,
      satisfactionChange: Math.min(0.2, value / 5000),
      retentionChange: Math.min(0.1, value / 8000),
      payRateChange: 0,
      activePlayersChange: Math.floor(projectData.activePlayers * 0.01)
    },
    basis: {
      welfareType: type,
      rewardValue: value
    },
    confidence: 0.85,
    risks: value > projectData.dailyRevenue * 0.5 ? ['福利成本过高，可能影响财务'] : [],
    createdAt: new Date().toISOString()
  };

  return prediction;
}

/**
 * 计算准确度
 */
export function calculateAccuracy(predicted: number, actual: number): number {
  if (predicted === 0) return actual === 0 ? 1 : 0;
  const diff = Math.abs(predicted - actual);
  const relativeDiff = diff / Math.abs(predicted);
  return Math.max(0, 1 - relativeDiff);
}

/**
 * 生成分析总结
 */
export function generateAnalysis(
  prediction: OperationPrediction,
  actual: {
    revenueChange: number;
    satisfactionChange: number;
    retentionChange: number;
    payRateChange: number;
    activePlayersChange: number;
  },
  accuracy: {
    revenue: number;
    satisfaction: number;
    retention: number;
    overall: number;
  }
): string {
  const parts: string[] = [];

  if (accuracy.overall > 0.8) {
    parts.push('预测非常准确');
  } else if (accuracy.overall > 0.6) {
    parts.push('预测基本准确');
  } else {
    parts.push('预测与实际存在较大偏差');
  }

  if (actual.revenueChange > prediction.predicted.revenueChange * 1.2) {
    parts.push('实际收入超出预期，运营效果很好');
  } else if (actual.revenueChange < prediction.predicted.revenueChange * 0.8) {
    parts.push('实际收入低于预期，可能需要调整策略');
  }

  if (actual.satisfactionChange < 0 && prediction.predicted.satisfactionChange > 0) {
    parts.push('玩家满意度下降，建议关注玩家反馈');
  }

  return parts.join('；');
}
