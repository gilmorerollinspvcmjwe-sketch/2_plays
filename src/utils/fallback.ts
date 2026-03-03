/**
 * 兜底逻辑管理工具
 * 用于处理 AI 超时、失败等情况，提供预设模板作为备选
 */

import { TemplateManager } from './templateManager';
import type {
  CharacterTemplate,
  CommentTemplate,
  PlotTemplate,
  CommentType,
  PlayerType
} from '@/types/template';

export class FallbackManager {
  /**
   * AI 请求超时处理
   * @param taskType 任务类型
   * @returns 预设的兜底文本
   */
  static handleTimeout(taskType: string): string {
    const templates: Record<string, string> = {
      comment: '[评论] 由于响应超时，暂时无法生成评论。请稍后重试。',
      character: '[角色设定] 由于响应超时，暂时无法生成角色设定。请稍后重试。',
      long_text: '[长文本] 由于响应超时，暂时无法处理长文本。请稍后重试。',
      multimodal: '[多模态] 由于响应超时，暂时无法处理图片内容。请稍后重试。',
      general: '[系统] 由于响应超时，暂时无法完成请求。请稍后重试。',
      polish: '[润色] 由于响应超时，暂时无法润色文本。请稍后重试。',
      plot: '[剧情] 由于响应超时，暂时无法生成剧情。请稍后重试。'
    };
    
    return templates[taskType] || templates.general;
  }

  /**
   * AI 请求失败处理
   * @param taskType 任务类型
   * @returns 预设模板对象
   */
  static handleFailure(taskType: string): any {
    console.log(`[兜底] AI 请求失败，使用预设模板：${taskType}`);
    
    // 返回预设模板
    switch (taskType) {
      case 'comment':
        return TemplateManager.getRandomComment();
      case 'character':
        return TemplateManager.getRandomCharacter();
      case 'plot':
        // 返回示例剧情
        return this.getExamplePlot();
      case 'event':
        return this.getExampleEvent();
      case 'incident':
        return this.getExampleIncident();
      default:
        return null;
    }
  }

  /**
   * 快速模式：直接使用预设模板，跳过 AI
   * @param taskType 任务类型
   */
  static useQuickMode(taskType: string): any {
    console.log(`[快速模式] 使用预设模板：${taskType}`);
    return this.handleFailure(taskType);
  }

  /**
   * 示例剧情模板
   */
  private static getExamplePlot(): PlotTemplate {
    return {
      id: 'plot_example',
      routeType: 'sweet',
      title: '示例剧情',
      summary: '这是一个示例剧情模板',
      chapters: [
        {
          chapter: 1,
          title: '初遇',
          scene: '樱花飘落的校园',
          keyEvent: '你们在樱花树下意外相遇',
          choices: ['道歉', '离开', '搭话']
        }
      ],
      difficulty: '简单'
    };
  }

  /**
   * 示例活动模板
   */
  private static getExampleEvent() {
    return {
      id: 'event_example',
      type: 'festival',
      name: '示例活动',
      description: '这是一个示例活动',
      duration: 7,
      rewards: ['钻石 x1000', '限定卡面'],
      mechanics: ['完成任务', '获取奖励'],
      budget: '中'
    };
  }

  /**
   * 示例事件模板
   */
  private static getExampleIncident() {
    return {
      id: 'incident_example',
      type: 'dropRate',
      name: '示例事件',
      description: '这是一个示例事件',
      severity: '中',
      triggerCondition: '示例触发条件',
      playerReactions: ['玩家反应 1', '玩家反应 2'],
      solutions: [
        {
          action: '示例解决方案',
          cost: '中',
          effect: '示例效果'
        }
      ]
    };
  }

  /**
   * 检查是否需要使用兜底逻辑
   * @param error 错误对象
   * @param timeout 是否超时
   */
  static shouldUseFallback(error: any, timeout: boolean = false): boolean {
    // 超时
    if (timeout) {
      return true;
    }
    
    // 网络错误
    if (error?.message?.includes('network')) {
      return true;
    }
    
    // API 限流
    if (error?.status === 429) {
      return true;
    }
    
    // 服务器错误
    if (error?.status >= 500) {
      return true;
    }
    
    return false;
  }

  /**
   * 获取友好的错误提示
   * @param taskType 任务类型
   * @param error 错误对象
   */
  static getFriendlyError(taskType: string, error?: any): string {
    if (!error) {
      return this.handleTimeout(taskType);
    }

    if (error?.status === 429) {
      return '[系统] 请求过于频繁，请稍后再试。';
    }

    if (error?.status >= 500) {
      return '[系统] 服务器暂时繁忙，请稍后再试。';
    }

    if (error?.message?.includes('network')) {
      return '[系统] 网络连接失败，请检查网络后重试。';
    }

    return this.handleTimeout(taskType);
  }
}
