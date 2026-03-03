/**
 * 玩家行为模拟 Store
 * 模拟玩家抽卡行为、统计幸运值、分析玩家状态
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { nanoid } from 'nanoid';
import { DataLoader } from '@/utils/dataLoader';

/**
 * 玩家状态枚举
 */
export enum PlayerState {
  NEW = 'NEW',           // 新玩家
  ACTIVE = 'ACTIVE',     // 活跃玩家
  PAYING = 'PAYING',     // 付费玩家
  AT_RISK = 'AT_RISK',   // 有流失风险
  LOST = 'LOST',         // 流失玩家
  RETURNED = 'RETURNED'  // 回流玩家
}

/**
 * 玩家接口
 */
export interface Player {
  id: string;
  name: string;
  state: PlayerState;
  totalDraws: number;        // 总抽卡次数
  ssrCount: number;          // SSR 获得次数
  srCount: number;           // SR 获得次数
  rCount: number;            // R 获得次数
  luckValue: number;         // 幸运值（实际概率/期望概率）
  lastLoginAt: string;       // 最后登录时间
  createdAt: string;         // 创建时间
  totalSpent?: number;       // 总消耗（可选）
  consecutiveLosses?: number; // 连续未出 SSR 次数
  lostAt?: string;           // 流失时间（可选）
  returnedAt?: string;       // 回归时间（可选）
}

/**
 * 抽卡结果接口
 */
export interface GachaResult {
  id: string;
  playerId: string;
  playerName: string;
  result: ('SSR' | 'SR' | 'R')[];  // 抽卡结果数组（支持十连）
  isTenPull: boolean;              // 是否十连抽
  pityCount: number;               // 保底计数
  timestamp: string;               // 抽卡时间
  luckValue: number;               // 本次幸运值
}

/**
 * 抽卡配置接口
 */
export interface GachaConfig {
  ssrRate: number;           // SSR 基础概率（如 0.03 表示 3%）
  srRate: number;            // SR 基础概率（如 0.10 表示 10%）
  pityThreshold: number;     // 保底次数（如 90 抽保底）
  softPityStart?: number;    // 软保底开始次数（可选）
}

/**
 * 玩家抽卡统计接口
 */
export interface PlayerGachaStats {
  playerId: string;
  playerName: string;
  totalDraws: number;
  ssrCount: number;
  actualSsrRate: number;
  luckValue: number;
  state: PlayerState;
}

/**
 * 抽卡播报接口
 */
export interface GachaBroadcast {
  playerId: string;
  playerName: string;
  rarity: 'SSR' | 'SR';
  isTenPull: boolean;
  ssrCount: number;
  timestamp: string;
  message: string;
}

// 默认抽卡配置
const DEFAULT_GACHA_CONFIG: GachaConfig = {
  ssrRate: 0.03,        // 3% SSR 概率
  srRate: 0.10,         // 10% SR 概率
  pityThreshold: 90,    // 90 抽保底
  softPityStart: 75     // 75 抽开始软保底
};

