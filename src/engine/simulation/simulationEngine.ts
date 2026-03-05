import { VirtualPlayerPool, type VirtualPlayer } from './playerPool';
import type { PlayerState, SpendingLevel, PlayStyle } from './types';

interface MacroResult {
  estimatedDAU: number;
  estimatedRetention: { d1: number; d7: number; d30: number };
  estimatedRevenue: number;
  estimatedSatisfaction: number;
  confidence: number;
}

interface PlayerBehavior {
  playerId: string;
  actions: string[];
  gachaResults: string[];
  activityParticipated: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  spending: number;
  sessionDuration: number;
}

interface SimulationEvent {
  type: 'gacha_banner' | 'content_update' | 'community_incident' | 'system_event';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedPlayers: number;
  revenue: number;
  satisfaction: number;
}

interface MicroSimulationResult {
  sampledPlayers: VirtualPlayer[];
  behaviors: PlayerBehavior[];
  statistics: {
    gachaDistribution: Record<string, number>;
    activityParticipation: Record<string, number>;
    sentimentDistribution: { positive: number; neutral: number; negative: number };
  };
}

interface CriticalEventResult {
  events: SimulationEvent[];
  extremeBehaviors: PlayerBehavior[];
}

interface DaySummary {
  keyEvents: string[];
  dataChanges: Record<string, { before: number; after: number; delta: number }>;
}

interface GlobalImpact {
  company: { revenue: number; expense: number; cash: number; reputation: number };
  project: {
    dau: number;
    retention: { d1: number; d7: number; d30: number };
    satisfaction: number;
    rating: number;
    revenue: number;
  };
  characters: Map<string, { popularity: number; drawRate: number; discussion: number; cpHeat: Map<string, number> }>;
  plots: Map<string, { completionRate: number; positiveRate: number; dropOffPoints: string[] }>;
}

interface SimulationResult {
  day: number;
  date: string;
  macro: MacroResult;
  micro: MicroSimulationResult;
  critical: CriticalEventResult;
  globalImpact: GlobalImpact;
  summary: DaySummary;
}

interface SimulationConfig {
  normalSampleSize: number;
  criticalSampleSize: number;
  cacheEnabled: boolean;
  targetRuntimeMs: number;
}

interface CachedResult<T> {
  data: T;
  timestamp: number;
  hits: number;
}

const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  normalSampleSize: 200,
  criticalSampleSize: 500,
  cacheEnabled: true,
  targetRuntimeMs: 200,
};

