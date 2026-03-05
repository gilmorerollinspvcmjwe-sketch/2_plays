import type { 
  VirtualPlayer, 
  PlayerState, 
  SpendingLevel, 
  PlayStyle,
  PlayerPoolConfig 
} from './types';
import { 
  DEFAULT_POOL_CONFIG,
  GENRE_PREFERENCES,
  CHARACTER_PREFERENCES,
  PLOT_PREFERENCES,
  SPENDING_PROBABILITY_MAP,
  GACHA_MOTIVATION_MAP,
  ACTIVITY_LEVEL_MAP,
  LOYALTY_MAP
} from './types';

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomIntInRange(min: number, max: number): number {
  return Math.floor(randomInRange(min, max + 1));
}

function weightedRandom<T>(items: { value: T; weight: number }[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item.value;
    }
  }
  
  return items[items.length - 1].value;
}

function generateRandomPreferences<T>(pool: T[], min: number, max: number): T[] {
  const count = randomIntInRange(min, max);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateId(): string {
  return `vp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export class VirtualPlayerPool {
  private players: VirtualPlayer[] = [];
  private config: PlayerPoolConfig;

  constructor(config: Partial<PlayerPoolConfig> = {}) {
    this.config = { ...DEFAULT_POOL_CONFIG, ...config };
  }

  initialize(): void {
    this.players = [];
    
    for (let i = 0; i < this.config.totalPlayers; i++) {
      const player = this.generatePlayer();
      this.players.push(player);
    }
  }

  private generatePlayer(): VirtualPlayer {
    const age = this.generateAge();
    const gender = this.generateGender();
    const occupation = this.generateOccupation();
    const spendingLevel = this.generateSpendingLevel();
    const playStyle = this.generatePlayStyle();
    
    const spendingProbRange = SPENDING_PROBABILITY_MAP[spendingLevel];
    const gachaMotRange = GACHA_MOTIVATION_MAP[playStyle];
    const activityRange = ACTIVITY_LEVEL_MAP[playStyle];
    const loyaltyRange = LOYALTY_MAP[spendingLevel];
    
    return {
      id: generateId(),
      age,
      gender,
      occupation,
      genrePreference: generateRandomPreferences(GENRE_PREFERENCES, 2, 5),
      characterPreference: generateRandomPreferences(CHARACTER_PREFERENCES, 1, 3),
      plotPreference: generateRandomPreferences(PLOT_PREFERENCES, 1, 3),
      spendingLevel,
      spendingProbability: randomInRange(spendingProbRange.min, spendingProbRange.max),
      gachaMotivation: randomInRange(gachaMotRange.min, gachaMotRange.max),
      playStyle,
      activityLevel: randomInRange(activityRange.min, activityRange.max),
      loyalty: randomInRange(loyaltyRange.min, loyaltyRange.max),
      state: this.generateInitialState(),
      satisfaction: randomInRange(0.4, 0.8),
      fatigue: randomInRange(0, 0.3),
      daysSinceLastLogin: 0,
      lastGachaTime: 0,
      guaranteePity: 0,
    };
  }

  private generateAge(): number {
    const ageRange = weightedRandom(this.config.ageDistribution);
    return randomIntInRange(ageRange.min, ageRange.max);
  }

  private generateGender(): '男' | '女' | '其他' {
    return weightedRandom(this.config.genderDistribution);
  }

  private generateOccupation(): string {
    return weightedRandom(this.config.occupationDistribution);
  }

  private generateSpendingLevel(): SpendingLevel {
    return weightedRandom(this.config.spendingDistribution);
  }

  private generatePlayStyle(): PlayStyle {
    const playStyles: PlayStyle[] = ['剧情党', '强度党', 'XP党', '咸鱼党', '社交党'];
    const weights = [0.2, 0.25, 0.25, 0.15, 0.15];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < playStyles.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return playStyles[i];
      }
    }
    
    return playStyles[playStyles.length - 1];
  }

  private generateInitialState(): PlayerState {
    const states: PlayerState[] = ['NEW', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'PAYING', 'AT_RISK'];
    const weights = [0.1, 0.4, 0.4, 0.4, 0.05, 0.05];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < states.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return states[i];
      }
    }
    
    return 'ACTIVE';
  }

  sample(count: number): VirtualPlayer[] {
    const shuffled = [...this.players].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  getByTags(tags: Partial<Record<keyof VirtualPlayer, string | string[]>>): VirtualPlayer[] {
    return this.players.filter(player => {
      for (const [key, value] of Object.entries(tags)) {
        const playerValue = player[key as keyof VirtualPlayer];
        
        if (Array.isArray(value)) {
          if (!value.some(v => playerValue === v)) {
            return false;
          }
        } else if (value !== undefined && playerValue !== value) {
          return false;
        }
      }
      return true;
    });
  }

  getPlayers(): VirtualPlayer[] {
    return [...this.players];
  }

  getPlayerCount(): number {
    return this.players.length;
  }

  getStatistics(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    for (const player of this.players) {
      stats[player.state] = (stats[player.state] || 0) + 1;
      stats[player.spendingLevel] = (stats[player.spendingLevel] || 0) + 1;
      stats[player.playStyle] = (stats[player.playStyle] || 0) + 1;
      stats[player.gender] = (stats[player.gender] || 0) + 1;
    }
    
    return stats;
  }
}
