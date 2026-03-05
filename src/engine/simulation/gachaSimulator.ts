import { VirtualPlayer, PlayerState } from './types';

export interface GachaResult {
  playerId: string;
  draws: number;
  results: GachaItem[];
  totalCost: number;
  ssrCount: number;
  srCount: number;
  rCount: number;
  isGuarantee: boolean;
}

export interface GachaItem {
  rarity: 'SSR' | 'SR' | 'R';
  characterId: string;
  characterName: string;
}

export interface GachaPoolConfig {
  ssrRate: number;
  srRate: number;
  rRate: number;
  upCharacters: string[];
  upRateMultiplier: number;
  guaranteeThreshold: number;
  singlePrice: number;
}

export interface GachaStatistics {
  totalDraws: number;
  totalCost: number;
  ssrCount: number;
  srCount: number;
  rCount: number;
  averageSSRPerDraw: number;
  averageCostPerSSR: number;
  guaranteeRate: number;
  upCharacterRate: number;
}

const CHARACTER_DATABASE: Record<string, { id: string; name: string; rarity: 'SSR' | 'SR' | 'R' }[]> = {
  SSR: [
    { id: 'ssr_001', name: '银发公主' },
    { id: 'ssr_002', name: '黑曜王子' },
    { id: 'ssr_003', name: '灵狐少女' },
    { id: 'ssr_004', name: '星之导师' },
    { id: 'ssr_005', name: '暗夜女王' },
  ],
  SR: [
    { id: 'sr_001', name: '温柔的骑士' },
    { id: 'sr_002', name: '神秘的占卜师' },
    { id: 'sr_003', name: '活泼的店员' },
    { id: 'sr_004', name: '稳重的管家' },
    { id: 'sr_005', name: '调皮的精灵' },
    { id: 'sr_006', name: '酷酷的剑士' },
    { id: 'sr_007', name: '害羞的作家' },
    { id: 'sr_008', name: '热血的运动员' },
  ],
  R: [
    { id: 'r_001', name: '路人甲' },
    { id: 'r_002', name: '小镇居民' },
    { id: 'r_003', name: '商店老板' },
    { id: 'r_004', name: '图书馆管理员' },
    { id: 'r_005', name: '码头工人' },
    { id: 'r_006', name: '旅店服务员' },
    { id: 'r_007', name: '普通士兵' },
    { id: 'r_008', name: '村庄少年' },
    { id: 'r_009', name: '城镇少女' },
    { id: 'r_010', name: '流浪艺人' },
  ],
};

export class GachaSimulator {
  private poolConfig: GachaPoolConfig;

  constructor(poolConfig: GachaPoolConfig) {
    this.poolConfig = poolConfig;
  }

  simulatePlayerDraw(player: VirtualPlayer, poolConfig: GachaPoolConfig): GachaResult {
    const shouldDrawResult = this.shouldDraw(player, poolConfig);
    
    if (!shouldDrawResult) {
      return {
        playerId: player.id,
        draws: 0,
        results: [],
        totalCost: 0,
        ssrCount: 0,
        srCount: 0,
        rCount: 0,
        isGuarantee: false,
      };
    }

    const spendLevel = this.getSpendAmountLevel(player.spendingLevel);
    const drawCount = Math.floor(Math.random() * spendLevel) + 1;
    
    return this.drawMultiple(drawCount, poolConfig, player.id);
  }

  shouldDraw(player: VirtualPlayer, poolConfig: GachaPoolConfig): boolean {
    if (player.state === 'LOST') {
      return false;
    }

    const baseProbability = player.gachaMotivation;
    const activityBonus = player.activityLevel * 0.2;
    const satisfactionBonus = player.satisfaction * 0.15;
    const fatiguePenalty = player.fatigue * 0.1;

    let drawProbability = baseProbability + activityBonus + satisfactionBonus - fatiguePenalty;
    drawProbability = Math.max(0, Math.min(1, drawProbability));

    const spendingThreshold = this.getSpendingThreshold(player.spendingLevel);
    drawProbability *= spendingThreshold;

    return Math.random() < drawProbability;
  }

  calculateDrawProbability(player: VirtualPlayer, poolConfig: GachaPoolConfig): number {
    const baseProbability = player.gachaMotivation;
    const activityBonus = player.activityLevel * 0.2;
    const satisfactionBonus = player.satisfaction * 0.15;
    const fatiguePenalty = player.fatigue * 0.1;

    let probability = baseProbability + activityBonus + satisfactionBonus - fatiguePenalty;
    probability = Math.max(0, Math.min(1, probability));

    const spendingThreshold = this.getSpendingThreshold(player.spendingLevel);
    probability *= spendingThreshold;

    return probability;
  }