function formatDate(day: number): string {
  const startDate = new Date('2024-01-01');
  const currentDate = new Date(startDate);
  currentDate.setDate(startDate.getDate() + day);
  return currentDate.toISOString().split('T')[0];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export class SimulationEngine {
  private playerPool: VirtualPlayerPool;
  private config: SimulationConfig;
  private cache: Map<string, CachedResult<unknown>>;
  private globalState: {
    day: number;
    cash: number;
    reputation: number;
    dau: number;
    retention: { d1: number; d7: number; d30: number };
    satisfaction: number;
    rating: number;
    totalRevenue: number;
  };
  private executionTime: number = 0;

  constructor(playerPool: VirtualPlayerPool, config: Partial<SimulationConfig> = {}) {
    this.playerPool = playerPool;
    this.config = { ...DEFAULT_SIMULATION_CONFIG, ...config };
    this.cache = new Map();
    this.globalState = {
      day: 0,
      cash: 1000000,
      reputation: 80,
      dau: 0,
      retention: { d1: 0.4, d7: 0.2, d30: 0.1 },
      satisfaction: 0.7,
      rating: 4.5,
      totalRevenue: 0,
    };
  }

  async tick(day: number): Promise<SimulationResult> {
    const startTime = performance.now();
    this.globalState.day = day;

    const macro = this.calculateMacro();
    const micro = await this.simulateMicro(this.playerPool.getPlayers());
    const critical = this.checkCriticalEvents(micro);

    const impact = this.calculateGlobalImpact(macro, micro, critical);
    this.applyGlobalImpact(impact);

    const result = this.aggregateResults(day, macro, micro, critical, impact);

    this.executionTime = performance.now() - startTime;

    return result;
  }

  private calculateMacro(): MacroResult {
    const players = this.playerPool.getPlayers();
    const activePlayers = players.filter(p => p.state === 'ACTIVE' || p.state === 'PAYING');
    const estimatedDAU = Math.floor(activePlayers.length * 0.85);

    const avgSatisfaction = players.reduce((sum, p) => sum + p.satisfaction, 0) / players.length;
    const payingPlayers = players.filter(p => p.state === 'PAYING');

    const baseRevenue = payingPlayers.reduce((sum, p) => {
      const spendingMultiplier = this.getSpendingMultiplier(p.spendingLevel);
      return sum + (Math.random() * 50 + 10) * spendingMultiplier;
    }, 0);

    const eventMultiplier = 1 + (Math.random() * 0.3);
    const estimatedRevenue = baseRevenue * eventMultiplier;

    const d1Retention = clamp(this.globalState.retention.d1 + (Math.random() - 0.5) * 0.05, 0.2, 0.6);
    const d7Retention = clamp(this.globalState.retention.d7 + (Math.random() - 0.5) * 0.03, 0.1, 0.4);
    const d30Retention = clamp(this.globalState.retention.d30 + (Math.random() - 0.5) * 0.02, 0.05, 0.2);

    const confidence = this.calculateConfidence(players.length);

    return {
      estimatedDAU,
      estimatedRetention: {
        d1: Math.round(d1Retention * 1000) / 1000,
        d7: Math.round(d7Retention * 1000) / 1000,
        d30: Math.round(d30Retention * 1000) / 1000,
      },
      estimatedRevenue: Math.round(estimatedRevenue * 100) / 100,
      estimatedSatisfaction: Math.round(avgSatisfaction * 1000) / 1000,
      confidence,
    };
  }

  private getSpendingMultiplier(level: SpendingLevel): number {
    const multipliers: Record<SpendingLevel, number> = {
      '零氪': 0,
      '微氪': 1,
      '中氪': 5,
      '重氪': 20,
      '神豪': 100,
    };
    return multipliers[level];
  }

  private calculateConfidence(playerCount: number): number {
    return clamp(0.5 + Math.log10(playerCount) / 4, 0.6, 0.95);
  }

  private async simulateMicro(players: VirtualPlayer[]): Promise<MicroSimulationResult> {
    const sampleSize = this.config.normalSampleSize;
    const sampledPlayers = this.playerPool.sample(sampleSize);

    const behaviors = await this.simulatePlayerBehaviors(sampledPlayers);

    const statistics = this.calculateStatistics(behaviors);

    return {
      sampledPlayers,
      behaviors,
      statistics,
    };
  }

  private async simulatePlayerBehaviors(players: VirtualPlayer[]): Promise<PlayerBehavior[]> {
    const behaviors: PlayerBehavior[] = [];
    const bannerTypes = ['限定角色', '常驻角色', '活动角色', '剧情角色'];
    const activities = ['每日任务', '主线剧情', '支线任务', '公会活动', '竞技场', '限时活动'];

    for (const player of players) {
      const behavior: PlayerBehavior = {
        playerId: player.id,
        actions: [],
        gachaResults: [],
        activityParticipated: [],
        sentiment: 'neutral',
        spending: 0,
        sessionDuration: 0,
      };

      const activityChance = player.activityLevel * Math.random();
      if (activityChance > 0.3) {
        const numActivities = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < numActivities; i++) {
          const activity = activities[Math.floor(Math.random() * activities.length)];
          if (!behavior.activityParticipated.includes(activity)) {
            behavior.activityParticipated.push(activity);
            behavior.actions.push(`参与${activity}`);
          }
        }
      }

      const gachaChance = player.gachaMotivation * Math.random();
      if (gachaChance > 0.4) {
        const numPulls = Math.floor(Math.random() * 10) + 1;
        for (let i = 0; i < numPulls; i++) {
          const banner = bannerTypes[Math.floor(Math.random() * bannerTypes.length)];
          const rarity = this.calculateGachaRarity();
          behavior.gachaResults.push(`${banner} - ${rarity}`);
          behavior.actions.push(`抽卡-${banner}`);
        }

        if (player.spendingProbability > 0.3 && Math.random() > 0.7) {
          const spendingAmount = this.calculateSpendingAmount(player.spendingLevel);
          behavior.spending = spendingAmount;
          behavior.actions.push(`消费${spendingAmount}元`);
        }
      }

      const satisfaction = player.satisfaction;
      if (satisfaction > 0.7) {
        behavior.sentiment = 'positive';
      } else if (satisfaction < 0.4) {
        behavior.sentiment = 'negative';
      } else {
        behavior.sentiment = 'neutral';
      }

      behavior.sessionDuration = Math.floor(player.activityLevel * 120) + Math.floor(Math.random() * 30);

      behaviors.push(behavior);
    }

    return behaviors;
  }

  private calculateGachaRarity(): string {
    const rand = Math.random();
    if (rand < 0.03) return 'SSR';
    if (rand < 0.12) return 'SR';
    if (rand < 0.40) return 'R';
    return 'N';
  }

  private calculateSpendingAmount(level: SpendingLevel): number {
    const amounts: Record<SpendingLevel, number[]> = {
      '零氪': [0],
      '微氪': [6, 30, 68],
      '中氪': [68, 198, 328],
      '重氪': [328, 648, 1296],
      '神豪': [648, 1296, 2592, 6480],
    };
    const options = amounts[level];
    return options[Math.floor(Math.random() * options.length)];
  }

  private calculateStatistics(behaviors: PlayerBehavior[]): MicroSimulationResult['statistics'] {
    const gachaDistribution: Record<string, number> = {};
    const activityParticipation: Record<string, number> = { positive: 0, neutral: 0, negative: 0 };

    for (const behavior of behaviors) {
      for (const gacha of behavior.gachaResults) {
        const rarity = gacha.split(' - ')[1] || 'Unknown';
        gachaDistribution[rarity] = (gachaDistribution[rarity] || 0) + 1;
      }

      for (const activity of behavior.activityParticipated) {
        activityParticipation[activity] = (activityParticipation[activity] || 0) + 1;
      }

      activityParticipation[behavior.sentiment]++;
    }

    const sentimentDistribution = {
      positive: behaviors.filter(b => b.sentiment === 'positive').length,
      neutral: behaviors.filter(b => b.sentiment === 'neutral').length,
      negative: behaviors.filter(b => b.sentiment === 'negative').length,
    };

    return {
      gachaDistribution,
      activityParticipation,
      sentimentDistribution,
    };
  }

  private checkCriticalEvents(micro: MicroSimulationResult): CriticalEventResult {
    const events: SimulationEvent[] = [];
    const extremeBehaviors: PlayerBehavior[] = [];

    const criticalThreshold = this.config.criticalSampleSize;
    const criticalSample = this.playerPool.sample(criticalThreshold);

    const negativeRatio = micro.statistics.sentimentDistribution.negative / micro.behaviors.length;
    if (negativeRatio > 0.2) {
      events.push({
        type: 'community_incident',
        severity: negativeRatio > 0.4 ? 'critical' : 'high',
        description: `负面情绪占比达到${Math.round(negativeRatio * 100)}%，可能引发社区危机`,
        affectedPlayers: Math.floor(criticalSample.length * negativeRatio),
        revenue: negativeRatio > 0.4 ? -5000 : -2000,
        satisfaction: -0.15,
      });
    }

    const highSpenders = micro.behaviors.filter(b => b.spending > 500);
    if (highSpenders.length > 0) {
      events.push({
        type: 'gacha_banner',
        severity: 'medium',
        description: `高付费玩家触发卡池抽取活动`,
        affectedPlayers: highSpenders.length,
        revenue: highSpenders.reduce((sum, b) => sum + b.spending, 0),
        satisfaction: 0.05,
      });
    }

    const extremelyActive = micro.behaviors.filter(b => b.sessionDuration > 180);
    if (extremelyActive.length > 0) {
      for (const behavior of extremelyActive) {
        if (behavior.sentiment === 'negative' || behavior.spending > 1000) {
          extremeBehaviors.push(behavior);
        }
      }

      if (extremeBehaviors.length > 0) {
        events.push({
          type: 'system_event',
          severity: 'high',
          description: `检测到${extremeBehaviors.length}个极端行为模式`,
          affectedPlayers: extremeBehaviors.length,
          revenue: 0,
          satisfaction: -0.1,
        });
      }
    }

    const randomEventChance = Math.random();
    if (randomEventChance > 0.95) {
      events.push({
        type: 'content_update',
        severity: 'medium',
        description: '新版本内容更新引发玩家讨论热潮',
        affectedPlayers: Math.floor(criticalSample.length * 0.3),
        revenue: Math.random() * 3000,
        satisfaction: 0.1,
      });
    }

    return { events, extremeBehaviors };
  }

  private calculateGlobalImpact(
    macro: MacroResult,
    micro: MicroSimulationResult,
    critical: CriticalEventResult
  ): GlobalImpact {
    const eventRevenue = critical.events.reduce((sum, e) => sum + e.revenue, 0);
    const playerSpending = micro.behaviors.reduce((sum, b) => sum + b.spending, 0);

    const characters = new Map<string, { popularity: number; drawRate: number; discussion: number; cpHeat: Map<string, number> }>();
    const sampleChars = ['角色A', '角色B', '角色C', '角色D'];
    for (const char of sampleChars) {
      characters.set(char, {
        popularity: Math.random(),
        drawRate: Math.random() * 0.3,
        discussion: Math.floor(Math.random() * 1000),
        cpHeat: new Map([['CP1', Math.random()], ['CP2', Math.random()]]),
      });
    }

    const plots = new Map<string, { completionRate: number; positiveRate: number; dropOffPoints: string[] }>();
    const samplePlots = ['主线剧情1', '支线剧情A', '活动剧情'];
    for (const plot of samplePlots) {
      plots.set(plot, {
        completionRate: Math.random(),
        positiveRate: Math.random(),
        dropOffPoints: [],
      });
    }

    return {
      company: {
        revenue: eventRevenue + playerSpending,
        expense: 5000 + Math.random() * 2000,
        cash: this.globalState.cash + eventRevenue + playerSpending,
        reputation: clamp(this.globalState.reputation + critical.events.reduce((sum, e) => sum + e.satisfaction * 10, 0), 0, 100),
      },
      project: {
        dau: macro.estimatedDAU,
        retention: macro.estimatedRetention,
        satisfaction: macro.estimatedSatisfaction,
        rating: clamp(this.globalState.rating + critical.events.reduce((sum, e) => sum + e.satisfaction * 0.1, 0), 1, 5),
        revenue: macro.estimatedRevenue,
      },
      characters,
      plots,
    };
  }

  private applyGlobalImpact(impact: GlobalImpact): void {
    this.globalState.cash = impact.company.cash;
    this.globalState.reputation = impact.company.reputation;
    this.globalState.dau = impact.project.dau;
    this.globalState.retention = impact.project.retention;
    this.globalState.satisfaction = impact.project.satisfaction;
    this.globalState.rating = impact.project.rating;
    this.globalState.totalRevenue += impact.project.revenue;
  }

  private aggregateResults(
    day: number,
    macro: MacroResult,
    micro: MicroSimulationResult,
    critical: CriticalEventResult,
    impact: GlobalImpact
  ): SimulationResult {
    const keyEvents = critical.events.map(e => e.description);
    const dataChanges: DaySummary['dataChanges'] = {
      DAU: {
        before: this.globalState.dau,
        after: macro.estimatedDAU,
        delta: macro.estimatedDAU - this.globalState.dau,
      },
      Revenue: {
        before: this.globalState.totalRevenue - macro.estimatedRevenue,
        after: this.globalState.totalRevenue,
        delta: macro.estimatedRevenue,
      },
      Satisfaction: {
        before: this.globalState.satisfaction,
        after: macro.estimatedSatisfaction,
        delta: macro.estimatedSatisfaction - this.globalState.satisfaction,
      },
      Rating: {
        before: this.globalState.rating - (impact.project.rating - this.globalState.rating),
        after: impact.project.rating,
        delta: impact.project.rating - this.globalState.rating + (impact.project.rating - this.globalState.rating),
      },
    };

    const summary: DaySummary = {
      keyEvents,
      dataChanges,
    };

    return {
      day,
      date: formatDate(day),
      macro,
      micro,
      critical,
      globalImpact: impact,
      summary,
    };
  }

  getExecutionTime(): number {
    return this.executionTime;
  }

  getGlobalState() {
    return { ...this.globalState };
  }

  clearCache(): void {
    this.cache.clear();
  }

  setConfig(config: Partial<SimulationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export type {
  MacroResult,
  MicroSimulationResult,
  CriticalEventResult,
  SimulationResult,
  GlobalImpact,
  DaySummary,
  PlayerBehavior,
  SimulationEvent,
  SimulationConfig,
};
