/**
 * 角色每日更新引擎
 * 实现角色亲密度衰减、人气变化、生日事件、互动数据统计等功能
 */

import { ref } from 'vue';

// 角色人气变化结果
export interface PopularityChange {
  characterId: string;
  oldPopularity: number;
  newPopularity: number;
  change: number;
  reason: string;
}

// 生日事件
export interface BirthdayEvent {
  characterId: string;
  characterName: string;
  date: number;
  popularityBoost: number;
  heatBoost: number;
  specialComments: number;
}

// 角色提及统计
export interface MentionStats {
  characterId: string;
  mentionCount: number;
  positiveMentions: number;
  negativeMentions: number;
  neutralMentions: number;
}

// CP 热度数据
export interface CPHeatData {
  characterId1: string;
  characterId2: string;
  heat: number;
  trend: 'up' | 'down' | 'stable';
  mentionCount: number;
}

// 角色口碑评分
export interface ReputationScore {
  characterId: string;
  score: number; // 1-5 星
  reviewCount: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// 评论数据接口
export interface Comment {
  id: string;
  characterId?: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  rating?: number;
  timestamp: number;
}

/**
 * 亲密度衰减计算器
 * 每日自动衰减 0.5%
 */
export class IntimacyDecayCalculator {
  private readonly DECAY_RATE = 0.005; // 0.5%

  /**
   * 计算亲密度衰减
   * @param currentIntimacy 当前亲密度
   * @param daysSinceLastInteraction 距离上次互动天数
   * @returns 衰减后的亲密度
   */
  calculate(currentIntimacy: number, daysSinceLastInteraction: number = 1): number {
    if (currentIntimacy <= 0) return 0;

    const decayAmount = currentIntimacy * this.DECAY_RATE * daysSinceLastInteraction;
    const newIntimacy = currentIntimacy - decayAmount;

    return Math.max(0, Math.floor(newIntimacy));
  }

  /**
   * 计算衰减量
   * @param currentIntimacy 当前亲密度
   * @param days 天数
   * @returns 衰减量
   */
  getDecayAmount(currentIntimacy: number, days: number = 1): number {
    return Math.floor(currentIntimacy * this.DECAY_RATE * days);
  }
}

/**
 * 人气更新器
 * 基于项目表现动态调整角色人气
 */
export class PopularityUpdater {
  /**
   * 根据项目收入表现计算人气变化
   * @param currentPopularity 当前人气
   * @param dailyIncome 日收入
   * @param expectedIncome 预期收入
   * @returns 人气变化值
   */
  calculateFromRevenue(currentPopularity: number, dailyIncome: number, expectedIncome: number): number {
    const ratio = dailyIncome / expectedIncome;
    let change = 0;

    if (ratio > 1.2) {
      change = 5;
    } else if (ratio > 1.0) {
      change = 2;
    } else if (ratio < 0.5) {
      change = -5;
    } else if (ratio < 1.0) {
      change = -2;
    }

    return Math.max(0, currentPopularity + change);
  }

  /**
   * 获取人气变化原因
   * @param dailyIncome 日收入
   * @param expectedIncome 预期收入
   * @returns 原因描述
   */
  getChangeReason(dailyIncome: number, expectedIncome: number): string {
    const ratio = dailyIncome / expectedIncome;

    if (ratio > 1.2) {
      return '项目收入远超预期，人气大幅上升';
    } else if (ratio > 1.0) {
      return '项目收入超过预期，人气小幅上升';
    } else if (ratio < 0.5) {
      return '项目收入远低于预期，人气大幅下降';
    } else if (ratio < 1.0) {
      return '项目收入低于预期，人气小幅下降';
    } else {
      return '项目收入符合预期，人气保持稳定';
    }
  }

