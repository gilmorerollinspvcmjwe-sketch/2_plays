/**
 * 评论系统 Store
 * 管理玩家评论的生成、展示和交互
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { CommentType, CommentSentiment, PlayerType, CommentTemplate } from '@/types/template';
import { generateComment, generateComments, getRandomPlayerType, getRandomCommentType } from '@/data/templates/comments';
import { getRandomLossComment, getRandomReturnComment } from '@/data/templates/lossReturnComments';
import { generatePlatformComment, getPlatformName } from '@/data/templates/platformComments';
import { 
  getRandomQuitComment, 
  getRandomReturnComment as getNewReturnComment, 
  getRandomRecommendationComment,
  getRandomPlatform,
  type CommentType as PlayerStateCommentType
} from '@/data/commentTemplates';
import type { Player } from './playerStore';
import { useSimulationStore } from './simulationStore';
import { useProjectStore } from './projectStore';
import { useGameStore } from './gameStore';
import { usePointsStore } from './points';
import { contentGenerationEngine, type ContentAssociation, type SentimentType } from '@/engine/contentGenerationEngine';
import type { GenerationContext, CharacterHeat, PlotHeat, ActivityHeat, GameEvent } from '@/engine/contentGenerationEngine';
import type { VirtualPlayer } from '@/engine/simulation/types';

// 平台类型
export type PlatformType = 'douyin' | 'xiaohongshu' | 'weibo' | 'bilibili' | 'tieba';

// 游戏评论接口（包含互动数据）
export interface GameComment extends CommentTemplate {
  likes: number;
  shares: number;
  comments: number;
  heat: number;
  createdAt: string;
  isLiked?: boolean;
  isShared?: boolean;
  isReplied?: boolean;
  platform?: PlatformType;
  // 关联字段
  projectId?: string;
  projectName?: string;
  characterId?: string;
  characterName?: string;
  plotId?: string;
  plotTitle?: string;
  activityId?: string;
  activityName?: string;
}

// 舆情数据
export interface PublicOpinion {
  heat: number;        // 热度 0-100
  sentiment: number;   // 情感 -100 到 100
  trend: 'up' | 'down' | 'stable';
  triggers: string[];  // 触发事件
}

// 节奏事件
export interface RhythmEvent {
  id: string;
  type: 'small' | 'large' | 'fire';  // 小节奏/大节奏/炎上
  heat: number;
  reputationImpact: number;  // 声誉影响
  duration: number;          // 持续时间（小时）
  createdAt: string;
  resolved: boolean;
}

// 舆情统计
export interface SentimentStats {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  satisfaction: number;
  hotTags: { tag: string; count: number }[];
}

// 筛选选项
export interface CommentFilter {
  type?: CommentType | 'all';
  sentiment?: CommentSentiment | 'all';
  playerType?: PlayerType | 'all';
}

// 生成参数
export interface GenerateParams {
  playerType: PlayerType;
  commentType: CommentType;
  count: number;
  platform?: PlatformType;
}

// 角色提及统计
export interface CharacterMentionStats {
  characterId: string;
  characterName: string;
  mentionCount: number;
  positiveMentions: number;
  negativeMentions: number;
  neutralMentions: number;
  sentimentScore: number; // -100 到 100
}

// CP 热度数据
export interface CharacterCPHeat {
  characterId1: string;
  characterName1: string;
  characterId2: string;
  characterName2: string;
  heat: number;
  mentionCount: number;
  trend: 'up' | 'down' | 'stable';
}

// 角色口碑数据
export interface CharacterReputationData {
  characterId: string;
  characterName: string;
  averageRating: number; // 1-5
  totalComments: number;
  positiveRate: number; // 0-100
  distribution: {
    excellent: number; // 5 星
    good: number;      // 4 星
    average: number;   // 3 星
    poor: number;      // 2 星
    terrible: number;  // 1 星
  };
}

export const useCommentStore = defineStore('comment', () => {
  // 引入 simulationStore
  const simulationStore = useSimulationStore();
  const pointsStore = usePointsStore();
  
  // State - store 延迟初始化
  const comments = ref<GameComment[]>([]);
  const rhythmEvents = ref<RhythmEvent[]>([]);
  
  // 舆情数据和情感统计使用可写 ref，避免对 computed 赋值导致运行时错误
  const publicOpinion = ref<PublicOpinion>(createPublicOpinionFromSimulation());
  const sentimentStats = ref<SentimentStats>(createSentimentStatsFromSimulation());
  
  const isGenerating = ref(false);
  const lastGeneratedAt = ref<string | null>(null);
  
  // 监听 simulationStore 的评论变化，同步到本地
  watch(() => simulationStore.platformComments, (newPlatformComments) => {
    if (!newPlatformComments || newPlatformComments.length === 0) return;
    
    // 将平台评论转换为 GameComment 格式
    const newComments: GameComment[] = [];
    newPlatformComments.forEach(platform => {
      platform.comments.forEach(comment => {
        const gameComment: GameComment = {
          id: comment.id,
          content: comment.content,
          type: 'game',
          sentiment: comment.sentiment,
          playerType: 'casual',
          platform: mapPlatformToUI(platform.platform),
          tags: comment.tags,
          likes: comment.likes,
          shares: Math.floor(comment.likes * 0.3),
          comments: Math.floor(comment.likes * 0.1),
          heat: comment.likes * 2,
          createdAt: new Date(comment.timestamp).toISOString(),
          isLiked: false
        };
        newComments.push(gameComment);
      });
    });
    
    // 合并新评论（去重）
    const existingIds = new Set(comments.value.map(c => c.id));
    const uniqueNewComments = newComments.filter(c => !existingIds.has(c.id));
    
    if (uniqueNewComments.length > 0) {
      comments.value.unshift(...uniqueNewComments);
      updateSentimentStats();
      updatePublicOpinion();
    }
  }, { deep: true });

  watch(
    () => [simulationStore.commentMetrics, simulationStore.platformStatistics],
    () => {
      if (comments.value.length === 0) {
        publicOpinion.value = createPublicOpinionFromSimulation();
        sentimentStats.value = createSentimentStatsFromSimulation();
      }
    },
    { deep: true, immediate: true }
  );
  
  // 平台映射函数
  function mapPlatformToUI(platform: string): PlatformType {
    const mapping: Record<string, PlatformType> = {
      '抖音': 'douyin',
      '小红书': 'xiaohongshu',
      '微博': 'weibo',
      'B站': 'bilibili',
      '贴吧': 'tieba'
    };
    return mapping[platform] || 'weibo';
  }

  function createPublicOpinionFromSimulation(): PublicOpinion {
    const sentiment = simulationStore.commentMetrics?.sentiment || 0;
    return {
      heat: simulationStore.commentMetrics?.heat || 0,
      sentiment,
      trend: sentiment > 10 ? 'up' : sentiment < -10 ? 'down' : 'stable',
      triggers: simulationStore.platformStatistics
        ? Object.entries(simulationStore.platformStatistics.sentimentDistribution)
            .filter(([_, count]) => count > 0)
            .map(([sentimentKey]) => sentimentKey)
        : []
    };
  }

  function createSentimentStatsFromSimulation(): SentimentStats {
    const stats = simulationStore.platformStatistics;
    return {
      total: stats?.totalComments || 0,
      positive: stats?.sentimentDistribution.positive || 0,
      negative: stats?.sentimentDistribution.negative || 0,
      neutral: stats?.sentimentDistribution.neutral || 0,
      satisfaction: 85 + (simulationStore.commentMetrics?.sentiment || 0) * 0.15,
      hotTags: []
    };
  }
  
  // Getters
  const filteredComments = computed(() => {
    return (filter: CommentFilter) => {
      let result = comments.value;
      
      if (filter.type && filter.type !== 'all') {
        result = result.filter(c => c.type === filter.type);
      }
      
      if (filter.sentiment && filter.sentiment !== 'all') {
        result = result.filter(c => c.sentiment === filter.sentiment);
      }
      
      if (filter.playerType && filter.playerType !== 'all') {
        result = result.filter(c => c.playerType === filter.playerType);
      }
      
      return result;
    };
  });
  
  const commentsByType = computed(() => {
    return (type: CommentType) => comments.value.filter(c => c.type === type);
  });
  
  const commentsBySentiment = computed(() => {
    return (sentiment: CommentSentiment) => comments.value.filter(c => c.sentiment === sentiment);
  });
  
  // Actions
  
  /**
   * 生成退坑评论（玩家流失时自动触发）
   */
  function generateLossComment(player: Player): void {
    const template = getRandomLossComment();
    const platforms = ['weibo', 'douyin', 'tieba'] as const;
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    
    const comment: GameComment = {
      id: `loss_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: template.content,
      type: 'game',
      sentiment: 'negative',
      playerType: 'casual',
      platform: platform as any,
      tags: template.tags,
      likes: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 20),
      comments: Math.floor(Math.random() * 10),
      heat: 0,
      createdAt: new Date().toISOString(),
      isLiked: false
    };
    
    // 计算热度
    comment.heat = calculateCommentHeat(comment);
    
    // 添加到评论列表
    comments.value.unshift(comment);
    
    // 更新舆情
    updatePublicOpinion();
    saveToLocal();
  }
  
  /**
   * 生成真香评论（玩家回归时自动触发）
   */
  function generateReturnComment(player: Player): void {
    const template = getRandomReturnComment();
    const platforms = ['weibo', 'douyin'] as const;
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    
    const comment: GameComment = {
      id: `return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: template.content,
      type: 'game',
      sentiment: 'positive',
      playerType: 'casual',
      platform: platform as any,
      tags: template.tags,
      likes: Math.floor(Math.random() * 100) + 50,
      shares: Math.floor(Math.random() * 30) + 10,
      comments: Math.floor(Math.random() * 20) + 5,
      heat: 0,
      createdAt: new Date().toISOString(),
      isLiked: false
    };
    
    // 计算热度
    comment.heat = calculateCommentHeat(comment);
    
    // 添加到评论列表
    comments.value.unshift(comment);
    
    // 更新舆情
    updatePublicOpinion();
    saveToLocal();
  }

  /**
   * 生成退坑评论（玩家流失时触发）- 1-3条
   * @param playerId 玩家ID
   */
  function generateQuitComments(playerId: string): void {
    const count = Math.floor(Math.random() * 3) + 1; // 1-3条
    
    for (let i = 0; i < count; i++) {
      const template = getRandomQuitComment();
      const platform = getRandomPlatform();
      
      const comment: GameComment = {
        id: `quit_${playerId}_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        content: template.content,
        type: 'roast',
        sentiment: 'negative',
        playerType: '休闲玩家',
        platform: platform as any,
        tags: template.tags,
        likes: Math.floor(Math.random() * 50),
        shares: Math.floor(Math.random() * 20),
        comments: Math.floor(Math.random() * 10),
        heat: 0,
        createdAt: new Date().toISOString(),
        isLiked: false
      };
      
      // 计算热度
      comment.heat = calculateCommentHeat(comment);
      comments.value.unshift(comment);
    }
    
    // 更新舆情
    updatePublicOpinion();
    saveToLocal();
  }

  /**
   * 生成真香评论（玩家回归时触发）- 1-2条
   * @param playerId 玩家ID
   */
  function generateReturnComments(playerId: string): void {
    const count = Math.floor(Math.random() * 2) + 1; // 1-2条
    
    for (let i = 0; i < count; i++) {
      const template = getNewReturnComment();
      const platform = getRandomPlatform();
      
      const comment: GameComment = {
        id: `return_${playerId}_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        content: template.content,
        type: 'recommend',
        sentiment: 'positive',
        playerType: '休闲玩家',
        platform: platform as any,
        tags: template.tags,
        likes: Math.floor(Math.random() * 100) + 50,
        shares: Math.floor(Math.random() * 30) + 10,
        comments: Math.floor(Math.random() * 20) + 5,
        heat: 0,
        createdAt: new Date().toISOString(),
        isLiked: false
      };
      
      // 计算热度
      comment.heat = calculateCommentHeat(comment);
      comments.value.unshift(comment);
    }
    
    // 更新舆情
    updatePublicOpinion();
    saveToLocal();
  }

  /**
   * 生成安利评论（付费玩家30%概率触发）
   * @param playerId 玩家ID
   */
  function generateRecommendationComments(playerId: string): void {
    const template = getRandomRecommendationComment();
    const platform = getRandomPlatform();
    
    const comment: GameComment = {
      id: `recommend_${playerId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: template.content,
      type: 'recommend',
      sentiment: 'positive',
      playerType: '氪金大佬',
      platform: platform as any,
      tags: template.tags,
      likes: Math.floor(Math.random() * 200) + 100,
      shares: Math.floor(Math.random() * 50) + 20,
      comments: Math.floor(Math.random() * 30) + 10,
      heat: 0,
      createdAt: new Date().toISOString(),
      isLiked: false
    };
    
    // 计算热度
    comment.heat = calculateCommentHeat(comment);
    comments.value.unshift(comment);
    
    // 更新舆情
    updatePublicOpinion();
    saveToLocal();
  }
  
  /**
   * 基于模拟数据计算情感分布
   * 使用 contentGenerationEngine 的算法
   */
  function calculateSentimentDistributionFromSimulation(): { positive: number; neutral: number; negative: number } {
    const stats = simulationStore.platformStatistics;
    if (!stats) {
      // 没有模拟数据时返回默认分布
      return { positive: 0.4, neutral: 0.3, negative: 0.3 };
    }

    const total = stats.sentimentDistribution.positive + stats.sentimentDistribution.neutral + stats.sentimentDistribution.negative;
    if (total === 0) {
      return { positive: 0.4, neutral: 0.3, negative: 0.3 };
    }

    return {
      positive: stats.sentimentDistribution.positive / total,
      neutral: stats.sentimentDistribution.neutral / total,
      negative: stats.sentimentDistribution.negative / total,
    };
  }

  /**
   * 根据模拟数据决定情感倾向
   * 基于当前舆情统计计算
   */
  function determineSentimentBySimulation(): CommentSentiment {
    const distribution = calculateSentimentDistributionFromSimulation();

    const rand = Math.random();
    if (rand < distribution.positive) return 'positive';
    if (rand < distribution.positive + distribution.neutral) return 'neutral';
    return 'negative';
  }

  /**
   * 获取当前情感比例统计
   */
  function getSentimentDistributionStats() {
    const distribution = calculateSentimentDistributionFromSimulation();
    return {
      positive: Math.round(distribution.positive * 100),
      neutral: Math.round(distribution.neutral * 100),
      negative: Math.round(distribution.negative * 100),
    };
  }

  /**
   * 生成评论
   * 接入 contentGenerationEngine，基于模拟数据生成真实评论
   */
  async function generateNewComments(params: GenerateParams): Promise<{ success: boolean; message: string; comments?: GameComment[] }> {
    isGenerating.value = true;
    
    try {
      // 从 simulationStore 获取模拟数据构建 GenerationContext
      const context = buildGenerationContext();
      
      if (!context) {
        isGenerating.value = false;
        return { success: false, message: '暂无模拟数据，请先上线项目' };
      }
      
      // 创建虚拟玩家列表用于生成评论
      const players = createVirtualPlayersForGeneration(params.count, params.playerType);
      
      // 使用 contentGenerationEngine 生成评论
      const result = contentGenerationEngine.generate(context, players);
      
      // 将生成的评论转换为 GameComment 格式
      const newComments: GameComment[] = result.comments.map(generatedComment => {
        const association = generatedComment.association;
        const platform = mapEnginePlatformToUI(generatedComment.platform);
        
        return {
          id: generatedComment.id,
          content: generatedComment.content,
          type: params.commentType || getRandomCommentType(),
          sentiment: generatedComment.sentiment as CommentSentiment,
          playerType: params.playerType || getRandomPlayerType(),
          tags: generatedComment.relatedTags,
          platform: platform,
          likes: Math.floor(Math.random() * 100) + 10,
          shares: Math.floor(Math.random() * 30),
          comments: Math.floor(Math.random() * 20),
          heat: 0,
          createdAt: new Date(generatedComment.timestamp).toISOString(),
          isLiked: false,
          // 关联字段
          projectId: association.projectId,
          projectName: association.projectName,
          characterId: association.characterId,
          characterName: association.characterName,
          plotId: association.plotId,
          plotTitle: association.plotTitle,
          activityId: association.activityId,
          activityName: association.activityName,
        };
      });
      
      // 计算热度
      newComments.forEach(comment => {
        comment.heat = calculateCommentHeat(comment);
      });
      
      // 添加到列表
      comments.value.unshift(...newComments);
      
      // 分析评论中的角色提及并更新人气
    const currentGameStore = useGameStore();
    currentGameStore.analyzeCommentMentions(newComments.map(c => ({
        content: c.content,
        sentiment: c.sentiment
      })));
      
      // 更新统计
      updateSentimentStats();
      
      // 保存到本地
      saveToLocal();
      
      lastGeneratedAt.value = new Date().toISOString();
      isGenerating.value = false;
      
      return { 
        success: true, 
        message: `成功生成${newComments.length}条评论`, 
        comments: newComments 
      };
    } catch (error) {
      console.error('生成评论失败:', error);
      isGenerating.value = false;
      return { success: false, message: '生成评论失败，请重试' };
    }
  }
  
  /**
   * 构建生成上下文
   * 从 simulationStore 获取数据构建 GenerationContext
   */
  function buildGenerationContext(): GenerationContext | null {
    const stats = simulationStore.platformStatistics;
    if (!stats) return null;

    // 获取项目信息
    const projectStore = useProjectStore();
    const currentProject = projectStore.currentProject;

    if (!currentProject) return null;

    // 获取游戏数据
    const gameStore = useGameStore();

    // 构建角色热度信息
    const characters: CharacterHeat[] = [];
    const currentGame = gameStore.currentGame;
    if (!currentGame) return null;

    currentGame.characters.forEach(char => {
      characters.push({
        characterId: char.id,
        characterName: char.name,
        popularity: char.popularity?.popularity || 50,
        intimacy: char.intimacy?.level ? (char.intimacy.level / 10) * 100 : 50,
        plotPerformance: char.popularity?.discussionHeat || 50,
        cpHeat: new Map(Object.entries(char.popularity?.cpHeat || {})),
      });
    });

    // 构建剧情热度信息
    const plots: PlotHeat[] = [];
    currentGame.plots.forEach(plot => {
      plots.push({
        plotId: plot.id,
        plotTitle: plot.title,
        heat: 50, // 默认热度
        sentiment: 'neutral',
        discussionCount: 0,
      });
    });

    // 构建活动热度信息 - 从项目数据中获取
    const activities: ActivityHeat[] = [];
    // 如果有运营中的活动，可以在这里添加

    // 构建游戏事件
    const recentEvents: GameEvent[] = [];

    return {
      project: currentProject,
      metrics: {
        rating: currentProject.metrics?.rating || 7,
        downloads: currentProject.metrics?.totalPlayers || 0,
        revenue: currentProject.metrics?.totalRevenue || 0,
        dau: currentProject.metrics?.dau || 0,
        mau: currentProject.metrics?.mau || 0,
        retention: currentProject.metrics?.retention || { day1: 0, day7: 0, day30: 0 },
      },
      characters,
      plots,
      activities,
      recentEvents,
      daySinceLaunch: simulationStore.currentDay || 1,
      playerSatisfaction: (stats.sentimentDistribution.positive / (stats.totalComments || 1)) || 0.5,
    };
  }
  
  /**
   * 创建用于生成评论的虚拟玩家列表
   */
  function createVirtualPlayersForGeneration(count: number, playerType?: PlayerType): VirtualPlayer[] {
    const players: VirtualPlayer[] = [];
    const playStyles = ['剧情党', '强度党', 'XP党', '社交党', '咸鱼党'];
    
    for (let i = 0; i < count; i++) {
      const style = playerType 
        ? mapPlayerTypeToPlayStyle(playerType)
        : playStyles[Math.floor(Math.random() * playStyles.length)];
        
      players.push({
        id: `virtual_${Date.now()}_${i}`,
        playStyle: style,
        satisfaction: 0.5 + Math.random() * 0.5,
        loyalty: 0.3 + Math.random() * 0.7,
        activityLevel: 0.2 + Math.random() * 0.8,
        state: 'ACTIVE',
        lastActiveTime: Date.now(),
      });
    }
    
    return players;
  }
  
  /**
   * 将 PlayerType 映射到 playStyle
   */
  function mapPlayerTypeToPlayStyle(playerType: PlayerType): string {
    const mapping: Record<PlayerType, string> = {
      '氪金大佬': '强度党',
      '剧情党': '剧情党',
      '外观党': 'XP党',
      '休闲玩家': '咸鱼党',
    };
    return mapping[playerType] || '剧情党';
  }
  
  /**
   * 将引擎平台类型映射到 UI 平台类型
   */
  function mapEnginePlatformToUI(platform: string): PlatformType {
    const mapping: Record<string, PlatformType> = {
      'taptap': 'tieba',
      'appstore': 'weibo',
      'weibo': 'weibo',
      'bilibili': 'bilibili',
      'xiaohongshu': 'xiaohongshu',
    };
    return mapping[platform] || 'weibo';
  }
  
  /**
   * 快速生成评论（用于模拟每日数据）
   */
  function generateDailyComments(count: number = 5): GameComment[] {
    const newComments: GameComment[] = [];
    const platforms: PlatformType[] = ['douyin', 'xiaohongshu', 'weibo', 'bilibili', 'tieba'];
    
    for (let i = 0; i < count; i++) {
      // 随机分配平台
      const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
      const platformTemplate = generatePlatformComment(randomPlatform);
      
      const comment: GameComment = {
        id: platformTemplate.id,
        content: platformTemplate.content,
        type: getRandomCommentType(),
        sentiment: platformTemplate.sentiment as CommentSentiment,
        playerType: getRandomPlayerType(),
        tags: platformTemplate.tags,
        platform: randomPlatform,
        likes: platformTemplate.baseLikes + Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 20),
        comments: Math.floor(Math.random() * 30),
        heat: 0,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        isLiked: false
      };
      
      // 计算初始热度
      comment.heat = calculateCommentHeat(comment);
      
      newComments.push(comment);
    }
    
    comments.value.unshift(...newComments);
    updateSentimentStats();
    updatePublicOpinion();
    saveToLocal();
    
    return newComments;
  }
  
  /**
   * 计算评论热度
   * 公式：点赞数 + 转发数*2 + 回复数*0.5 + 时间衰减
   */
  function calculateCommentHeat(comment: GameComment): number {
    const now = Date.now();
    const createdAt = new Date(comment.createdAt).getTime();
    const hoursDiff = (now - createdAt) / 3600000;
    
    // 时间衰减因子（每小时衰减 5%）
    const timeDecay = Math.pow(0.95, hoursDiff);
    
    // 基础热度
    const baseHeat = comment.likes + comment.shares * 2 + comment.comments * 0.5;
    
    return Math.round(baseHeat * timeDecay * 10) / 10;
  }
  
  /**
   * 更新评论互动数据
   */
  function updateCommentInteraction(
    id: string, 
    action: 'like' | 'share' | 'comment',
    increment: boolean = true
  ): boolean {
    const comment = comments.value.find(c => c.id === id);
    if (!comment) return false;

    if (action === 'like') {
      comment.likes += increment ? 1 : -1;
      comment.isLiked = increment;
    } else if (action === 'share') {
      comment.shares += increment ? 1 : -1;
      comment.isShared = increment;
    } else if (action === 'comment') {
      comment.comments += increment ? 1 : -1;
      comment.isReplied = increment;
    }

    // 重新计算热度
    comment.heat = calculateCommentHeat(comment);

    // 更新舆情
    updatePublicOpinion();
    saveToLocal();
    
    return true;
  }
  
  /**
   * 获取热门评论
   */
  function getHotComments(limit: number = 10): GameComment[] {
    return [...comments.value]
      .sort((a, b) => b.heat - a.heat)
      .slice(0, limit);
  }

  /**
   * 应用节奏事件的声誉伤害（每小时调用）
   * 小节奏 -2/小时，大节奏 -5/小时，炎上 -10/小时
   */
  function applyRhythmDamage(operationStore: any): void {
    rhythmEvents.value.forEach(event => {
      if (!event.resolved) {
        // 根据节奏类型扣除声誉
        operationStore.stats.reputation += event.reputationImpact;
        
        // 确保声誉不低于 0
        if (operationStore.stats.reputation < 0) {
          operationStore.stats.reputation = 0;
        }
        
        // 持续时间递减
        event.duration--;
        
        // 持续时间为 0 时标记为已解决
        if (event.duration <= 0) {
          event.resolved = true;
        }
      }
    });
    
    saveToLocal();
  }

  /**
   * 启动定时器（每小时执行一次）
   */
  function startRhythmTimer(operationStore: any): void {
    // 每小时执行一次
    setInterval(() => {
      applyRhythmDamage(operationStore);
    }, 3600000); // 3600000ms = 1小时
    
    // 为了测试，也可以设置为每分钟执行一次
    // setInterval(() => {
    //   applyRhythmDamage(operationStore);
    // }, 60000); // 60000ms = 1分钟
  }
  
  /**
   * 检查节奏事件
   * 负面评论热度超过阈值触发节奏
   */
  function checkRhythmEvents(): RhythmEvent[] {
    const now = new Date();
    const negativeHotComments = comments.value.filter(
      c => c.sentiment === 'negative' && c.heat > 100
    );
    
    const newEvents: RhythmEvent[] = [];
    
    negativeHotComments.forEach(comment => {
      let type: 'small' | 'large' | 'fire';
      let reputationImpact: number;
      
      if (comment.heat > 500) {
        type = 'fire';
        reputationImpact = -10;
      } else if (comment.heat > 200) {
        type = 'large';
        reputationImpact = -5;
      } else {
        type = 'small';
        reputationImpact = -2;
      }
      
      const event: RhythmEvent = {
        id: `rhythm_${comment.id}`,
        type,
        heat: comment.heat,
        reputationImpact,
        duration: type === 'fire' ? 24 : type === 'large' ? 12 : 6,
        createdAt: now.toISOString(),
        resolved: false
      };
      
      newEvents.push(event);
    });
    
    rhythmEvents.value = newEvents;
    return newEvents;
  }
  
  /**
   * 控评操作
   */
  async function controlOpinion(
    method: 'welfare' | 'control' | 'ignore'
  ): Promise<{ success: boolean; message: string; reputationChange?: number }> {
    if (rhythmEvents.value.length === 0) {
      return { success: false, message: '当前无节奏事件' };
    }
    
    const totalImpact = rhythmEvents.value.reduce(
      (sum, e) => sum + e.reputationImpact, 
      0
    );
    
    switch (method) {
      case 'welfare':
        // 发福利平息（消耗钻石）
        const diamondCost = rhythmEvents.value.length * 50;
        // TODO: 调用 gameStore 消耗钻石
        rhythmEvents.value.forEach(e => e.resolved = true);
        rhythmEvents.value = [];
        return { 
          success: true, 
          message: `消耗${diamondCost}钻石发放福利，成功平息节奏`,
          reputationChange: Math.abs(totalImpact)
        };
        
      case 'control':
        // 控评（消耗金币）
        const goldCost = rhythmEvents.value.length * 100;
        // TODO: 调用 gameStore 消耗金币
        rhythmEvents.value.forEach(e => e.resolved = true);
        rhythmEvents.value = [];
        return { 
          success: true, 
          message: `消耗${goldCost}金币进行控评，成功平息节奏`,
          reputationChange: Math.abs(totalImpact)
        };
        
      case 'ignore':
        // 装死（可能恶化）
        const恶化概率 = 0.5;
        if (Math.random() < 恶化概率) {
          rhythmEvents.value.forEach(e => {
            e.reputationImpact *= 1.5;
          });
          return { 
            success: false, 
            message: '装死失败，节奏恶化！',
            reputationChange: totalImpact * 0.5
          };
        } else {
          rhythmEvents.value.forEach(e => e.resolved = true);
          rhythmEvents.value = [];
          return { 
            success: true, 
            message: '装死成功，节奏自然平息',
            reputationChange: 0
          };
        }
        
      default:
        return { success: false, message: '无效的控评方式' };
    }
  }
  
  /**
   * 更新舆情数据
   */
  function updatePublicOpinion() {
    if (comments.value.length === 0) {
      publicOpinion.value = createPublicOpinionFromSimulation();
      return;
    }
    
    // 计算平均热度
    const avgHeat = comments.value.reduce((sum, c) => sum + c.heat, 0) / comments.value.length;
    
    // 计算情感倾向
    const positiveCount = comments.value.filter(c => c.sentiment === 'positive').length;
    const negativeCount = comments.value.filter(c => c.sentiment === 'negative').length;
    const neutralCount = comments.value.filter(c => c.sentiment === 'neutral').length;
    const totalCount = comments.value.length;
    
    const sentimentScore = ((positiveCount - negativeCount) / totalCount) * 100;
    
    // 计算各情感占比
    const positiveRatio = positiveCount / totalCount;
    const negativeRatio = negativeCount / totalCount;
    
    // 判断趋势（基于情感占比）
    let trend: 'up' | 'down' | 'stable' = 'stable';
    
    // 负面评论占比 > 30% → 趋势下降
    if (negativeRatio > 0.3) {
      trend = 'down';
    }
    // 正面评论占比 > 70% → 趋势上升
    else if (positiveRatio > 0.7) {
      trend = 'up';
    }
    // 其他情况根据情感分数判断
    else if (sentimentScore > 20) {
      trend = 'up';
    }
    else if (sentimentScore < -20) {
      trend = 'down';
    }
    
    // 触发事件
    const triggers: string[] = [];
    if (rhythmEvents.value.length > 0) {
      triggers.push(`正在发生${rhythmEvents.value.length}个节奏事件`);
    }
    if (negativeRatio > 0.3) {
      triggers.push('负面评论占比超过 30%');
    }
    if (positiveRatio > 0.7) {
      triggers.push('正面评论占比超过 70%');
    }
    
    publicOpinion.value = {
      heat: Math.round(avgHeat),
      sentiment: Math.round(sentimentScore),
      trend,
      triggers
    };
  }
  
  /**
   * 获取未解决的节奏事件
   */
  function getPendingRhythmEvents(): RhythmEvent[] {
    return rhythmEvents.value.filter(e => !e.resolved);
  }
  
  /**
   * 点赞评论
   */
  function likeComment(id: string): boolean {
    const comment = comments.value.find(c => c.id === id);
    if (!comment) return false;
    
    if (comment.isLiked) {
      comment.likes--;
      comment.isLiked = false;
    } else {
      comment.likes++;
      comment.isLiked = true;
      
      // 评论获赞 10+ 奖励积分
      if (comment.likes === 10) {
        void pointsStore.unlockAchievement('hot_comment');
      }
    }
    
    // 更新热度
    comment.heat = calculateCommentHeat(comment);
    updatePublicOpinion();
    saveToLocal();
    return true;
  }
  
  /**
   * 回复评论
   */
  function replyToComment(id: string, content: string): boolean {
    const comment = comments.value.find(c => c.id === id);
    if (!comment) return false;
    if (!content.trim()) return false;
    
    comment.comments++;
    saveToLocal();
    
    // 处理负面评论奖励
    if (comment.sentiment === 'negative') {
      void pointsStore.spendPoints(-5, '处理负面评论奖励');
    }
    
    return true;
  }
  
  /**
   * 删除评论
   */
  function deleteComment(id: string): boolean {
    const index = comments.value.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    comments.value.splice(index, 1);
    updateSentimentStats();
    saveToLocal();
    return true;
  }
  
  /**
   * 更新舆情统计
   */
  function updateSentimentStats() {
    const total = comments.value.length;
    const positive = comments.value.filter(c => c.sentiment === 'positive').length;
    const negative = comments.value.filter(c => c.sentiment === 'negative').length;
    const neutral = comments.value.filter(c => c.sentiment === 'neutral').length;
    
    // 计算满意度 (0-100)
    const satisfaction = total > 0 
      ? Math.round((positive / total) * 100) 
      : 85;
    
    // 统计热门标签
    const tagCount: Record<string, number> = {};
    comments.value.forEach(comment => {
      (comment.tags || []).forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    
    const hotTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    sentimentStats.value = {
      total,
      positive,
      negative,
      neutral,
      satisfaction,
      hotTags
    };
  }
  
  /**
   * 清空所有评论
   */
  function clearAllComments() {
    comments.value = [];
    updateSentimentStats();
    saveToLocal();
  }
  
  /**
   * 保存到本地存储
   */
  function saveToLocal() {
    const data = {
      comments: comments.value,
      sentimentStats: sentimentStats.value,
      lastGeneratedAt: lastGeneratedAt.value
    };
    localStorage.setItem('comment_data', JSON.stringify(data));
  }
  
  /**
   * 从本地存储加载
   */
  function loadFromLocal() {
    const saved = localStorage.getItem('comment_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        comments.value = data.comments || [];
        sentimentStats.value = data.sentimentStats || createSentimentStatsFromSimulation();
        lastGeneratedAt.value = data.lastGeneratedAt || null;
        updatePublicOpinion();
      } catch (e) {
        console.error('加载评论数据失败:', e);
      }
    }
  }
  
  /**
   * 初始化评论系统
   * 不再生成默认评论，等待真实评论生成
   */
  function initDefaultComments() {
    // 不再生成默认评论，保持空状态
    // 评论将在项目上线后根据玩家反馈自动生成
  }
  
  /**
   * 分析评论中的角色提及
   * @param characterMap 角色 ID 到名称的映射
   * @returns 角色提及统计列表
   */
  function analyzeCharacterMentions(characterMap: Map<string, string>): CharacterMentionStats[] {
    const statsMap = new Map<string, CharacterMentionStats>();
    
    // 初始化所有角色的统计
    characterMap.forEach((name, id) => {
      statsMap.set(id, {
        characterId: id,
        characterName: name,
        mentionCount: 0,
        positiveMentions: 0,
        negativeMentions: 0,
        neutralMentions: 0,
        sentimentScore: 0
      });
    });
    
    // 遍历所有评论
    comments.value.forEach(comment => {
      // 检查每个角色是否被提及
      characterMap.forEach((name, id) => {
        if (comment.content.includes(name)) {
          const stats = statsMap.get(id)!;
          stats.mentionCount++;
          
          // 根据情感分类
          if (comment.sentiment === 'positive') {
            stats.positiveMentions++;
          } else if (comment.sentiment === 'negative') {
            stats.negativeMentions++;
          } else {
            stats.neutralMentions++;
          }
          
          // 更新情感分数
          stats.sentimentScore = ((stats.positiveMentions - stats.negativeMentions) / stats.mentionCount) * 100;
        }
      });
    });
    
    return Array.from(statsMap.values());
  }
  
  /**
   * 计算 CP 热度
   * @param characterMap 角色 ID 到名称的映射
   * @returns CP 热度列表
   */
  function calculateCPHeat(characterMap: Map<string, string>): CharacterCPHeat[] {
    const cpHeatMap = new Map<string, {
      characterId1: string;
      characterName1: string;
      characterId2: string;
      characterName2: string;
      heat: number;
      mentionCount: number;
    }>();
    
    // 遍历所有评论
    comments.value.forEach(comment => {
      const mentionedChars: Array<{ id: string; name: string }> = [];
      
      // 找出被提及的角色
      characterMap.forEach((name, id) => {
        if (comment.content.includes(name)) {
          mentionedChars.push({ id, name });
        }
      });
      
      // 如果提及了多个角色，计算 CP 热度
      if (mentionedChars.length >= 2) {
        for (let i = 0; i < mentionedChars.length; i++) {
          for (let j = i + 1; j < mentionedChars.length; j++) {
            const char1 = mentionedChars[i];
            const char2 = mentionedChars[j];
            
            // 创建唯一的 CP 键（按 ID 排序保证一致性）
            const cpKey = [char1.id, char2.id].sort().join('_');
            
            if (!cpHeatMap.has(cpKey)) {
              cpHeatMap.set(cpKey, {
                characterId1: char1.id,
                characterName1: char1.name,
                characterId2: char2.id,
                characterName2: char2.name,
                heat: 50, // 初始热度
                mentionCount: 0
              });
            }
            
            const cpData = cpHeatMap.get(cpKey)!;
            cpData.mentionCount++;
            cpData.heat = Math.min(100, cpData.heat + 1);
          }
        }
      }
    });
    
    // 转换为数组并添加趋势
    return Array.from(cpHeatMap.values()).map(cp => ({
      ...cp,
      trend: cp.heat > 70 ? 'up' : cp.heat < 30 ? 'down' : 'stable' as 'up' | 'down' | 'stable'
    }));
  }
  
  /**
   * 计算角色口碑评分
   * @param characterMap 角色 ID 到名称的映射
   * @returns 角色口碑数据列表
   */
  function calculateCharacterReputation(characterMap: Map<string, string>): CharacterReputationData[] {
    const reputationMap = new Map<string, {
      characterId: string;
      characterName: string;
      ratings: number[];
      totalComments: number;
      positiveCount: number;
    }>();
    
    // 初始化
    characterMap.forEach((name, id) => {
      reputationMap.set(id, {
        characterId: id,
        characterName: name,
        ratings: [],
        totalComments: 0,
        positiveCount: 0
      });
    });
    
    // 分析评论
    comments.value.forEach(comment => {
      characterMap.forEach((name, id) => {
        if (comment.content.includes(name)) {
          const rep = reputationMap.get(id)!;
          rep.totalComments++;
          
          // 根据情感推断评分
          let rating = 3; // 默认中性
          if (comment.sentiment === 'positive') {
            rating = 4 + Math.floor(Math.random() * 2); // 4-5 星
            rep.positiveCount++;
          } else if (comment.sentiment === 'negative') {
            rating = 1 + Math.floor(Math.random() * 2); // 1-2 星
          }
          
          rep.ratings.push(rating);
        }
      });
    });
    
    // 计算最终口碑数据
    return Array.from(reputationMap.values()).map(rep => {
      const distribution = {
        excellent: 0, // 5 星
        good: 0,      // 4 星
        average: 0,   // 3 星
        poor: 0,      // 2 星
        terrible: 0   // 1 星
      };
      
      rep.ratings.forEach(rating => {
        switch (rating) {
          case 5: distribution.excellent++; break;
          case 4: distribution.good++; break;
          case 3: distribution.average++; break;
          case 2: distribution.poor++; break;
          case 1: distribution.terrible++; break;
        }
      });
      
      const averageRating = rep.ratings.length > 0
        ? Math.round((rep.ratings.reduce((a, b) => a + b, 0) / rep.ratings.length) * 2) / 2
        : 0;
      
      const positiveRate = rep.totalComments > 0
        ? Math.round((rep.positiveCount / rep.totalComments) * 100)
        : 0;
      
      return {
        characterId: rep.characterId,
        characterName: rep.characterName,
        averageRating,
        totalComments: rep.totalComments,
        positiveRate,
        distribution
      };
    });
  }
  
  /**
   * 获取角色的热门 CP 排行
   * @param characterId 角色 ID
   * @param characterMap 角色 ID 到名称的映射
   * @param limit 返回数量
   * @returns CP 热度排行
   */
  function getCharacterCPRanking(
    characterId: string, 
    characterMap: Map<string, string>,
    limit: number = 5
  ): CharacterCPHeat[] {
    const allCPHeat = calculateCPHeat(characterMap);
    
    return allCPHeat
      .filter(cp => cp.characterId1 === characterId || cp.characterId2 === characterId)
      .sort((a, b) => b.heat - a.heat)
      .slice(0, limit);
  }
  
  // 初始化时加载数据
  loadFromLocal();
  
  return {
    // State
    comments,
    rhythmEvents,
    publicOpinion,
    sentimentStats,
    isGenerating,
    lastGeneratedAt,

    // Getters
    filteredComments,
    commentsByType,
    commentsBySentiment,

    // Actions
    generateNewComments,
    generateDailyComments,
    calculateCommentHeat,
    updateCommentInteraction,
    getHotComments,
    checkRhythmEvents,
    controlOpinion,
    updatePublicOpinion,
    getPendingRhythmEvents,
    likeComment,
    replyToComment,
    deleteComment,
    updateSentimentStats,
    clearAllComments,
    saveToLocal,
    loadFromLocal,
    initDefaultComments,
    generateQuitComments,
    generateReturnComments,
    generateRecommendationComments,

    // 角色数据分析
    analyzeCharacterMentions,
    calculateCPHeat,
    calculateCharacterReputation,
    getCharacterCPRanking,

    // 新增：情感分布统计
    getSentimentDistributionStats,
    calculateSentimentDistributionFromSimulation,
    
    // Phase 4: 协调者模式 - onDailyTick
    onDailyTick(ctx: any) {
      generateDailyComments();
    },
  };
});
