/**
 * MiniMax 2.5 AI 服务实现
 * 评论生成主力模型
 */

import { BaseAIService } from '../base';
import { AIProvider, ProviderConfig, AIRequestConfig, AIResponse } from '../types';

export class MiniMaxService extends BaseAIService {
  constructor(config: ProviderConfig) {
    super(config, 'minimax');
  }

  /**
   * 发送请求到 MiniMax API
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
        error instanceof Error ? error.message : 'MiniMax request failed'
      );
    }
  }

  /**
   * 构建 MiniMax 请求体
   */
  private buildRequestBody(config: AIRequestConfig): any {
    return {
      model: config.model || this.config.model,
      messages: this.buildMessages(config.messages),
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens || 2048,
      stream: config.stream || false
    };
  }

  /**
   * 提取 MiniMax 响应内容
   */
  protected extractContent(response: any): string {
    return response.choices?.[0]?.message?.content || '';
  }

  /**
   * 提取 MiniMax 使用量信息
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
 * 创建 MiniMax 服务实例的工厂函数
 */
export function createMiniMaxService(apiKey: string): MiniMaxService {
  return new MiniMaxService({
    apiKey,
    baseUrl: 'https://api.minimaxi.com',
    model: 'MiniMax-2.5',
    timeout: 10000,
    maxRetries: 3
  });
}
