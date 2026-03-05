/**
 * AI 服务管理器
 * 实现智能切换、超时处理、成本优化
 */

import {
  AIProvider,
  AIRequestConfig,
  AIResponse,
  TaskType,
  Message,
  FallbackConfig,
  TimeoutConfig,
  CostOptimizationConfig
} from './types';

import { BaseAIService } from './base';
import { createMiniMaxService } from './providers/minimax';
import { createKimiService } from './providers/kimi';
import { createDeepSeekService } from './providers/deepseek';
import { createDoubaoService } from './providers/doubao';
import { createQwenService } from './providers/qwen';

/**
 * 默认超时预设模板
 */
export const DEFAULT_TIMEOUT_TEMPLATES: Record<string, string> = {
  comment: '[评论] 由于响应超时，暂时无法生成评论。请稍后重试。',
  character: '[角色设定] 由于响应超时，暂时无法生成角色设定。请稍后重试。',
  long_text: '[长文本] 由于响应超时，暂时无法处理长文本。请稍后重试。',
  multimodal: '[多模态] 由于响应超时，暂时无法处理图片内容。请稍后重试。',
  general: '[系统] 由于响应超时，暂时无法完成请求。请稍后重试。'
};

/**
 * 默认成本优化配置
 */
export const DEFAULT_COST_CONFIG: CostOptimizationConfig = {
  taskTypeProviderMap: {
    comment: 'minimax',    // 评论生成用 MiniMax（便宜且快速）
    long_text: 'kimi',     // 长文本用 Kimi（擅长处理）
    character: 'deepseek', // 角色设定用 DeepSeek（创造性高）
    multimodal: 'doubao',  // 多模态用豆包（视觉处理强）
    general: 'minimax'     // 通用任务用 MiniMax（性价比高）
  }
};

/**
 * 默认智能切换配置
 */
export const DEFAULT_FALLBACK_CONFIG: FallbackConfig = {
  primaryProvider: 'minimax',
  fallbackProviders: ['qwen', 'kimi', 'deepseek'],
  maxRetries: 3,
  retryDelay: 1000
};

/**
 * 默认超时配置
 */
export const DEFAULT_TIMEOUT_CONFIG: TimeoutConfig = {
  defaultTimeout: 10000,
  fallbackTemplate: DEFAULT_TIMEOUT_TEMPLATES.general
};

/**
 * AI 服务管理器类
 */
export class AIServiceManager {
  private services: Map<AIProvider, BaseAIService> = new Map();
  private fallbackConfig: FallbackConfig;
  private costConfig: CostOptimizationConfig;
  private timeoutConfig: TimeoutConfig;
  private apiKeyMap: Record<string, string> = {};

  constructor(options?: {
    apiKeys?: Record<string, string>;
    fallbackConfig?: FallbackConfig;
    costConfig?: CostOptimizationConfig;
    timeoutConfig?: TimeoutConfig;
  }) {
    // 初始化 API Keys
    if (options?.apiKeys) {
      this.apiKeyMap = options.apiKeys;
      this.initializeServices();
    }

    // 使用默认配置或用户配置
    this.fallbackConfig = options?.fallbackConfig || DEFAULT_FALLBACK_CONFIG;
    this.costConfig = options?.costConfig || DEFAULT_COST_CONFIG;
    this.timeoutConfig = options?.timeoutConfig || DEFAULT_TIMEOUT_CONFIG;
  }

  /**
   * 初始化所有 AI 服务
   */
  private initializeServices() {
    if (this.apiKeyMap.minimax) {
      this.services.set('minimax', createMiniMaxService(this.apiKeyMap.minimax));
    }
    if (this.apiKeyMap.kimi) {
      this.services.set('kimi', createKimiService(this.apiKeyMap.kimi));
    }
    if (this.apiKeyMap.deepseek) {
      this.services.set('deepseek', createDeepSeekService(this.apiKeyMap.deepseek));
    }
    if (this.apiKeyMap.doubao) {
      this.services.set('doubao', createDoubaoService(this.apiKeyMap.doubao));
    }
    if (this.apiKeyMap.qwen) {
      this.services.set('qwen', createQwenService(this.apiKeyMap.qwen));
    }
  }

  /**
   * 手动添加 AI 服务
   */
  addService(provider: AIProvider, service: BaseAIService) {
    this.services.set(provider, service);
  }

  /**
   * 获取服务
   */
  private getService(provider: AIProvider): BaseAIService | undefined {
    return this.services.get(provider);
  }

  /**
   * 根据任务类型选择最优提供商（成本优化）
   */
  private selectProviderByTaskType(taskType: TaskType): AIProvider {
    const provider = this.costConfig.taskTypeProviderMap[taskType];
    // 确保选中的提供商可用
    if (this.services.has(provider)) {
      return provider;
    }
    // 如果配置的提供商不可用，返回第一个可用的
    return this.fallbackConfig.primaryProvider;
  }

