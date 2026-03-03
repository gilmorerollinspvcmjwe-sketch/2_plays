/**
 * 模板管理工具类
 * 用于管理和随机选择各种预设模板
 */

import { characterTemplates } from '@/data/templates/characters';
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
}
