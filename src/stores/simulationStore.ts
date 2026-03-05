import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  VirtualPlayerPool,
  SimulationEngine,
  ActivitySimulator,
  ConfessionSimulator,
  FanworkSimulator,
  EventSimulator,
  WorldSimulator,
  CommentSimulator,
  GachaSimulator
} from '@/engine/simulation';
import type {
  SimulationResult,
  VirtualPlayer,
  ActivityConfig,
  Confession,
  Fanwork,
  OperationEvent,
  WorldImpact,
  PlatformComment,
  PlatformStatistics
} from '@/engine/simulation';
import { useEmployeeStore } from './employeeStore';
import { useProjectStore } from './projectStore';

export interface RetentionData {
  d1: number;
  d7: number;
  d30: number;
}

export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

export interface GachaDistribution {
  SSR: number;
  SR: number;
  R: number;
  N: number;
}

export interface CharacterPopularity {
  name: string;
  popularity: number;
  drawRate: number;
  discussion: number;
}

export interface PlotCompletion {
  name: string;
  completionRate: number;
  positiveRate: number;
}

// 匹配现有UI的数据结构
export interface OperationMetrics {
  todayRevenue: number;      // 今日收入
  activePlayers: number;     // 活跃玩家
  totalDraws: number;        // 总抽卡数
  activeEvents: number;      // 进行中活动
  reputation: number;        // 游戏声誉
  pendingIncidents: number;  // 待处理事件
}

export interface CommentMetrics {
  heat: number;              // 舆情热度
  sentiment: number;         // 情感倾向 (-100 到 100)
  negativeRatio: number;     // 负面占比
}

// 匹配UI的平台评论结构
export interface UIPlatformComments {
  platform: string;          // 抖音/小红书/微博/B站/贴吧
  comments: UIComment[];
}

export interface UIComment {
  id: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  likes: number;
  tags: string[];
  timestamp: number;
}