  /**
   * 发送请求（带智能切换）
   */
  async sendRequest(config: AIRequestConfig): Promise<AIResponse> {
    const provider = config.provider || 
                     this.selectProviderByTaskType(config.taskType || 'general');
    
    // 构建提供商列表（主提供商 + 备用提供商）
    const providerChain = this.buildProviderChain(provider);

    // 尝试每个提供商
    for (let i = 0; i < providerChain.length; i++) {
      const currentProvider = providerChain[i];
      const service = this.getService(currentProvider);

      if (!service) {
        console.warn(`Service ${currentProvider} not available, skipping...`);
        continue;
      }

      try {
        // 发送请求
        const response = await this.sendWithTimeout(
          service,
          config,
          this.timeoutConfig.defaultTimeout
        );

        // 如果成功，返回结果
        if (response.success) {
          return {
            ...response,
            fallback: i > 0  // 标记是否使用了备用模型
          };
        }

        // 如果失败但不是超时，记录错误并继续尝试下一个
        console.warn(`Provider ${currentProvider} failed: ${response.error}`);
        
        // 如果是最后一个提供商，返回错误
        if (i === providerChain.length - 1) {
          return response;
        }

      } catch (error) {
        console.error(`Provider ${currentProvider} error:`, error);
        
        // 如果是最后一个提供商，返回错误
        if (i === providerChain.length - 1) {
          return {
            success: false,
            content: '',
            provider: currentProvider,
            model: 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }

      // 重试延迟
      if (i < providerChain.length - 1 && this.fallbackConfig.retryDelay) {
        await this.delay(this.fallbackConfig.retryDelay);
      }
    }

    // 所有提供商都失败，返回超时模板
    return this.createTimeoutResponse(config.taskType || 'general');
  }

  /**
   * 构建提供商链（主提供商 + 备用提供商）
   */
  private buildProviderChain(primary: AIProvider): AIProvider[] {
    const fallbacks = this.fallbackConfig.fallbackProviders.filter(
      p => p !== primary && this.services.has(p)
    );
    return [primary, ...fallbacks];
  }

  /**
   * 带超时的请求
   */
  private async sendWithTimeout(
    service: BaseAIService,
    config: AIRequestConfig,
    timeout: number
  ): Promise<AIResponse> {
    const timeoutPromise = new Promise<AIResponse>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    const requestPromise = service.sendRequest({
      ...config,
      timeout: timeout
    });

    try {
      return await Promise.race([requestPromise, timeoutPromise]);
    } catch (error) {
      if (error instanceof Error && error.message === 'Request timeout') {
        throw error;
      }
      throw error;
    }
  }

  /**
   * 创建超时响应
   */
  private createTimeoutResponse(taskType: TaskType): AIResponse {
    const template = DEFAULT_TIMEOUT_TEMPLATES[taskType] || 
                     DEFAULT_TIMEOUT_TEMPLATES.general;
    
    return {
      success: false,
      content: template,
      provider: this.fallbackConfig.primaryProvider,
      model: 'timeout',
      timeout: true
    };
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 便捷方法：生成评论
   */
  async generateComment(prompt: string, context?: string): Promise<AIResponse> {
    const messages: Message[] = [
      {
        role: 'system',
        content: '你是一个专业的游戏评论生成器，擅长生成有趣、有深度的游戏评论。'
      },
      {
        role: 'user',
        content: context 
          ? `请为以下内容生成评论：\n\n${context}\n\n用户提示：${prompt}`
          : prompt
      }
    ];

    return this.sendRequest({
      provider: 'minimax',
      messages,
      taskType: 'comment',
      temperature: 0.8,
      maxTokens: 500
    });
  }

  /**
   * 便捷方法：生成角色设定
   */
  async generateCharacter(description: string): Promise<AIResponse> {
    const messages: Message[] = [
      {
        role: 'system',
        content: '你是一个专业的角色设定师，擅长创造生动、有个性的游戏角色。'
      },
      {
        role: 'user',
        content: `请根据以下描述生成角色设定：\n\n${description}`
      }
    ];

    return this.sendRequest({
      provider: 'deepseek',
      messages,
      taskType: 'character',
      temperature: 0.9,
      maxTokens: 1000
    });
  }

  /**
   * 便捷方法：处理长文本
   */
  async processLongText(text: string, instruction: string): Promise<AIResponse> {
    const messages: Message[] = [
      {
        role: 'system',
        content: '你是一个专业的长文本处理助手，擅长总结、分析和处理长文本内容。'
      },
      {
        role: 'user',
        content: `${instruction}\n\n文本内容：\n\n${text}`
      }
    ];

    return this.sendRequest({
      provider: 'kimi',
      messages,
      taskType: 'long_text',
      temperature: 0.7,
      maxTokens: 4096
    });
  }

  /**
   * 便捷方法：多模态处理
   */
  async processMultimodal(
    prompt: string,
    imageUrls: string[]
  ): Promise<AIResponse> {
    const messages: Message[] = [
      {
        role: 'system',
        content: '你是一个专业的多模态 AI 助手，擅长分析图片和文本内容。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return this.sendRequest({
      provider: 'doubao',
      messages,
      imageUrls,
      taskType: 'multimodal',
      temperature: 0.7,
      maxTokens: 1000
    });
  }

  /**
   * 获取所有可用的提供商
   */
  getAvailableProviders(): AIProvider[] {
    return Array.from(this.services.keys());
  }

  /**
   * 更新超时配置
   */
  updateTimeoutConfig(config: Partial<TimeoutConfig>) {
    this.timeoutConfig = { ...this.timeoutConfig, ...config };
  }

  /**
   * 更新成本优化配置
   */
  updateCostConfig(config: Partial<CostOptimizationConfig>) {
    this.costConfig = { ...this.costConfig, ...config };
  }

  /**
   * 更新智能切换配置
   */
  updateFallbackConfig(config: Partial<FallbackConfig>) {
    this.fallbackConfig = { ...this.fallbackConfig, ...config };
  }
}

/**
 * 创建 AI 服务管理器的工厂函数
 */
export function createAIServiceManager(options?: {
  apiKeys?: Record<string, string>;
  fallbackConfig?: FallbackConfig;
  costConfig?: CostOptimizationConfig;
  timeoutConfig?: TimeoutConfig;
}): AIServiceManager {
  return new AIServiceManager(options);
}
