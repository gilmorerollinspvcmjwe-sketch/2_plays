/**
 * DeepSeek AI 服务实现
 * 角色设定专家
 */

import { BaseAIService } from './base';
import { AIProvider, ProviderConfig, AIRequestConfig, AIResponse } from './types';

export class DeepSeekService extends BaseAIService {
  constructor(config: ProviderConfig) {
    super(config, 'deepseek');
  }

  /**
   * 发送请求到 DeepSeek API
   */
  async sendRequest(config: AIRequestConfig): Promise<AIResponse> {
    try {
      const url = `${this.config.baseUrl}/v1/chat/completions`;
      const body = this.buildRequestBody(config);

      const response = await this.executeRequest(
        url,
        body,
        config.timeout || this.config.timeout || 10000
      );

      return this.processResponse(response);
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'DeepSeek request failed'
      );
    }
  }

  /**
   * 构建 DeepSeek 请求体
   */
  private buildRequestBody(config: AIRequestConfig): any {
    return {
      model: config.model || this.config.model,
      messages: this.buildMessages(config.messages),
      temperature: config.temperature ?? 0.9,  // 角色设定需要更高创造性
      max_tokens: config.maxTokens || 2048,
      stream: config.stream || false
    };
  }

  /**
   * 提取 DeepSeek 响应内容
   */
  protected extractContent(response: any): string {
    return response.choices?.[0]?.message?.content || '';
  }

  /**
   * 提取 DeepSeek 使用量信息
   */
  protected extractUsage(response: any): AIResponse['usage'] | undefined {
    if (response.usage) {
      return {
        promptTokens: response.usage.prompt_tokens || 0,
        completionTokens: response.usage.completion_tokens || 0,
        totalTokens: response.usage.total_tokens || 0
      };
    }
    return undefined;
  }
}

/**
 * 创建 DeepSeek 服务实例的工厂函数
 */
export function createDeepSeekService(apiKey: string): DeepSeekService {
  return new DeepSeekService({
    apiKey,
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    timeout: 10000,
    maxRetries: 3
  });
}