  drawSingle(poolConfig: GachaPoolConfig): GachaItem {
    const totalRate = poolConfig.ssrRate + poolConfig.srRate + poolConfig.rRate;
    const random = Math.random() * totalRate;

    let rarity: 'SSR' | 'SR' | 'R';
    
    if (random < poolConfig.ssrRate) {
      rarity = 'SSR';
    } else if (random < poolConfig.ssrRate + poolConfig.srRate) {
      rarity = 'SR';
    } else {
      rarity = 'R';
    }

    const isUpCharacter = poolConfig.upCharacters.length > 0 && rarity === 'SSR';
    
    if (isUpCharacter && Math.random() < poolConfig.upRateMultiplier * poolConfig.ssrRate / (poolConfig.ssrRate + poolConfig.ssrRate)) {
      const upIndex = Math.floor(Math.random() * poolConfig.upCharacters.length);
      return {
        rarity,
        characterId: poolConfig.upCharacters[upIndex],
        characterName: this.getUpCharacterName(poolConfig.upCharacters[upIndex]),
      };
    }

    const characters = CHARACTER_DATABASE[rarity];
    const character = characters[Math.floor(Math.random() * characters.length)];

    return {
      rarity,
      characterId: character.id,
      characterName: character.name,
    };
  }

  drawMultiple(count: number, poolConfig: GachaPoolConfig, playerId: string = ''): GachaResult {
    const results: GachaItem[] = [];
    let ssrCount = 0;
    let srCount = 0;
    let rCount = 0;
    let isGuarantee = false;

    for (let i = 0; i < count; i++) {
      const item = this.drawSingle(poolConfig);
      results.push(item);

      if (item.rarity === 'SSR') {
        ssrCount++;
      } else if (item.rarity === 'SR') {
        srCount++;
      } else {
        rCount++;
      }
    }

    const totalCost = count * poolConfig.singlePrice;

    if (ssrCount === 0 && count >= poolConfig.guaranteeThreshold) {
      isGuarantee = true;
    }

    return {
      playerId,
      draws: count,
      results,
      totalCost,
      ssrCount,
      srCount,
      rCount,
      isGuarantee,
    };
  }

  getStatistics(results: GachaResult[]): GachaStatistics {
    let totalDraws = 0;
    let totalCost = 0;
    let ssrCount = 0;
    let srCount = 0;
    let rCount = 0;
    let guaranteeCount = 0;
    let upCharacterCount = 0;

    for (const result of results) {
      totalDraws += result.draws;
      totalCost += result.totalCost;
      ssrCount += result.ssrCount;
      srCount += result.srCount;
      rCount += result.rCount;
      if (result.isGuarantee) guaranteeCount++;
    }

    const averageSSRPerDraw = totalDraws > 0 ? ssrCount / totalDraws : 0;
    const averageCostPerSSR = ssrCount > 0 ? totalCost / ssrCount : 0;
    const guaranteeRate = results.length > 0 ? guaranteeCount / results.length : 0;

    return {
      totalDraws,
      totalCost,
      ssrCount,
      srCount,
      rCount,
      averageSSRPerDraw,
      averageCostPerSSR,
      guaranteeRate,
      upCharacterRate: 0,
    };
  }

  private getSpendAmountLevel(spendingLevel: string): number {
    const spendMap: Record<string, number> = {
      '零氪': 1,
      '微氪': Math.floor(Math.random() * 3) + 1,
      '中氪': Math.floor(Math.random() * 10) + 5,
      '重氪': Math.floor(Math.random() * 30) + 20,
      '神豪': Math.floor(Math.random() * 100) + 50,
    };
    return spendMap[spendingLevel] || 1;
  }

  private getSpendingThreshold(spendingLevel: string): number {
    const thresholdMap: Record<string, number> = {
      '零氪': 0.1,
      '微氪': 0.3,
      '中氪': 0.6,
      '重氪': 0.85,
      '神豪': 1.0,
    };
    return thresholdMap[spendingLevel] || 0.1;
  }

  private getUpCharacterName(characterId: string): string {
    const ssrCharacters = CHARACTER_DATABASE['SSR'];
    const found = ssrCharacters.find(c => c.id === characterId);
    return found ? found.name : 'Unknown';
  }
}