  /**
   * 批量更新角色人气
   * @param characters 角色列表
   * @param projectData 项目数据
   * @returns 人气变化结果
   */
  batchUpdate(
    characters: Array<{ id: string; popularity: number }>,
    projectData: Record<string, { dailyIncome: number; expectedIncome: number }>
  ): PopularityChange[] {
    const results: PopularityChange[] = [];

    characters.forEach(character => {
      const project = projectData[character.id];
      if (!project) return;

      const oldPopularity = character.popularity;
      const newPopularity = this.calculateFromRevenue(oldPopularity, project.dailyIncome, project.expectedIncome);
      const change = newPopularity - oldPopularity;

      results.push({
        characterId: character.id,
        oldPopularity,
        newPopularity,
        change,
        reason: this.getChangeReason(project.dailyIncome, project.expectedIncome)
      });
    });

    return results;
  }
}

/**
 * 生日检测器
 * 检测角色生日并触发特殊事件
 */
export class BirthdayDetector {
  /**
   * 检测是否是角色生日
   * @param birthday 角色生日 (MM-DD 格式)
   * @param currentDate 当前日期
   * @returns 是否是生日
   */
  isBirthday(birthday: string, currentDate: Date = new Date()): boolean {
    const [month, day] = birthday.split('-').map(Number);
    const today = currentDate;

    return (
      today.getMonth() + 1 === month &&
      today.getDate() === day
    );
  }

  /**
   * 生成生日事件
   * @param characterId 角色 ID
   * @param characterName 角色名称
   * @returns 生日事件
   */
  generateBirthdayEvent(characterId: string, characterName: string): BirthdayEvent {
    return {
      characterId,
      characterName,
      date: Date.now(),
      popularityBoost: 20,
      heatBoost: 50,
      specialComments: Math.floor(Math.random() * 6) + 5 // 5-10 条
    };
  }

  /**
   * 批量检测角色生日
   * @param characters 角色列表
   * @param currentDate 当前日期
   * @returns 生日角色列表
   */
  checkBirthdays(
    characters: Array<{ id: string; name: string; birthday?: string }>,
    currentDate: Date = new Date()
  ): BirthdayEvent[] {
    const birthdayEvents: BirthdayEvent[] = [];

    characters.forEach(character => {
      if (character.birthday && this.isBirthday(character.birthday, currentDate)) {
        birthdayEvents.push(this.generateBirthdayEvent(character.id, character.name));
      }
    });

    return birthdayEvents;
  }
}

/**
 * 评论提及分析器
 * 分析评论中的角色提及
 */
export class MentionAnalyzer {
  /**
   * 分析单条评论中的角色提及
   * @param comment 评论内容
   * @param characterNames 角色名称列表
   * @returns 提及的角色 ID 列表
   */
  analyzeComment(comment: string, characterNames: Map<string, string>): string[] {
    const mentionedCharacters: string[] = [];

    characterNames.forEach((name, id) => {
      if (comment.includes(name)) {
        mentionedCharacters.push(id);
      }
    });

    return mentionedCharacters;
  }

  /**
   * 批量分析评论
   * @param comments 评论列表
   * @param characterNames 角色名称映射
   * @returns 提及统计
   */
  batchAnalyze(
    comments: Comment[],
    characterNames: Map<string, string>
  ): Map<string, MentionStats> {
    const stats = new Map<string, MentionStats>();

    comments.forEach(comment => {
      const mentionedIds = this.analyzeComment(comment.content, characterNames);

      mentionedIds.forEach(characterId => {
        if (!stats.has(characterId)) {
          stats.set(characterId, {
            characterId,
            mentionCount: 0,
            positiveMentions: 0,
            negativeMentions: 0,
            neutralMentions: 0
          });
        }

        const charStats = stats.get(characterId)!;
        charStats.mentionCount++;

        if (comment.sentiment === 'positive') {
          charStats.positiveMentions++;
        } else if (comment.sentiment === 'negative') {
          charStats.negativeMentions++;
        } else {
          charStats.neutralMentions++;
        }
      });
    });

    return stats;
  }

