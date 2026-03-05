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
import type { Player } from './playerStore';
import { useSimulationStore } from './simulationStore';

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
}

export const useCommentStore = defineStore('comment', () => {
  // 引入 simulationStore
  const simulationStore = useSimulationStore();
  
  // State - store 延迟初始化
  const comments = ref<GameComment[]>([]);
  const rhythmEvents = ref<RhythmEvent[]>([]);
  
  // 从 simulationStore 获取舆情数据
  const publicOpinion = computed<PublicOpinion>(() => ({
    heat: simulationStore.commentMetrics?.heat || 0,
    sentiment: simulationStore.commentMetrics?.sentiment || 0,
    trend: (simulationStore.commentMetrics?.sentiment || 0) > 10 ? 'up' : 
           (simulationStore.commentMetrics?.sentiment || 0) < -10 ? 'down' : 'stable',
    triggers: simulationStore.platformStatistics ? 
      Object.entries(simulationStore.platformStatistics.sentimentDistribution)
        .filter(([_, count]) => count > 0)
        .map(([sentiment]) => sentiment) : []
  }));
  
  // 从 simulationStore 获取情感统计
  const sentimentStats = computed<SentimentStats>(() => {
    const stats = simulationStore.platformStatistics;
    const total = stats ? stats.sentimentDistribution.positive + stats.sentimentDistribution.neutral + stats.sentimentDistribution.negative : 0;
    return {
      total: stats?.totalComments || 0,
      positive: stats?.sentimentDistribution.positive || 0,
      negative: stats?.sentimentDistribution.negative || 0,
      neutral: stats?.sentimentDistribution.neutral || 0,
      satisfaction: 85 + (simulationStore.commentMetrics?.sentiment || 0) * 0.15,
      hotTags: []
    };
  });
  
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
    }
  }, { deep: true });
  
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
   * 生成评论
   */
  async function generateNewComments(params: GenerateParams): Promise<{ success: boolean; message: string; comments?: GameComment[] }> {
    const cost = 20; // 生成评论消耗20积分
    const platforms: PlatformType[] = ['douyin', 'xiaohongshu', 'weibo', 'bilibili', 'tieba'];
    
    // 检查积分
    if (pointsStore.balance < cost) {
      return { success: false, message: `积分不足，需要${cost}积分` };
    }
    
    isGenerating.value = true;
    
    try {
      // 消耗积分
      const spendResult = await pointsStore.spendPoints(cost, `AI生成${params.count}条评论`);
      if (!spendResult.success) {
        isGenerating.value = false;
        return { success: false, message: spendResult.message };
      }
      
      // 模拟AI生成延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 生成评论 - 使用平台评论模板
      const newComments: GameComment[] = [];
      for (let i = 0; i < params.count; i++) {
        const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
        const platformTemplate = generatePlatformComment(randomPlatform);
        
        const comment: GameComment = {
          id: platformTemplate.id,
          content: platformTemplate.content,
          type: params.commentType || getRandomCommentType(),
          sentiment: platformTemplate.sentiment as CommentSentiment,
          playerType: params.playerType || getRandomPlayerType(),
          tags: platformTemplate.tags,
          platform: randomPlatform,
          likes: platformTemplate.baseLikes + Math.floor(Math.random() * 50),
          shares: Math.floor(Math.random() * 10),
          comments: Math.floor(Math.random() * 20),
          heat: 0,
          createdAt: new Date().toISOString(),
          isLiked: false
        };
        
        // 计算热度
        comment.heat = calculateCommentHeat(comment);
        
        newComments.push(comment);
      }
      
      // 添加到列表
      comments.value.unshift(...newComments);
      
      // 分析评论中的角色提及并更新人气
      const gameStore = useGameStore();
      gameStore.analyzeCommentMentions(newComments.map(c => ({
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
        message: `成功生成${params.count}条评论`, 
        comments: newComments 
      };
    } catch (error) {
      isGenerating.value = false;
      return { success: false, message: '生成评论失败，请重试' };
    }
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
      publicOpinion.value = { heat: 0, sentiment: 0, trend: 'stable', triggers: [] };
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
        pointsStore.unlockAchievement('hot_comment');
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
    
    comment.replies++;
    saveToLocal();
    
    // 处理负面评论奖励
    if (comment.sentiment === 'negative') {
      pointsStore.spendPoints(-5, '处理负面评论奖励');
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
      comment.tags.forEach(tag => {
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
        sentimentStats.value = data.sentimentStats || {
          total: 0, positive: 0, negative: 0, neutral: 0, satisfaction: 85, hotTags: []
        };
        lastGeneratedAt.value = data.lastGeneratedAt || null;
      } catch (e) {
        console.error('加载评论数据失败:', e);
      }
    }
  }
  
  /**
   * 初始化一些默认评论
   */
  function initDefaultComments() {
    if (comments.value.length === 0) {
      generateDailyComments(10);
    }
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
    initDefaultComments
  };
});
