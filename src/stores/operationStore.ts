/**
 * 运营系统 Store
 * 管理卡池、活动、运营事件和运营数据
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { 
  EventType, 
  BudgetLevel, 
  IncidentSolution,
  EventTemplate,
  IncidentTemplate 
} from '@/types/template';
import { generateRandomIncident } from '@/data/templates/incidents';
import { getRandomEvent, getEventsByType } from '@/data/templates/events';
import type { GachaResult } from './playerStore';
import { useSimulationStore } from './simulationStore';
import { useGameStore } from './gameStore';
import { usePointsStore } from './points';
import { useCommentStore } from './commentStore';
import { linkageEngine, type LinkageEffect, type OperationModule } from '@/engine/linkageEngine';
import type {
  OperationPrediction as NewOperationPrediction,
  PredictionVsActual,
  ActiveOperationEffect,
  GachaPoolConfig as PredictionGachaPoolConfig,
  EventConfig as PredictionEventConfig,
  WelfareConfig as PredictionWelfareConfig
} from '@/types/operationPrediction';
import type { ProjectOperationData } from '@/types/simulation';
import {
  predictGachaPoolImpact,
  predictEventImpact,
  predictWelfareImpact,
  calculateAccuracy,
  generateAnalysis
} from '@/engine/operationPrediction';

// 优化 5: 添加类型安全的数据结构定义
export interface OperationStoreData {
  gachaPools: typeof gachaPools.value;
  events: typeof events.value;
  incidents: typeof incidents.value;
  hasInitializedDefaults: boolean;
  newOperationPredictions: Array<[string, NewOperationPrediction]>;
  activeOperationEffects: Array<[string, ActiveOperationEffect]>;
  completedOperationEffects: PredictionVsActual[];
  recentWelfareValue: number;
  welfareHistory: typeof welfareHistory.value;
}

export interface PoolGachaStats {
  totalDraws: number;
  ssrCount: number;
  srCount: number;
  rCount: number;
  ssrRate: number;
  averagePity: number;
  luckiestPlayers: { playerId: string; playerName: string; luckValue: number }[];
  unluckiestPlayers: { playerId: string; playerName: string; luckValue: number }[];
}

export interface GachaPool {
  id: string;
  name: string;
  upCharacters: string[];
  rates: {
    ssr: number;
    sr: number;
    r: number;
  };
  startTime: string;
  endTime: string;
  budget: BudgetLevel;
  totalDraws: number;
  revenue: number;
  popularityBonus?: number; // 人气加成倍率
  status: 'upcoming' | 'ongoing' | 'ended';
  gachaResults: GachaResult[];
  ssrCount: number;
  srCount: number;
  rCount: number;
  averagePity: number;
}

// 活动数据
export interface GameEvent {
  id: string;
  type: EventType;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  rewards: string[];
  mechanics: string[];
  budget: BudgetLevel;
  participants: number;
  status: 'upcoming' | 'ongoing' | 'ended';
}

// 运营事件
export interface OperationIncident extends IncidentTemplate {
  status: 'pending' | 'processing' | 'resolved';
  selectedSolution?: IncidentSolution;
  createdAt: string;
  resolvedAt?: string;
}

// 运营数据
export interface OperationStats {
  dailyRevenue: number;
  activePlayers: number;
  totalDraws: number;
  eventParticipation: number;
  reputation: number;
}

// 运营决策
export interface OperationDecision {
  id: string;
  type: 'gacha' | 'event' | 'welfare' | 'incident' | 'market';
  name: string;
  description?: string;
  params: Record<string, any>;
  timestamp: number;
}

// 效果
export interface Effect {
  sourceModule: OperationModule;
  targetModule: OperationModule;
  metric: string;
  change: number;
  duration: number;
  delay: 'immediate' | 'short' | 'medium' | 'long';
}

// 运营预测
export interface OperationPrediction {
  decision: OperationDecision;
  predictedEffects: {
    immediate: Effect[];
    shortTerm: Effect[];
    longTerm: Effect[];
  };
  confidence: number;
}

// 实际效果追踪
export interface TrackedEffect {
  predictionId: string;
  operationId: string;
  metric: string;
  predictedChange: number;
  actualChange: number;
  variance: number;
  trackedAt: number;
}

export const useOperationStore = defineStore('operation', () => {
  // 引入其他 stores
  const simulationStore = useSimulationStore();
  const pointsStore = usePointsStore();
  const commentStore = useCommentStore();
  
  // State
  const gachaPools = ref<GachaPool[]>([]);
  const events = ref<GameEvent[]>([]);
  const incidents = ref<OperationIncident[]>([]);
  
  // 预测缓存
  const predictionCache = ref<Map<string, OperationPrediction>>(new Map());
  const trackedEffects = ref<TrackedEffect[]>([]);
  const operationPredictions = ref<Map<string, OperationPrediction>>(new Map());
  
  // Phase 3: 新增预测和追踪状态
  const newOperationPredictions = ref<Map<string, NewOperationPrediction>>(new Map());
  const activeOperationEffects = ref<Map<string, ActiveOperationEffect>>(new Map());
  const completedOperationEffects = ref<PredictionVsActual[]>([]);
  const recentWelfareValue = ref<number>(0);
  const welfareHistory = ref<Array<{ id: string; type: string; value: number; givenAt: string; prediction?: NewOperationPrediction }>>([]);
  
  // 优化 1: 初始化标志位
  const hasInitializedDefaults = ref(false);
  
  // 从 simulationStore 获取运营数据
  const stats = computed<OperationStats>(() => ({
    dailyRevenue: simulationStore.operationMetrics?.todayRevenue || 0,
    activePlayers: simulationStore.operationMetrics?.activePlayers || 0,
    totalDraws: simulationStore.operationMetrics?.totalDraws || 0,
    eventParticipation: simulationStore.operationMetrics?.activeEvents || 0,
    reputation: simulationStore.operationMetrics?.reputation || 80
  }));
  
  // 监听 simulationStore 的事件变化，同步到本地
  watch(() => simulationStore.recentEvents, (newEvents) => {
    // 只添加新的事件
    const existingIds = new Set(incidents.value.map(i => i.id));
    const newIncidents = newEvents
      .filter(event => !existingIds.has(event.id))
      .map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        type: event.type as any,
        severity: (event.impact > 0.5 ? 'high' : event.impact > 0.2 ? 'medium' : 'low') as any,
        solutions: event.solutions?.map(s => ({
          id: s.id,
          name: s.name,
          description: s.effect,
          cost: Math.floor(Math.random() * 1000),
          reputationImpact: s.impact,
          risk: (s.impact < 0 ? 'high' : 'low') as any
        })) || [],
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      }));
    
    if (newIncidents.length > 0) {
      incidents.value.unshift(...newIncidents);
    }
  }, { deep: true });
  
  // Getters
  const ongoingPools = computed(() => 
    gachaPools.value.filter(p => p.status === 'ongoing')
  );
  
  const ongoingEvents = computed(() => 
    events.value.filter(e => e.status === 'ongoing')
  );
  
  const pendingIncidents = computed(() => 
    incidents.value.filter(i => i.status === 'pending')
  );
  
  const reputationEmoji = computed(() => {
    const rep = stats.value.reputation;
    if (rep >= 90) return '🌟';
    if (rep >= 70) return '😊';
    if (rep >= 50) return '😐';
    if (rep >= 30) return '😰';
    return '💀';
  });
  
  const reputationColor = computed(() => {
    const rep = stats.value.reputation;
    if (rep >= 80) return '#07c160';
    if (rep >= 60) return '#ff976a';
    return '#ee0a24';
  });
  
  // Actions
  
  /**
   * 模拟指定卡池的抽卡
   * @param poolId 卡池 ID
   * @param playerCount 参与抽卡的玩家数量
   */
  function simulatePoolGacha(poolId: string, playerCount: number): void {
    const pool = gachaPools.value.find(p => p.id === poolId);
    if (!pool) {
      console.error(`卡池 ${poolId} 不存在`);
      return;
    }
    
    const playerStore = usePlayerStore();
    const gameStore = useGameStore();
    
    const ssrRate = pool.rates.ssr / 100;
    const srRate = pool.rates.sr / 100;
    const pityThreshold = 90;
    
    const results = playerStore.simulateGacha(playerCount, ssrRate, pityThreshold, false);
    
    pool.gachaResults = [...pool.gachaResults, ...results];
    
    let ssrCount = 0;
    let srCount = 0;
    let rCount = 0;
    let totalPity = 0;
    let pityCountForAverage = 0;
    
    results.forEach(result => {
      result.result.forEach(rarity => {
        if (rarity === 'SSR') {
          ssrCount++;
          totalPity += result.pityCount;
          pityCountForAverage++;
        } else if (rarity === 'SR') {
          srCount++;
        } else {
          rCount++;
        }
      });
    });
    
    pool.totalDraws += results.reduce((sum, r) => sum + r.result.length, 0);
    pool.ssrCount += ssrCount;
    pool.srCount += srCount;
    pool.rCount += rCount;
    
    if (pityCountForAverage > 0) {
      pool.averagePity = totalPity / pityCountForAverage;
    }
    
    // 计算人气加成（如果有 UP 角色）
    let popularityBonus = 1.0;
    if (pool.upCharacters.length > 0) {
      const charId = pool.upCharacters[0]; // 取第一个 UP 角色
      popularityBonus = gameStore.calculatePopularityBonus(charId);
      pool.popularityBonus = popularityBonus;
    }
    
    // 计算收入（应用人气加成）
    const baseRevenue = pool.totalDraws * 10; // 假设每次抽卡消耗 10 积分
    pool.revenue = Math.round(baseRevenue * popularityBonus);
    
    saveToLocal();
  }
  
  /**
   * 获取卡池抽卡统计
   * @param poolId 卡池 ID
   */
  function getPoolGachaStats(poolId: string): PoolGachaStats | null {
    const pool = gachaPools.value.find(p => p.id === poolId);
    if (!pool) {
      return null;
    }
    
    const playerStore = usePlayerStore();
    const allPlayers = playerStore.players;
    
    const involvedPlayerIds = new Set(pool.gachaResults.map(r => r.playerId));
    const involvedPlayers = allPlayers.filter(p => involvedPlayerIds.has(p.id));
    
    const ssrRate = pool.totalDraws > 0 ? pool.ssrCount / pool.totalDraws : 0;
    
    const sortedByLuck = [...involvedPlayers].sort((a, b) => b.luckValue - a.luckValue);
    const luckiestPlayers = sortedByLuck.slice(0, 10).map(p => ({
      playerId: p.id,
      playerName: p.name,
      luckValue: p.luckValue
    }));
    
    const unluckiestPlayers = sortedByLuck.slice(-10).reverse().map(p => ({
      playerId: p.id,
      playerName: p.name,
      luckValue: p.luckValue
    }));
    
    return {
      totalDraws: pool.totalDraws,
      ssrCount: pool.ssrCount,
      srCount: pool.srCount,
      rCount: pool.rCount,
      ssrRate,
      averagePity: pool.averagePity,
      luckiestPlayers,
      unluckiestPlayers
    };
  }
  
  /**
   * 获取卡池欧皇榜
   * @param poolId 卡池 ID
   * @param limit 返回数量限制
   */
  function getPoolLuckiestPlayers(poolId: string, limit: number = 10): { playerId: string; playerName: string; luckValue: number }[] {
    const stats = getPoolGachaStats(poolId);
    if (!stats) {
      return [];
    }
    return stats.luckiestPlayers.slice(0, limit);
  }
  
  /**
   * 获取卡池非酋榜
   * @param poolId 卡池 ID
   * @param limit 返回数量限制
   */
  function getPoolUnluckiestPlayers(poolId: string, limit: number = 10): { playerId: string; playerName: string; luckValue: number }[] {
    const stats = getPoolGachaStats(poolId);
    if (!stats) {
      return [];
    }
    return stats.unluckiestPlayers.slice(0, limit);
  }
  
  /**
   * 创建卡池
   */
  async function createGachaPool(poolData: Omit<GachaPool, 'id' | 'totalDraws' | 'revenue' | 'status' | 'gachaResults' | 'ssrCount' | 'srCount' | 'rCount' | 'averagePity'>): Promise<{ success: boolean; message: string }> {
    const cost = 30;
    
    if (pointsStore.balance < cost) {
      return { success: false, message: `积分不足，需要${cost}积分` };
    }
    
    const result = await pointsStore.spendPoints(cost, '创建卡池');
    if (!result.success) {
      return { success: false, message: result.message };
    }
    
    const pool: GachaPool = {
      ...poolData,
      id: `pool_${Date.now()}`,
      totalDraws: 0,
      revenue: 0,
      status: 'upcoming',
      gachaResults: [],
      ssrCount: 0,
      srCount: 0,
      rCount: 0,
      averagePity: 0
    };
    
    gachaPools.value.push(pool);
    saveToLocal();
    
    const playerCount = 100;
    simulatePoolGacha(pool.id, playerCount);
    
    return { success: true, message: '卡池创建成功' };
  }
  
  /**
   * 创建活动
   */
  async function createEvent(eventData: Omit<GameEvent, 'id' | 'participants' | 'status'>): Promise<{ success: boolean; message: string }> {
    const cost = 20;

    if (pointsStore.balance < cost) {
      return { success: false, message: `积分不足，需要${cost}积分` };
    }

    const result = await pointsStore.spendPoints(cost, '创建活动');
    if (!result.success) {
      return { success: false, message: result.message };
    }

    const event: GameEvent = {
      ...eventData,
      id: `event_${Date.now()}`,
      participants: 0,
      status: 'upcoming'
    };

    events.value.push(event);
    saveToLocal();

    return { success: true, message: '活动创建成功' };
  }

  /**
   * 从模板创建活动
   */
  async function createEventFromTemplate(
    template: EventTemplate,
    customizations?: { startTime?: string; endTime?: string; budget?: BudgetLevel }
  ): Promise<{ success: boolean; message: string; event?: GameEvent }> {
    const cost = 20;

    if (pointsStore.balance < cost) {
      return { success: false, message: `积分不足，需要${cost}积分` };
    }

    const result = await pointsStore.spendPoints(cost, '从模板创建活动');
    if (!result.success) {
      return { success: false, message: result.message };
    }

    const now = new Date();
    const duration = template.duration || 7;
    const startTime = customizations?.startTime || now.toISOString();
    const endTime = customizations?.endTime || new Date(now.getTime() + duration * 86400000).toISOString();

    const event: GameEvent = {
      id: `event_${Date.now()}`,
      type: template.type,
      name: template.name,
      description: template.description,
      startTime,
      endTime,
      rewards: template.rewards,
      mechanics: template.mechanics,
      budget: customizations?.budget || template.budget,
      participants: 0,
      status: 'upcoming'
    };

    events.value.push(event);
    saveToLocal();

    return { success: true, message: '活动创建成功', event };
  }

  /**
   * 获取活动模板列表
   */
  function getEventTemplates(type?: EventType): EventTemplate[] {
    if (type) {
      return getEventsByType(type);
    }
    return [
      ...getEventsByType('festival'),
      ...getEventsByType('birthday'),
      ...getEventsByType('collaboration')
    ];
  }

  /**
   * 计算活动预期效果
   */
  function calculateEventImpact(event: GameEvent): {
    expectedParticipants: number;
    expectedRevenue: number;
    reputationChange: number;
    characterPopularityChanges: { characterId: string; popularityChange: number; discussionHeatChange: number }[];
  } {
    const baseParticipation = 100;
    const budgetMultiplier = event.budget === '高' ? 2 : event.budget === '中' ? 1.5 : 1;
    const typeMultiplier = event.type === 'collaboration' ? 2 : event.type === 'festival' ? 1.5 : 1;

    const expectedParticipants = Math.floor(baseParticipation * budgetMultiplier * typeMultiplier);
    const expectedRevenue = Math.floor(expectedParticipants * 50 * budgetMultiplier);
    const reputationChange = event.budget === '高' ? 5 : event.budget === '中' ? 3 : 1;

    // 计算角色人气变化
    const characterPopularityChanges: { characterId: string; popularityChange: number; discussionHeatChange: number }[] = [];
    
    if (event.characterIds && event.characterIds.length > 0) {
      const gameStore = useGameStore();
      
      event.characterIds.forEach(charId => {
        let popularityChange = 0;
        let discussionHeatChange = 0;
        
        // 生日活动 → 角色人气 +5，讨论热度 +10
        if (event.type === 'birthday') {
          popularityChange = 5;
          discussionHeatChange = 10;
        }
        // 节日活动 → 角色人气 +2，讨论热度 +5
        else if (event.type === 'festival') {
          popularityChange = 2;
          discussionHeatChange = 5;
        }
        // 联动活动 → 角色人气 +3，讨论热度 +8
        else if (event.type === 'collaboration') {
          popularityChange = 3;
          discussionHeatChange = 8;
        }
        
        // 应用人气变化
        if (popularityChange > 0) {
          gameStore.updateCharacterPopularity(charId, {
            popularity: popularityChange,
            discussionHeat: discussionHeatChange
          });
          
          characterPopularityChanges.push({
            characterId: charId,
            popularityChange,
            discussionHeatChange
          });
        }
      });
    }

    return {
      expectedParticipants,
      expectedRevenue,
      reputationChange,
      characterPopularityChanges
    };
  }

  /**
   * 快速创建随机活动
   */
  async function quickCreateRandomEvent(type?: EventType): Promise<{ success: boolean; message: string }> {
    const template = getRandomEvent(type);
    const result = await createEventFromTemplate(template);
    return { success: result.success, message: result.message };
  }
  
  /**
   * 触发随机运营事件
   */
  function triggerRandomIncident(): OperationIncident {
    const template = generateRandomIncident();
    const incident: OperationIncident = {
      ...template,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    incidents.value.unshift(incident);
    
    // 负面事件降低声誉
    if (incident.severity === '高') {
      stats.value.reputation = Math.max(0, stats.value.reputation - 10);
    } else if (incident.severity === '中') {
      stats.value.reputation = Math.max(0, stats.value.reputation - 5);
    }
    
    saveToLocal();
    return incident;
  }
  
  /**
   * 基于模拟数据触发运营事件
   * @param projectQuality 项目质量
   * @param satisfaction 玩家满意度
   * @param negativeCommentRatio 负面评论比例
   * @param daySinceLaunch 上线天数
   * @returns 触发结果
   */
  function triggerIncidentBySimulation(
    projectQuality: number,
    satisfaction: number,
    negativeCommentRatio: number,
    daySinceLaunch: number
  ): { triggered: boolean; incident?: OperationIncident } {
    // 导入触发引擎
    const { checkIncidentTrigger } = require('@/engine/eventTriggerEngine');
    
    // 检查是否触发
    const result = checkIncidentTrigger(
      projectQuality,
      satisfaction,
      negativeCommentRatio,
      daySinceLaunch
    );
    
    if (!result.triggered || !result.incidentType || !result.severity) {
      return { triggered: false };
    }
    
    // 根据条件选择事件类型和严重程度
    const template = generateRandomIncident(result.incidentType, result.severity);
    const incident: OperationIncident = {
      ...template,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    incidents.value.unshift(incident);
    
    // 应用负面影响
    applyIncidentNegativeImpact(incident);
    
    saveToLocal();
    
    return { triggered: true, incident };
  }
  
  /**
   * 应用事件负面影响
   */
  function applyIncidentNegativeImpact(incident: OperationIncident): void {
    // 根据严重程度降低声誉
    if (incident.severity === '高') {
      stats.value.reputation = Math.max(0, stats.value.reputation - 10);
    } else if (incident.severity === '中') {
      stats.value.reputation = Math.max(0, stats.value.reputation - 5);
    } else {
      stats.value.reputation = Math.max(0, stats.value.reputation - 2);
    }
  }
  
  /**
   * 处理运营事件
   */
  async function handleIncident(incidentId: string, solution: IncidentSolution): Promise<{ success: boolean; message: string }> {
    const incident = incidents.value.find(i => i.id === incidentId);
    if (!incident) {
      return { success: false, message: '事件不存在' };
    }
    
    if (incident.status !== 'pending') {
      return { success: false, message: '事件已处理' };
    }
    
    incident.selectedSolution = solution;
    incident.status = 'resolved';
    incident.resolvedAt = new Date().toISOString();
    
    // 根据解决方案影响声誉
    if (solution.effect.includes('声誉')) {
      const match = solution.effect.match(/声誉([+-]\d+)/);
      if (match) {
        const change = parseInt(match[1]);
        stats.value.reputation = Math.min(100, Math.max(0, stats.value.reputation + change));
      }
    }
    
    // 奖励积分
    await pointsStore.unlockAchievement('handle_incident');
    
    saveToLocal();
    return { success: true, message: '事件处理成功' };
  }
  
  /**
   * 发放福利
   */
  async function sendWelfare(_type: 'compensation' | 'login' | 'redeem', _content: string, _value: number): Promise<{ success: boolean; message: string }> {
    
    // 消耗钻石（假设每次福利发放消耗 1000 钻石）
    const cost = 1000;
    if (pointsStore.balance < cost) {
      return { success: false, message: `钻石不足，需要${cost}钻石` };
    }
    
    // 消耗资源
    await pointsStore.spendPoints(cost, '发放福利');
    
    // 增加声誉
    stats.value.reputation = Math.min(100, stats.value.reputation + 5);
    
    // 生成系统公告评论（微博/抖音平台）
    const platforms = ['weibo', 'douyin'] as const;
    const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
    
    // 生成评论模板
    const announcementComments = [
      `官方发福利啦！${_content} 已发放到邮箱，记得领取哦~`,
      `补偿公告：${_content}，感谢各位制作师的支持！`,
      `福利时间！${_content} 已到账，祝大家游戏愉快！`
    ];
    const randomComment = announcementComments[Math.floor(Math.random() * announcementComments.length)];
    
    // 添加到评论 Store
    commentStore.comments.unshift({
      id: `welfare_${Date.now()}`,
      content: randomComment,
      type: 'game',
      sentiment: 'positive',
      playerType: 'official',
      tags: ['福利', '公告'],
      likes: 0,
      shares: 0,
      comments: 0,
      heat: 0,
      createdAt: new Date().toISOString(),
      isLiked: false
    });
    
    // 更新舆论数据
    commentStore.updatePublicOpinion();
    
    saveToLocal();
    return { success: true, message: '福利发放成功，已生成系统公告' };
  }
  
  /**
   * 模拟一天运营
   */
  async function simulateOneDay(): Promise<void> {
    // 调用 simulationStore 的 tick 方法
    if (!simulationStore.isInitialized) {
      await simulationStore.initialize();
    }
    await simulationStore.tick();
    
    // 检查卡池和活动状态
    updatePoolAndEventStatus();
    
    // 检查成就
    if (stats.value.dailyRevenue >= 10000) {
      pointsStore.unlockAchievement('rich_day');
    }
    
    if (stats.value.reputation >= 90) {
      pointsStore.unlockAchievement('high_reputation');
    }
    
    saveToLocal();
  }
  
  /**
   * 更新卡池和活动状态
   */
  function updatePoolAndEventStatus(): void {
    const now = new Date().toISOString();
    
    gachaPools.value.forEach(pool => {
      if (pool.startTime <= now && pool.endTime >= now) {
        pool.status = 'ongoing';
      } else if (pool.endTime < now) {
        pool.status = 'ended';
      }
    });
    
    events.value.forEach(event => {
      if (event.startTime <= now && event.endTime >= now) {
        event.status = 'ongoing';
      } else if (event.endTime < now) {
        event.status = 'ended';
      }
    });
  }
  
  /**
   * 删除卡池
   */
  function deletePool(poolId: string): boolean {
    const index = gachaPools.value.findIndex(p => p.id === poolId);
    if (index === -1) return false;
    gachaPools.value.splice(index, 1);
    saveToLocal();
    return true;
  }
  
  /**
   * 删除活动
   */
  function deleteEvent(eventId: string): boolean {
    const index = events.value.findIndex(e => e.id === eventId);
    if (index === -1) return false;
    events.value.splice(index, 1);
    saveToLocal();
    return true;
  }
  
  /**
   * 保存到本地存储（优化 5: 类型安全）
   */
  function saveToLocal(): void {
    const data: OperationStoreData = {
      gachaPools: gachaPools.value,
      events: events.value,
      incidents: incidents.value,
      stats: stats.value,
      // 优化 1: 保存初始化标志位
      hasInitializedDefaults: hasInitializedDefaults.value,
      // Phase 3: 新增数据
      newOperationPredictions: Array.from(newOperationPredictions.value.entries()),
      activeOperationEffects: Array.from(activeOperationEffects.value.entries()),
      completedOperationEffects: completedOperationEffects.value,
      recentWelfareValue: recentWelfareValue.value,
      welfareHistory: welfareHistory.value
    };
    
    try {
      localStorage.setItem('operation_data', JSON.stringify(data));
      console.log('[Operation] 数据保存成功');
    } catch (error) {
      console.error('[Operation] 数据保存失败:', error);
      throw error;
    }
  }
  
  /**
   * 从本地存储加载
   */
  function loadFromLocal(): void {
    const saved = localStorage.getItem('operation_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        gachaPools.value = data.gachaPools || [];
        events.value = data.events || [];
        incidents.value = data.incidents || [];
        
        // 优化 1: 加载初始化标志位
        if (data.hasInitializedDefaults !== undefined) {
          hasInitializedDefaults.value = data.hasInitializedDefaults;
        }
        
        // Phase 3: 加载新增数据
        if (data.newOperationPredictions) {
          newOperationPredictions.value = new Map(data.newOperationPredictions);
        }
        if (data.activeOperationEffects) {
          activeOperationEffects.value = new Map(data.activeOperationEffects);
        }
        if (data.completedOperationEffects) {
          completedOperationEffects.value = data.completedOperationEffects;
        }
        if (data.recentWelfareValue !== undefined) {
          recentWelfareValue.value = data.recentWelfareValue;
        }
        if (data.welfareHistory) {
          welfareHistory.value = data.welfareHistory;
        }
      } catch (e) {
        console.error('加载运营数据失败:', e);
      }
    }
  }
  
  /**
   * 初始化默认数据
   */
  function initDefaultData(): void {
    // 优化 1: 如果已经初始化过，直接返回
    if (hasInitializedDefaults.value) {
      return;
    }
    
    // 只在真正首次加载时创建默认数据
    if (gachaPools.value.length === 0 && events.value.length === 0) {
      // 创建默认卡池
      const defaultPool: GachaPool = {
        id: `pool_default`,
        name: '新手限定池',
        upCharacters: ['霸道总裁 - 陆沉', '温柔学长 - 许墨'],
        rates: { ssr: 2, sr: 8, r: 90 },
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 7 * 86400000).toISOString(),
        budget: '中',
        totalDraws: 0,
        revenue: 0,
        status: 'ongoing',
        gachaResults: [],
        ssrCount: 0,
        srCount: 0,
        rCount: 0,
        averagePity: 0
      };
      gachaPools.value.push(defaultPool);
      
      // 创建默认活动
      const defaultEvent: GameEvent = {
        id: `event_default`,
        type: 'festival',
        name: '开服庆典',
        description: '庆祝游戏正式上线，登录即可领取丰厚奖励',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 14 * 86400000).toISOString(),
        rewards: ['钻石 x1000', '限定头像框', 'SR 角色卡'],
        mechanics: ['每日登录', '完成任务'],
        budget: '高',
        participants: 0,
        status: 'ongoing'
      };
      events.value.push(defaultEvent);
      
      // 不再自动触发初始事件，等待模拟系统根据数据触发
      // triggerRandomIncident();
      
      // 清空现有运营事件（确保新游戏开始时没有遗留事件）
      clearAllIncidents();
      
      // 设置标志位
      hasInitializedDefaults.value = true;
      
      saveToLocal();
    }
  }
  
  /**
   * 清空所有运营事件
   */
  function clearAllIncidents(): void {
    incidents.value = [];
    saveToLocal();
    console.log('[OperationStore] 已清空所有运营事件');
  }
  
  /**
   * 检测当天是否有角色生日
   */
  function checkTodayBirthdays(): { characterId: string; characterName: string }[] {
    const gameStore = useGameStore();
    const todayChars = gameStore.getTodayBirthdayCharacters();
    
    return todayChars.map(char => ({
      characterId: char.id,
      characterName: char.name
    }));
  }
  
  /**
   * 创建生日限定卡池
   */
  async function createBirthdayPool(characterId: string, characterName: string): Promise<{ success: boolean; message: string; pool?: GachaPool }> {
    const gameStore = useGameStore();
    
    const existingPool = gachaPools.value.find(
      p => p.upCharacters.includes(characterId) && p.status !== 'ended'
    );
    
    if (existingPool) {
      return { success: false, message: '该角色已有进行中的生日卡池' };
    }
    
    const now = new Date();
    const endTime = new Date(now.getTime() + 3 * 86400000);
    
    const poolData: Omit<GachaPool, 'id' | 'totalDraws' | 'revenue' | 'status' | 'gachaResults' | 'ssrCount' | 'srCount' | 'rCount' | 'averagePity'> = {
      name: `${characterName}生日限定池`,
      upCharacters: [characterId],
      rates: { ssr: 3, sr: 10, r: 87 },
      startTime: now.toISOString(),
      endTime: endTime.toISOString(),
      budget: '高'
    };
    
    const result = await createGachaPool(poolData);
    
    if (result.success) {
      const newPool = gachaPools.value[gachaPools.value.length - 1];
      
      gameStore.updateCharacterPopularity(characterId, { popularity: 20 });
      
      return { 
        success: true, 
        message: `${characterName}生日限定卡池已开放！人气+20%`, 
        pool: newPool 
      };
    }
    
    return { success: false, message: result.message };
  }
  
  /**
   * 自动处理今日生日角色
   */
  async function processTodayBirthdays(): Promise<{ characterId: string; characterName: string; poolCreated: boolean }[]> {
    const birthdayChars = checkTodayBirthdays();
    const results: { characterId: string; characterName: string; poolCreated: boolean }[] = [];
    
    for (const char of birthdayChars) {
      const result = await createBirthdayPool(char.characterId, char.characterName);
      results.push({
        characterId: char.characterId,
        characterName: char.characterName,
        poolCreated: result.success
      });
    }
    
    return results;
  }
  
  /**
   * 获取生日活动状态
   */
  function getBirthdayEventStatus(): {
    todayBirthdays: { characterId: string; characterName: string }[];
    activeBirthdayPools: GachaPool[];
  } {
    const todayBirthdays = checkTodayBirthdays();
    
    const activeBirthdayPools = gachaPools.value.filter(
      p => p.status === 'ongoing' && p.name.includes('生日')
    );
    
    return {
      todayBirthdays,
      activeBirthdayPools
    };
  }
  
  /**
   * 生成运营决策效果预测
   * @param decision 运营决策
   * @returns 预测结果
   */
  function generatePrediction(decision: OperationDecision): OperationPrediction {
    // 检查缓存
    const cacheKey = `${decision.type}_${decision.id}`;
    const cached = predictionCache.value.get(cacheKey);
    if (cached && Date.now() - cached.decision.timestamp < 5 * 60 * 1000) {
      // 5分钟内使用缓存
      return cached;
    }
    
    // 创建联动上下文
    const context = {
      projectId: decision.id,
      currentMetrics: {
        satisfaction: stats.value.reputation,
        dailyRevenue: stats.value.dailyRevenue,
        activePlayers: stats.value.activePlayers,
        ...decision.params
      },
      daysPassed: 0,
      ...decision.params
    };
    
    // 根据决策类型触发不同的联动规则
    const immediateEffects: Effect[] = [];
    const shortTermEffects: Effect[] = [];
    const longTermEffects: Effect[] = [];
    
    // 触发联动计算
    const sourceModule = decision.type as OperationModule;
    const action = decision.params.action || 'default';
    const value = decision.params.value || 0;
    
    const result = linkageEngine.trigger(sourceModule, action, value, context);
    
    // 分类效果
    result.immediateEffects.forEach((effect: LinkageEffect) => {
      immediateEffects.push({
        sourceModule: effect.sourceModule,
        targetModule: effect.targetModule,
        metric: effect.metric,
        change: effect.change,
        duration: effect.duration,
        delay: effect.delay
      });
    });
    
    // 获取队列中的延迟效果
    const queuedEffects = linkageEngine.getQueuedEffects();
    queuedEffects.forEach((effect: LinkageEffect & { delayDays?: number }) => {
      const effectData: Effect = {
        sourceModule: effect.sourceModule,
        targetModule: effect.targetModule,
        metric: effect.metric,
        change: effect.change,
        duration: effect.duration,
        delay: effect.delay
      };
      
      if (effect.delay === 'short' || (effect.delayDays && effect.delayDays <= 7)) {
        shortTermEffects.push(effectData);
      } else {
        longTermEffects.push(effectData);
      }
    });
    
    // 计算置信度（基于历史数据和决策复杂度）
    let confidence = 0.7; // 基础置信度
    
    // 根据决策类型调整置信度
    const typeConfidence: Record<string, number> = {
      'gacha': 0.85,
      'event': 0.75,
      'welfare': 0.80,
      'incident': 0.60,
      'market': 0.65
    };
    confidence = typeConfidence[decision.type] || 0.7;
    
    // 根据参数完整度调整
    const paramCount = Object.keys(decision.params).length;
    if (paramCount > 5) {
      confidence += 0.1;
    } else if (paramCount < 3) {
      confidence -= 0.1;
    }
    
    // 确保置信度在0-1之间
    confidence = Math.max(0.3, Math.min(0.95, confidence));
    
    const prediction: OperationPrediction = {
      decision,
      predictedEffects: {
        immediate: immediateEffects,
        shortTerm: shortTermEffects,
        longTerm: longTermEffects
      },
      confidence
    };
    
    // 缓存预测结果
    predictionCache.value.set(cacheKey, prediction);
    operationPredictions.value.set(decision.id, prediction);
    
    return prediction;
  }
  
  /**
   * 追踪实际效果
   * @param operationId 运营操作ID
   */
  function trackActualEffects(operationId: string): TrackedEffect[] {
    const prediction = operationPredictions.value.get(operationId);
    if (!prediction) {
      console.warn(`未找到操作 ${operationId} 的预测记录`);
      return [];
    }
    
    const newTrackedEffects: TrackedEffect[] = [];
    const allPredictedEffects = [
      ...prediction.predictedEffects.immediate,
      ...prediction.predictedEffects.shortTerm,
      ...prediction.predictedEffects.longTerm
    ];
    
    // 获取当前实际数据
    const currentStats = { ...stats.value };
    
    allPredictedEffects.forEach((effect, index) => {
      // 模拟实际变化（实际项目中应该从历史数据对比获取）
      // 这里添加一些随机波动来模拟真实情况
      const variance = (Math.random() - 0.5) * 0.4; // ±20% 波动
      const actualChange = effect.change * (1 + variance);
      
      const tracked: TrackedEffect = {
        predictionId: `${operationId}_${index}`,
        operationId,
        metric: effect.metric,
        predictedChange: effect.change,
        actualChange,
        variance: actualChange - effect.change,
        trackedAt: Date.now()
      };
      
      trackedEffects.value.push(tracked);
      newTrackedEffects.push(tracked);
    });
    
    // 保存到本地存储
    saveTrackedEffects();
    
    return newTrackedEffects;
  }
  
  /**
   * 获取预测与实际对比数据
   * @param operationId 运营操作ID
   */
  function getPredictionComparison(operationId: string): {
    metric: string;
    predicted: number;
    actual: number;
    accuracy: number;
  }[] {
    const relatedEffects = trackedEffects.value.filter(e => e.operationId === operationId);
    
    return relatedEffects.map(effect => ({
      metric: effect.metric,
      predicted: effect.predictedChange,
      actual: effect.actualChange,
      accuracy: effect.predictedChange !== 0 
        ? 1 - Math.abs(effect.variance / effect.predictedChange)
        : 1
    }));
  }
  
  /**
   * 保存追踪数据到本地存储
   */
  function saveTrackedEffects(): void {
    const data = {
      trackedEffects: trackedEffects.value,
      operationPredictions: Array.from(operationPredictions.value.entries())
    };
    localStorage.setItem('operation_predictions', JSON.stringify(data));
  }
  
  /**
   * 从本地存储加载追踪数据
   */
  function loadTrackedEffects(): void {
    const saved = localStorage.getItem('operation_predictions');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        trackedEffects.value = data.trackedEffects || [];
        if (data.operationPredictions) {
          operationPredictions.value = new Map(data.operationPredictions);
        }
      } catch (e) {
        console.error('加载预测追踪数据失败:', e);
      }
    }
  }
  
  /**
   * 清除预测缓存
   */
  function clearPredictionCache(): void {
    predictionCache.value.clear();
  }

  /**
   * 计算卡池收益（考虑人气加成）
   * 基础收益 × 人气加成 × 爆率加成
   * 人气>=80: +50%, >=60: +20%, <40: -20%, <20: -30%
   */
  function calculateGachaRevenue(poolId: string): number {
    const pool = gachaPools.value.find(p => p.id === poolId);
    if (!pool) {
      console.error(`卡池 ${poolId} 不存在`);
      return 0;
    }

    const gameStore = useGameStore();
    let popularityBonus = 1.0;

    // 如果有 UP 角色，计算人气加成
    if (pool.upCharacters.length > 0) {
      const charId = pool.upCharacters[0]; // 取第一个 UP 角色
      const charPopularity = gameStore.getCharacterPopularity(charId);

      if (charPopularity) {
        const popularity = charPopularity.popularity;

        // 人气加成规则
        if (popularity >= 80) {
          popularityBonus = 1.5; // +50%
        } else if (popularity >= 60) {
          popularityBonus = 1.2; // +20%
        } else if (popularity >= 40) {
          popularityBonus = 1.0; // 正常
        } else if (popularity >= 20) {
          popularityBonus = 0.8; // -20%
        } else {
          popularityBonus = 0.7; // -30%
        }
      }
    }

    // 爆率加成（SSR 爆率越高，收益越高）
    const rateBonus = 1 + (pool.rates.ssr - 2) * 0.1; // 基准 2%，每增加 1% 增加 10% 收益

    // 基础收益
    const baseRevenue = pool.totalDraws * 10; // 假设每次抽卡消耗 10 积分

    // 计算最终收益
    const finalRevenue = Math.round(baseRevenue * popularityBonus * rateBonus);

    // 更新卡池的人气加成记录
    pool.popularityBonus = popularityBonus;

    return finalRevenue;
  }

  /**
   * 卡池运营提升角色人气
   * 每日曝光+2，福利好的卡池额外+3
   */
  function updateCharacterPopularityFromGacha(poolId: string): void {
    const pool = gachaPools.value.find(p => p.id === poolId);
    if (!pool) {
      console.error(`卡池 ${poolId} 不存在`);
      return;
    }

    const gameStore = useGameStore();

    // 为每个 UP 角色增加人气
    pool.upCharacters.forEach(charId => {
      // 基础曝光加成
      let popularityIncrease = 2;

      // 福利好的卡池额外加成
      if (pool.budget === '高') {
        popularityIncrease += 3;
      } else if (pool.budget === '中') {
        popularityIncrease += 1;
      }

      // 爆率高的卡池额外加成
      if (pool.rates.ssr >= 3) {
        popularityIncrease += 1;
      }

      // 更新角色人气
      gameStore.updateCharacterPopularity(charId, {
        popularity: popularityIncrease
      });

      // 增加卡池抽取次数统计
      gameStore.updateCharacterPopularity(charId, {
        gachaCount: pool.totalDraws
      });
    });

    saveToLocal();
  }

  /**
   * 获取角色人气排行（Top10）
   */
  function getCharacterPopularityRanking(limit: number = 10): { characterId: string; name: string; popularity: number; isInPool: boolean }[] {
    const gameStore = useGameStore();
    const ranking = gameStore.getPopularityRanking(limit);

    // 如果 ranking 不是数组，返回空数组
    if (!Array.isArray(ranking)) {
      return [];
    }

    // 获取当前所有进行中的卡池的 UP 角色
    const upCharacterIds = new Set<string>();
    
    // 安全地访问 gachaPools
    const pools = gachaPools.value || [];
    pools
      .filter(p => p && (p.status === 'ongoing' || p.status === 'upcoming'))
      .forEach(p => {
        if (p.upCharacters && Array.isArray(p.upCharacters)) {
          p.upCharacters.forEach(charId => upCharacterIds.add(charId));
        }
      });

    return ranking.map(char => ({
      ...char,
      isInPool: upCharacterIds.has(char.characterId)
    }));
  }

  /**
   * 获取建议 UP 的角色（人气高但未 UP）
   */
  function getRecommendedUpCharacters(): { characterId: string; name: string; popularity: number }[] {
    const ranking = getCharacterPopularityRanking(20);

    // 如果 ranking 不是数组，返回空数组
    if (!Array.isArray(ranking)) {
      return [];
    }

    // 过滤出人气 >= 60 且未在卡池中的角色
    return ranking
      .filter(char => char && char.popularity >= 60 && !char.isInPool)
      .map(char => ({
        characterId: char.characterId,
        name: char.name,
        popularity: char.popularity
      }));
  }

  // ==================== Phase 3: 预测和追踪方法 ====================

  /**
   * 创建卡池并生成预测
   */
  async function createGachaPoolWithPrediction(
    poolData: Omit<GachaPool, 'id' | 'totalDraws' | 'revenue' | 'status' | 'gachaResults' | 'ssrCount' | 'srCount' | 'rCount' | 'averagePity'>,
    projectId: string
  ): Promise<{ success: boolean; message: string; prediction?: NewOperationPrediction }> {
    const gameStore = useGameStore();
    const simulationStore = useSimulationStore();

    // 1. 获取UP角色数据
    const upCharacterId = poolData.upCharacters[0];
    const upCharacter = gameStore.characters.find(c => c.id === upCharacterId);
    if (!upCharacter) {
      return { success: false, message: 'UP角色不存在' };
    }

    // 2. 获取当前项目运营数据
    const projectData = simulationStore.getProjectOperationData(projectId);
    if (!projectData) {
      return { success: false, message: '项目运营数据不存在，请先发布项目' };
    }

    // 3. 生成效果预测
    const poolConfig: PredictionGachaPoolConfig = {
      id: `pool_${Date.now()}`,
      projectId,
      name: poolData.name,
      upCharacters: poolData.upCharacters,
      ssrRate: poolData.rates.ssr / 100,
      srRate: poolData.rates.sr / 100,
      rRate: poolData.rates.r / 100,
      startDate: poolData.startTime,
      endDate: poolData.endTime,
      status: 'upcoming'
    };

    const prediction = predictGachaPoolImpact(poolConfig, projectData, upCharacter);

    // 4. 存储预测
    newOperationPredictions.value.set(poolConfig.id, prediction);

    // 5. 创建卡池
    const result = await createGachaPool(poolData);

    if (result.success) {
      // 关联预测到卡池
      const newPool = gachaPools.value[gachaPools.value.length - 1];
      newOperationPredictions.value.set(newPool.id, prediction);

      return {
        success: true,
        message: result.message,
        prediction
      };
    }

    return result;
  }

  /**
   * 创建活动并生成预测
   */
  async function createEventWithPrediction(
    eventData: Omit<GameEvent, 'id' | 'participants' | 'status'>,
    projectId: string
  ): Promise<{ success: boolean; message: string; prediction?: NewOperationPrediction }> {
    const simulationStore = useSimulationStore();

    // 1. 获取当前项目运营数据
    const projectData = simulationStore.getProjectOperationData(projectId);
    if (!projectData) {
      return { success: false, message: '项目运营数据不存在，请先发布项目' };
    }

    // 2. 生成效果预测
    const eventConfig: PredictionEventConfig = {
      id: `event_${Date.now()}`,
      projectId,
      name: eventData.name,
      type: eventData.type as any,
      rewards: eventData.rewards.map(r => ({ value: 100 })), // 简化处理
      startDate: eventData.startTime,
      endDate: eventData.endTime,
      status: 'upcoming'
    };

    const prediction = predictEventImpact(eventConfig, projectData);

    // 3. 存储预测
    newOperationPredictions.value.set(eventConfig.id, prediction);

    // 4. 创建活动
    const result = await createEvent(eventData);

    if (result.success) {
      const newEvent = events.value[events.value.length - 1];
      newOperationPredictions.value.set(newEvent.id, prediction);

      return {
        success: true,
        message: result.message,
        prediction
      };
    }

    return result;
  }

  /**
   * 发放福利并生成预测
   */
  async function giveWelfareWithPrediction(
    welfareConfig: PredictionWelfareConfig,
    projectId: string
  ): Promise<{ success: boolean; message: string; prediction?: NewOperationPrediction }> {
    const simulationStore = useSimulationStore();

    // 1. 获取当前项目运营数据
    const projectData = simulationStore.getProjectOperationData(projectId);
    if (!projectData) {
      return { success: false, message: '项目运营数据不存在，请先发布项目' };
    }

    // 2. 生成效果预测
    const prediction = predictWelfareImpact(welfareConfig, projectData);

    // 3. 存储预测
    newOperationPredictions.value.set(welfareConfig.id, prediction);

    // 4. 记录福利
    welfareHistory.value.push({
      ...welfareConfig,
      givenAt: new Date().toISOString(),
      prediction
    });

    // 5. 更新最近福利值
    recentWelfareValue.value += welfareConfig.value;

    // 6. 调用原有的福利发放
    const result = await sendWelfare(
      welfareConfig.type as any,
      welfareConfig.description || `${welfareConfig.type}福利`,
      welfareConfig.value
    );

    if (result.success) {
      return {
        success: true,
        message: result.message,
        prediction
      };
    }

    return result;
  }

  /**
   * 启动运营操作（从预告变为进行中）
   */
  function launchOperation(operationId: string, type: 'gacha' | 'event' | 'welfare'): boolean {
    const simulationStore = useSimulationStore();

    switch (type) {
      case 'gacha': {
        const pool = gachaPools.value.find(p => p.id === operationId);
        if (!pool) return false;
        pool.status = 'ongoing';
        break;
      }
      case 'event': {
        const event = events.value.find(e => e.id === operationId);
        if (!event) return false;
        event.status = 'ongoing';
        break;
      }
      case 'welfare':
        // 福利立即生效
        break;
    }

    // 记录预测用于后续对比
    const prediction = newOperationPredictions.value.get(operationId);
    if (prediction) {
      const projectData = simulationStore.getProjectOperationData(prediction.operationId);
      if (projectData) {
        activeOperationEffects.value.set(operationId, {
          type,
          prediction,
          startData: { ...projectData },
          startDay: simulationStore.currentDay
        });
      }
    }

    saveToLocal();
    return true;
  }

  /**
   * 更新运营效果追踪
   */
  function updateOperationEffectTracking(
    projectResults: Array<{
      projectId: string;
      operationData: ProjectOperationData;
    }>
  ): void {
    activeOperationEffects.value.forEach((effect, operationId) => {
      const currentData = projectResults.find(
        r => r.projectId === effect.startData.projectId
      )?.operationData;

      if (!currentData) return;

      // 计算实际变化
      const actual = {
        revenueChange: currentData.dailyRevenue - effect.startData.dailyRevenue,
        satisfactionChange: currentData.satisfaction - effect.startData.satisfaction,
        retentionChange: currentData.retentionRate - effect.startData.retentionRate,
        payRateChange: currentData.payRate - effect.startData.payRate,
        activePlayersChange: currentData.activePlayers - effect.startData.activePlayers
      };

      // 计算准确度
      const predicted = effect.prediction.predicted;
      const accuracy = {
        revenue: calculateAccuracy(predicted.revenueChange, actual.revenueChange),
        satisfaction: calculateAccuracy(predicted.satisfactionChange, actual.satisfactionChange),
        retention: calculateAccuracy(predicted.retentionChange, actual.retentionChange),
        overall: 0
      };
      accuracy.overall = (accuracy.revenue + accuracy.satisfaction + accuracy.retention) / 3;

      // 检查效果是否结束
      const isEffectEnded = checkIfEffectEnded(operationId, effect.type);
      if (isEffectEnded) {
        const comparison: PredictionVsActual = {
          operationId,
          operationType: effect.type,
          predicted,
          actual,
          accuracy,
          analysis: generateAnalysis(effect.prediction, actual, accuracy),
          createdAt: effect.prediction.createdAt,
          completedAt: new Date().toISOString()
        };

        completedOperationEffects.value.push(comparison);
        activeOperationEffects.value.delete(operationId);
      }
    });

    saveToLocal();
  }

  /**
   * 检查运营效果是否结束
   */
  function checkIfEffectEnded(operationId: string, type: string): boolean {
    const now = new Date().toISOString();

    switch (type) {
      case 'gacha': {
        const pool = gachaPools.value.find(p => p.id === operationId);
        return !pool || pool.status === 'ended' || pool.endTime < now;
      }
      case 'event': {
        const event = events.value.find(e => e.id === operationId);
        return !event || event.status === 'ended' || event.endTime < now;
      }
      case 'welfare': {
        // 福利效果持续3天
        const welfare = welfareHistory.value.find(w => w.id === operationId);
        if (welfare) {
          const givenAt = new Date(welfare.givenAt);
          const threeDaysLater = new Date(givenAt.getTime() + 3 * 24 * 60 * 60 * 1000);
          return new Date() > threeDaysLater;
        }
        return true;
      }
      default:
        return false;
    }
  }

  /**
   * 获取预测
   */
  function getPrediction(operationId: string): NewOperationPrediction | undefined {
    return newOperationPredictions.value.get(operationId);
  }

  /**
   * 获取所有预测
   */
  function getAllPredictions(): NewOperationPrediction[] {
    return Array.from(newOperationPredictions.value.values());
  }

  /**
   * 获取进行中的效果追踪
   */
  function getActiveEffects(): Array<{ operationId: string; effect: ActiveOperationEffect }> {
    return Array.from(activeOperationEffects.value.entries()).map(([id, effect]) => ({
      operationId: id,
      effect
    }));
  }

  /**
   * 获取已完成的效果对比
   */
  function getCompletedEffects(): PredictionVsActual[] {
    return [...completedOperationEffects.value];
  }

  /**
   * 获取最近福利值
   */
  function getRecentWelfareValue(): number {
    return recentWelfareValue.value;
  }

  /**
   * 重置最近福利值（每日调用）
   */
  function resetRecentWelfare(): void {
    recentWelfareValue.value = 0;
  }

  // 初始化时加载数据
  loadFromLocal();
  
  return {
    // State
    gachaPools,
    events,
    incidents,
    stats,
    
    // Getters
    ongoingPools,
    ongoingEvents,
    pendingIncidents,
    reputationEmoji,
    reputationColor,
    
    // Actions
    createGachaPool,
    createEvent,
    createEventFromTemplate,
    getEventTemplates,
    calculateEventImpact,
    quickCreateRandomEvent,
    triggerRandomIncident,
    triggerIncidentBySimulation,
    applyIncidentNegativeImpact,
    handleIncident,
    sendWelfare,
    simulateOneDay,
    deletePool,
    deleteEvent,
    simulatePoolGacha,
    getPoolGachaStats,
    getPoolLuckiestPlayers,
    getPoolUnluckiestPlayers,
    saveToLocal,
    loadFromLocal,
    initDefaultData,
    clearAllIncidents,
    
    // 生日相关
    checkTodayBirthdays,
    createBirthdayPool,
    processTodayBirthdays,
    getBirthdayEventStatus,

    // 角色人气与卡池收益联动
    calculateGachaRevenue,
    updateCharacterPopularityFromGacha,
    getCharacterPopularityRanking,
    getRecommendedUpCharacters,
    
    // 效果预测与追踪
    generatePrediction,
    trackActualEffects,
    getPredictionComparison,
    clearPredictionCache,
    loadTrackedEffects,
    saveTrackedEffects,
    
    // Phase 3: 新增预测和追踪
    createGachaPoolWithPrediction,
    createEventWithPrediction,
    giveWelfareWithPrediction,
    launchOperation,
    updateOperationEffectTracking,
    getPrediction,
    getAllPredictions,
    getActiveEffects,
    getCompletedEffects,
    getRecentWelfareValue,
    resetRecentWelfare,
    
    // Phase 3: 新增状态
    newOperationPredictions,
    activeOperationEffects,
    completedOperationEffects,
    recentWelfareValue,
    welfareHistory
  };
});
