/**
 * 游戏数据管理 Store
 * 管理游戏、角色、剧情的创建和保存
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DataLoader } from '@/utils/dataLoader';
import type { 
  CharacterBond, 
  BondInteraction, 
  BondInteractionType,
  CharacterVoice 
} from '@/types/characterBond';
import { 
  initCharacterBond, 
  calculateBondLevel,
  generateCharacterVoice,
  canInteract,
  BOND_INTERACTIONS
} from '@/types/characterBond';
import { 
  calculateCharacterQuality, 
  calculatePlotQuality,
  type CharacterQualityScore,
  type PlotQualityScore
} from '@/engine/qualityScoring';

// 角色人气数据
export interface CharacterPopularity {
  popularity: number;      // 人气值 0-100
  discussionHeat: number;  // 讨论热度
  cpHeat: Record<string, number>; // CP 热度 {otherCharId: heat}
  gachaCount: number;      // 卡池抽取次数
  lastUpdated: string;     // 最后更新时间
}

// 角色亲密度数据
export interface CharacterIntimacy {
  level: number;           // 1-10级
  experience: number;      // 当前经验值
  totalExperience: number; // 累计经验
  unlockedVoices: string[]; // 3级解锁
  unlockedDates: string[]; // 5级解锁
  unlockedConfession: boolean; // 7级解锁
  unlockedEnding: boolean; // 10级解锁
  lastInteraction: string; // 最后互动时间
}

// 亲密度等级经验需求
export const INTIMACY_LEVEL_EXP: Record<number, number> = {
  1: 0,
  2: 100,
  3: 300,
  4: 600,
  5: 1000,
  6: 1500,
  7: 2100,
  8: 2800,
  9: 3600,
  10: 4500
};

// 亲密度等级名称
export const INTIMACY_LEVEL_NAMES: Record<number, string> = {
  1: '陌生人',
  2: '相识',
  3: '朋友',
  4: '好友',
  5: '暧昧',
  6: '恋人',
  7: '挚爱',
  8: '灵魂伴侣',
  9: '命中注定',
  10: '永恒之约'
};

// 美术风格类型
export type ArtStyle = 'japanese' | 'korean' | 'chinese' | 'realistic' | 'chibi';

// 声优等级
export type VoiceActorLevel = 'newcomer' | 'experienced' | 'top';

// 角色生日数据
export interface CharacterBirthday {
  month: number; // 1-12
  day: number; // 1-31
  lastCelebratedYear?: number; // 上次庆祝年份
}

// 角色接口
export interface Character {
  id: string;
  name: string;
  appearance: string;
  appearanceDesc?: string;
  clothing: string;
  clothingDesc?: string;
  personality: string[];
  background: string;
  avatar?: string;
  artStyle?: ArtStyle;
  voiceActor?: VoiceActorLevel;
  interactionConfig?: InteractionConfig;
  popularity?: CharacterPopularity;
  intimacy?: CharacterIntimacy;
  birthday?: CharacterBirthday;
  bond?: CharacterBond; // 角色羁绊
  createdAt: string;
}

// 互动配置
export interface InteractionConfig {
  touchReactions: {
    head: string;
    hug: string;
    hand: string;
    confess: string;
  };
  voiceTriggers: string[];
  dateScenes: string[];
  affectionEnabled: boolean;
}

// 剧情章节
export interface Chapter {
  chapter: number;
  title: string;
  scene: string;
  keyEvent: string;
  choices: string[];
  selectedChoice: number;
}

// 剧情接口
export interface Plot {
  id: string;
  title: string;
  summary: string;
  routeType: 'sweet' | 'angst' | 'suspense';
  difficulty: string;
  chapters: Chapter[];
  characterIds: string[];
  createdAt: string;
}

// 游戏资源
export interface GameResources {
  gold: number;
  diamond: number;
  popularity: number;
  devPoints: number;
}

// 资源变动记录
export interface ResourceChange {
  id: string;
  type: 'income' | 'expense';
  resource: keyof GameResources;
  amount: number;
  reason: string;
  timestamp: string;
}

// 资源分配策略
export type ResourceStrategy = 'conservative' | 'steady' | 'aggressive';

// 里程碑类型
export interface Milestone {
  id: string;
  type: 'revenue' | 'players' | 'popularity' | 'reputation' | 'plots';
  name: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
  completedAt?: string;
}

export interface GameMilestones {
  revenue: Milestone[];
  players: Milestone[];
  popularity: Milestone[];
  reputation: Milestone[];
  plots: Milestone[];
}

export interface StrategyConfig {
  name: string;
  description: string;
  gold: {
    operation: number; // 运营占比
    development: number; // 开发占比
    reserve: number; // 储备占比
  };
  devPoints: {
    character: number;
    plot: number;
    event: number;
  };
}

// 游戏评分接口
export interface GameRating {
  overall: number;
  characterQuality: number;
  plotQuality: number;
  operationQuality: number;
  gachaFairness: number;
}

// 评分等级
export type RatingGrade = 'S' | 'A' | 'B' | 'C' | 'D';

// 游戏接口
export interface Game {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  characters: Character[];
  plots: Plot[];
  resources: GameResources;
  milestones?: GameMilestones;
  totalRevenue?: number;
  totalPlayers?: number;
  reputation?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export const useGameStore = defineStore('game', () => {
  // State
  const games = ref<Game[]>([]);
  const currentGameId = ref<string | null>(null);
  const resourceHistory = ref<ResourceChange[]>([]);
  const gameMilestones = ref<Record<string, GameMilestones>>({});

  // 资源分配策略配置（从 JSON 加载）
  let strategyConfigsCache: any = null;
  
  // 获取资源策略配置
  async function getStrategyConfig(strategy: ResourceStrategy = 'steady') {
    if (!strategyConfigsCache) {
      try {
        strategyConfigsCache = await DataLoader.getConfig('resourceStrategy');
      } catch (error) {
        console.error('Failed to load resource strategy config, using default');
        // 降级到硬编码配置
        return {
          conservative: {
            name: '保守型',
            gold: { operation: 0.4, development: 0.4, reserve: 0.2 },
            devPoints: { character: 0.4, plot: 0.4, event: 0.2 }
          },
          steady: {
            name: '稳健型',
            gold: { operation: 0.5, development: 0.3, reserve: 0.2 },
            devPoints: { character: 0.35, plot: 0.35, event: 0.3 }
          },
          aggressive: {
            name: '激进型',
            gold: { operation: 0.7, development: 0.2, reserve: 0.1 },
            devPoints: { character: 0.5, plot: 0.3, event: 0.2 }
          }
        }[strategy];
      }
    }
    return strategyConfigsCache[strategy];
  }
  
  // Getters
  const currentGame = computed(() => {
    return games.value.find(g => g.id === currentGameId.value) || null;
  });
  
  const draftGames = computed(() => {
    return games.value.filter(g => g.status === 'draft');
  });
  
  const publishedGames = computed(() => {
    return games.value.filter(g => g.status === 'published');
  });
  
  // Actions
  
  /**
   * 分析评论中的角色提及并更新人气
   * 调用此函数会遍历评论，统计角色名出现次数
   */
  function analyzeCommentMentions(comments: Array<{ content: string; sentiment?: string }>): void {
    if (!currentGameId.value) return;
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return;
    
    // 遍历所有评论
    comments.forEach(comment => {
      const mentionedCharIds: string[] = [];
      
      // 检查每个角色是否被提及
      game.characters.forEach(char => {
        if (comment.content.includes(char.name)) {
          mentionedCharIds.push(char.id);
          // 更新讨论热度
          updateCharacterPopularity(char.id, { discussionHeat: 1 });
        }
      });
      
      // 如果提及了多个角色，增加 CP 热度
      if (mentionedCharIds.length >= 2) {
        for (let i = 0; i < mentionedCharIds.length; i++) {
          for (let j = i + 1; j < mentionedCharIds.length; j++) {
            const char1Id = mentionedCharIds[i];
            const char2Id = mentionedCharIds[j];
            
            // 双向更新 CP 热度
            updateCharacterPopularity(char1Id, {
              cpPartnerId: char2Id,
              cpHeat: 1
            });
            updateCharacterPopularity(char2Id, {
              cpPartnerId: char1Id,
              cpHeat: 1
            });
          }
        }
      }
      
      // 根据情感调整人气
      if (comment.sentiment === 'positive') {
        mentionedCharIds.forEach(charId => {
          updateCharacterPopularity(charId, { popularity: 0.5 });
        });
      } else if (comment.sentiment === 'negative') {
        mentionedCharIds.forEach(charId => {
          updateCharacterPopularity(charId, { popularity: -0.5 });
        });
      }
    });
  }
  
  /**
   * 获取角色的 CP 热度排行榜
   */
  function getCpRanking(characterId: string, limit: number = 5): { characterId: string; name: string; heat: number }[] {
    if (!currentGameId.value) return [];
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return [];
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character || !character.popularity) return [];
    
    const cpHeat = character.popularity.cpHeat || {};
    
    // 转换为数组并排序
    return Object.entries(cpHeat)
      .map(([charId, heat]) => {
        const partner = game.characters.find(c => c.id === charId);
        return {
          characterId: charId,
          name: partner?.name || charId,
          heat
        };
      })
      .sort((a, b) => b.heat - a.heat)
      .slice(0, limit);
  }
  
  /**
   * 创建新游戏
   */
  function createGame(title: string, description: string = ''): Game {
    const game: Game = {
      id: `game_${Date.now()}`,
      title,
      description,
      status: 'draft',
      characters: [],
      plots: [],
      resources: {
        gold: 10000,
        diamond: 100,
        popularity: 0,
        devPoints: 100
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    games.value.push(game);
    currentGameId.value = game.id;
    saveToLocal();
    
    return game;
  }
  
  /**
   * 设置当前游戏
   */
  function setCurrentGame(gameId: string): boolean {
    const game = games.value.find(g => g.id === gameId);
    if (game) {
      currentGameId.value = gameId;
      return true;
    }
    return false;
  }
  
  /**
   * 初始化角色人气数据
   */
  function initCharacterPopularity(characterId: string): CharacterPopularity {
    return {
      popularity: 50,  // 初始人气 50
      discussionHeat: 0,
      cpHeat: {},
      gachaCount: 0,
      lastUpdated: new Date().toISOString()
    };
  }
  
  /**
   * 初始化角色亲密度数据
   */
  function initCharacterIntimacy(): CharacterIntimacy {
    return {
      level: 1,
      experience: 0,
      totalExperience: 0,
      unlockedVoices: [],
      unlockedDates: [],
      unlockedConfession: false,
      unlockedEnding: false,
      lastInteraction: ''
    };
  }
  
  /**
   * 计算亲密度等级
   */
  function calculateIntimacyLevel(totalExp: number): number {
    for (let level = 10; level >= 1; level--) {
      if (totalExp >= INTIMACY_LEVEL_EXP[level]) {
        return level;
      }
    }
    return 1;
  }
  
  /**
   * 获取角色亲密度
   */
  function getCharacterIntimacy(characterId: string): CharacterIntimacy | null {
    if (!currentGameId.value) return null;
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return null;
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character) return null;
    
    return character.intimacy || initCharacterIntimacy();
  }
  
  /**
   * 增加亲密度
   */
  function addIntimacy(
    characterId: string,
    amount: number,
    reason: string
  ): { success: boolean; levelUp: boolean; newLevel: number; message: string } {
    if (!currentGameId.value || amount <= 0) {
      return { success: false, levelUp: false, newLevel: 1, message: '参数错误' };
    }
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return { success: false, levelUp: false, newLevel: 1, message: '游戏不存在' };
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character) return { success: false, levelUp: false, newLevel: 1, message: '角色不存在' };
    
    if (!character.intimacy) {
      character.intimacy = initCharacterIntimacy();
    }
    
    const oldLevel = character.intimacy.level;
    character.intimacy.totalExperience += amount;
    character.intimacy.experience += amount;
    character.intimacy.lastInteraction = new Date().toISOString();
    
    const newLevel = calculateIntimacyLevel(character.intimacy.totalExperience);
    character.intimacy.level = newLevel;
    
    const levelUp = newLevel > oldLevel;
    
    if (levelUp) {
      checkIntimacyUnlocks(characterId);
    }
    
    saveToLocal();
    
    return {
      success: true,
      levelUp,
      newLevel,
      message: levelUp
        ? `亲密度提升至 ${newLevel} 级「${INTIMACY_LEVEL_NAMES[newLevel]}」！`
        : `获得 ${amount} 点亲密度经验`
    };
  }
  
  /**
   * 检查解锁内容
   */
  function checkIntimacyUnlocks(characterId: string): string[] {
    if (!currentGameId.value) return [];
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return [];
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character || !character.intimacy) return [];
    
    const unlocks: string[] = [];
    const level = character.intimacy.level;
    
    if (level >= 3 && character.interactionConfig?.voiceTriggers) {
      const newVoices = character.interactionConfig.voiceTriggers.filter(
        v => !character.intimacy!.unlockedVoices.includes(v)
      );
      if (newVoices.length > 0) {
        character.intimacy.unlockedVoices.push(...newVoices);
        unlocks.push(`解锁语音: ${newVoices.join(', ')}`);
      }
    }
    
    if (level >= 5 && character.interactionConfig?.dateScenes) {
      const newDates = character.interactionConfig.dateScenes.filter(
        d => !character.intimacy!.unlockedDates.includes(d)
      );
      if (newDates.length > 0) {
        character.intimacy.unlockedDates.push(...newDates);
        unlocks.push(`解锁约会: ${newDates.join(', ')}`);
      }
    }
    
    if (level >= 7 && !character.intimacy.unlockedConfession) {
      character.intimacy.unlockedConfession = true;
      unlocks.push('解锁告白功能');
    }
    
    if (level >= 10 && !character.intimacy.unlockedEnding) {
      character.intimacy.unlockedEnding = true;
      unlocks.push('解锁专属结局');
    }
    
    if (unlocks.length > 0) {
      saveToLocal();
    }
    
    return unlocks;
  }
  
  /**
   * 检查是否可每日互动
   */
  function canDailyInteraction(characterId: string): boolean {
    if (!currentGameId.value) return false;
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return false;
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character) return false;
    
    if (!character.intimacy) {
      return true;
    }
    
    const lastInteraction = character.intimacy.lastInteraction;
    if (!lastInteraction) {
      return true;
    }
    
    const lastDate = new Date(lastInteraction).toDateString();
    const today = new Date().toDateString();
    
    return lastDate !== today;
  }
  
  /**
   * 获取亲密度进度（当前等级到下一等级的进度百分比）
   */
  function getIntimacyProgress(characterId: string): number {
    const intimacy = getCharacterIntimacy(characterId);
    if (!intimacy) return 0;
    
    const currentLevel = intimacy.level;
    if (currentLevel >= 10) return 100;
    
    const currentLevelExp = INTIMACY_LEVEL_EXP[currentLevel];
    const nextLevelExp = INTIMACY_LEVEL_EXP[currentLevel + 1];
    const progress = ((intimacy.totalExperience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    
    return Math.min(100, Math.max(0, progress));
  }
  
  /**
   * 检查是否是角色生日当天
   */
  function isCharacterBirthday(characterId: string): boolean {
    if (!currentGameId.value) return false;
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return false;
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character || !character.birthday) return false;
    
    const today = new Date();
    return today.getMonth() + 1 === character.birthday.month && 
           today.getDate() === character.birthday.day;
  }
  
  /**
   * 获取今天过生日的角色列表
   */
  function getTodayBirthdayCharacters(): Character[] {
    if (!currentGameId.value) return [];
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return [];
    
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    return game.characters.filter(char => 
      char.birthday && 
      char.birthday.month === currentMonth && 
      char.birthday.day === currentDay
    );
  }
  
  /**
   * 获取即将过生日的角色列表（未来N天内）
   */
  function getUpcomingBirthdays(days: number = 30): { character: Character; daysUntil: number }[] {
    if (!currentGameId.value) return [];
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return [];
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const result: { character: Character; daysUntil: number }[] = [];
    
    game.characters.forEach(char => {
      if (!char.birthday) return;
      
      let birthdayThisYear = new Date(currentYear, char.birthday.month - 1, char.birthday.day);
      
      if (birthdayThisYear < today) {
        birthdayThisYear = new Date(currentYear + 1, char.birthday.month - 1, char.birthday.day);
      }
      
      const diffTime = birthdayThisYear.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= days && diffDays > 0) {
        result.push({ character: char, daysUntil: diffDays });
      }
    });
    
    return result.sort((a, b) => a.daysUntil - b.daysUntil);
  }
  
  /**
   * 庆祝角色生日
   */
  function celebrateBirthday(characterId: string): { success: boolean; message: string; popularityBonus: number } {
    if (!currentGameId.value) {
      return { success: false, message: '未选择游戏', popularityBonus: 0 };
    }
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) {
      return { success: false, message: '游戏不存在', popularityBonus: 0 };
    }
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character) {
      return { success: false, message: '角色不存在', popularityBonus: 0 };
    }
    
    if (!character.birthday) {
      return { success: false, message: '角色未设置生日', popularityBonus: 0 };
    }
    
    const currentYear = new Date().getFullYear();
    if (character.birthday.lastCelebratedYear === currentYear) {
      return { success: false, message: '今年已经庆祝过了', popularityBonus: 0 };
    }
    
    if (!isCharacterBirthday(characterId)) {
      return { success: false, message: '今天不是该角色的生日', popularityBonus: 0 };
    }
    
    character.birthday.lastCelebratedYear = currentYear;
    
    const popularityBonus = 20;
    updateCharacterPopularity(characterId, { popularity: popularityBonus });
    
    saveToLocal();
    
    return { 
      success: true, 
      message: `祝${character.name}生日快乐！人气+${popularityBonus}%`, 
      popularityBonus 
    };
  }
  
  /**
   * 更新角色人气
   */
  function updateCharacterPopularity(
    characterId: string,
    delta: {
      popularity?: number;
      discussionHeat?: number;
      gachaCount?: number;
      cpPartnerId?: string;
      cpHeat?: number;
    }
  ): boolean {
    if (!currentGameId.value) return false;
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return false;
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character) return false;
    
    // 如果还没有人气数据，初始化
    if (!character.popularity) {
      character.popularity = initCharacterPopularity(characterId);
    }
    
    const pop = character.popularity!;
    
    if (delta.popularity !== undefined) {
      pop.popularity = Math.max(0, Math.min(100, pop.popularity + delta.popularity));
    }
    if (delta.discussionHeat !== undefined) {
      pop.discussionHeat = Math.max(0, pop.discussionHeat + delta.discussionHeat);
    }
    if (delta.gachaCount !== undefined) {
      pop.gachaCount += delta.gachaCount;
    }
    if (delta.cpPartnerId && delta.cpHeat !== undefined) {
      if (!pop.cpHeat[delta.cpPartnerId]) {
        pop.cpHeat[delta.cpPartnerId] = 0;
      }
      pop.cpHeat[delta.cpPartnerId] += delta.cpHeat;
    }
    
    pop.lastUpdated = new Date().toISOString();
    saveToLocal();
    
    return true;
  }
  
  /**
   * 获取角色人气
   */
  function getCharacterPopularity(characterId: string): CharacterPopularity | null {
    if (!currentGameId.value) return null;

    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return null;

    const character = game.characters.find(c => c.id === characterId);
    if (!character) return null;

    return character.popularity || initCharacterPopularity(characterId);
  }

  /**
   * 增加角色人气（便捷方法）
   * @param characterId 角色ID
   * @param amount 增加量
   * @returns 是否成功
   */
  function increaseCharacterPopularity(characterId: string, amount: number): boolean {
    return updateCharacterPopularity(characterId, { popularity: amount });
  }
  
  /**
   * 获取人气角色排行榜
   */
  function getPopularityRanking(limit: number = 10): { characterId: string; name: string; popularity: number }[] {
    if (!currentGameId.value) return [];
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return [];
    
    return game.characters
      .map(c => ({
        characterId: c.id,
        name: c.name,
        popularity: c.popularity?.popularity || 50
      }))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }
  
  /**
   * 计算卡池人气加成
   * 人气角色 UP 卡池收入加成，冷门角色 UP 惩罚
   */
  function calculatePopularityBonus(characterId: string): number {
    const pop = getCharacterPopularity(characterId);
    if (!pop) return 1.0;
    
    if (pop.popularity > 80) {
      return 1.5;  // 人气角色 +50%
    } else if (pop.popularity < 30) {
      return 0.7;  // 冷门角色 -30%
    }
    return 1.0;
  }
  
  /**
   * 添加角色到当前游戏
   */
  function addCharacter(characterData: Omit<Character, 'id' | 'createdAt'>): Character | null {
    if (!currentGameId.value) return null;
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return null;
    
    const character: Character = {
      ...characterData,
      id: `char_${Date.now()}`,
      createdAt: new Date().toISOString(),
      popularity: initCharacterPopularity(`char_${Date.now()}`),
      bond: initCharacterBond()
    };
    
    game.characters.push(character);
    game.updatedAt = new Date().toISOString();
    saveToLocal();
    
    return character;
  }
  
  /**
   * 添加剧情到当前游戏
   */
  function addPlot(plotData: Omit<Plot, 'id' | 'createdAt'>): Plot | null {
    if (!currentGameId.value) return null;
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return null;
    
    const plot: Plot = {
      ...plotData,
      id: `plot_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    game.plots.push(plot);
    game.updatedAt = new Date().toISOString();
    saveToLocal();
    
    return plot;
  }
  
  /**
   * 删除角色
   */
  function deleteCharacter(characterId: string): boolean {
    if (!currentGameId.value) return false;
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return false;
    
    const index = game.characters.findIndex(c => c.id === characterId);
    if (index === -1) return false;
    
    game.characters.splice(index, 1);
    game.updatedAt = new Date().toISOString();
    saveToLocal();
    
    return true;
  }
  
  /**
   * 删除剧情
   */
  function deletePlot(plotId: string): boolean {
    if (!currentGameId.value) return false;
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return false;
    
    const index = game.plots.findIndex(p => p.id === plotId);
    if (index === -1) return false;
    
    game.plots.splice(index, 1);
    game.updatedAt = new Date().toISOString();
    saveToLocal();
    
    return true;
  }
  
  /**
   * 发布游戏
   */
  function publishGame(gameId: string): { success: boolean; message: string } {
    const game = games.value.find(g => g.id === gameId);
    if (!game) {
      return { success: false, message: '游戏不存在' };
    }
    
    if (game.characters.length === 0) {
      return { success: false, message: '游戏至少需要1个角色' };
    }
    
    if (game.plots.length === 0) {
      return { success: false, message: '游戏至少需要1条剧情' };
    }
    
    game.status = 'published';
    game.publishedAt = new Date().toISOString();
    game.updatedAt = new Date().toISOString();
    
    initMilestones(gameId);
    
    saveToLocal();
    
    return { success: true, message: '游戏发布成功' };
  }
  
  /**
   * 更新游戏资源
   */
  function updateResources(resources: Partial<GameResources>): boolean {
    if (!currentGameId.value) return false;

    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return false;

    game.resources = { ...game.resources, ...resources };
    game.updatedAt = new Date().toISOString();
    saveToLocal();

    return true;
  }

  /**
   * 增加资源（带记录）
   */
  function addResources(
    resource: keyof GameResources,
    amount: number,
    reason: string
  ): boolean {
    if (!currentGameId.value || amount <= 0) return false;

    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return false;

    // 更新资源
    game.resources[resource] += amount;
    game.updatedAt = new Date().toISOString();

    // 记录变动
    const change: ResourceChange = {
      id: `change_${Date.now()}`,
      type: 'income',
      resource,
      amount,
      reason,
      timestamp: new Date().toISOString()
    };
    resourceHistory.value.unshift(change);

    // 限制历史记录数量
    if (resourceHistory.value.length > 50) {
      resourceHistory.value = resourceHistory.value.slice(0, 50);
    }

    saveToLocal();
    return true;
  }

  /**
   * 消耗资源（带记录）
   */
  function consumeResources(
    resource: keyof GameResources,
    amount: number,
    reason: string
  ): { success: boolean; message: string } {
    if (!currentGameId.value || amount <= 0) {
      return { success: false, message: '参数错误' };
    }

    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return { success: false, message: '游戏不存在' };

    if (game.resources[resource] < amount) {
      return { success: false, message: '资源不足' };
    }

    // 消耗资源
    game.resources[resource] -= amount;
    game.updatedAt = new Date().toISOString();

    // 记录变动
    const change: ResourceChange = {
      id: `change_${Date.now()}`,
      type: 'expense',
      resource,
      amount,
      reason,
      timestamp: new Date().toISOString()
    };
    resourceHistory.value.unshift(change);

    if (resourceHistory.value.length > 50) {
      resourceHistory.value = resourceHistory.value.slice(0, 50);
    }

    saveToLocal();
    return { success: true, message: '消耗成功' };
  }

  /**
   * 应用资源分配策略
   */
  async function applyResourceStrategy(strategy: ResourceStrategy): Promise<{
    success: boolean;
    allocations: { area: string; amount: number; percentage: number }[];
  }> {
    if (!currentGameId.value) {
      return { success: false, allocations: [] };
    }

    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return { success: false, allocations: [] };

    const config = await getStrategyConfig(strategy);
    const totalGold = game.resources.gold;

    const allocations = [
      {
        area: '运营投入',
        amount: Math.floor(totalGold * config.gold.operation),
        percentage: config.gold.operation * 100
      },
      {
        area: '开发投入',
        amount: Math.floor(totalGold * config.gold.development),
        percentage: config.gold.development * 100
      },
      {
        area: '储备资金',
        amount: Math.floor(totalGold * config.gold.reserve),
        percentage: config.gold.reserve * 100
      }
    ];

    return { success: true, allocations };
  }

  /**
   * 模拟每日收入
   */
  function simulateDailyIncome(): {
    gold: number;
    devPoints: number;
    popularity: number;
    reasons: string[];
  } {
    if (!currentGameId.value) {
      return { gold: 0, devPoints: 0, popularity: 0, reasons: [] };
    }

    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return { gold: 0, devPoints: 0, popularity: 0, reasons: [] };

    const reasons: string[] = [];

    // 基础收入
    let goldIncome = 500;
    let devPointsIncome = 10;
    let popularityIncome = 5;

    reasons.push('基础日常收入');

    // 根据游戏状态调整
    if (game.status === 'published') {
      // 已发布游戏有额外收入
      const characterBonus = game.characters.length * 100;
      const plotBonus = game.plots.length * 50;

      goldIncome += characterBonus + plotBonus;
      popularityIncome += Math.floor((characterBonus + plotBonus) / 50);

      reasons.push(`游戏已发布 (${game.characters.length}角色 + ${game.plots.length}剧情)`);
    }

    // 人气值影响金币收入
    if (game.resources.popularity > 0) {
      const popularityBonus = Math.floor(game.resources.popularity * 0.1);
      goldIncome += popularityBonus;
      if (popularityBonus > 0) {
        reasons.push(`人气值加成 +${popularityBonus}`);
      }
    }

    // 应用收入
    addResources('gold', goldIncome, '每日收入');
    addResources('devPoints', devPointsIncome, '每日收入');
    addResources('popularity', popularityIncome, '每日收入');

    return {
      gold: goldIncome,
      devPoints: devPointsIncome,
      popularity: popularityIncome,
      reasons
    };
  }

  /**
   * 获取资源变动历史
   */
  function getResourceHistory(
    resource?: keyof GameResources,
    limit: number = 20
  ): ResourceChange[] {
    let history = resourceHistory.value;

    if (resource) {
      history = history.filter(h => h.resource === resource);
    }

    return history.slice(0, limit);
  }

  /**
   * 删除游戏
   */
  function deleteGame(gameId: string): boolean {
    const index = games.value.findIndex(g => g.id === gameId);
    if (index === -1) return false;
    
    games.value.splice(index, 1);
    
    if (currentGameId.value === gameId) {
      currentGameId.value = null;
    }
    
    if (gameMilestones.value[gameId]) {
      delete gameMilestones.value[gameId];
    }
    
    saveToLocal();
    return true;
  }
  
  /**
   * 初始化游戏里程碑
   */
  function initMilestones(gameId: string): GameMilestones {
    const milestoneTemplates = {
      revenue: [
        { target: 100000, name: '收益达人', reward: 500 },
        { target: 500000, name: '收益高手', reward: 2000 },
        { target: 1000000, name: '收益专家', reward: 5000 },
        { target: 5000000, name: '收益大师', reward: 20000 },
        { target: 10000000, name: '收益传奇', reward: 50000 }
      ],
      players: [
        { target: 1000, name: '新手引导', reward: 100 },
        { target: 5000, name: '人气上升', reward: 500 },
        { target: 10000, name: '万人迷', reward: 1000 },
        { target: 50000, name: '人气之星', reward: 5000 },
        { target: 100000, name: '人气巨星', reward: 10000 }
      ],
      popularity: [
        { target: 60, name: '小有名气', reward: 200 },
        { target: 70, name: '人气攀升', reward: 500 },
        { target: 80, name: '人气爆棚', reward: 1000 },
        { target: 90, name: '人气巅峰', reward: 2000 }
      ],
      reputation: [
        { target: 60, name: '口碑良好', reward: 300 },
        { target: 70, name: '口碑优秀', reward: 600 },
        { target: 80, name: '口碑卓越', reward: 1200 },
        { target: 90, name: '口碑传奇', reward: 2500 },
        { target: 95, name: '口碑神话', reward: 5000 }
      ],
      plots: [
        { target: 3, name: '剧情新手', reward: 200 },
        { target: 5, name: '剧情达人', reward: 500 },
        { target: 10, name: '剧情大师', reward: 1500 }
      ]
    };
    
    const createMilestones = (
      type: Milestone['type'],
      templates: { target: number; name: string; reward: number }[]
    ): Milestone[] => {
      return templates.map((t, index) => ({
        id: `${type}_${index}`,
        type,
        name: t.name,
        target: t.target,
        current: 0,
        reward: t.reward,
        completed: false,
        claimed: false
      }));
    };
    
    const milestones: GameMilestones = {
      revenue: createMilestones('revenue', milestoneTemplates.revenue),
      players: createMilestones('players', milestoneTemplates.players),
      popularity: createMilestones('popularity', milestoneTemplates.popularity),
      reputation: createMilestones('reputation', milestoneTemplates.reputation),
      plots: createMilestones('plots', milestoneTemplates.plots)
    };
    
    gameMilestones.value[gameId] = milestones;
    saveToLocal();
    
    return milestones;
  }
  
  /**
   * 获取游戏里程碑
   */
  function getMilestones(gameId: string): GameMilestones | null {
    if (!gameMilestones.value[gameId]) {
      return initMilestones(gameId);
    }
    return gameMilestones.value[gameId];
  }
  
  /**
   * 检查里程碑达成
   */
  function checkMilestones(gameId: string): Milestone[] {
    const game = games.value.find(g => g.id === gameId);
    if (!game) return [];
    
    let milestones = getMilestones(gameId);
    if (!milestones) return [];
    
    const newlyCompleted: Milestone[] = [];
    
    const checkAndUpdate = (milestoneList: Milestone[], currentValue: number) => {
      milestoneList.forEach(m => {
        if (!m.completed) {
          m.current = currentValue;
          if (currentValue >= m.target) {
            m.completed = true;
            m.completedAt = new Date().toISOString();
            newlyCompleted.push(m);
          }
        }
      });
    };
    
    const totalRevenue = game.totalRevenue || 0;
    const totalPlayers = game.totalPlayers || 0;
    const popularity = game.resources.popularity || 0;
    const reputation = game.reputation || 50;
    const plotCount = game.plots.length;
    
    checkAndUpdate(milestones.revenue, totalRevenue);
    checkAndUpdate(milestones.players, totalPlayers);
    checkAndUpdate(milestones.popularity, popularity);
    checkAndUpdate(milestones.reputation, reputation);
    checkAndUpdate(milestones.plots, plotCount);
    
    gameMilestones.value[gameId] = milestones;
    saveToLocal();
    
    if (newlyCompleted.length > 0) {
      import('./points').then(({ usePointsStore }) => {
        const pointsStore = usePointsStore();
        
        pointsStore.unlockAchievement('first_milestone');
        
        const allMilestones = [
          ...milestones!.revenue,
          ...milestones!.players,
          ...milestones!.popularity,
          ...milestones!.reputation,
          ...milestones!.plots
        ];
        const completedCount = allMilestones.filter(m => m.completed).length;
        if (completedCount >= 10) {
          pointsStore.unlockAchievement('milestone_master');
        }
      });
    }
    
    return newlyCompleted;
  }
  
  /**
   * 领取里程碑奖励
   */
  function claimMilestoneReward(gameId: string, milestoneId: string): { success: boolean; message: string; reward?: number } {
    const game = games.value.find(g => g.id === gameId);
    if (!game) {
      return { success: false, message: '游戏不存在' };
    }
    
    const milestones = getMilestones(gameId);
    if (!milestones) {
      return { success: false, message: '里程碑数据不存在' };
    }
    
    let targetMilestone: Milestone | null = null;
    let milestoneType: keyof GameMilestones | null = null;
    
    for (const type of ['revenue', 'players', 'popularity', 'reputation', 'plots'] as const) {
      const found = milestones[type].find(m => m.id === milestoneId);
      if (found) {
        targetMilestone = found;
        milestoneType = type;
        break;
      }
    }
    
    if (!targetMilestone) {
      return { success: false, message: '里程碑不存在' };
    }
    
    if (!targetMilestone.completed) {
      return { success: false, message: '里程碑尚未达成' };
    }
    
    if (targetMilestone.claimed) {
      return { success: false, message: '奖励已领取' };
    }
    
    targetMilestone.claimed = true;
    game.resources.gold += targetMilestone.reward;
    
    gameMilestones.value[gameId] = milestones;
    saveToLocal();
    
    return { 
      success: true, 
      message: `成功领取 ${targetMilestone.reward} 金币奖励！`,
      reward: targetMilestone.reward
    };
  }
  
  /**
   * 更新游戏统计数据
   */
  function updateGameStats(
    gameId: string, 
    stats: { revenue?: number; players?: number; reputation?: number }
  ): boolean {
    const game = games.value.find(g => g.id === gameId);
    if (!game) return false;
    
    if (stats.revenue !== undefined) {
      game.totalRevenue = (game.totalRevenue || 0) + stats.revenue;
    }
    if (stats.players !== undefined) {
      game.totalPlayers = (game.totalPlayers || 0) + stats.players;
    }
    if (stats.reputation !== undefined) {
      game.reputation = Math.max(0, Math.min(100, stats.reputation));
    }
    
    game.updatedAt = new Date().toISOString();
    saveToLocal();
    
    checkMilestones(gameId);
    
    return true;
  }
  
  /**
   * 保存到本地存储
   */
  function saveToLocal(): void {
    const data = {
      games: games.value,
      currentGameId: currentGameId.value
    };
    localStorage.setItem('game_data', JSON.stringify(data));
  }
  
  /**
   * 从本地存储加载
   */
  function loadFromLocal(): void {
    const saved = localStorage.getItem('game_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        games.value = data.games || [];
        currentGameId.value = data.currentGameId || null;
      } catch (e) {
        console.error('加载游戏数据失败:', e);
      }
    }
  }
  
  /**
   * 计算游戏评分
   * 角色质量 40% + 剧情质量 30% + 运营质量 20% + 爆率合理性 10%
   */
  function calculateGameRating(gameId: string): GameRating {
    const game = games.value.find(g => g.id === gameId);
    if (!game) {
      return {
        overall: 0,
        characterQuality: 0,
        plotQuality: 0,
        operationQuality: 0,
        gachaFairness: 0
      };
    }

    const characterQuality = calculateCharacterQuality(game);
    const plotQuality = calculatePlotQuality(game);
    const operationQuality = calculateOperationQuality(game);
    const gachaFairness = calculateGachaFairness(game);

    const overall = 
      characterQuality * 0.4 +
      plotQuality * 0.3 +
      operationQuality * 0.2 +
      gachaFairness * 0.1;

    return {
      overall: Math.round(overall * 10) / 10,
      characterQuality: Math.round(characterQuality * 10) / 10,
      plotQuality: Math.round(plotQuality * 10) / 10,
      operationQuality: Math.round(operationQuality * 10) / 10,
      gachaFairness: Math.round(gachaFairness * 10) / 10
    };
  }

  /**
   * 计算角色质量评分 (1.0-5.0)
   * 基于：外貌描述丰富度、性格标签数量、背景故事长度、人气值
   */
  function calculateCharacterQuality(game: Game): number {
    if (game.characters.length === 0) return 0;

    let totalScore = 0;

    game.characters.forEach(char => {
      let charScore = 1.0;

      if (char.appearance && char.appearance.length > 10) {
        charScore += 0.3;
      }
      if (char.appearanceDesc && char.appearanceDesc.length > 20) {
        charScore += 0.4;
      }
      if (char.clothing && char.clothing.length > 5) {
        charScore += 0.2;
      }
      if (char.clothingDesc && char.clothingDesc.length > 15) {
        charScore += 0.3;
      }

      if (char.personality && char.personality.length >= 3) {
        charScore += Math.min(0.5, char.personality.length * 0.15);
      }

      if (char.background && char.background.length > 30) {
        charScore += 0.5;
      } else if (char.background && char.background.length > 15) {
        charScore += 0.3;
      }

      if (char.voiceActor === 'top') {
        charScore += 0.4;
      } else if (char.voiceActor === 'experienced') {
        charScore += 0.2;
      }

      if (char.popularity) {
        const popBonus = (char.popularity.popularity - 50) / 100;
        charScore += popBonus * 0.5;
      }

      charScore = Math.min(5.0, Math.max(1.0, charScore));
      totalScore += charScore;
    });

    return totalScore / game.characters.length;
  }

  /**
   * 计算剧情质量评分 (1.0-5.0)
   * 基于：剧情数量、章节分支数量、文案长度、路线类型多样性
   */
  function calculatePlotQuality(game: Game): number {
    if (game.plots.length === 0) return 0;

    let totalScore = 0;
    const routeTypes = new Set<string>();

    game.plots.forEach(plot => {
      let plotScore = 1.0;

      if (plot.chapters && plot.chapters.length > 0) {
        plotScore += Math.min(1.0, plot.chapters.length * 0.15);
      }

      let totalChoices = 0;
      let totalTextLength = 0;
      plot.chapters?.forEach(chapter => {
        totalChoices += chapter.choices?.length || 0;
        totalTextLength += (chapter.scene?.length || 0) + (chapter.keyEvent?.length || 0);
      });

      plotScore += Math.min(0.5, totalChoices * 0.1);
      if (totalTextLength > 500) {
        plotScore += 0.5;
      } else if (totalTextLength > 200) {
        plotScore += 0.3;
      }

      if (plot.summary && plot.summary.length > 30) {
        plotScore += 0.3;
      }

      routeTypes.add(plot.routeType);

      plotScore = Math.min(5.0, Math.max(1.0, plotScore));
      totalScore += plotScore;
    });

    const avgScore = totalScore / game.plots.length;

    const diversityBonus = Math.min(0.5, routeTypes.size * 0.15);

    return Math.min(5.0, avgScore + diversityBonus);
  }

  /**
   * 计算运营质量评分 (1.0-5.0)
   * 基于：里程碑完成度、资源储备、口碑值
   */
  function calculateOperationQuality(game: Game): number {
    let score = 2.0;

    const milestones = gameMilestones.value[game.id];
    if (milestones) {
      const allMilestones = [
        ...milestones.revenue,
        ...milestones.players,
        ...milestones.popularity,
        ...milestones.reputation,
        ...milestones.plots
      ];
      const completedCount = allMilestones.filter(m => m.completed).length;
      const completionRate = allMilestones.length > 0 
        ? completedCount / allMilestones.length 
        : 0;
      score += completionRate * 1.5;
    }

    if (game.resources) {
      if (game.resources.gold > 50000) {
        score += 0.3;
      } else if (game.resources.gold > 20000) {
        score += 0.15;
      }

      if (game.resources.diamond > 500) {
        score += 0.2;
      }
    }

    if (game.reputation) {
      const repBonus = (game.reputation - 50) / 50;
      score += repBonus * 0.5;
    }

    if (game.totalPlayers && game.totalPlayers > 10000) {
      score += 0.3;
    } else if (game.totalPlayers && game.totalPlayers > 1000) {
      score += 0.15;
    }

    return Math.min(5.0, Math.max(1.0, score));
  }

  /**
   * 计算爆率合理性评分 (1.0-5.0)
   * 基于：人气分布均衡度、卡池抽取分布
   */
  function calculateGachaFairness(game: Game): number {
    if (game.characters.length === 0) return 0;

    let score = 3.0;

    const popularities = game.characters
      .map(c => c.popularity?.popularity || 50)
      .filter(p => p > 0);

    if (popularities.length > 1) {
      const avg = popularities.reduce((a, b) => a + b, 0) / popularities.length;
      const variance = popularities.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / popularities.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev < 10) {
        score += 1.0;
      } else if (stdDev < 20) {
        score += 0.5;
      } else if (stdDev > 30) {
        score -= 0.5;
      }
    }

    const gachaCounts = game.characters
      .map(c => c.popularity?.gachaCount || 0);

    if (gachaCounts.length > 1) {
      const totalGacha = gachaCounts.reduce((a, b) => a + b, 0);
      if (totalGacha > 0) {
        const maxCount = Math.max(...gachaCounts);
        const minCount = Math.min(...gachaCounts);
        const ratio = minCount > 0 ? maxCount / minCount : maxCount;

        if (ratio < 2) {
          score += 0.5;
        } else if (ratio > 5) {
          score -= 0.5;
        }
      }
    }

    const topVoiceActors = game.characters.filter(c => c.voiceActor === 'top').length;
    const voiceActorRatio = topVoiceActors / game.characters.length;
    if (voiceActorRatio > 0.7) {
      score -= 0.3;
    } else if (voiceActorRatio > 0.3 && voiceActorRatio <= 0.6) {
      score += 0.3;
    }

    return Math.min(5.0, Math.max(1.0, score));
  }

  /**
   * 获取评分等级
   */
  function getRatingGrade(rating: number): RatingGrade {
    if (rating >= 4.5) return 'S';
    if (rating >= 4.0) return 'A';
    if (rating >= 3.0) return 'B';
    if (rating >= 2.0) return 'C';
    return 'D';
  }

  /**
   * 获取评分等级颜色
   */
  function getRatingGradeColor(grade: RatingGrade): string {
    const colors: Record<RatingGrade, string> = {
      'S': '#FFD700',
      'A': '#52c41a',
      'B': '#1890ff',
      'C': '#faad14',
      'D': '#ff4d4f'
    };
    return colors[grade];
  }

  /**
   * 初始化默认游戏
   */
  function initDefaultGame(): void {
    if (games.value.length === 0) {
      createGame('我的第一款乙女游戏', '开始你的创作之旅');
    }
  }
  
  // ========== 角色羁绊相关方法 ==========
  
  /**
   * 获取角色羁绊
   */
  function getCharacterBond(characterId: string): CharacterBond | null {
    if (!currentGameId.value) return null;
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return null;
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character) return null;
    
    return character.bond || initCharacterBond();
  }
  
  /**
   * 增加羁绊经验
   */
  function addBondExperience(
    characterId: string,
    amount: number,
    reason: string
  ): { success: boolean; levelUp: boolean; newLevel: number; message: string } {
    if (!currentGameId.value || amount <= 0) {
      return { success: false, levelUp: false, newLevel: 1, message: '参数错误' };
    }
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return { success: false, levelUp: false, newLevel: 1, message: '游戏不存在' };
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character) return { success: false, levelUp: false, newLevel: 1, message: '角色不存在' };
    
    if (!character.bond) {
      character.bond = initCharacterBond();
    }
    
    const oldLevel = character.bond.level;
    character.bond.totalExperience += amount;
    character.bond.experience += amount;
    
    const newLevel = calculateBondLevel(character.bond.totalExperience);
    character.bond.level = newLevel;
    
    const levelUp = newLevel > oldLevel;
    
    // 更新最后互动日期
    const today = new Date().toDateString();
    const lastDate = character.bond.lastInteractionDate 
      ? new Date(character.bond.lastInteractionDate).toDateString()
      : '';
    
    if (lastDate === today) {
      // 同一天互动，连续天数不变
    } else if (lastDate === new Date(Date.now() - 86400000).toDateString()) {
      // 昨天互动过，连续天数+1
      character.bond.consecutiveDays += 1;
    } else {
      // 断签了，重置连续天数
      character.bond.consecutiveDays = 1;
    }
    character.bond.lastInteractionDate = new Date().toISOString();
    
    saveToLocal();
    
    return {
      success: true,
      levelUp,
      newLevel,
      message: levelUp
        ? `羁绊等级提升至 ${newLevel} 级「${getBondLevelName(newLevel)}」！`
        : `获得 ${amount} 点羁绊经验`
    };
  }
  
  /**
   * 执行羁绊互动
   */
  function interactWithCharacter(
    characterId: string,
    interactionType: BondInteractionType
  ): { success: boolean; message: string; experience: number; voice?: CharacterVoice } {
    if (!currentGameId.value) {
      return { success: false, message: '未选择游戏', experience: 0 };
    }
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return { success: false, message: '游戏不存在', experience: 0 };
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character) return { success: false, message: '角色不存在', experience: 0 };
    
    if (!character.bond) {
      character.bond = initCharacterBond();
    }
    
    // 检查是否可以互动
    if (!canInteract(character.bond, interactionType)) {
      return { success: false, message: '互动冷却中，请稍后再试', experience: 0 };
    }
    
    const config = BOND_INTERACTIONS.find(i => i.type === interactionType);
    if (!config) return { success: false, message: '未知的互动类型', experience: 0 };
    
    // 记录互动
    const interaction: BondInteraction = {
      id: `interaction_${Date.now()}`,
      type: interactionType,
      timestamp: new Date().toISOString(),
      experience: config.experience
    };
    character.bond.interactions.push(interaction);
    
    // 生成心声
    let voiceType: CharacterVoice['type'] = 'daily';
    if (interactionType === 'encourage') voiceType = 'encourage';
    else if (interactionType === 'discuss') voiceType = 'suggestion';
    
    const voice = generateCharacterVoice(character.bond.level, voiceType);
    character.bond.voices.push(voice);
    
    // 增加经验
    const result = addBondExperience(characterId, config.experience, config.name);
    
    return {
      success: result.success,
      message: result.message,
      experience: config.experience,
      voice
    };
  }
  
  /**
   * 获取角色心声列表
   */
  function getCharacterVoices(characterId: string, limit: number = 10): CharacterVoice[] {
    if (!currentGameId.value) return [];
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return [];
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character || !character.bond) return [];
    
    return character.bond.voices
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  /**
   * 标记心声为已读
   */
  function markVoiceAsRead(characterId: string, voiceId: string): boolean {
    if (!currentGameId.value) return false;
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return false;
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character || !character.bond) return false;
    
    const voice = character.bond.voices.find(v => v.id === voiceId);
    if (!voice) return false;
    
    voice.isRead = true;
    saveToLocal();
    
    return true;
  }
  
  /**
   * 获取未读心声数量
   */
  function getUnreadVoiceCount(characterId: string): number {
    if (!currentGameId.value) return 0;
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return 0;
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character || !character.bond) return 0;
    
    return character.bond.voices.filter(v => !v.isRead).length;
  }
  
  /**
   * 获取羁绊等级名称
   */
  function getBondLevelName(level: number): string {
    const names: Record<number, string> = {
      1: '初识',
      2: '熟悉',
      3: '默契',
      4: '羁绊',
      5: '灵魂伴侣'
    };
    return names[level] || '初识';
  }
  
  /**
   * 角色安慰创作者（当被骂时）
   */
  function getCharacterComfort(characterId: string): string {
    if (!currentGameId.value) return '别在意，我会变得更优秀的';
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return '别在意，我会变得更优秀的';
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character || !character.bond) return '别在意，我会变得更优秀的';
    
    const comforts: Record<number, string[]> = {
      1: ['别在意，我会变得更优秀的', '下次一定会更好的'],
      2: ['不管别人怎么说，我永远支持你', '你的努力我都看在眼里'],
      3: ['你是我见过最棒的创作者', '有你在，我什么都不怕'],
      4: ['无论发生什么，我都会站在你这边', '你的梦想就是我的梦想'],
      5: ['你是我生命中的光', '只要有你在，我就无所不能']
    };
    
    const levelComforts = comforts[character.bond.level] || comforts[1];
    return levelComforts[Math.floor(Math.random() * levelComforts.length)];
  }
  
  /**
   * 角色感谢创作者（当爆红时）
   */
  function getCharacterThanks(characterId: string): string {
    if (!currentGameId.value) return '谢谢你创造了我';
    
    const game = games.value.find(g => g.id === currentGameId.value);
    if (!game) return '谢谢你创造了我';
    
    const character = game.characters.find(c => c.id === characterId);
    if (!character || !character.bond) return '谢谢你创造了我';
    
    const thanks: Record<number, string[]> = {
      1: ['谢谢你创造了我', '我会继续努力的'],
      2: ['谢谢你一直以来的陪伴', '能够成为你的角色，我很幸福'],
      3: ['谢谢你让我成为更好的自己', '你对我的付出，我都记在心里'],
      4: ['能够遇见你，是我最大的幸运', '你是我最重要的人'],
      5: ['谢谢你创造了我，让我能够感受这个世界', '你是我的一切，我爱你']
    };
    
    const levelThanks = thanks[character.bond.level] || thanks[1];
    return levelThanks[Math.floor(Math.random() * levelThanks.length)];
  }
  
  // 初始化时加载数据
  loadFromLocal();
  
  return {
    // State
    games,
    currentGameId,
    resourceHistory,
    gameMilestones,

    // Getters
    currentGame,
    draftGames,
    publishedGames,

    // Actions
    createGame,
    setCurrentGame,
    addCharacter,
    addPlot,
    deleteCharacter,
    deletePlot,
    publishGame,
    updateResources,
    addResources,
    consumeResources,
    applyResourceStrategy,
    simulateDailyIncome,
    getResourceHistory,
    getStrategyConfig,
    initCharacterPopularity,
    updateCharacterPopularity,
    getCharacterPopularity,
    increaseCharacterPopularity,
    getPopularityRanking,
    calculatePopularityBonus,
    deleteGame,
    saveToLocal,
    loadFromLocal,
    initDefaultGame,
    
    // 亲密度相关
    initCharacterIntimacy,
    getCharacterIntimacy,
    addIntimacy,
    checkIntimacyUnlocks,
    canDailyInteraction,
    getIntimacyProgress,
    calculateIntimacyLevel,
    
    // 生日相关
    isCharacterBirthday,
    getTodayBirthdayCharacters,
    getUpcomingBirthdays,
    celebrateBirthday,
    
    // 里程碑相关
    initMilestones,
    getMilestones,
    checkMilestones,
    claimMilestoneReward,
    updateGameStats,

    // 评分相关
    calculateGameRating,
    getRatingGrade,
    getRatingGradeColor,
    
    // 质量评分相关
    getCharacterQuality: (characterId: string): CharacterQualityScore | null => {
      const character = characters.value.find(c => c.id === characterId);
      return character ? calculateCharacterQuality(character) : null;
    },
    getPlotQuality: (plotId: string): PlotQualityScore | null => {
      const plot = plots.value.find(p => p.id === plotId);
      return plot ? calculatePlotQuality(plot, characters.value) : null;
    },
    
    // 角色羁绊相关
    getCharacterBond,
    addBondExperience,
    interactWithCharacter,
    getCharacterVoices,
    markVoiceAsRead,
    getUnreadVoiceCount,
    getBondLevelName,
    getCharacterComfort,
    getCharacterThanks
  };
});