export const useSimulationStore = defineStore('simulation', () => {
  const currentDay = ref(1);
  const isRunning = ref(false);
  const lastResult = ref<SimulationResult | null>(null);
  const history = ref<SimulationResult[]>([]);
  const playerPool = ref<VirtualPlayerPool | null>(null);
  const engine = ref<SimulationEngine | null>(null);
  const error = ref<string | null>(null);

  const recentConfessions = ref<Confession[]>([]);
  const recentFanworks = ref<Fanwork[]>([]);
  const recentEvents = ref<OperationEvent[]>([]);
  const worldImpact = ref<WorldImpact | null>(null);
  const worldSimulator = ref<WorldSimulator | null>(null);

  const retentionHistory = ref<RetentionData[]>([]);
  const currentRetention = ref<RetentionData>({ d1: 0, d7: 0, d30: 0 });
  const sentimentDistribution = ref<SentimentDistribution>({ positive: 0, neutral: 0, negative: 0 });
  const gachaDistribution = ref<GachaDistribution>({ SSR: 0, SR: 0, R: 0, N: 0 });
  const characterPopularity = ref<CharacterPopularity[]>([]);
  const plotCompletion = ref<PlotCompletion[]>([]);

  // 新增：匹配现有UI的数据
  const operationMetrics = ref<OperationMetrics>({
    todayRevenue: 0,
    activePlayers: 0,
    totalDraws: 0,
    activeEvents: 0,
    reputation: 55,
    pendingIncidents: 0
  });

  const commentMetrics = ref<CommentMetrics>({
    heat: 0,
    sentiment: 0,
    negativeRatio: 0
  });

  const platformComments = ref<UIPlatformComments[]>([]);
  const rawPlatformComments = ref<PlatformComment[]>([]);
  const platformStatistics = ref<PlatformStatistics | null>(null);

  const isInitialized = computed(() => playerPool.value !== null && engine.value !== null);

  async function initialize() {
    try {
      isRunning.value = true;
      error.value = null;

      const pool = new VirtualPlayerPool({ totalPlayers: 10000 });
      pool.initialize();
      playerPool.value = pool;

      engine.value = new SimulationEngine(pool, {
        normalSampleSize: 200,
        criticalSampleSize: 500
      });

      worldSimulator.value = new WorldSimulator();
      worldSimulator.value.initialize(1);

      currentDay.value = 1;
      history.value = [];
      recentConfessions.value = [];
      recentFanworks.value = [];
      recentEvents.value = [];
      retentionHistory.value = [];
      currentRetention.value = { d1: 0, d7: 0, d30: 0 };
      sentimentDistribution.value = { positive: 0, neutral: 0, negative: 0 };
      gachaDistribution.value = { SSR: 0, SR: 0, R: 0, N: 0 };
      characterPopularity.value = [];
      plotCompletion.value = [];
    } catch (e) {
      error.value = e instanceof Error ? e.message : '初始化失败';
      console.error('Simulation initialize error:', e);
    } finally {
      isRunning.value = false;
    }
  }

  async function tick(): Promise<SimulationResult | null> {
    if (!engine.value || !playerPool.value) {
      error.value = '请先初始化模拟引擎';
      return null;
    }

    try {
      isRunning.value = true;
      error.value = null;

      const sampledPlayers = playerPool.value.sample(200);

      const activitySim = new ActivitySimulator();
      const activityResult = activitySim.simulateBatch(
        sampledPlayers,
        getCurrentActivity()
      );

      const confessionSim = new ConfessionSimulator();
      const confessionResult = confessionSim.simulateBatch(
        sampledPlayers,
        getCurrentCharacterTags()
      );
      recentConfessions.value = confessionResult.confessions.slice(0, 10);

      const fanworkSim = new FanworkSimulator();
      const fanworkResult = fanworkSim.simulateBatch(
        sampledPlayers,
        getCurrentCharacterNames()
      );
      recentFanworks.value = fanworkResult.fanworks.slice(0, 10);

      const avgSatisfaction = sampledPlayers.reduce((sum, p) => sum + p.satisfaction, 0) / sampledPlayers.length;
      const eventSim = new EventSimulator();
      const eventResult = eventSim.simulate(avgSatisfaction, getCurrentContentTags());
      if (eventResult.triggered && eventResult.event) {
        recentEvents.value.push(eventResult.event);
      }

      const positiveCount = sampledPlayers.filter(p => p.satisfaction > 0.7).length;
      const neutralCount = sampledPlayers.filter(p => p.satisfaction >= 0.4 && p.satisfaction <= 0.7).length;
      const negativeCount = sampledPlayers.filter(p => p.satisfaction < 0.4).length;
      const total = sampledPlayers.length;
      sentimentDistribution.value = {
        positive: Math.round(positiveCount / total * 100),
        neutral: Math.round(neutralCount / total * 100),
        negative: Math.round(negativeCount / total * 100)
      };

      const gachaCounts = { SSR: 0, SR: 0, R: 0, N: 0 };
      sampledPlayers.forEach(p => {
        const pulls = Math.floor(Math.random() * 10) + 1;
        for (let i = 0; i < pulls; i++) {
          const rand = Math.random();
          if (rand < 0.03) gachaCounts.SSR++;
          else if (rand < 0.12) gachaCounts.SR++;
          else if (rand < 0.40) gachaCounts.R++;
          else gachaCounts.N++;
        }
      });
      const totalGacha = gachaCounts.SSR + gachaCounts.SR + gachaCounts.R + gachaCounts.N;
      if (totalGacha > 0) {
        gachaDistribution.value = {
          SSR: Math.round(gachaCounts.SSR / totalGacha * 100),
          SR: Math.round(gachaCounts.SR / totalGacha * 100),
          R: Math.round(gachaCounts.R / totalGacha * 100),
          N: Math.round(gachaCounts.N / totalGacha * 100)
        };
      }

      if (worldSimulator.value) {
        worldSimulator.value.update(currentDay.value);
        
        const characterGenres = new Map<string, string>();
        characterGenres.set('char1', '甜宠');
        characterGenres.set('char2', '虐恋');
        
        const yourRating = lastResult.value?.globalImpact.project.satisfaction ? lastResult.value.globalImpact.project.satisfaction * 10 : 7.5;
        const yourDAU = lastResult.value?.globalImpact.project.dau || 1000;
        
        const impact = worldSimulator.value.calculateImpact(yourRating, yourDAU, characterGenres);
        worldImpact.value = impact;

        result.globalImpact.project.dau += impact.project.dauChange;
        result.globalImpact.project.rating += impact.project.ratingChange;
        result.globalImpact.company.cash += impact.company.cashChange;
        result.globalImpact.company.reputation += impact.company.reputationChange;
      }

      // 生成平台评论数据
      const commentSim = new CommentSimulator();
      rawPlatformComments.value = commentSim.simulateCommentsForPlayers(sampledPlayers, getCurrentContentTags(), []);
      platformStatistics.value = commentSim.getPlatformStatistics(rawPlatformComments.value);

      // 转换为UI格式
      commentMetrics.value = {
        heat: rawPlatformComments.value.length * 10,
        sentiment: calculateSentimentScore(platformStatistics.value.sentimentDistribution),
        negativeRatio: platformStatistics.value.sentimentDistribution.negative
      };

      platformComments.value = [
        {
          platform: '抖音',
          comments: convertToUIComments(rawPlatformComments.value.filter(c => c.platform === 'weibo'))
        },
        {
          platform: '小红书',
          comments: convertToUIComments(rawPlatformComments.value.filter(c => c.platform === 'xiaohongshu'))
        },
        {
          platform: '微博',
          comments: convertToUIComments(rawPlatformComments.value.filter(c => c.platform === 'weibo'))
        },
        {
          platform: 'B站',
          comments: convertToUIComments(rawPlatformComments.value.filter(c => c.platform === 'bilibili'))
        },
        {
          platform: '贴吧',
          comments: convertToUIComments(rawPlatformComments.value.filter(c => c.platform === 'taptap'))
        }
      ];

      const result = await engine.value.tick(currentDay.value);

      currentRetention.value = {
        d1: Math.round(result.micro.statistics.retention?.d1 || result.macro.estimatedRetention.d1 * 100),
        d7: Math.round(result.micro.statistics.retention?.d7 || result.macro.estimatedRetention.d7 * 100),
        d30: Math.round(result.micro.statistics.retention?.d30 || result.macro.estimatedRetention.d30 * 100)
      };
      retentionHistory.value.push({ ...currentRetention.value });
      if (retentionHistory.value.length > 30) {
        retentionHistory.value.shift();
      }

      const chars = result.globalImpact.characters;
      const charPopularityList: CharacterPopularity[] = [];
      chars.forEach((value, key) => {
        charPopularityList.push({
          name: key,
          popularity: Math.round(value.popularity * 100),
          drawRate: Math.round(value.drawRate * 100),
          discussion: value.discussion
        });
      });
      characterPopularity.value = charPopularityList.sort((a, b) => b.popularity - a.popularity);

      const plots = result.globalImpact.plots;
      const plotList: PlotCompletion[] = [];
      plots.forEach((value, key) => {
        plotList.push({
          name: key,
          completionRate: Math.round(value.completionRate * 100),
          positiveRate: Math.round(value.positiveRate * 100)
        });
      });
      plotCompletion.value = plotList;

      result.globalImpact.project.dau += activityResult.effect.dauChange;
      result.globalImpact.project.satisfaction += activityResult.effect.satisfactionChange;
      result.globalImpact.project.revenue += activityResult.effect.revenueChange + (eventResult.effects?.shortTerm.revenue || 0);

      result.globalImpact.company.reputation += (eventResult.effects?.mediumTerm.reputation || 0);

      // 扣除员工薪资（日薪 = 月薪 / 30）
      const employeeStore = useEmployeeStore();
      const dailySalaryExpense = Math.floor(employeeStore.totalSalary / 30);
      result.globalImpact.company.cash -= dailySalaryExpense;

      // 更新开发中项目的进度（引入员工效率）
      const projectStore = useProjectStore();
      const developingProjects = projectStore.developingProjects;
      
      developingProjects.forEach(project => {
        // 获取项目团队效率
        const teamEfficiency = employeeStore.getProjectTeamEfficiency(project.id);
        const avgEfficiency = teamEfficiency.overall || 1.0;
        
        // 基础进度增长（每天1-3%）
        const baseProgress = 1 + Math.random() * 2;
        
        // 应用效率乘数（0.5 - 1.5）
        const efficiencyMultiplier = Math.max(0.5, Math.min(1.5, avgEfficiency));
        const actualProgress = baseProgress * efficiencyMultiplier;
        
        // 更新项目进度
        const newProgress = Math.min(100, project.progress + actualProgress);
        projectStore.updateProjectProgress(project.id, newProgress);
        
        // 项目进度增加给员工增加经验
        if (newProgress > project.progress) {
          const projectEmployees = employeeStore.getProjectEmployees(project.id);
          projectEmployees.forEach(emp => {
            employeeStore.addExperience(emp.id, Math.floor(actualProgress * 0.5));
          });
        }
      });

      // 生成运营指标数据
      const totalDraws = sampledPlayers.reduce((sum, p) => sum + Math.floor(Math.random() * 5), 0);
      operationMetrics.value = {
        todayRevenue: Math.floor(result.globalImpact.project.revenue * 1000),
        activePlayers: result.globalImpact.project.dau,
        totalDraws: operationMetrics.value.totalDraws + totalDraws,
        activeEvents: recentEvents.value.filter(e => !e.resolved).length,
        reputation: result.globalImpact.company.reputation,
        pendingIncidents: recentEvents.value.length
      };

      lastResult.value = result;
      history.value.push(result);
      currentDay.value++;

      return result;
    } catch (e) {
      error.value = e instanceof Error ? e.message : '模拟运行失败';
      console.error('Simulation tick error:', e);
      return null;
    } finally {
      isRunning.value = false;
    }
  }

  function getCurrentActivity(): ActivityConfig {
    const activities: ActivityConfig[] = [
      {
        id: 'valentine',
        name: '情人节限定活动',
        type: '限时',
        tags: ['情人节', '高福利'],
        rewardValue: 100,
        difficulty: 3,
        duration: 7,
        requiredLevel: 5,
        startDay: currentDay.value,
        endDay: currentDay.value + 7
      },
      {
        id: 'daily_signin',
        name: '每日签到',
        type: '日常',
        tags: ['签到'],
        rewardValue: 10,
        difficulty: 1,
        duration: 1,
        requiredLevel: 1,
        startDay: currentDay.value,
        endDay: currentDay.value
      },
      {
        id: 'anniversary',
        name: '周年庆典',
        type: '大型',
        tags: ['周年庆', '高福利'],
        rewardValue: 200,
        difficulty: 5,
        duration: 14,
        requiredLevel: 10,
        startDay: currentDay.value,
        endDay: currentDay.value + 14
      }
    ];

    return activities[currentDay.value % activities.length];
  }

  function getCurrentCharacterTags(): string[] {
    const tagPool = ['病娇', '温柔', '高冷', '甜宠', '治愈', '傲娇'];
    const count = 1 + Math.floor(Math.random() * 2);
    const shuffled = [...tagPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  function getCurrentCharacterNames(): string[] {
    const names = ['冰山总裁', '温柔医生', '阳光学弟', '病娇竹马'];
    const count = 1 + Math.floor(Math.random() * 2);
    return names.slice(0, count);
  }

  function getCurrentContentTags(): string[] {
    const tags = ['甜宠', '虐恋', '高福利', '长剧情'];
    return tags.slice(0, 2);
  }

  // 辅助函数：计算情感得分 (-100 到 100)
  function calculateSentimentScore(distribution: { positive: number; neutral: number; negative: number }): number {
    return Math.round((distribution.positive - distribution.negative) * 100 / (distribution.positive + distribution.neutral + distribution.negative));
  }

  // 辅助函数：转换为UI评论格式
  function convertToUIComments(comments: PlatformComment[]): UIComment[] {
    return comments.map(c => ({
      id: c.id,
      content: c.content,
      sentiment: c.sentiment,
      likes: Math.floor(Math.random() * 100),
      tags: c.relatedTags,
      timestamp: c.timestamp
    }));
  }

  function getHistory(): SimulationResult[] {
    return [...history.value];
  }

  function getLastResult(): SimulationResult | null {
    return lastResult.value;
  }

  function getConfessions(): Confession[] {
    return [...recentConfessions.value];
  }

  function getFanworks(): Fanwork[] {
    return [...recentFanworks.value];
  }

  function getEvents(): OperationEvent[] {
    return [...recentEvents.value];
  }

  function reset() {
    currentDay.value = 1;
    isRunning.value = false;
    lastResult.value = null;
    history.value = [];
    playerPool.value = null;
    engine.value = null;
    error.value = null;
    recentConfessions.value = [];
    recentFanworks.value = [];
    recentEvents.value = [];
  }

  return {
    currentDay,
    isRunning,
    lastResult,
    history,
    error,
    recentConfessions,
    recentFanworks,
    recentEvents,
    worldImpact,
    worldSimulator,
    isInitialized,
    retentionHistory,
    currentRetention,
    sentimentDistribution,
    gachaDistribution,
    characterPopularity,
    plotCompletion,
    operationMetrics,
    commentMetrics,
    platformComments,
    rawPlatformComments,
    platformStatistics,
    initialize,
    tick,
    getHistory,
    getLastResult,
    getConfessions,
    getFanworks,
    getEvents,
    reset
  };
});
