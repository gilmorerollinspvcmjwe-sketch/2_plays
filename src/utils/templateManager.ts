/**
 * 模板管理工具类
 * 用于管理和随机选择各种预设模板
 */

import { characterTemplates } from '@/data/templates/characters';
import plotTemplatesData from '@/data/plotTemplates.json';
import {
  sweetPlotTemplates,
  angstPlotTemplates,
  suspensePlotTemplates,
  getAllPlotTemplates as getNewPlotTemplates
} from '@/data/templates/plots';
import {
  getRandomGachaComment,
  getGachaCommentByPlayerType,
  getRandomCharacterComment,
  getCharacterCommentByPlayerType,
  getRandomEventComment,
  getEventCommentBySatisfaction,
  getTotalCommentCount,
  getCommentTemplateStats
} from '@/data/templates/comments';
import {
  festivalEventTemplates,
  birthdayEventTemplates,
  getAllFestivalEvents,
  getEventsByBudget,
  getHighImpactEvents
} from '@/data/templates/events';
import {
  incidentTemplates,
  getIncidentsBySeverity,
  getIncidentsByType,
  getRandomIncident,
  getIncidentSolutions
} from '@/data/templates/incidents';
import type {
  CharacterTemplate,
  CharacterCategory,
  PlotTemplate,
  PlotRouteType,
  CommentTemplate,
  CommentType,
  PlayerType,
  EventTemplate,
  EventType,
  IncidentTemplate,
  IncidentType,
  TemplateStats
} from '@/types/template';

export interface PlotChapter {
  chapter: number;
  title: string;
  scene: string;
  keyEvent: string;
  choices: string[];
  selectedChoice: number;
}

export interface PlotTemplateData {
  id: string;
  routeType: 'sweet' | 'angst' | 'suspense';
  title: string;
  summary: string;
  chapters: PlotChapter[];
  difficulty: string;
}

export class TemplateManager {
  /**
   * 随机获取角色模板
   * @param category 可选，角色类型
   */
  static getRandomCharacter(category?: CharacterCategory): CharacterTemplate {
    const templates = category
      ? characterTemplates.filter(t => t.category === category)
      : characterTemplates;
    
    if (templates.length === 0) {
      return characterTemplates[0];
    }
    
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }

  /**
   * 根据标签筛选角色模板
   * @param tags 标签数组
   */
  static getCharactersByTags(tags: string[]): CharacterTemplate[] {
    return characterTemplates.filter(t =>
      tags.some(tag => t.tags.includes(tag))
    );
  }

  /**
   * 获取所有角色模板
   */
  static getAllCharacters(): CharacterTemplate[] {
    return characterTemplates;
  }

  /**
   * 根据人气值排序角色模板
   * @param order 'asc' | 'desc'
   */
  static getCharactersByPopularity(order: 'asc' | 'desc' = 'desc'): CharacterTemplate[] {
    return [...characterTemplates].sort((a, b) => 
      order === 'desc' ? b.popularity - a.popularity : a.popularity - b.popularity
    );
  }

  /**
   * 随机获取评论模板
   * @param type 可选，评论类型
   * @param playerType 可选，玩家类型
   */
  static getRandomComment(
    type?: CommentType,
    playerType?: PlayerType
  ): CommentTemplate {
    // 这里返回一个示例评论，实际应该从评论模板库中获取
    const comment: CommentTemplate = {
      id: 'comment_example',
      type: type || 'roast',
      content: '这游戏也太好玩了吧！！！老公好帅！！！',
      sentiment: 'positive',
      intensity: 3,
      playerType: playerType || '外观党',
      tags: ['老公', '帅', '好玩']
    };
    return comment;
  }

  /**
   * 获取模板统计信息
   */
  static getTemplateStats(): TemplateStats {
    return {
      characters: characterTemplates.length,
      plots: 0,  // 待实现
      comments: 0,  // 待实现
      events: 0,  // 待实现
      incidents: 0,  // 待实现
      total: characterTemplates.length
    };
  }

  /**
   * 快速模式：直接返回预设模板（不经过 AI）
   */
  static useQuickMode(): {
    character: CharacterTemplate;
    comment: CommentTemplate;
  } {
    return {
      character: this.getRandomCharacter(),
      comment: this.getRandomComment()
    };
  }

  /**
   * 获取剧情模板
   * @param routeType 剧情类型：甜宠/虐恋/悬疑
   */
  static getPlotTemplates(routeType: 'sweet' | 'angst' | 'suspense'): PlotTemplateData[] {
    return plotTemplatesData[routeType] || [];
  }