  /**
   * 计算人气影响
   * @param stats 提及统计
   * @returns 人气变化值
   */
  calculatePopularityImpact(stats: MentionStats): number {
    const positiveBoost = stats.positiveMentions;
    const negativePenalty = stats.negativeMentions;

    return positiveBoost - negativePenalty;
  }
}

/**
 * CP 热度计算器
 * 计算角色组合的 CP 热度
 */
export class CPHeatCalculator {
  private readonly HEAT_DECAY_RATE = 0.02; // 每日衰减 2%

  /**
   * 检测评论中的 CP 组合
   * @param comment 评论内容
   * @param characterNames 角色名称映射
   * @returns CP 组合列表
   */
  detectCPPairs(comment: string, characterNames: Map<string, string>): Array<[string, string]> {
    const mentionedIds: string[] = [];

    characterNames.forEach((name, id) => {
      if (comment.includes(name)) {
        mentionedIds.push(id);
      }
    });

    const pairs: Array<[string, string]> = [];
    for (let i = 0; i < mentionedIds.length; i++) {
      for (let j = i + 1; j < mentionedIds.length; j++) {
        pairs.push([mentionedIds[i], mentionedIds[j]]);
      }
    }

    return pairs;
  }

  /**
   * 批量计算 CP 热度
   * @param comments 评论列表
   * @param characterNames 角色名称映射
   * @param currentHeat 当前热度
   * @returns 更新后的 CP 热度
   */
  batchCalculate(
    comments: Comment[],
    characterNames: Map<string, string>,
    currentHeat: Map<string, number>
  ): Map<string, CPHeatData> {
    const heatMap = new Map<string, CPHeatData>();

    comments.forEach(comment => {
      const pairs = this.detectCPPairs(comment.content, characterNames);

      pairs.forEach(pair => {
        const key = this.getCPKey(pair[0], pair[1]);
        const oldHeat = currentHeat.get(key) || 50;
        const newHeat = Math.min(100, oldHeat + 1);

        heatMap.set(key, {
          characterId1: pair[0],
          characterId2: pair[1],
          heat: newHeat,
          trend: newHeat > oldHeat ? 'up' : newHeat < oldHeat ? 'down' : 'stable',
          mentionCount: Math.floor(newHeat / 10)
        });
      });
    });

    return heatMap;
  }

  /**
   * 应用每日衰减
   * @param currentHeat 当前热度
   * @returns 衰减后的热度
   */
  applyDecay(currentHeat: number): number {
    const decayed = currentHeat * (1 - this.HEAT_DECAY_RATE);
    return Math.max(0, Math.floor(decayed));
  }

  /**
   * 获取 CP 组合的唯一键
   */
  private getCPKey(id1: string, id2: string): string {
    return [id1, id2].sort().join('_');
  }
}

/**
 * 口碑评分计算器
 * 基于评论生成角色口碑评分
 */
export class ReputationCalculator {
  /**
   * 计算角色口碑评分
   * @param comments 角色评论列表
   * @returns 口碑评分
   */
  calculate(comments: Comment[]): ReputationScore | null {
    if (comments.length === 0) {
      return null;
    }

    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    let totalScore = 0;

    comments.forEach(comment => {
      let rating = comment.rating || this.inferRatingFromSentiment(comment.sentiment);
      distribution[rating as 1 | 2 | 3 | 4 | 5]++;
      totalScore += rating;
    });

    const averageScore = totalScore / comments.length;
    const starRating = Math.round(averageScore * 2) / 2;

    return {
      characterId: comments[0]?.characterId || 'unknown',
      score: Math.max(1, Math.min(5, starRating)),
      reviewCount: comments.length,
      distribution
    };
  }

  /**
   * 从情感推断评分
   */
  private inferRatingFromSentiment(sentiment: 'positive' | 'negative' | 'neutral'): number {
    switch (sentiment) {
      case 'positive':
        return 4 + Math.floor(Math.random() * 2);
      case 'negative':
        return 1 + Math.floor(Math.random() * 2);
      case 'neutral':
        return 3;
    }
  }

