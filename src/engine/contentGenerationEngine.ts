/**
 * 内容生成引擎
 * 基于游戏状态生成评论、告白、同人等内容
 * 与项目、角色、剧情深度绑定
 * 集成模板系统支持占位符替换
 */

import type { VirtualPlayer } from './simulation/types';
import type { Project, ProjectMetrics } from '@/types/project';
import type { Character } from '@/types/character';

// 导入模板系统
import {
  generateCommentContent,
  type CommentCategory,
  type CommentPlaceholderData,
} from '@/data/templates/commentTemplates';

import {
  generateConfessionContent,
  type CharacterPersonality,
  type ConfessionCategory,
  type ConfessionPlaceholderData,
} from '@/data/templates/confessionTemplates';

import {
  generateFanwork,
  type FanworkType,
  type FanworkQuality,
  type FanworkPlaceholderData,
} from '@/data/templates/fanworkTemplates';

// ==================== 类型定义 ====================

/** 内容类型 */
export type ContentType = 'comment' | 'confession' | 'fanwork';

/** 情感类型 */
export type SentimentType = 'positive' | 'neutral' | 'negative';

/** 告白类型 */
export type ConfessionType = '角色告白' | '剧情告白' | '官方告白' | '退坑告白';

/** 同人类型 - 映射到模板系统 */
export type FanworkContentType = '绘画' | '文稿' | '视频' | 'COS';

/** 同人质量 - 映射到模板系统 */
export type FanworkContentQuality = '优质' | '普通' | '粗糙';

// 映射函数：将引擎类型转换为模板类型
function mapFanworkType(type: FanworkContentType): FanworkType {
  const typeMap: Record<FanworkContentType, FanworkType> = {
    '绘画': 'drawing',
    '文稿': 'writing',
    '视频': 'video',
    'COS': 'cosplay',
  };
  return typeMap[type] || 'drawing';
}

function mapFanworkQuality(quality: FanworkContentQuality): FanworkQuality {
  const qualityMap: Record<FanworkContentQuality, FanworkQuality> = {
    '优质': 'excellent',
    '普通': 'normal',
    '粗糙': 'rough',
  };
  return qualityMap[quality] || 'normal';
}

/** 平台类型 */
export type Platform = 'taptap' | 'appstore' | 'weibo' | 'bilibili' | 'xiaohongshu';

/** 情感分布 */
export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

/** 内容关联信息 */
export interface ContentAssociation {
  projectId?: string;
  projectName?: string;
  characterId?: string;
  characterName?: string;
  plotId?: string;
  plotTitle?: string;
  activityId?: string;
  activityName?: string;
  cpCharacters?: string[]; // CP角色ID列表
}

/** 游戏事件 */
export interface GameEvent {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  timestamp: number;
  impact?: {
    target: string;
    value: number;
  };
}

/** 角色热度信息 */
export interface CharacterHeat {
  characterId: string;
  characterName: string;
  popularity: number; // 人气值 0-100
  intimacy: number; // 亲密度 0-100
  plotPerformance: number; // 剧情表现 0-100
  cpHeat: Map<string, number>; // CP热度
}

/** 剧情热度信息 */
export interface PlotHeat {
  plotId: string;
  plotTitle: string;
  heat: number; // 热度 0-100
  sentiment: SentimentType;
  discussionCount: number;
}

/** 活动热度信息 */
export interface ActivityHeat {
  activityId: string;
  activityName: string;
  heat: number; // 热度 0-100
  type: 'gacha' | 'story' | 'event' | 'collab';
}

/** 生成上下文 */
export interface GenerationContext {
  project: Project;
  metrics: ProjectMetrics;
  characters: CharacterHeat[];
  plots: PlotHeat[];
  activities: ActivityHeat[];
  recentEvents: GameEvent[];
  daySinceLaunch: number;
  playerSatisfaction: number;
}

/** 评论内容 */
export interface GeneratedComment {
  id: string;
  platform: Platform;
  playerId: string;
  content: string;
  rating?: number;
  sentiment: SentimentType;
  relatedTags: string[];
  association: ContentAssociation;
  timestamp: number;
}

/** 告白内容 */
export interface GeneratedConfession {
  id: string;
  playerId: string;
  type: ConfessionType;
  content: string;
  relatedTags: string[];
  sentiment: SentimentType;
  association: ContentAssociation;
  likes: number;
  timestamp: number;
}

