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
import { useGameStore } from './gameStore';
import { useOperationStore } from './operationStore';
import { useTaskStore } from './taskStore';
import type {
  ProjectOperationData,
  SimulationConfig,
  ProjectSimulationResult,
  ProjectComment,
  ProjectConfession,
  GlobalMetrics,
  OperationEffectTracking,
  BaseMetrics,
  OperationImpacts,
  PlayerBehavior,
  CommentSentiment,
  SimulationTickResult
} from '@/types/simulation';
import { DailyEventEngine } from '@/engine/dailyEventEngine';
import type { DailyEvent, DailyEventType } from '@/engine/dailyEventEngine';
import { seasonEventEngine } from '@/engine/seasonEventEngine';
import {
  calculateProjectQuality,
  calculateCharacterQuality,
  calculatePlotQuality,
  type ProjectQualityScore
} from '@/engine/qualityScoring';
import type { Character, Plot } from '@/types';

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

  // 每日结算回调
  const dailyReportCallback = ref<((report: any) => void) | null>(null);

  function setDailyReportCallback(callback: (report: any) => void) {
    dailyReportCallback.value = callback;
  }

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

  // ==================== Phase 2: 新增状态 ====================
  // 项目运营数据映射（projectId -> data）
  const projectOperationData = ref<Map<string, ProjectOperationData>>(new Map());

  // 全局运营指标（汇总所有项目）
  const globalMetrics = ref<GlobalMetrics>({
    totalRevenue: 0,
    totalActivePlayers: 0,
    averageSatisfaction: 0.5,
    totalDraws: 0
  });

  // 模拟配置
  const config = ref<SimulationConfig>({
    basePlayerCount: 1000,
    marketMultiplier: 1.0,
    competitionFactor: 1.0,
    timeDecay: 0.995
  });

  // 近期事件（用于影响计算）
  const recentSimulationEvents = ref<string[]>([]);

  // 运营效果追踪（用于对比预测vs实际）
  const effectTracking = ref<OperationEffectTracking[]>([]);

  // 项目评论和告白（按项目存储）
  const projectComments = ref<Map<string, ProjectComment[]>>(new Map());
  const projectConfessions = ref<Map<string, ProjectConfession[]>>(new Map());

  // ==================== Phase 5: 随机事件系统状态 ====================
  const dailyEventEngine = ref<DailyEventEngine | null>(null);
  const triggeredEvents = ref<DailyEvent[]>([]);
  const pendingNeutralEvents = ref<DailyEvent[]>([]);

  const isInitialized = computed(() => playerPool.value !== null && engine.value !== null);

  // ==================== Phase 2: 核心算法函数 ====================

  /**
   * 计算项目基础指标
   * 基于项目质量评分计算满意度、留存率、付费率
   */
  function calculateProjectBaseMetrics(
    projectQuality: ProjectQualityScore,
    historicalData: ProjectOperationData | null
  ): BaseMetrics {
    // 1. 计算满意度
    // 基础满意度 0.5，根据质量调整
    const baseSatisfaction = 0.5;
    const qualityBonus = (projectQuality.totalScore - 0.5) * 0.4;
    const satisfaction = Math.max(0, Math.min(1, baseSatisfaction + qualityBonus));

    // 2. 计算留存率
    // 基础留存率 60%，满意度影响 40%，角色吸引力影响 30%
    const baseRetention = 0.6;
    const satisfactionImpact = (satisfaction - 0.5) * 0.4;
    const characterAppeal = projectQuality.characterScore;
    const characterImpact = (characterAppeal - 0.5) * 0.3;
    const retentionRate = Math.max(0.1, Math.min(0.95,
      baseRetention + satisfactionImpact + characterImpact
    ));

    // 3. 计算付费率
    // 基础付费率 5%，角色人气影响 15%，剧情质量影响 5%
    const basePayRate = 0.05;
    const characterBonus = projectQuality.characterScore * 0.15;
    const plotBonus = projectQuality.plotScore * 0.05;
    const payRate = Math.max(0.01, Math.min(0.5,
      basePayRate + characterBonus + plotBonus
    ));

    return { satisfaction, retentionRate, payRate };
  }

  /**
   * 计算运营操作对指标的影响
   */
  function calculateOperationImpacts(
    baseMetrics: BaseMetrics,
    operations: {
      gachaPools: any[];
      events: any[];
      recentWelfare: number;
    },
    characters: Character[]
  ): OperationImpacts {
    let { satisfaction, retentionRate, payRate } = baseMetrics;
    let revenueMultiplier = 1.0;

    // 1. 卡池影响
    operations.gachaPools.forEach(pool => {
      if (pool.status === 'ongoing') {
        // UP角色人气影响付费率
        const upCharId = pool.upCharacters?.[0];
        const upChar = characters.find(c => c.id === upCharId);
        const charPopularity = upChar?.popularity?.base || 50;
        const popularityBonus = (charPopularity / 100) * 0.1;
        payRate += popularityBonus;

        // 爆率合理性影响满意度
        const ssrRate = pool.ssrRate || 0.02;
        const rateFairness = ssrRate >= 0.015 && ssrRate <= 0.03 ? 0.7 : 0.4;
        satisfaction += (rateFairness - 0.5) * 0.1;

        // 收入加成
        revenueMultiplier += popularityBonus;
      }
    });

    // 2. 活动影响
    operations.events.forEach(event => {
      if (event.status === 'ongoing') {
        // 活动类型影响不同指标
        switch (event.type) {
          case 'login':
            retentionRate += 0.05;
            break;
          case 'gacha':
            payRate += 0.03;
            revenueMultiplier += 0.15;
            break;
          case 'story':
            satisfaction += 0.08;
            break;
          case 'limited':
            payRate += 0.05;
            revenueMultiplier += 0.2;
            break;
        }
      }
    });

    // 3. 福利影响
    if (operations.recentWelfare > 0) {
      satisfaction += Math.min(0.15, operations.recentWelfare / 5000);
      retentionRate += 0.03;
    }

    return {
      satisfaction: Math.max(0, Math.min(1, satisfaction)),
      retentionRate: Math.max(0.1, Math.min(0.95, retentionRate)),
      payRate: Math.max(0.01, Math.min(0.5, payRate)),
      revenueMultiplier
    };
  }

  /**
   * 生成真实玩家行为数据
   */
  function generatePlayerBehavior(
    metrics: OperationImpacts,
    projectQuality: ProjectQualityScore,
    historicalData: ProjectOperationData | null
  ): PlayerBehavior {
    // 1. 计算活跃玩家数
    const basePlayers = config.value.basePlayerCount * projectQuality.totalScore; // 基础玩家数基于质量
    const prevActive = historicalData?.activePlayers || Math.floor(basePlayers);

    // 新玩家 = 基础新增 * 质量加成 * 市场系数
    const newPlayers = Math.floor(basePlayers * 0.1 * (1 + projectQuality.totalScore) * config.value.marketMultiplier);

    // 流失玩家 = 上一日活跃 * (1 - 留存率)
    const lostPlayers = Math.floor(prevActive * (1 - metrics.retentionRate));

    // 当前活跃 = 上一日留存 + 新增
    const activePlayers = Math.floor(prevActive * metrics.retentionRate) + newPlayers;

    // 2. 计算付费玩家和收入
    const payingPlayers = Math.floor(activePlayers * metrics.payRate);
    const avgSpending = 100 * metrics.revenueMultiplier; // 人均付费
    const dailyRevenue = Math.floor(payingPlayers * avgSpending);

    // 3. 计算抽卡数据
    const drawsPerPlayer = 2 + (metrics.satisfaction * 3); // 满意度越高抽卡越多
    const totalDraws = Math.floor(activePlayers * drawsPerPlayer);

    // SSR/SR 数量基于实际爆率
    const ssrRate = 0.02; // 2%基础爆率
    const srRate = 0.1;   // 10%基础爆率
    const ssrCount = Math.floor(totalDraws * ssrRate);
    const srCount = Math.floor(totalDraws * srRate);

    return {
      activePlayers,
      newPlayers,
      lostPlayers,
      payingPlayers,
      dailyRevenue,
      totalDraws,
      ssrCount,
      srCount
    };
  }

  /**
   * 计算评论情感分布
   */
  function calculateCommentSentiment(
    params: {
      satisfaction: number;
      plotTagMatch: number;
    }
  ): 'positive' | 'neutral' | 'negative' {
    const { satisfaction, plotTagMatch } = params;
    const score = satisfaction * 0.6 + plotTagMatch * 0.4;

    if (score > 0.7) return 'positive';
    if (score < 0.4) return 'negative';
    return 'neutral';
  }

  /**
   * 生成基于真实角色的评论
   */
  function generateRealCharacterComments(
    characters: Character[],
    sentiment: 'positive' | 'neutral' | 'negative',
    count: number
  ): ProjectComment[] {
    const comments: ProjectComment[] = [];
    const platforms = ['抖音', '小红书', '微博', 'B站', '贴吧'];

    if (characters.length === 0) return comments;

    // 根据角色人气决定评论数量分配
    const totalPopularity = characters.reduce((sum, c) => sum + (c.popularity?.base || 50), 0);

    characters.forEach(char => {
      const popularityRatio = (char.popularity?.base || 50) / totalPopularity;
      const charCommentCount = Math.max(1, Math.floor(count * popularityRatio));

      for (let i = 0; i < charCommentCount; i++) {
        // 根据角色属性选择模板
        const templates = getCharacterCommentTemplates(char, sentiment);
        const template = templates[Math.floor(Math.random() * templates.length)];

        comments.push({
          id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: template
            .replace('{name}', char.name)
            .replace('{trait}', char.personality || '神秘'),
          sentiment,
          characterId: char.id,
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          likes: Math.floor(Math.random() * 100 * (char.popularity?.base || 50) / 50),
          createdAt: new Date().toISOString()
        });
      }
    });

    return comments.slice(0, count);
  }

  /**
   * 获取角色评论模板
   */
  function getCharacterCommentTemplates(
    character: Character,
    sentiment: 'positive' | 'neutral' | 'negative'
  ): string[] {
    const templates: Record<string, string[]> = {
      positive: [
        '{name}真的太棒了，{trait}的性格好戳我！',
        '为了{name}入坑，结果真香！',
        '{name}的剧情写得太好了，制作组加鸡腿！',
        '每天上线就是为了看{name}，太可爱了！',
        '{name}的新卡面美哭了，必抽！',
        '谁懂啊{name}的{trait}设定太香了',
        '{name}是我玩下去的唯一动力！'
      ],
      neutral: [
        '{name}的人设还可以，期待后续剧情',
        '感觉{name}的剧情有点平淡',
        '{name}的卡面质量不太稳定',
        '希望{name}能有更多互动内容',
        '{name}的设定还行吧，中规中矩'
      ],
      negative: [
        '{name}的剧情是不是换写手了？质量下降好多',
        '等了这么久{name}就这点内容？',
        '{name}的人设崩了吧，完全OOC',
        '对{name}很失望，退坑边缘',
        '{name}的剧情写得什么鬼，退钱了'
      ]
    };

    return templates[sentiment];
  }

  /**
   * 生成基于真实剧情的评论
   */
  function generateRealPlotComments(
    plots: Plot[],
    characters: Character[],
    sentiment: 'positive' | 'neutral' | 'negative',
    count: number
  ): ProjectComment[] {
    const comments: ProjectComment[] = [];
    const platforms = ['抖音', '小红书', '微博', 'B站', '贴吧'];

    if (plots.length === 0) return comments;

    plots.forEach(plot => {
      // 根据剧情质量决定评论数量
      const qualityRatio = (plot.quality || 70) / 100;
      const plotCommentCount = Math.max(1, Math.floor(count * qualityRatio / plots.length));

      for (let i = 0; i < plotCommentCount; i++) {
        const templates = getPlotCommentTemplates(plot.tags || [], sentiment);
        const template = templates[Math.floor(Math.random() * templates.length)];

        // 替换剧情相关变量
        const charNames = plot.characters?.map(id =>
          characters.find(c => c.id === id)?.name
        ).filter(Boolean).join('、') || '';

        comments.push({
          id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: template
            .replace('{chars}', charNames)
            .replace('{tag}', plot.tags?.[0] || '剧情'),
          sentiment,
          plotId: plot.id,
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          likes: Math.floor(Math.random() * 50 * qualityRatio),
          createdAt: new Date().toISOString()
        });
      }
    });

    return comments.slice(0, count);
  }

  /**
   * 获取剧情评论模板
   */
  function getPlotCommentTemplates(
    tags: string[],
    sentiment: 'positive' | 'neutral' | 'negative'
  ): string[] {
    const templates: Record<string, string[]> = {
      positive: [
        '{chars}的剧情太甜了，{tag}党狂喜！',
        '这期{tag}剧情写得真好，制作组用心了',
        '{tag}线终于更新了，等了好久！',
        '{chars}的互动太有爱了，kswl',
        '这剧情质量，这游戏我玩定了！'
      ],
      neutral: [
        '{tag}剧情还可以，但有点短',
        '{chars}的剧情中规中矩吧',
        '希望{tag}线能再丰富一些',
        '剧情节奏有点问题，但总体还行'
      ],
      negative: [
        '{tag}剧情写得什么鬼，逻辑不通',
        '{chars}的剧情太水了，敷衍玩家',
        '这{tag}线崩了吧，完全不符合人设',
        '剧情质量下降太严重了，失望'
      ]
    };

    return templates[sentiment];
  }

  /**
   * 生成基于真实角色的告白
   */
  function generateRealConfessions(
    characters: Character[],
    playerSatisfaction: number,
    count: number
  ): ProjectConfession[] {
    const confessions: ProjectConfession[] = [];

    if (characters.length === 0) return confessions;

    // 根据角色人气和玩家满意度决定告白数量
    characters.forEach(char => {
      const charPopularity = char.popularity?.base || 50;
      const probability = (charPopularity / 100) * playerSatisfaction;

      // 每个角色最多生成2条告白
      const maxConfessions = Math.floor(probability * 2);

      for (let i = 0; i < maxConfessions; i++) {
        if (Math.random() < probability) {
          const templates = getConfessionTemplates(char);
          const template = templates[Math.floor(Math.random() * templates.length)];

          confessions.push({
            id: `confession_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            characterId: char.id,
            characterName: char.name,
            content: template.replace('{name}', char.name),
            likes: Math.floor(Math.random() * 200 * (charPopularity / 50)),
            createdAt: new Date().toISOString()
          });
        }
      }
    });

    // 限制总数
    return confessions.slice(0, count);
  }

  /**
   * 获取告白模板
   */
  function getConfessionTemplates(character: Character): string[] {
    return [
      `今天又是为${character.name}心动的一天！`,
      `${character.name}真的太完美了，我沦陷了`,
      `为了${character.name}，这游戏我能玩一辈子`,
      `${character.name}的每一个表情都让我心动`,
      `许愿能和${character.name}在现实中相遇`,
      `${character.name}就是我理想型的化身`,
      `每天最开心的事就是看到${character.name}`
    ];
  }

  /**
   * 更新全局指标
   */
  function updateGlobalMetrics() {
    let totalRevenue = 0;
    let totalActivePlayers = 0;
    let totalSatisfaction = 0;
    let totalDraws = 0;
    let projectCount = 0;

    projectOperationData.value.forEach(data => {
      totalRevenue += data.dailyRevenue;
      totalActivePlayers += data.activePlayers;
      totalSatisfaction += data.satisfaction;
      totalDraws += data.totalDraws;
      projectCount++;
    });

    globalMetrics.value = {
      totalRevenue,
      totalActivePlayers,
      averageSatisfaction: projectCount > 0 ? totalSatisfaction / projectCount : 0.5,
      totalDraws
    };

    // 更新UI显示的运营指标
    operationMetrics.value = {
      todayRevenue: totalRevenue,
      activePlayers: totalActivePlayers,
      totalDraws: operationMetrics.value.totalDraws + totalDraws,
      activeEvents: recentEvents.value.filter(e => !e.resolved).length,
      reputation: Math.round(globalMetrics.value.averageSatisfaction * 100),
      pendingIncidents: recentEvents.value.length
    };
  }

  /**
   * 更新开发中项目进度
   */
  function updateDevelopingProjects() {
    const employeeStore = useEmployeeStore();
    const projectStore = useProjectStore();
    const developingProjects = projectStore.developingProjects;

    developingProjects.forEach(project => {
      // 获取项目团队效率（包含默契度加成）
      const teamEfficiency = employeeStore.getProjectTeamEfficiency(project.id);
      const avgEfficiency = teamEfficiency.overall || 1.0;

      // 基础进度增长（每天 1-3%）
      const baseProgress = 1 + Math.random() * 2;

      // 应用效率乘数（0.5 - 1.5）
      const efficiencyMultiplier = Math.max(0.5, Math.min(1.5, avgEfficiency));
      const actualProgress = baseProgress * efficiencyMultiplier;

      // 更新项目进度
      const newProgress = Math.min(100, project.progress + actualProgress);
      projectStore.updateProjectProgress(project.id, newProgress);

      // 项目进度增加给员工增加经验（基于进度：+5/+8/+10）
      if (newProgress > project.progress) {
        const projectEmployees = employeeStore.getProjectEmployees(project.id);
        projectEmployees.forEach(emp => {
          // 根据员工等级调整经验获取
          let expGain = 5;
          if (emp.level === 'mid') expGain = 8;
          else if (emp.level === 'senior' || emp.level === 'expert') expGain = 10;
          
          employeeStore.addExperience(emp.id, expGain);
        });
      }
    });
  }

  // ==================== Phase 5: 随机事件系统集成 ====================

  /**
   * 触发每日随机事件
   */
  async function triggerDailyEvents() {
    if (!dailyEventEngine.value) return;

    const employeeStore = useEmployeeStore();
    const projectStore = useProjectStore();
    const gameStore = useGameStore();

    // 获取员工列表
    const employees = employeeStore.employees;

    // 获取项目 ID 列表
    const projectIds = projectStore.operatingProjects.map(p => p.id);

    // 获取角色名称列表
    const characterNames = gameStore.characters.map(c => c.name);

    // 触发事件
    const result = dailyEventEngine.value.triggerEvents({
      employees,
      projectIds,
      characterNames,
      projectData: projectOperationData.value, // 传递项目运营数据
    });

    // 保存触发的事件
    triggeredEvents.value = result.events;

    // 分类处理事件
    result.events.forEach(event => {
      if (event.category === 'neutral') {
        // 中性事件需要玩家选择，加入待处理队列
        pendingNeutralEvents.value.push(event);
      } else {
        // 正面/负面/员工事件自动应用影响
        applyEventImpact(event);
      }
    });

    // 将事件添加到历史
    recentEvents.value.push(...result.events.map(e => ({
      ...e,
      resolved: false
    })));
  }

  /**
   * 应用单个事件的影响
   */
  function applyEventImpact(event: DailyEvent) {
    const impact = event.impact;

    // 根据事件类型应用不同影响
    switch (event.category) {
      case 'positive':
        applyPositiveEventImpact(event);
        break;
      case 'negative':
        applyNegativeEventImpact(event);
        break;
      case 'employee':
        applyEmployeeEventImpact(event);
        break;
    }

    // 如果有持续时间，设置事件效果
    if (event.duration) {
      // TODO: 实现持续事件效果系统
      console.log(`事件 ${event.title} 将持续 ${event.duration} 天`);
    }
  }

  /**
   * 应用正面事件影响
   */
  function applyPositiveEventImpact(event: DailyEvent) {
    const impact = event.impact;
    const projectStore = useProjectStore();

    // 玩家数量增加
    if (impact.playerChange && event.affectedProjectId) {
      const projectData = projectOperationData.value.get(event.affectedProjectId);
      if (projectData) {
        projectData.activePlayers += impact.playerChange;
        projectData.newPlayers += impact.playerChange;
      }
    }

    // 收入加成
    if (impact.revenueChange) {
      // 对受影响的项目应用收入加成
      if (event.affectedProjectId) {
        const projectData = projectOperationData.value.get(event.affectedProjectId);
        if (projectData) {
          projectData.dailyRevenue = Math.floor(
            projectData.dailyRevenue * (1 + impact.revenueChange)
          );
        }
      }
    }

    // 满意度提升
    if (impact.satisfactionChange) {
      // 全局满意度提升
      globalMetrics.value.averageSatisfaction = Math.min(1,
        globalMetrics.value.averageSatisfaction + (impact.satisfactionChange / 100)
      );
    }

    // 声誉提升
    if (impact.reputationChange) {
      operationMetrics.value.reputation = Math.min(100,
        operationMetrics.value.reputation + impact.reputationChange
      );
    }

    console.log(`应用正面事件影响：${event.title}`);
  }

  /**
   * 应用负面事件影响
   */
  function applyNegativeEventImpact(event: DailyEvent) {
    const impact = event.impact;
    const projectStore = useProjectStore();

    // 玩家数量减少
    if (impact.playerChange && event.affectedProjectId) {
      const projectData = projectOperationData.value.get(event.affectedProjectId);
      if (projectData) {
        projectData.activePlayers = Math.max(0, projectData.activePlayers + impact.playerChange);
        projectData.lostPlayers += Math.abs(impact.playerChange);
      }
    }

    // 收入减少
    if (impact.revenueChange) {
      if (event.affectedProjectId) {
        const projectData = projectOperationData.value.get(event.affectedProjectId);
        if (projectData) {
          projectData.dailyRevenue = Math.floor(
            projectData.dailyRevenue * (1 + impact.revenueChange)
          );
        }
      }
    }

    // 满意度降低
    if (impact.satisfactionChange) {
      globalMetrics.value.averageSatisfaction = Math.max(0,
        globalMetrics.value.averageSatisfaction + (impact.satisfactionChange / 100)
      );
    }

    // 声誉降低
    if (impact.reputationChange) {
      operationMetrics.value.reputation = Math.max(0,
        operationMetrics.value.reputation + impact.reputationChange
      );
    }

    console.log(`应用负面事件影响：${event.title}`);
  }

  /**
   * 应用员工事件影响
   */
  function applyEmployeeEventImpact(event: DailyEvent) {
    const employeeStore = useEmployeeStore();
    const impact = event.impact;

    if (!event.affectedEmployeeId) return;

    const employee = employeeStore.employees.find(e => e.id === event.affectedEmployeeId);
    if (!employee) return;

    // 疲劳度变化
    if (impact.fatigueChange) {
      employee.fatigue = Math.max(0, Math.min(100, employee.fatigue + impact.fatigueChange));
    }

    // 满意度变化
    if (impact.satisfactionChange) {
      employee.satisfaction = Math.max(0, Math.min(100, employee.satisfaction + impact.satisfactionChange));
    }

    // 经验奖励
    if (impact.experienceBonus) {
      employeeStore.addExperience(event.affectedEmployeeId, impact.experienceBonus);
    }

    // 公司声誉变化
    if (impact.reputationChange) {
      operationMetrics.value.reputation = Math.max(0, Math.min(100,
        operationMetrics.value.reputation + impact.reputationChange
      ));
    }

    console.log(`应用员工事件影响：${event.title}`);
  }

  /**
   * 将事件影响应用到所有项目
   */
  function applyEventImpactsToProjects() {
    // 处理已自动应用的 event 影响
    // 这个函数主要用于处理需要批量应用的影响
    triggeredEvents.value.forEach(event => {
      if (event.category !== 'neutral') {
        // 非中性事件已经在 applyEventImpact 中处理
        return;
      }
      // 中性事件等待玩家选择
    });
  }

  /**
   * 处理中性事件选择
   */
  function handleNeutralEventChoice(eventId: string, accept: boolean) {
    const event = pendingNeutralEvents.value.find(e => e.id === eventId);
    if (!event) return;

    if (accept) {
      // 接受事件，应用正面影响
      applyEventImpact(event);
    } else {
      // 拒绝事件，可能应用负面影响或无影响
      if (event.type === 'player_request') {
        // 拒绝玩家请求，满意度降低
        globalMetrics.value.averageSatisfaction = Math.max(0,
          globalMetrics.value.averageSatisfaction - 0.05
        );
      }
    }

    // 从待处理队列移除
    pendingNeutralEvents.value = pendingNeutralEvents.value.filter(e => e.id !== eventId);
  }

  /**
   * 移除待处理事件（用于扩展事件）
   */
  function removePendingEvent(eventId: string) {
    pendingNeutralEvents.value = pendingNeutralEvents.value.filter(e => e.id !== eventId);
  }

  /**
   * 应用事件影响（支持自定义影响对象）
   */
  function applyCustomEventImpact(impact: {
    revenueChange?: number;
    satisfactionChange?: number;
    reputationChange?: number;
    playerChange?: number;
    fatigueChange?: number;
    experienceBonus?: number;
  }) {
    applyEventImpact(impact as any);
  }

  // ==================== 原有函数 ====================

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

      // Phase 5: 初始化每日事件引擎
      dailyEventEngine.value = new DailyEventEngine();

      currentDay.value = 1;
      history.value = [];
      recentConfessions.value = [];
      recentFanworks.value = [];
      recentEvents.value = [];
      triggeredEvents.value = [];
      pendingNeutralEvents.value = [];
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

  /**
   * 重构后的 simulation tick
   * 基于真实项目数据生成运营数据
   * 
   * 调用顺序：
   * 1. 递增天数
   * 2. 员工更新
   * 3. 角色更新
   * 4. 季节检查
   * 5. 随机事件
   * 6. 运营数据生成
   * 7. 数据保存
   */
  async function tick(): Promise<SimulationTickResult | null> {
    if (!engine.value || !playerPool.value) {
      error.value = '请先初始化模拟引擎';
      return null;
    }

    try {
      isRunning.value = true;
      error.value = null;

      const projectStore = useProjectStore();
      const operationStore = useOperationStore();
      const gameStore = useGameStore();
      const employeeStore = useEmployeeStore();

      // ==================== Phase 6: 集成所有模块 ====================
      // 1. 递增天数（首先递增，用于后续计算）
      currentDay.value++;
      console.log(`[Simulation] 开始第 ${currentDay.value.value} 天的模拟`);

      // 2. 员工更新（疲劳度、满意度、经验、离职等）
      console.log('[Simulation] 执行员工每日更新...');
      const allProjectIds = [...projectStore.projects.map(p => p.id)];
      const allCharacterNames = gameStore.characters.map(c => c.name);
      
      const dailyUpdateResult = employeeStore.simulateDailyUpdate(allProjectIds, allCharacterNames);
      
      if (dailyUpdateResult.leveledUpEmployees.length > 0) {
        console.log(`[Simulation] ${dailyUpdateResult.leveledUpEmployees.length}名员工可以升级`);
      }
      
      if (dailyUpdateResult.events.length > 0) {
        console.log(`[Simulation] 员工系统触发了${dailyUpdateResult.events.length}个随机事件`);
      }

      // 3. 角色更新（亲密度衰减、人气变化、生日事件等）
      console.log('[Simulation] 执行角色每日更新...');
      try {
        const characterUpdateResult = await gameStore.updateCharacterDaily();
        if (characterUpdateResult.success) {
          console.log('[Simulation] 角色每日更新完成');
          
          if (characterUpdateResult.birthdayEvents && characterUpdateResult.birthdayEvents.length > 0) {
            console.log(`[Simulation] 触发${characterUpdateResult.birthdayEvents.length}个生日事件`);
          }
          
          if (characterUpdateResult.popularityChanges && characterUpdateResult.popularityChanges.length > 0) {
            console.log(`[Simulation] ${characterUpdateResult.popularityChanges.length}个角色人气发生变化`);
          }
        } else {
          console.warn('[Simulation] 角色每日更新失败:', characterUpdateResult.message);
        }
      } catch (charError) {
        console.error('[Simulation] 角色每日更新异常:', charError);
      }

      // 4. 季节检查（季节系统更新）
      console.log('[Simulation] 执行季节系统更新...');
      try {
        if (seasonEventEngine) {
          seasonEventEngine.update();
          const seasonState = seasonEventEngine.getState();
          console.log(`[Simulation] 当前季节：${seasonState.currentSeason}, 节假日：${seasonState.activeHolidays.length}个`);
        }
      } catch (seasonError) {
        console.error('[Simulation] 季节系统更新异常:', seasonError);
      }

      // 5. 获取所有已发布的项目
      const operatingProjects = projectStore.operatingProjects;

      if (operatingProjects.length === 0) {
        console.log('[Simulation] 没有已发布的项目，跳过模拟');
        // 仍然执行原有的虚拟模拟以保持兼容性
        return await runLegacyTick();
      }

      // 2. 为每个项目计算运营数据
      const projectResults: ProjectSimulationResult[] = [];

      for (const project of operatingProjects) {
        // 2.1 获取项目关联的角色和剧情
        const projectChars: Character[] = project.characters
          .map(id => gameStore.characters.find(c => c.id === id))
          .filter((c): c is Character => c !== undefined);

        const projectPlots: Plot[] = project.plots
          .map(id => gameStore.plots.find(p => p.id === id))
          .filter((p): p is Plot => p !== undefined);

        // 2.2 计算项目质量评分
        const projectQuality = calculateProjectQuality(projectChars, projectPlots);

        // 2.3 获取历史数据
        const historicalData = projectOperationData.value.get(project.id) || null;

        // 2.4 计算基础指标
        const baseMetrics = calculateProjectBaseMetrics(projectQuality, historicalData);

        // 2.5 获取当前运营配置
        const operations = {
          gachaPools: operationStore.gachaPools.filter(p =>
            p.projectId === project.id && p.status === 'ongoing'
          ),
          events: operationStore.events.filter(e =>
            e.projectId === project.id && e.status === 'ongoing'
          ),
          recentWelfare: operationStore.recentWelfareValue || 0
        };

        // 2.6 应用运营操作影响
        const adjustedMetrics = calculateOperationImpacts(baseMetrics, operations, projectChars);

        // 2.7 生成玩家行为数据
        const playerBehavior = generatePlayerBehavior(
          adjustedMetrics,
          projectQuality,
          historicalData
        );

        // 2.8 生成UGC内容
        const sentiment = calculateCommentSentiment({
          satisfaction: adjustedMetrics.satisfaction,
          plotTagMatch: projectQuality.plotScore
        });

        const comments = [
          ...generateRealCharacterComments(projectChars, sentiment, 10),
          ...generateRealPlotComments(projectPlots, projectChars, sentiment, 5)
        ];

        const confessions = generateRealConfessions(
          projectChars,
          adjustedMetrics.satisfaction,
          5
        );

        // 2.9 更新项目运营数据
        const operationData: ProjectOperationData = {
          projectId: project.id,
          satisfaction: adjustedMetrics.satisfaction,
          retentionRate: adjustedMetrics.retentionRate,
          payRate: adjustedMetrics.payRate,
          activePlayers: playerBehavior.activePlayers,
          newPlayers: playerBehavior.newPlayers,
          lostPlayers: playerBehavior.lostPlayers,
          payingPlayers: playerBehavior.payingPlayers,
          dailyRevenue: playerBehavior.dailyRevenue,
          totalRevenue: (historicalData?.totalRevenue || 0) + playerBehavior.dailyRevenue,
          gachaRevenue: Math.floor(playerBehavior.dailyRevenue * 0.8),
          totalDraws: (historicalData?.totalDraws || 0) + playerBehavior.totalDraws,
          ssrCount: (historicalData?.ssrCount || 0) + playerBehavior.ssrCount,
          srCount: (historicalData?.srCount || 0) + playerBehavior.srCount,
          history: [
            ...(historicalData?.history || []),
            {
              date: new Date().toISOString(),
              revenue: playerBehavior.dailyRevenue,
              activePlayers: playerBehavior.activePlayers,
              satisfaction: adjustedMetrics.satisfaction
            }
          ]
        };

        projectOperationData.value.set(project.id, operationData);
        projectComments.value.set(project.id, comments);
        projectConfessions.value.set(project.id, confessions);

        projectResults.push({
          projectId: project.id,
          operationData,
          comments,
          confessions
        });
      }

      // 6. 触发每日随机事件（Phase 5）
      console.log('[Simulation] 触发每日随机事件...');
      try {
        await triggerDailyEvents();
        
        if (triggeredEvents.value.length > 0) {
          console.log(`[Simulation] 触发了 ${triggeredEvents.value.length} 个随机事件`);
          
          // 分类统计事件
          const positiveCount = triggeredEvents.value.filter(e => e.category === 'positive').length;
          const negativeCount = triggeredEvents.value.filter(e => e.category === 'negative').length;
          const neutralCount = triggeredEvents.value.filter(e => e.category === 'neutral').length;
          const employeeCount = triggeredEvents.value.filter(e => e.category === 'employee').length;
          
          console.log(`[Simulation] 事件类型分布：正面${positiveCount}个，负面${negativeCount}个，中性${neutralCount}个，员工${employeeCount}个`);
        }
      } catch (eventError) {
        console.error('[Simulation] 随机事件触发异常:', eventError);
      }

      // 7. 应用事件影响到项目数据（Phase 5）
      console.log('[Simulation] 应用事件影响...');
      try {
        applyEventImpactsToProjects();
      } catch (impactError) {
        console.error('[Simulation] 应用事件影响异常:', impactError);
      }

      // 8. 更新全局指标
      console.log('[Simulation] 更新全局指标...');
      updateGlobalMetrics();

      // 9. 更新运营效果追踪（Phase 3）
      operationStore.updateOperationEffectTracking(
        projectResults.map(r => ({
          projectId: r.projectId,
          operationData: r.operationData
        }))
      );

      // 10. 清理过期数据（优化 4）
      console.log('[Simulation] 清理过期数据...');
      cleanupExpiredData();

      // 11. 更新开发中项目进度
      console.log('[Simulation] 更新开发中项目进度...');
      updateDevelopingProjects();

      // 12. 重置每日福利值（Phase 3）
      console.log('[Simulation] 重置每日福利值...');
      operationStore.resetRecentWelfare();

      // 13. 保存数据（批量保存）
      console.log('[Simulation] 保存数据到本地存储...');
      try {
        saveToLocal();
        console.log('[Simulation] 数据保存成功');
      } catch (saveError) {
        console.error('[Simulation] 数据保存失败:', saveError);
      }

      // 14. 更新情感分布（基于所有项目评论）
      updateSentimentDistribution();

      // 15. 记录每日总结报告
      console.log('[Simulation] 记录每日总结报告...');
      try {
        const taskStore = useTaskStore();
        const totalRevenue = projectResults.reduce((sum, r) => sum + r.operationData.dailyRevenue, 0);
        const totalExpense = 0; // TODO: 计算实际支出
        
        taskStore.addDailyReport({
          day: currentDay.value,
          date: new Date().toISOString(),
          revenue: totalRevenue,
          expense: totalExpense,
          newPlayers: projectResults.reduce((sum, r) => sum + r.operationData.newPlayers, 0),
          lostPlayers: projectResults.reduce((sum, r) => sum + r.operationData.lostPlayers, 0),
          completedTasks: taskStore.dailyProgress.current,
          achievements: [] // TODO: 记录当日达成的成就
        });
        
        // 触发每日结算回调
        if (dailyReportCallback.value) {
          dailyReportCallback.value({
            day: currentDay.value,
            date: new Date().toISOString(),
            revenue: totalRevenue,
            expense: totalExpense,
            newPlayers: projectResults.reduce((sum, r) => sum + r.operationData.newPlayers, 0),
            lostPlayers: projectResults.reduce((sum, r) => sum + r.operationData.lostPlayers, 0),
            completedTasks: taskStore.dailyProgress.current,
            achievements: []
          });
        }
      } catch (reportError) {
        console.error('[Simulation] 记录每日报告失败:', reportError);
      }

      return {
        day: currentDay.value,
        projectResults,
        globalMetrics: globalMetrics.value
      };
    } catch (e) {
      error.value = e instanceof Error ? e.message : '模拟运行失败';
      console.error('Simulation tick error:', e);
      return null;
    } finally {
      isRunning.value = false;
    }
  }

  /**
   * 运行传统的虚拟模拟（兼容模式）
   */
  async function runLegacyTick(): Promise<SimulationTickResult | null> {
    if (!engine.value || !playerPool.value) return null;

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

    // 更新开发中项目的进度
    updateDevelopingProjects();

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

    return {
      day: currentDay.value,
      projectResults: [],
      globalMetrics: {
        totalRevenue: result.globalImpact.project.revenue,
        totalActivePlayers: result.globalImpact.project.dau,
        averageSatisfaction: result.globalImpact.project.satisfaction,
        totalDraws: operationMetrics.value.totalDraws
      }
    };
  }

  /**
   * 更新情感分布
   */
  function updateSentimentDistribution() {
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    projectComments.value.forEach(comments => {
      comments.forEach(c => {
        if (c.sentiment === 'positive') positive++;
        else if (c.sentiment === 'negative') negative++;
        else neutral++;
      });
    });

    const total = positive + neutral + negative;
    if (total > 0) {
      sentimentDistribution.value = {
        positive: Math.round(positive / total * 100),
        neutral: Math.round(neutral / total * 100),
        negative: Math.round(negative / total * 100)
      };
    }
  }

  function getCurrentActivity(): ActivityConfig {
    const activities: ActivityConfig[] = getActivitiesFromConfig();
    return activities[currentDay.value % activities.length];
  }

  function getActivitiesFromConfig(): ActivityConfig[] {
    try {
      const activitiesConfig = require('@/config/activities.json');
      return (activitiesConfig.activities || []).map((activity: any) => ({
        ...activity,
        startDay: currentDay.value,
        endDay: currentDay.value + activity.duration
      }));
    } catch (error) {
      console.error('加载活动配置失败:', error);
      return [
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
        }
      ];
    }
  }

  function getCurrentCharacterTags(): string[] {
    const tagPool = getTagsFromConfig().characterTags;
    const count = 1 + Math.floor(Math.random() * 2);
    const shuffled = [...tagPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  function getCurrentCharacterNames(): string[] {
    const names = getNamesFromConfig().characterNames;
    const count = 1 + Math.floor(Math.random() * 2);
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  function getCurrentContentTags(): string[] {
    const tags = getTagsFromConfig().contentTags;
    const count = 2;
    const shuffled = [...tags].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  function getTagsFromConfig(): { characterTags: string[]; contentTags: string[] } {
    try {
      const tagsConfig = require('@/config/tags.json');
      return {
        characterTags: tagsConfig.characterTags || ['温柔', '高冷'],
        contentTags: tagsConfig.contentTags || ['甜宠', '虐恋']
      };
    } catch (error) {
      console.error('加载标签配置失败:', error);
      return {
        characterTags: ['温柔', '高冷', '甜宠', '治愈', '傲娇'],
        contentTags: ['甜宠', '虐恋', '高福利', '长剧情']
      };
    }
  }

  function getNamesFromConfig(): { characterNames: string[]; playerNames: string[] } {
    try {
      const namesConfig = require('@/config/names.json');
      return {
        characterNames: namesConfig.characterNames || ['角色A', '角色B'],
        playerNames: namesConfig.playerNames || ['玩家1', '玩家2']
      };
    } catch (error) {
      console.error('加载名称配置失败:', error);
      return {
        characterNames: ['冰山总裁', '温柔医生', '阳光学弟', '病娇竹马'],
        playerNames: ['小可爱', '游戏达人', '剧情党']
      };
    }
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

  // ==================== 数据持久化 ====================

  /**
   * 保存到本地存储（优化版）
   * - 批量保存所有数据
   * - 压缩数据大小
   */
  function saveToLocal() {
    try {
      const now = Date.now();

      // 批量保存数据
      const data = {
        currentDay: currentDay.value,
        projectOperationData: Array.from(projectOperationData.value.entries()),
        globalMetrics: globalMetrics.value,
        config: config.value,
        projectComments: Array.from(projectComments.value.entries()),
        projectConfessions: Array.from(projectConfessions.value.entries()),
        lastSaveTime: now
      };

      localStorage.setItem('simulation_data', JSON.stringify(data));
      
      // 保存成功日志
      console.log('[Simulation] 数据保存成功:', {
        currentDay: currentDay.value,
        projectsCount: projectOperationData.value.size,
        commentsCount: Array.from(projectComments.value.values()).reduce((sum, c) => sum + c.length, 0),
        confessionsCount: Array.from(projectConfessions.value.values()).reduce((sum, c) => sum + c.length, 0)
      });
    } catch (error) {
      console.error('[Simulation] 数据保存失败:', error);
      throw error;
    }
  }

  /**
   * 从本地存储加载（优化版）
   * - 数据验证
   * - 版本兼容
   * - 错误恢复
   */
  function loadFromLocal() {
    try {
      const saved = localStorage.getItem('simulation_data');
      if (!saved) {
        console.log('[Simulation] 未找到保存的数据，使用默认值');
        return;
      }

      const data = JSON.parse(saved);
      
      // 数据验证和迁移
      if (data.currentDay) {
        currentDay.value = data.currentDay;
      }
      
      if (data.projectOperationData && Array.isArray(data.projectOperationData)) {
        projectOperationData.value = new Map(data.projectOperationData);
        console.log(`[Simulation] 加载了 ${projectOperationData.value.size} 个项目的运营数据`);
      }
      
      if (data.globalMetrics) {
        globalMetrics.value = data.globalMetrics;
      }
      
      if (data.config) {
        config.value = data.config;
      }
      
      if (data.projectComments && Array.isArray(data.projectComments)) {
        projectComments.value = new Map(data.projectComments);
        const totalComments = Array.from(projectComments.value.values()).reduce((sum, c) => sum + c.length, 0);
        console.log(`[Simulation] 加载了 ${totalComments} 条评论`);
      }
      
      if (data.projectConfessions && Array.isArray(data.projectConfessions)) {
        projectConfessions.value = new Map(data.projectConfessions);
        const totalConfessions = Array.from(projectConfessions.value.values()).reduce((sum, c) => sum + c.length, 0);
        console.log(`[Simulation] 加载了 ${totalConfessions} 条告白`);
      }
      
      // 检查数据是否过期（超过 7 天未登录）
      if (data.lastSaveTime) {
        const daysSinceSave = Math.floor((Date.now() - data.lastSaveTime) / (1000 * 60 * 60 * 24));
        if (daysSinceSave > 7) {
          console.warn(`[Simulation] 数据已过期 ${daysSinceSave} 天，可能需要重新校准`);
          // TODO: 实现离线期间的数据补偿逻辑
        }
      }
      
      console.log('[Simulation] 数据加载成功');
  } catch (error) {
    console.error('[Simulation] 数据加载失败:', error);
    // 数据损坏时清空，避免影响游戏运行
    localStorage.removeItem('simulation_data');
  }
}

/**
 * 优化 4: 清理过期数据（统一清理机制）
 */
function cleanupExpiredData(): void {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  
  // 清理过期的评论（超过 30 天）
  projectComments.value.forEach((comments, projectId) => {
    const validComments = comments.filter(c => {
      const commentTime = new Date(c.createdAt).getTime();
      return commentTime > thirtyDaysAgo;
    });
    
    // 只保留最近 50 条
    const limitedComments = validComments.slice(-50);
    
    if (limitedComments.length !== comments.length) {
      projectComments.value.set(projectId, limitedComments);
      console.log(`[Simulation] 清理项目 ${projectId} 的过期评论：${comments.length} -> ${limitedComments.length}`);
    }
  });
  
  // 清理过期的告白（超过 30 天）
  projectConfessions.value.forEach((confessions, projectId) => {
    const validConfessions = confessions.filter(c => {
      const confessionTime = new Date(c.createdAt).getTime();
      return confessionTime > thirtyDaysAgo;
    });
    
    // 只保留最近 20 条
    const limitedConfessions = validConfessions.slice(-20);
    
    if (limitedConfessions.length !== confessions.length) {
      projectConfessions.value.set(projectId, limitedConfessions);
      console.log(`[Simulation] 清理项目 ${projectId} 的过期告白：${confessions.length} -> ${limitedConfessions.length}`);
    }
  });
  
  // 清理过期项目运营数据（项目已删除）
  projectOperationData.value.forEach((data, projectId) => {
    const project = projectStore.projects.find(p => p.id === projectId);
    if (!project) {
      // 项目已删除，清除数据
      projectOperationData.value.delete(projectId);
      console.log(`[Simulation] 清理已删除项目 ${projectId} 的运营数据`);
    }
  });
  
  console.log('[Simulation] 过期数据清理完成');
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

  /**
   * 获取项目的运营数据
   */
  function getProjectOperationData(projectId: string): ProjectOperationData | null {
    return projectOperationData.value.get(projectId) || null;
  }

  /**
   * 优化 2: 初始化项目运营数据（项目发布时调用）
   */
  function initializeProjectOperationData(projectId: string): void {
    const initialData: ProjectOperationData = {
      projectId,
      satisfaction: 0.7,        // 初始满意度 70%
      retentionRate: 0.5,       // 初始留存率 50%
      payRate: 0.05,           // 初始付费率 5%
      activePlayers: 1000,      // 初始活跃玩家 1000
      newPlayers: 0,
      lostPlayers: 0,
      payingPlayers: 0,
      dailyRevenue: 0,
      totalRevenue: 0,
      gachaRevenue: 0,
      totalDraws: 0,
      ssrCount: 0,
      srCount: 0,
      history: []
    };
    
    projectOperationData.value.set(projectId, initialData);
    console.log(`[Simulation] 优化 2: 项目 ${projectId} 运营数据已初始化`);
  }

  /**
   * 获取项目的评论
   */
  function getProjectComments(projectId: string): ProjectComment[] {
    return projectComments.value.get(projectId) || [];
  }

  /**
   * 获取项目的告白
   */
  function getProjectConfessions(projectId: string): ProjectConfession[] {
    return projectConfessions.value.get(projectId) || [];
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
    projectOperationData.value = new Map();
    globalMetrics.value = {
      totalRevenue: 0,
      totalActivePlayers: 0,
      averageSatisfaction: 0.5,
      totalDraws: 0
    };
    projectComments.value = new Map();
    projectConfessions.value = new Map();
    localStorage.removeItem('simulation_data');
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
    // Phase 2 新增导出
    projectOperationData,
    globalMetrics,
    projectComments,
    projectConfessions,
    // Phase 5: 随机事件系统导出
    dailyEventEngine,
    triggeredEvents,
    pendingNeutralEvents,
    initialize,
    tick,
    getHistory,
    getLastResult,
    getConfessions,
    getFanworks,
    getEvents,
    getProjectOperationData,
    getProjectComments,
    getProjectConfessions,
    // 优化 2: 导出项目运营数据初始化函数
    initializeProjectOperationData,
    // 优化 4: 导出数据清理函数
    cleanupExpiredData,
    saveToLocal,
    loadFromLocal,
    reset,
    // Phase 5: 事件处理函数
    handleNeutralEventChoice,
    // Phase 5.5: 扩展事件支持函数
    removePendingEvent,
    applyCustomEventImpact,
    // 每日结算回调
    setDailyReportCallback
  };
});