  /**
   * 批量计算多个角色的口碑
   * @param commentsByCharacter 按角色分组的评论
   * @returns 口碑评分列表
   */
  batchCalculate(commentsByCharacter: Map<string, Comment[]>): ReputationScore[] {
    const scores: ReputationScore[] = [];

    commentsByCharacter.forEach((comments, characterId) => {
      const result = this.calculate(comments);
      if (result) {
        result.characterId = characterId;
        scores.push(result);
      }
    });

    return scores;
  }

  /**
   * 获取口碑评价描述
   * @param score 评分
   * @returns 评价描述
   */
  getReputationDescription(score: number): string {
    if (score >= 4.5) return '极佳';
    if (score >= 4.0) return '优秀';
    if (score >= 3.5) return '良好';
    if (score >= 3.0) return '一般';
    if (score >= 2.0) return '较差';
    return '极差';
  }
}

// 创建单例实例
const intimacyDecayCalculator = new IntimacyDecayCalculator();
const popularityUpdater = new PopularityUpdater();
const birthdayDetector = new BirthdayDetector();
const mentionAnalyzer = new MentionAnalyzer();
const cpHeatCalculator = new CPHeatCalculator();
const reputationCalculator = new ReputationCalculator();

/**
 * 统一的角色每日更新函数
 * @param context 更新上下文
 * @returns 更新结果
 */
export async function updateCharacterDaily(context: {
  characters: Array<{
    id: string;
    name: string;
    popularity: number;
    intimacy?: number;
    birthday?: string;
    lastInteraction?: number;
  }>;
  comments: Comment[];
  projectData: Record<string, { dailyIncome: number; expectedIncome: number }>;
  currentDate?: Date;
}): Promise<{
  popularityChanges: PopularityChange[];
  birthdayEvents: BirthdayEvent[];
  mentionStats: Map<string, MentionStats>;
  cpHeatData: Map<string, CPHeatData>;
  reputationScores: ReputationScore[];
  intimacyUpdates: Map<string, number>;
}> {
  const { characters, comments, projectData, currentDate = new Date() } = context;

  const characterNames = new Map(characters.map(c => [c.id, c.name]));

  const popularityChanges = popularityUpdater.batchUpdate(characters, projectData);

  const birthdayEvents = birthdayDetector.checkBirthdays(characters, currentDate);

  const mentionStats = mentionAnalyzer.batchAnalyze(comments, characterNames);

  const currentCPHeat = new Map<string, number>();
  const cpHeatData = cpHeatCalculator.batchCalculate(comments, characterNames, currentCPHeat);

  const commentsByCharacter = new Map<string, Comment[]>();
  comments.forEach(comment => {
    if (comment.characterId) {
      if (!commentsByCharacter.has(comment.characterId)) {
        commentsByCharacter.set(comment.characterId, []);
      }
      commentsByCharacter.get(comment.characterId)!.push(comment);
    }
  });
  const reputationScores = reputationCalculator.batchCalculate(commentsByCharacter);

  const intimacyUpdates = new Map<string, number>();
  characters.forEach(character => {
    if (character.intimacy !== undefined) {
      const daysSinceLastInteraction = character.lastInteraction
        ? Math.floor((Date.now() - character.lastInteraction) / (1000 * 60 * 60 * 24))
        : 1;

      const newIntimacy = intimacyDecayCalculator.calculate(
        character.intimacy,
        Math.max(1, daysSinceLastInteraction)
      );
      intimacyUpdates.set(character.id, newIntimacy);
    }
  });

  return {
    popularityChanges,
    birthdayEvents,
    mentionStats,
    cpHeatData,
    reputationScores,
    intimacyUpdates
  };
}

export {
  intimacyDecayCalculator,
  popularityUpdater,
  birthdayDetector,
  mentionAnalyzer,
  cpHeatCalculator,
  reputationCalculator
};