/** 同人作品 */
export interface GeneratedFanwork {
  id: string;
  playerId: string;
  type: FanworkContentType;
  quality: FanworkContentQuality;
  title: string;
  content: string;
  relatedCharacters: string[];
  tags: string[];
  association: ContentAssociation;
  likes: number;
  timestamp: number;
}

/** 生成结果 */
export interface GenerationResult {
  comments: GeneratedComment[];
  confessions: GeneratedConfession[];
  fanworks: GeneratedFanwork[];
  statistics: {
    totalGenerated: number;
    sentimentDistribution: SentimentDistribution;
    byType: Record<ContentType, number>;
  };
}

/** 生成配置 */
export interface GenerationConfig {
  // 基础概率配置
  baseCommentProbability: number;
  baseConfessionProbability: number;
  baseFanworkProbability: number;

  // 阈值配置
  confessionPopularityThreshold: number; // 告白人气阈值
  fanworkHeatThreshold: number; // 同人热度阈值

  // 数量限制
  maxCommentsPerDay: number;
  maxConfessionsPerDay: number;
  maxFanworksPerDay: number;

  // 时间衰减配置
  timeDecayFactor: number;
  minProbabilityAfterDecay: number;
}

// ==================== 默认配置 ====================

export const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  baseCommentProbability: 0.1,
  baseConfessionProbability: 0.05,
  baseFanworkProbability: 0.03,

  confessionPopularityThreshold: 20,
  fanworkHeatThreshold: 30,

  maxCommentsPerDay: 100,
  maxConfessionsPerDay: 20,
  maxFanworksPerDay: 10,

  timeDecayFactor: 365, // 365天后衰减到最低
  minProbabilityAfterDecay: 0.3,
};

// ==================== 平台配置 ====================

export const PLATFORM_CONFIG: Record<Platform, {
  ratingRange: [number, number];
  contentLength: [number, number];
  mainUserTypes: string[];
  weight: number;
}> = {
  taptap: {
    ratingRange: [1, 10],
    contentLength: [50, 500],
    mainUserTypes: ['剧情党', '强度党'],
    weight: 0.3,
  },
  appstore: {
    ratingRange: [1, 5],
    contentLength: [10, 100],
    mainUserTypes: ['所有'],
    weight: 0.2,
  },
  weibo: {
    ratingRange: [0, 100],
    contentLength: [10, 200],
    mainUserTypes: ['社交党'],
    weight: 0.2,
  },
  bilibili: {
    ratingRange: [0, 1000000],
    contentLength: [20, 300],
    mainUserTypes: ['XP党'],
    weight: 0.15,
  },
  xiaohongshu: {
    ratingRange: [0, 10000],
    contentLength: [30, 300],
    mainUserTypes: ['颜狗'],
    weight: 0.15,
  },
};

// ==================== 模板占位符替换系统 ====================

/** 占位符数据接口 */
export interface PlaceholderData {
  projectName?: string;
  characterName?: string;
  characterName2?: string;
  plotTitle?: string;
  activityName?: string;
  playerName?: string;
  dayCount?: number;
  rating?: number;
  chapter?: number;
  count?: number;
  price?: number;
  amount?: string;
  scene?: string;
  artistName?: string;
}

/**
 * 通用占位符替换函数
 * 支持 {projectName}、{characterName}、{plotTitle} 等占位符
 */