  /**
   * 获取所有剧情模板
   */
  static getAllPlotTemplates(): Record<string, PlotTemplateData[]> {
    return plotTemplatesData;
  }

  /**
   * 随机获取剧情模板
   * @param routeType 可选，剧情类型
   */
  static getRandomPlotTemplate(routeType?: 'sweet' | 'angst' | 'suspense'): PlotTemplateData | null {
    const templates = routeType
      ? this.getPlotTemplates(routeType)
      : Object.values(plotTemplatesData).flat();
    
    if (templates.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }

  // ==================== 新增方法 ====================

  /**
   * 根据人气范围筛选角色
   * @param min 最小人气值
   * @param max 最大人气值
   */
  static getCharactersByPopularityRange(min: number, max: number): CharacterTemplate[] {
    return characterTemplates.filter(t => t.popularity >= min && t.popularity <= max);
  }

  /**
   * 随机获取指定数量的不重复角色
   * @param count 数量
   * @param excludeIds 排除的角色ID列表
   */
  static getRandomCharacters(count: number, excludeIds?: string[]): CharacterTemplate[] {
    const available = excludeIds
      ? characterTemplates.filter(t => !excludeIds.includes(t.id))
      : characterTemplates;

    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * 获取推荐角色组合（用于新项目）
   * 策略：1个S级 + 2个A级 + 2个B级
   */
  static getRecommendedCharacterSet(): CharacterTemplate[] {
    const sRank = this.getCharactersByPopularityRange(9, 10);
    const aRank = this.getCharactersByPopularityRange(7, 8);
    const bRank = this.getCharactersByPopularityRange(5, 6);

    const result: CharacterTemplate[] = [];

    if (sRank.length > 0) {
      result.push(sRank[Math.floor(Math.random() * sRank.length)]);
    }

    const aSelected = this.getRandomCharacters(2, result.map(r => r.id));
    result.push(...aSelected);

    const bSelected = this.getRandomCharacters(2, result.map(r => r.id));
    result.push(...bSelected);

    return result.filter(Boolean);
  }

  /**
   * 按类别统计角色数量
   */
  static getCharacterCountByCategory(): Record<string, number> {
    const counts: Record<string, number> = {};
    characterTemplates.forEach(char => {
      counts[char.category] = (counts[char.category] || 0) + 1;
    });
    return counts;
  }

  // ==================== 评论模板新方法 ====================

  /**
   * 生成抽卡相关评论
   * @param playerType 玩家类型
   */
  static generateGachaComment(playerType?: PlayerType): CommentTemplate {
    const content = playerType
      ? getGachaCommentByPlayerType(playerType)
      : getRandomGachaComment();

    return {
      id: `comment_gacha_${Date.now()}`,
      type: 'roast',
      content,
      sentiment: this.analyzeSentiment(content),
      intensity: this.getIntensity(content),
      playerType: playerType || '外观党',
      tags: this.extractTags(content)
    };
  }

  /**
   * 生成角色相关评论
   * @param playerType 玩家类型
   */
  static generateCharacterComment(playerType?: PlayerType): CommentTemplate {
    const content = playerType
      ? getCharacterCommentByPlayerType(playerType)
      : getRandomCharacterComment();

    return {
      id: `comment_character_${Date.now()}`,
      type: 'recommend',
      content,
      sentiment: this.analyzeSentiment(content),
      intensity: this.getIntensity(content),
      playerType: playerType || '外观党',
      tags: this.extractTags(content)
    };
  }

  /**
   * 生成活动相关评论
   * @param satisfaction 满意度
   */
  static generateEventComment(satisfaction?: 'high' | 'medium' | 'low'): CommentTemplate {
    const content = satisfaction
      ? getEventCommentBySatisfaction(satisfaction)
      : getRandomEventComment();

    return {
      id: `comment_event_${Date.now()}`,
      type: 'roast',
      content,
      sentiment: satisfaction === 'high' ? 'positive' : satisfaction === 'low' ? 'negative' : 'neutral',
      intensity: satisfaction === 'high' ? 4 : satisfaction === 'low' ? 4 : 2,
      playerType: '休闲玩家',
      tags: this.extractTags(content)
    };
  }

  // ==================== 辅助方法 ====================

  /**
   * 分析评论情感
   * @param content 评论内容
   */
  private static analyzeSentiment(content: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['好', '棒', '赞', '爱', '喜欢', '完美', '优秀', '值得', '不错', '满意', '开心', '快乐'];
    const negativeWords = ['差', '烂', '坑', '垃圾', '失望', '后悔', '生气', '愤怒', '无语', '难受', '痛苦', '讨厌'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      if (content.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (content.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * 获取评论强度
   * @param content 评论内容
   */
  private static getIntensity(content: string): number {
    const intenseWords = ['太', '超级', '非常', '极其', '绝对', '完全', '真的', '特别'];
    const punctuation = (content.match(/[!！]{2,}/g) || []).length;
    
    let intensity = 1;
    intenseWords.forEach(word => {
      if (content.includes(word)) intensity++;
    });
    intensity += punctuation;
    
    return Math.min(intensity, 5);
  }

  /**
   * 提取标签
   * @param content 评论内容
   */
  private static extractTags(content: string): string[] {
    const commonTags = ['老公', '老婆', '角色', '剧情', '画风', '声优', '爆率', '抽卡', '活动', '福利'];
    return commonTags.filter(tag => content.includes(tag));
  }

  // ==================== 活动模板方法 ====================

  /**
   * 获取所有节日活动模板
   */
  static getAllFestivalEventTemplates(): EventTemplate[] {
    return getAllFestivalEvents();
  }

  /**
   * 根据预算筛选活动
   * @param budget 预算等级
   */
  static getEventsByBudgetLevel(budget: '低' | '中' | '高'): EventTemplate[] {
    return getEventsByBudget(budget);
  }

  /**
   * 获取高收益活动（DAU增长>30%）
   */
  static getHighImpactEventTemplates(): EventTemplate[] {
    return getHighImpactEvents();
  }

  /**
   * 随机获取活动模板
   */
  static getRandomEventTemplate(): EventTemplate {
    const events = getAllFestivalEvents();
    return events[Math.floor(Math.random() * events.length)];
  }

  // ==================== 运营事件模板方法 ====================

  /**
   * 获取所有运营事件模板
   */
  static getAllIncidentTemplates(): IncidentTemplate[] {
    return incidentTemplates;
  }

  /**
   * 根据严重程度获取事件
   * @param severity 严重程度
   */
  static getIncidentsBySeverityLevel(severity: '低' | '中' | '高'): IncidentTemplate[] {
    return getIncidentsBySeverity(severity);
  }

  /**
   * 根据类型获取事件
   * @param type 事件类型
   */
  static getIncidentsByTypeFilter(type: string): IncidentTemplate[] {
    return getIncidentsByType(type);
  }

  /**
   * 随机获取运营事件
   */
  static getRandomIncidentTemplate(): IncidentTemplate {
    return getRandomIncident();
  }

  /**
   * 获取事件解决方案
   * @param incidentId 事件ID
   */
  static getIncidentSolutionOptions(incidentId: string) {
    return getIncidentSolutions(incidentId);
  }

  // ==================== 统计方法 ====================

  /**
   * 获取增强的模板统计信息
   */
  static getEnhancedTemplateStats(): TemplateStats & { details: any } {
    const commentStats = getCommentTemplateStats();

    return {
      characters: characterTemplates.length,
      plots: sweetPlotTemplates.length + angstPlotTemplates.length + suspensePlotTemplates.length,
      comments: commentStats.total,
      events: festivalEventTemplates.length + birthdayEventTemplates.length,
      incidents: incidentTemplates.length,
      total: characterTemplates.length +
        sweetPlotTemplates.length + angstPlotTemplates.length + suspensePlotTemplates.length +
        commentStats.total +
        festivalEventTemplates.length + birthdayEventTemplates.length +
        incidentTemplates.length,
      details: {
        characters: {
          total: characterTemplates.length,
          byCategory: this.getCharacterCountByCategory()
        },
        plots: {
          sweet: sweetPlotTemplates.length,
          angst: angstPlotTemplates.length,
          suspense: suspensePlotTemplates.length
        },
        comments: commentStats,
        events: {
          festival: festivalEventTemplates.length,
          birthday: birthdayEventTemplates.length
        },
        incidents: {
          total: incidentTemplates.length,
          bySeverity: {
            high: incidentTemplates.filter(i => i.severity === '高').length,
            medium: incidentTemplates.filter(i => i.severity === '中').length,
            low: incidentTemplates.filter(i => i.severity === '低').length
          }
        }
      }
    };
  }
}
