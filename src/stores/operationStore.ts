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

export const useOperationStore = defineStore('operation', () => {
  // 引入 simulationStore
  const simulationStore = useSimulationStore();
  
  // State - 不在这里初始化 store，等使用时再动态导入
  const gachaPools = ref<GachaPool[]>([]);
  const events = ref<GameEvent[]>([]);
  const incidents = ref<OperationIncident[]>([]);
  
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
    const pointsStore = usePointsStore();
    const commentStore = useCommentStore();
    
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
   * 保存到本地存储
   */
  function saveToLocal(): void {
    const data = {
      gachaPools: gachaPools.value,
      events: events.value,
      incidents: incidents.value,
      stats: stats.value
    };
    localStorage.setItem('operation_data', JSON.stringify(data));
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
        stats.value = data.stats || {
          dailyRevenue: 0,
          activePlayers: 0,
          totalDraws: 0,
          eventParticipation: 0,
          reputation: 80
        };
      } catch (e) {
        console.error('加载运营数据失败:', e);
      }
    }
  }
  
  /**
   * 初始化默认数据
   */
  function initDefaultData(): void {
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
        rewards: ['钻石x1000', '限定头像框', 'SR角色卡'],
        mechanics: ['每日登录', '完成任务'],
        budget: '高',
        participants: 0,
        status: 'ongoing'
      };
      events.value.push(defaultEvent);
      
      // 触发一个初始事件
      triggerRandomIncident();
      
      saveToLocal();
    }
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
    
    // 生日相关
    checkTodayBirthdays,
    createBirthdayPool,
    processTodayBirthdays,
    getBirthdayEventStatus
  };
});