export function replacePlaceholders(template: string, data: PlaceholderData): string {
  let result = template;

  // 定义占位符映射
  const placeholderMap: Record<string, string | number | undefined> = {
    '{projectName}': data.projectName,
    '{characterName}': data.characterName,
    '{characterName2}': data.characterName2,
    '{plotTitle}': data.plotTitle,
    '{activityName}': data.activityName,
    '{playerName}': data.playerName,
    '{dayCount}': data.dayCount,
    '{rating}': data.rating,
    '{chapter}': data.chapter,
    '{count}': data.count,
    '{price}': data.price,
    '{amount}': data.amount,
    '{scene}': data.scene,
    '{artistName}': data.artistName,
  };

  // 替换所有占位符
  Object.entries(placeholderMap).forEach(([placeholder, value]) => {
    if (value !== undefined) {
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
  });

  // 清理未替换的占位符
  result = result.replace(/\{[a-zA-Z0-9_]+\}/g, '');

  return result.trim();
}

/**
 * 从关联信息构建占位符数据
 */
export function buildPlaceholderData(
  association: ContentAssociation,
  context?: GenerationContext
): PlaceholderData {
  const data: PlaceholderData = {
    projectName: association.projectName,
    characterName: association.characterName,
    plotTitle: association.plotTitle,
    activityName: association.activityName,
  };

  // 如果有上下文，添加更多数据
  if (context) {
    data.dayCount = context.daySinceLaunch;
    data.rating = Math.floor(context.metrics.rating);
  }

  return data;
}

/**
 * 批量替换模板数组中的占位符
 */
export function replacePlaceholdersInTemplates(
  templates: string[],
  data: PlaceholderData
): string[] {
  return templates.map(template => replacePlaceholders(template, data));
}

// ==================== 核心算法 ====================

/**
 * 计算内容生成概率
 * 基于项目质量、角色人气、剧情热度、活动热度、上线天数
 */
export function calculateContentGenerationProbability(
  projectQuality: number,
  characterPopularity: number,
  plotHeat: number,
  activityHeat: number,
  daySinceLaunch: number,
  contentType: ContentType = 'comment'
): number {
  // 基础概率
  const baseProbabilityMap: Record<ContentType, number> = {
    comment: 0.1,
    confession: 0.05,
    fanwork: 0.03,
  };
  const baseProbability = baseProbabilityMap[contentType];

  // 质量加成 (0-0.3)
  const qualityBonus = projectQuality * 0.3;

  // 热度加成 (0-0.4)
  const heatBonus = (characterPopularity + plotHeat + activityHeat) / 300 * 0.4;

  // 时间衰减（上线越久，生成概率越低，趋于稳定）
  const timeDecay = Math.max(0.3, 1 - daySinceLaunch / 365);

  // 计算最终概率
  const probability = (baseProbability + qualityBonus + heatBonus) * timeDecay;

  // 限制最大概率
  return Math.min(0.8, probability);
}

/**
 * 计算情感分布
 * 基于项目质量、玩家满意度、近期事件
 */
export function calculateSentimentDistribution(
  projectQuality: number,
  playerSatisfaction: number,
  recentEvents: GameEvent[]
): SentimentDistribution {
  // 基础分布
  let positive = 0.4;
  let neutral = 0.3;
  let negative = 0.3;

  // 质量影响
  positive += projectQuality * 0.3;
  negative -= projectQuality * 0.2;

  // 满意度影响
  positive += playerSatisfaction * 0.2;
  negative -= playerSatisfaction * 0.15;

  // 近期事件影响
  recentEvents.forEach((event) => {
    if (event.type === 'positive') positive += 0.1;
    if (event.type === 'negative') negative += 0.15;
  });

  // 确保非负
  positive = Math.max(0.05, positive);
  neutral = Math.max(0.05, neutral);
  negative = Math.max(0.05, negative);

  // 归一化
  const total = positive + neutral + negative;
  return {
    positive: positive / total,
    neutral: neutral / total,
    negative: negative / total,
  };
}

/**
 * 根据情感分布随机选择情感类型
 */
export function randomSentiment(distribution: SentimentDistribution): SentimentType {
  const rand = Math.random();
  if (rand < distribution.positive) return 'positive';
  if (rand < distribution.positive + distribution.neutral) return 'neutral';
  return 'negative';
}

/**
 * 计算角色相关内容的生成权重
 */
export function calculateCharacterContentWeight(
  character: CharacterHeat,
  contentType: ContentType
): number {
  const baseWeight = character.popularity / 100;

  switch (contentType) {
    case 'confession':
      // 告白与亲密度强相关
      return baseWeight * (0.3 + character.intimacy / 100 * 0.7);
    case 'fanwork':
      // 同人与剧情表现强相关
      return baseWeight * (0.4 + character.plotPerformance / 100 * 0.6);
    case 'comment':
    default:
      return baseWeight;
  }
}

/**
 * 计算剧情相关内容的生成权重
 */
export function calculatePlotContentWeight(plot: PlotHeat): number {
  return plot.heat / 100;
}

// ==================== 内容关联系统 ====================

/**
 * 内容关联管理器
 * 管理内容与项目/角色/剧情的关联关系
 */
export class ContentAssociationManager {
  private associations: Map<string, ContentAssociation> = new Map();

  /**
   * 创建项目关联
   */
  createProjectAssociation(
    projectId: string,
    projectName: string
  ): ContentAssociation {
    return {
      projectId,
      projectName,
    };
  }

  /**
   * 创建角色关联
   */
  createCharacterAssociation(
    projectId: string,
    projectName: string,
    characterId: string,
    characterName: string
  ): ContentAssociation {
    return {
      projectId,
      projectName,
      characterId,
      characterName,
    };
  }

  /**
   * 创建剧情关联
   */
  createPlotAssociation(
    projectId: string,
    projectName: string,
    plotId: string,
    plotTitle: string
  ): ContentAssociation {
    return {
      projectId,
      projectName,
      plotId,
      plotTitle,
    };
  }

  /**
   * 创建CP关联
   */
  createCPAssociation(
    projectId: string,
    projectName: string,
    characterIds: string[],
    characterNames: string[]
  ): ContentAssociation {
    return {
      projectId,
      projectName,
      characterId: characterIds[0],
      characterName: characterNames[0],
      cpCharacters: characterIds,
    };
  }

  /**
   * 创建活动关联
   */
  createActivityAssociation(
    projectId: string,
    projectName: string,
    activityId: string,
    activityName: string
  ): ContentAssociation {
    return {
      projectId,
      projectName,
      activityId,
      activityName,
    };
  }

  /**
   * 存储关联信息
   */
  storeAssociation(contentId: string, association: ContentAssociation): void {
    this.associations.set(contentId, association);
  }

  /**
   * 获取关联信息
   */
  getAssociation(contentId: string): ContentAssociation | undefined {
    return this.associations.get(contentId);
  }

  /**
   * 根据项目ID获取所有关联内容
   */
  getContentByProject(projectId: string): string[] {
    const result: string[] = [];
    this.associations.forEach((assoc, contentId) => {
      if (assoc.projectId === projectId) {
        result.push(contentId);
      }
    });
    return result;
  }

  /**
   * 根据角色ID获取所有关联内容
   */
  getContentByCharacter(characterId: string): string[] {
    const result: string[] = [];
    this.associations.forEach((assoc, contentId) => {
      if (assoc.characterId === characterId || assoc.cpCharacters?.includes(characterId)) {
        result.push(contentId);
      }
    });
    return result;
  }

  /**
   * 清除所有关联
   */
  clear(): void {
    this.associations.clear();
  }
}

// ==================== 内容生成引擎 ====================

/**
 * 内容生成引擎
 * 核心类，负责生成评论、告白、同人等内容
 */
export class ContentGenerationEngine {
  private config: GenerationConfig;
  private associationManager: ContentAssociationManager;

  constructor(config: Partial<GenerationConfig> = {}) {
    this.config = { ...DEFAULT_GENERATION_CONFIG, ...config };
    this.associationManager = new ContentAssociationManager();
  }

  /**
   * 生成内容
   * 根据上下文生成评论、告白、同人
   */
  generate(context: GenerationContext, players: VirtualPlayer[]): GenerationResult {
    const comments: GeneratedComment[] = [];
    const confessions: GeneratedConfession[] = [];
    const fanworks: GeneratedFanwork[] = [];

    // 计算情感分布
    const sentimentDistribution = calculateSentimentDistribution(
      context.metrics.rating / 10,
      context.playerSatisfaction,
      context.recentEvents
    );

    // 生成评论
    const avgCharacterPopularity =
      context.characters.reduce((sum, c) => sum + c.popularity, 0) /
      (context.characters.length || 1);
    const avgPlotHeat =
      context.plots.reduce((sum, p) => sum + p.heat, 0) / (context.plots.length || 1);
    const avgActivityHeat =
      context.activities.reduce((sum, a) => sum + a.heat, 0) / (context.activities.length || 1);

    const commentProbability = calculateContentGenerationProbability(
      context.metrics.rating / 10,
      avgCharacterPopularity,
      avgPlotHeat,
      avgActivityHeat,
      context.daySinceLaunch,
      'comment'
    );

    // 生成告白
    const confessionProbability = calculateContentGenerationProbability(
      context.metrics.rating / 10,
      avgCharacterPopularity,
      avgPlotHeat,
      avgActivityHeat,
      context.daySinceLaunch,
      'confession'
    );

    // 生成同人
    const fanworkProbability = calculateContentGenerationProbability(
      context.metrics.rating / 10,
      avgCharacterPopularity,
      avgPlotHeat,
      avgActivityHeat,
      context.daySinceLaunch,
      'fanwork'
    );

    // 为每个玩家生成内容
    for (const player of players) {
      // 生成评论
      if (Math.random() < commentProbability && comments.length < this.config.maxCommentsPerDay) {
        const comment = this.generateComment(player, context, sentimentDistribution);
        if (comment) {
          comments.push(comment);
          this.associationManager.storeAssociation(comment.id, comment.association);
        }
      }

      // 生成告白
      if (
        Math.random() < confessionProbability &&
        confessions.length < this.config.maxConfessionsPerDay &&
        avgCharacterPopularity >= this.config.confessionPopularityThreshold
      ) {
        const confession = this.generateConfession(player, context, sentimentDistribution);
        if (confession) {
          confessions.push(confession);
          this.associationManager.storeAssociation(confession.id, confession.association);
        }
      }

      // 生成同人
      if (
        Math.random() < fanworkProbability &&
        fanworks.length < this.config.maxFanworksPerDay &&
        (avgCharacterPopularity >= this.config.fanworkHeatThreshold ||
          avgPlotHeat >= this.config.fanworkHeatThreshold)
      ) {
        const fanwork = this.generateFanwork(player, context);
        if (fanwork) {
          fanworks.push(fanwork);
          this.associationManager.storeAssociation(fanwork.id, fanwork.association);
        }
      }
    }

    // 计算统计信息
    const totalGenerated = comments.length + confessions.length + fanworks.length;
    const actualSentimentDistribution = this.calculateActualSentimentDistribution([
      ...comments,
      ...confessions,
      ...fanworks,
    ]);

    return {
      comments,
      confessions,
      fanworks,
      statistics: {
        totalGenerated,
        sentimentDistribution: actualSentimentDistribution,
        byType: {
          comment: comments.length,
          confession: confessions.length,
          fanwork: fanworks.length,
        },
      },
    };
  }

  /**
   * 生成单条评论
   */
  private generateComment(
    player: VirtualPlayer,
    context: GenerationContext,
    sentimentDistribution: SentimentDistribution
  ): GeneratedComment | null {
    const sentiment = randomSentiment(sentimentDistribution);
    const platform = this.assignPlatform(player);
    const association = this.selectCommentAssociation(context);

    const content = this.generateCommentContent(sentiment, platform, association, context);
    const rating = this.generateRating(sentiment, platform);

    return {
      id: this.generateId('comment'),
      platform,
      playerId: player.id,
      content,
      rating,
      sentiment,
      relatedTags: this.extractTags(association),
      association,
      timestamp: Date.now(),
    };
  }

  /**
   * 生成告白
   */
  private generateConfession(
    player: VirtualPlayer,
    context: GenerationContext,
    sentimentDistribution: SentimentDistribution
  ): GeneratedConfession | null {
    const type = this.assignConfessionType(player, sentimentDistribution);
    const sentiment = type === '退坑告白' ? 'negative' : randomSentiment(sentimentDistribution);
    const association = this.selectConfessionAssociation(context, type);

    const content = this.generateConfessionContent(type, association, player);
    const likes = this.calculateLikes(player);

    return {
      id: this.generateId('confession'),
      playerId: player.id,
      type,
      content,
      relatedTags: this.extractTags(association),
      sentiment,
      association,
      likes,
      timestamp: Date.now(),
    };
  }

  /**
   * 生成同人作品
   */
  private generateFanwork(
    player: VirtualPlayer,
    context: GenerationContext
  ): GeneratedFanwork | null {
    const type = this.assignFanworkType();
    const quality = this.calculateFanworkQuality(player);
    const association = this.selectFanworkAssociation(context);

    const title = this.generateFanworkTitle(type, association);
    const content = this.generateFanworkContent(type, quality, association);
    const likes = this.calculateFanworkLikes(quality, type);

    return {
      id: this.generateId('fanwork'),
      playerId: player.id,
      type,
      quality,
      title,
      content,
      relatedCharacters: this.extractCharacterIds(association),
      tags: this.extractTags(association),
      association,
      likes,
      timestamp: Date.now(),
    };
  }

  /**
   * 分配平台
   */
  private assignPlatform(player: VirtualPlayer): Platform {
    const platforms: Platform[] = ['taptap', 'appstore', 'weibo', 'bilibili', 'xiaohongshu'];
    const weights: number[] = platforms.map((p) => PLATFORM_CONFIG[p].weight);

    const playStyleToPlatform: Record<string, Platform> = {
      剧情党: 'taptap',
      强度党: 'taptap',
      XP党: 'bilibili',
      社交党: 'weibo',
      咸鱼党: 'appstore',
    };

    if (Math.random() < 0.4) {
      return playStyleToPlatform[player.playStyle] || 'taptap';
    }

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < platforms.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return platforms[i];
      }
    }

    return 'taptap';
  }

  /**
   * 分配告白类型
   */
  private assignConfessionType(
    player: VirtualPlayer,
    sentimentDistribution: SentimentDistribution
  ): ConfessionType {
    if (player.state === 'LOST' || player.state === 'AT_RISK') {
      return '退坑告白';
    }

    if (player.satisfaction > 0.8 && Math.random() < 0.08) {
      return '官方告白';
    }

    const rand = Math.random();
    if (rand < 0.7) return '角色告白';
    if (rand < 0.9) return '剧情告白';
    return '官方告白';
  }

  /**
   * 分配同人类型
   */
  private assignFanworkType(): FanworkContentType {
    const rand = Math.random();
    if (rand < 0.4) return '绘画';
    if (rand < 0.75) return '文稿';
    if (rand < 0.9) return '视频';
    return 'COS';
  }

  /**
   * 计算同人质量
   */
  private calculateFanworkQuality(player: VirtualPlayer): FanworkContentQuality {
    const baseQuality = player.loyalty * player.activityLevel;
    const rand = Math.random();

    if (baseQuality > 0.7 && rand < 0.3) return '优质';
    if (baseQuality > 0.4 || rand < 0.6) return '普通';
    return '粗糙';
  }

  /**
   * 选择评论关联
   */
  private selectCommentAssociation(context: GenerationContext): ContentAssociation {
    const rand = Math.random();

    if (rand < 0.4 && context.characters.length > 0) {
      // 角色相关
      const character = this.weightedRandom(context.characters, (c) => c.popularity);
      return this.associationManager.createCharacterAssociation(
        context.project.id,
        context.project.name,
        character.characterId,
        character.characterName
      );
    } else if (rand < 0.7 && context.plots.length > 0) {
      // 剧情相关
      const plot = this.weightedRandom(context.plots, (p) => p.heat);
      return this.associationManager.createPlotAssociation(
        context.project.id,
        context.project.name,
        plot.plotId,
        plot.plotTitle
      );
    } else if (rand < 0.85 && context.activities.length > 0) {
      // 活动相关
      const activity = this.weightedRandom(context.activities, (a) => a.heat);
      return this.associationManager.createActivityAssociation(
        context.project.id,
        context.project.name,
        activity.activityId,
        activity.activityName
      );
    } else {
      // 项目整体
      return this.associationManager.createProjectAssociation(context.project.id, context.project.name);
    }
  }

  /**
   * 选择告白关联
   */
  private selectConfessionAssociation(
    context: GenerationContext,
    type: ConfessionType
  ): ContentAssociation {
    if (type === '剧情告白' && context.plots.length > 0) {
      const plot = this.weightedRandom(context.plots, (p) => p.heat);
      return this.associationManager.createPlotAssociation(
        context.project.id,
        context.project.name,
        plot.plotId,
        plot.plotTitle
      );
    } else if (type === '官方告白') {
      return this.associationManager.createProjectAssociation(context.project.id, context.project.name);
    } else if (context.characters.length > 0) {
      // 角色告白或退坑告白
      const character = this.weightedRandom(context.characters, (c) =>
        calculateCharacterContentWeight(c, 'confession')
      );
      return this.associationManager.createCharacterAssociation(
        context.project.id,
        context.project.name,
        character.characterId,
        character.characterName
      );
    }

    return this.associationManager.createProjectAssociation(context.project.id, context.project.name);
  }

  /**
   * 选择同人关联
   */
  private selectFanworkAssociation(context: GenerationContext): ContentAssociation {
    const rand = Math.random();

    // 检查是否有高热度CP
    const hotCPs: { characters: CharacterHeat[]; heat: number }[] = [];
    for (const char of context.characters) {
      char.cpHeat.forEach((heat, otherId) => {
        if (heat > 50) {
          const otherChar = context.characters.find((c) => c.characterId === otherId);
          if (otherChar) {
            hotCPs.push({
              characters: [char, otherChar],
              heat,
            });
          }
        }
      });
    }

    if (rand < 0.3 && hotCPs.length > 0) {
      // CP相关
      const cp = this.weightedRandom(hotCPs, (c) => c.heat);
      return this.associationManager.createCPAssociation(
        context.project.id,
        context.project.name,
        cp.characters.map((c) => c.characterId),
        cp.characters.map((c) => c.characterName)
      );
    } else if (rand < 0.6 && context.characters.length > 0) {
      // 角色相关
      const character = this.weightedRandom(context.characters, (c) =>
        calculateCharacterContentWeight(c, 'fanwork')
      );
      return this.associationManager.createCharacterAssociation(
        context.project.id,
        context.project.name,
        character.characterId,
        character.characterName
      );
    } else if (context.plots.length > 0) {
      // 剧情相关
      const plot = this.weightedRandom(context.plots, (p) => p.heat);
      return this.associationManager.createPlotAssociation(
        context.project.id,
        context.project.name,
        plot.plotId,
        plot.plotTitle
      );
    }

    return this.associationManager.createProjectAssociation(context.project.id, context.project.name);
  }

  /**
   * 生成评论内容
   * 使用模板系统生成内容
   */
  private generateCommentContent(
    sentiment: SentimentType,
    platform: Platform,
    association: ContentAssociation,
    context: GenerationContext
  ): string {
    // 确定评论分类
    let category: CommentCategory = 'project';
    if (association.characterId) category = 'character';
    else if (association.plotId) category = 'plot';
    else if (association.activityId) category = 'activity';

    // 构建占位符数据
    const placeholderData: CommentPlaceholderData = {
      projectName: association.projectName,
      characterName: association.characterName,
      plotTitle: association.plotTitle,
      activityName: association.activityName,
      rating: Math.floor(context.metrics.rating),
      chapter: Math.floor(Math.random() * 10) + 1,
      count: Math.floor(Math.random() * 100) + 50,
      price: Math.floor(Math.random() * 100) + 100,
      amount: `${Math.floor(Math.random() * 10) + 1}万`,
    };

    // 使用模板系统生成评论
    return generateCommentContent(category, sentiment, platform, placeholderData);
  }

  /**
   * 生成告白内容
   * 使用模板系统生成内容
   */
  private generateConfessionContent(
    type: ConfessionType,
    association: ContentAssociation,
    player: VirtualPlayer
  ): string {
    // 映射告白类型到模板分类
    const categoryMap: Record<ConfessionType, ConfessionCategory> = {
      '角色告白': 'character',
      '剧情告白': 'plot',
      '官方告白': 'official',
      '退坑告白': 'quit',
    };

    // 根据玩家状态确定情感
    let sentiment: SentimentType = 'positive';
    if (type === '退坑告白') sentiment = 'negative';
    else if (player.satisfaction < 0.5) sentiment = 'neutral';

    // 确定角色性格（这里使用默认值，实际应从角色数据获取）
    const personality: CharacterPersonality = 'gentle';

    // 构建占位符数据
    const placeholderData: ConfessionPlaceholderData = {
      projectName: association.projectName,
      characterName: association.characterName,
      plotTitle: association.plotTitle,
      playerName: player.id,
      dayCount: Math.floor(Math.random() * 365) + 1,
    };

    // 使用模板系统生成告白
    return generateConfessionContent(
      personality,
      categoryMap[type],
      sentiment,
      placeholderData
    );
  }

  /**
   * 生成同人标题
   * 使用模板系统生成内容
   */
  private generateFanworkTitle(type: FanworkContentType, association: ContentAssociation): string {
    // 构建占位符数据
    const placeholderData: FanworkPlaceholderData = {
      projectName: association.projectName,
      characterName: association.characterName,
      characterName2: association.cpCharacters?.[1],
      plotTitle: association.plotTitle,
    };

    // 使用模板系统生成标题
    const fanwork = generateFanwork(
      mapFanworkType(type),
      'normal', // 默认使用普通质量
      placeholderData
    );

    return fanwork.title;
  }

  /**
   * 生成同人内容
   * 使用模板系统生成内容
   */
  private generateFanworkContent(
    type: FanworkContentType,
    quality: FanworkContentQuality,
    association: ContentAssociation
  ): string {
    // 构建占位符数据
    const placeholderData: FanworkPlaceholderData = {
      projectName: association.projectName,
      characterName: association.characterName,
      characterName2: association.cpCharacters?.[1],
      plotTitle: association.plotTitle,
      chapter: Math.floor(Math.random() * 10) + 1,
      scene: '经典场景',
    };

    // 使用模板系统生成内容
    const fanwork = generateFanwork(
      mapFanworkType(type),
      mapFanworkQuality(quality),
      placeholderData
    );

    return fanwork.content;
  }

  /**
   * 生成评分
   */
  private generateRating(sentiment: SentimentType, platform: Platform): number {
    const config = PLATFORM_CONFIG[platform];
    const [min, max] = config.ratingRange;

    if (sentiment === 'positive') {
      const highRange = min + (max - min) * 0.7;
      return Math.floor(highRange + Math.random() * (max - highRange));
    } else if (sentiment === 'negative') {
      const lowRange = min + (max - min) * 0.3;
      return Math.floor(min + Math.random() * (lowRange - min));
    } else {
      const midMin = min + (max - min) * 0.3;
      const midMax = min + (max - min) * 0.7;
      return Math.floor(midMin + Math.random() * (midMax - midMin));
    }
  }

  /**
   * 计算点赞数
   */
  private calculateLikes(player: VirtualPlayer): number {
    const baseLikes = 5;
    const activityBonus = player.activityLevel * 10;
    const loyaltyBonus = player.loyalty * 15;
    return Math.floor(baseLikes + activityBonus + loyaltyBonus + Math.random() * 20);
  }

  /**
   * 计算同人点赞数
   */
  private calculateFanworkLikes(quality: FanworkQuality, type: FanworkType): number {
    const baseLikes: Record<FanworkQuality, number> = {
      excellent: 50,
      normal: 20,
      rough: 5,
    };

    const typeBonus: Record<FanworkType, number> = {
      drawing: 1.2,
      writing: 1.0,
      video: 1.5,
      cosplay: 1.3,
    };

    return Math.floor(baseLikes[quality] * typeBonus[type] * (0.5 + Math.random()));
  }

  /**
   * 提取标签
   */
  private extractTags(association: ContentAssociation): string[] {
    const tags: string[] = [];
    if (association.characterName) tags.push(association.characterName);
    if (association.plotTitle) tags.push(association.plotTitle);
    if (association.activityName) tags.push(association.activityName);
    if (association.projectName) tags.push(association.projectName);
    return tags;
  }

  /**
   * 提取角色ID列表
   */
  private extractCharacterIds(association: ContentAssociation): string[] {
    const ids: string[] = [];
    if (association.characterId) ids.push(association.characterId);
    if (association.cpCharacters) ids.push(...association.cpCharacters);
    return [...new Set(ids)];
  }

  /**
   * 加权随机选择
   */
  private weightedRandom<T>(items: T[], weightFn: (item: T) => number): T {
    const weights = items.map(weightFn);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }

  /**
   * 生成唯一ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 计算实际情感分布
   */
  private calculateActualSentimentDistribution(
    items: Array<{ sentiment: SentimentType }>
  ): SentimentDistribution {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    items.forEach((item) => {
      counts[item.sentiment]++;
    });

    const total = items.length || 1;
    return {
      positive: counts.positive / total,
      neutral: counts.neutral / total,
      negative: counts.negative / total,
    };
  }

  /**
   * 获取关联管理器
   */
  getAssociationManager(): ContentAssociationManager {
    return this.associationManager;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<GenerationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): GenerationConfig {
    return { ...this.config };
  }
}

// ==================== 模板系统导出 ====================

/**
 * 模板系统导出
 * 提供统一的模板生成接口
 */
export {
  // 评论模板
  generateCommentContent,
  type CommentCategory,
  type CommentPlaceholderData,
} from '@/data/templates/commentTemplates';

export {
  // 告白模板
  generateConfessionContent,
  type CharacterPersonality,
  type ConfessionCategory,
  type ConfessionPlaceholderData,
} from '@/data/templates/confessionTemplates';

export {
  // 同人模板
  generateFanwork,
  type FanworkType,
  type FanworkQuality,
  type FanworkPlaceholderData,
} from '@/data/templates/fanworkTemplates';

// ==================== 导出单例 ====================

export const contentGenerationEngine = new ContentGenerationEngine();
export const contentAssociationManager = new ContentAssociationManager();

export default contentGenerationEngine;