export const usePlayerStore = defineStore('player', () => {
  // State
  const players = ref<Player[]>([]);
  const gachaRecords = ref<GachaResult[]>([]);
  const gachaConfig = ref<GachaConfig>({ ...DEFAULT_GACHA_CONFIG });
  const recentBroadcasts = ref<GachaBroadcast[]>([]);
  
  // 抽卡配置（从 JSON 加载）
  const playerStateConfig = ref<any>(null);
  
  // 初始化加载配置
  async function initConfig() {
    if (!gachaConfig.value) {
      gachaConfig.value = await DataLoader.getConfig('gacha');
    }
    if (!playerStateConfig.value) {
      playerStateConfig.value = await DataLoader.getConfig('playerState');
    }
  }
  
  // 获取抽卡配置
  function getGachaConfig(configName: string = 'default') {
    if (!gachaConfig.value) {
      // 降级到硬编码配置
      return {
        ssrRate: 0.03,
        srRate: 0.10,
        pityThreshold: 90,
        softPityStart: 75
      };
    }
    return gachaConfig.value[configName];
  }

  // Getters

  /**
   * 获取所有玩家的抽卡统计
   */
  const playerStats = computed(() => {
    return players.value.map(player => ({
      playerId: player.id,
      playerName: player.name,
      totalDraws: player.totalDraws,
      ssrCount: player.ssrCount,
      actualSsrRate: player.totalDraws > 0 
        ? player.ssrCount / player.totalDraws 
        : 0,
      luckValue: player.luckValue,
      state: player.state
    }));
  });

  /**
   * 获取欧皇榜（幸运值最高的玩家）
   */
  const getLuckiestPlayers = (limit: number = 10): PlayerGachaStats[] => {
    return [...players.value]
      .filter(p => p.totalDraws >= 10) // 至少抽卡 10 次才上榜
      .sort((a, b) => b.luckValue - a.luckValue)
      .slice(0, limit)
      .map(player => ({
        playerId: player.id,
        playerName: player.name,
        totalDraws: player.totalDraws,
        ssrCount: player.ssrCount,
        actualSsrRate: player.totalDraws > 0 
          ? player.ssrCount / player.totalDraws 
          : 0,
        luckValue: player.luckValue,
        state: player.state
      }));
  };

  /**
   * 获取非酋榜（幸运值最低的玩家）
   */
  const getUnluckiestPlayers = (limit: number = 10): PlayerGachaStats[] => {
    return [...players.value]
      .filter(p => p.totalDraws >= 10) // 至少抽卡 10 次才上榜
      .sort((a, b) => a.luckValue - b.luckValue)
      .slice(0, limit)
      .map(player => ({
        playerId: player.id,
        playerName: player.name,
        totalDraws: player.totalDraws,
        ssrCount: player.ssrCount,
        actualSsrRate: player.totalDraws > 0 
          ? player.ssrCount / player.totalDraws 
          : 0,
        luckValue: player.luckValue,
        state: player.state
      }));
  };

  /**
   * 获取实时抽卡播报
   */
  const getGachaBroadcast = (): GachaBroadcast[] => {
    return recentBroadcasts.value.slice(0, 20);
  };

  // Actions

  /**
   * 创建模拟玩家
   */
  function createPlayer(name: string): Player {
    const now = new Date().toISOString();
    const player: Player = {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      state: PlayerState.NEW,
      totalDraws: 0,
      ssrCount: 0,
      srCount: 0,
      rCount: 0,
      luckValue: 1.0,
      lastLoginAt: now,
      createdAt: now,
      totalSpent: 0,
      consecutiveLosses: 0
    };

    players.value.push(player);
    saveToLocal();
    return player;
  }

  /**
   * 批量创建模拟玩家
   */
  function createMultiplePlayers(count: number, namePrefix: string = '玩家'): Player[] {
    const newPlayers: Player[] = [];
    for (let i = 0; i < count; i++) {
      const player = createPlayer(`${namePrefix}_${i + 1}`);
      newPlayers.push(player);
    }
    return newPlayers;
  }

  /**
   * 单次抽卡逻辑
   */
  function singleDraw(player: Player): { result: 'SSR' | 'SR' | 'R'; pityCount: number } {
    const config = gachaConfig.value;
    const random = Math.random();
    
    // 更新连续未中次数
    player.consecutiveLosses = (player.consecutiveLosses || 0) + 1;

    // 计算当前概率（考虑软保底）
    let currentSsrRate = config.ssrRate;
    
    if (config.softPityStart && player.consecutiveLosses >= config.softPityStart) {
      // 软保底机制：每超过软保底一次，概率提升 5%
      const extraPityCount = player.consecutiveLosses - config.softPityStart;
      currentSsrRate = Math.min(1.0, config.ssrRate + (extraPityCount * 0.05));
    }

    // 硬保底：达到保底次数必定出 SSR
    if (player.consecutiveLosses >= config.pityThreshold) {
      player.consecutiveLosses = 0;
      player.ssrCount++;
      return { result: 'SSR', pityCount: 0 };
    }

    // 判断抽卡结果
    if (random < currentSsrRate) {
      // 出 SSR
      player.consecutiveLosses = 0;
      player.ssrCount++;
      return { result: 'SSR', pityCount: player.consecutiveLosses };
    } else if (random < currentSsrRate + config.srRate) {
      // 出 SR
      player.srCount++;
      return { result: 'SR', pityCount: player.consecutiveLosses };
    } else {
      // 出 R
      player.rCount++;
      return { result: 'R', pityCount: player.consecutiveLosses };
    }
  }

  /**
   * 模拟抽卡（支持单抽和十连）
   * @param playerCount 玩家数量（如果当前玩家不足会创建新玩家）
   * @param ssrRate SSR 概率（可选，覆盖默认配置）
   * @param pityThreshold 保底次数（可选，覆盖默认配置）
   * @param isTenPull 是否十连抽
   * @returns 抽卡结果
   */
  function simulateGacha(
    playerCount: number = 1, 
    ssrRate?: number, 
    pityThreshold?: number,
    isTenPull: boolean = false
  ): GachaResult[] {
    // 更新配置
    if (ssrRate !== undefined) {
      gachaConfig.value.ssrRate = ssrRate;
    }
    if (pityThreshold !== undefined) {
      gachaConfig.value.pityThreshold = pityThreshold;
    }

    const results: GachaResult[] = [];
    const now = new Date().toISOString();

    // 确保有足够的玩家
    while (players.value.length < playerCount) {
      createPlayer(`玩家_${players.value.length + 1}`);
    }

    // 随机选择玩家进行抽卡
    const selectedPlayers = players.value
      .sort(() => Math.random() - 0.5)
      .slice(0, playerCount);

    for (const player of selectedPlayers) {
      const drawResults: ('SSR' | 'SR' | 'R')[] = [];
      const pullCount = isTenPull ? 10 : 1;
      let ssrInThisPull = 0;

      // 执行抽卡
      for (let i = 0; i < pullCount; i++) {
        const draw = singleDraw(player);
        drawResults.push(draw.result);
        if (draw.result === 'SSR') {
          ssrInThisPull++;
        }
      }

      // 更新玩家数据
      player.totalDraws += pullCount;
      player.lastLoginAt = now;
      
      // 更新幸运值
      player.luckValue = calculateLuckValue(player);

      // 更新玩家状态
      updatePlayerState(player);

      // 创建抽卡记录
      const result: GachaResult = {
        id: `gacha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        playerId: player.id,
        playerName: player.name,
        result: drawResults,
        isTenPull,
        pityCount: player.consecutiveLosses || 0,
        timestamp: now,
        luckValue: player.luckValue
      };

      results.push(result);
      gachaRecords.value.unshift(result);

      // 生成播报（如果有 SSR 或 SR）
      if (ssrInThisPull > 0 || drawResults.includes('SR')) {
        createBroadcast(player, ssrInThisPull > 0 ? 'SSR' : 'SR', isTenPull, ssrInThisPull);
      }
    }

    // 限制记录数量
    if (gachaRecords.value.length > 1000) {
      gachaRecords.value = gachaRecords.value.slice(0, 1000);
    }

    saveToLocal();
    return results;
  }

  /**
   * 计算幸运值
   * 幸运值 = 实际 SSR 率 / 期望 SSR 率
   * > 1 表示比期望更幸运，< 1 表示比期望更非
   */
  function calculateLuckValue(player: Player): number {
    if (player.totalDraws === 0) return 1.0;
    
    const actualRate = player.ssrCount / player.totalDraws;
    const expectedRate = gachaConfig.value.ssrRate;
    
    // 避免除以 0
    if (expectedRate === 0) return 1.0;
    
    const luckValue = actualRate / expectedRate;
    
    // 保留 2 位小数
    return Math.round(luckValue * 100) / 100;
  }

  /**
   * 创建抽卡播报
   */
  function createBroadcast(
    player: Player, 
    rarity: 'SSR' | 'SR', 
    isTenPull: boolean, 
    ssrCount: number
  ): void {
    const messages = {
      SSR: isTenPull 
        ? `🎉 ${player.name} 在十连抽中获得了 ${ssrCount} 个 SSR！欧气爆棚！`
        : `🎉 ${player.name} 抽中了 SSR！欧皇附体！`,
      SR: isTenPull
        ? `✨ ${player.name} 在十连抽中获得了 SR！`
        : `✨ ${player.name} 抽中了 SR！`
    };

    const broadcast: GachaBroadcast = {
      playerId: player.id,
      playerName: player.name,
      rarity,
      isTenPull,
      ssrCount,
      timestamp: new Date().toISOString(),
      message: messages[rarity]
    };

    recentBroadcasts.value.unshift(broadcast);

    // 限制播报数量
    if (recentBroadcasts.value.length > 50) {
      recentBroadcasts.value = recentBroadcasts.value.slice(0, 50);
    }
  }

  /**
   * 更新单个玩家状态
   */
  function updatePlayerState(player: Player): void {
    const daysSinceLastLogin = getDaysSince(player.lastLoginAt);
    const actualRate = player.totalDraws > 0 ? player.ssrCount / player.totalDraws : 0;
    const expectedRate = gachaConfig.value.ssrRate;

    // 新玩家：抽卡次数少于 10 次
    if (player.totalDraws < 10) {
      player.state = PlayerState.NEW;
      return;
    }

    // 流失玩家：超过 30 天未登录
    if (daysSinceLastLogin > 30) {
      player.state = PlayerState.LOST;
      return;
    }

    // 回流玩家：曾经流失但现在登录了（通过 lastLoginAt 判断）
    if (player.state === PlayerState.LOST && daysSinceLastLogin <= 7) {
      player.state = PlayerState.RETURNED;
      return;
    }

    // 有流失风险：实际概率远低于期望概率（小于 50%）
    if (actualRate < expectedRate * 0.5) {
      player.state = PlayerState.AT_RISK;
      return;
    }

    // 付费玩家：假设抽卡次数超过 1000 次为付费玩家
    if (player.totalDraws >= 1000) {
      player.state = PlayerState.PAYING;
      return;
    }

    // 活跃玩家
    player.state = PlayerState.ACTIVE;
  }

  /**
   * 更新所有玩家状态
   */
  function updatePlayerStates(): void {
    players.value.forEach(player => {
      updatePlayerState(player);
    });
    saveToLocal();
  }

  /**
   * 自动更新玩家状态（定时任务，每小时执行）
   * 检查玩家登录时间，自动转换流失/回归状态
   */
  function updatePlayerStatesAutomatically(commentStore: any): void {
    const now = new Date();
    
    players.value.forEach(player => {
      const daysSinceLastLogin = getDaysSince(player.lastLoginAt);
      
      // 超过 30 天未登录 → 流失
      if (daysSinceLastLogin > 30 && player.state !== PlayerState.LOST) {
        player.state = PlayerState.LOST;
        player.lostAt = now.toISOString();
        
        // 生成退坑评论
        if (commentStore) {
          commentStore.generateLossComment(player);
        }
      }
      
      // 流失玩家超过 60 天 → 30% 概率回归
      if (player.state === PlayerState.LOST && player.lostAt) {
        const daysSinceLost = getDaysSince(player.lostAt);
        
        if (daysSinceLost > 60) {
          // 30% 概率回归
          if (Math.random() < 0.3) {
            player.state = PlayerState.RETURNED;
            player.returnedAt = now.toISOString();
            
            // 生成真香评论
            if (commentStore) {
              commentStore.generateReturnComment(player);
            }
          }
        }
      }
    });
    
    saveToLocal();
  }

  /**
   * 启动玩家状态定时器（每小时执行一次）
   */
  function startPlayerStateTimer(commentStore: any): void {
    // 每小时执行一次
    setInterval(() => {
      updatePlayerStatesAutomatically(commentStore);
    }, 3600000); // 3600000ms = 1小时
    
    // 为了测试，也可以设置为每分钟执行一次
    // setInterval(() => {
    //   updatePlayerStatesAutomatically(commentStore);
    // }, 60000); // 60000ms = 1分钟
  }

  /**
   * 计算距离指定时间的天数
   */
  function getDaysSince(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * 获取玩家状态统计
   */
  function getPlayerStateStats(): Record<PlayerState, number> {
    const stats: Record<PlayerState, number> = {
      [PlayerState.NEW]: 0,
      [PlayerState.ACTIVE]: 0,
      [PlayerState.PAYING]: 0,
      [PlayerState.AT_RISK]: 0,
      [PlayerState.LOST]: 0,
      [PlayerState.RETURNED]: 0
    };

    players.value.forEach(player => {
      stats[player.state]++;
    });

    return stats;
  }

  /**
   * 获取指定状态的玩家列表
   */
  function getPlayersByState(state: PlayerState): Player[] {
    return players.value.filter(player => player.state === state);
  }

  /**
   * 获取抽卡记录统计
   */
  function getGachaStats(): {
    totalDraws: number;
    totalSSR: number;
    totalSR: number;
    totalR: number;
    averageLuckValue: number;
  } {
    const totalDraws = players.value.reduce((sum, p) => sum + p.totalDraws, 0);
    const totalSSR = players.value.reduce((sum, p) => sum + p.ssrCount, 0);
    const totalSR = players.value.reduce((sum, p) => sum + p.srCount, 0);
    const totalR = players.value.reduce((sum, p) => sum + p.rCount, 0);
    const averageLuckValue = players.value.length > 0
      ? players.value.reduce((sum, p) => sum + p.luckValue, 0) / players.value.length
      : 0;

    return {
      totalDraws,
      totalSSR,
      totalSR,
      totalR,
      averageLuckValue: Math.round(averageLuckValue * 100) / 100
    };
  }

  /**
   * 删除玩家
   */
  function deletePlayer(playerId: string): boolean {
    const index = players.value.findIndex(p => p.id === playerId);
    if (index === -1) return false;

    players.value.splice(index, 1);
    
    // 同时删除该玩家的抽卡记录
    gachaRecords.value = gachaRecords.value.filter(r => r.playerId !== playerId);
    
    saveToLocal();
    return true;
  }

  /**
   * 清空所有数据
   */
  function clearAllData(): void {
    players.value = [];
    gachaRecords.value = [];
    recentBroadcasts.value = [];
    saveToLocal();
  }

  /**
   * 保存到本地存储
   */
  function saveToLocal(): void {
    const data = {
      players: players.value,
      gachaRecords: gachaRecords.value.slice(0, 100), // 只保存最近 100 条记录
      gachaConfig: gachaConfig.value,
      recentBroadcasts: recentBroadcasts.value.slice(0, 20) // 只保存最近 20 条播报
    };
    localStorage.setItem('player_gacha_data', JSON.stringify(data));
  }

  /**
   * 从本地存储加载
   */
  function loadFromLocal(): void {
    const saved = localStorage.getItem('player_gacha_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        players.value = data.players || [];
        gachaRecords.value = data.gachaRecords || [];
        gachaConfig.value = data.gachaConfig || { ...DEFAULT_GACHA_CONFIG };
        recentBroadcasts.value = data.recentBroadcasts || [];
      } catch (e) {
        console.error('加载玩家数据失败:', e);
      }
    }
  }

  /**
   * 重置抽卡配置为默认值
   */
  function resetGachaConfig(): void {
    gachaConfig.value = { ...DEFAULT_GACHA_CONFIG };
    saveToLocal();
  }

  /**
   * 更新抽卡配置
   */
  function updateGachaConfig(config: Partial<GachaConfig>): void {
    gachaConfig.value = { ...gachaConfig.value, ...config };
    saveToLocal();
  }

  // 初始化时加载数据
  loadFromLocal();

  return {
    // State
    players,
    gachaRecords,
    gachaConfig,
    recentBroadcasts,

    // Getters
    playerStats,

    // Actions
    createPlayer,
    createMultiplePlayers,
    simulateGacha,
    getLuckiestPlayers,
    getUnluckiestPlayers,
    getGachaBroadcast,
    updatePlayerStates,
    getPlayerStateStats,
    getPlayersByState,
    getGachaStats,
    deletePlayer,
    clearAllData,
    saveToLocal,
    loadFromLocal,
    resetGachaConfig,
    updateGachaConfig,
    calculateLuckValue
  };
});
