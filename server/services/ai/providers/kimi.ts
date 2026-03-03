/**
 * Kimi 2.5 AI 服务实现
 * 长文本处理专家
 */

import { BaseAIService } from './base';
import { AIProvider, ProviderConfig, AIRequestConfig, AIResponse } from './types';

export class KimiService extends BaseAIService {
  constructor(config: ProviderConfig) {
    super(config, 'kimi');
  }

  /**
   * 发送请求到 Kimi API
   */
  async sendRequest(config: AIRequestConfig): Promise<AIResponse> {
    try {
      const url = `${this.config.baseUrl}/v1/chat/completions`;
      const body = this.buildRequestBody(config);

      const response = await this.executeRequest(
        url,
        body,
        config.timeout || this.config.timeout || 15000  // Kimi 长文本需要更长时间
      );

      return this.processResponse(response);
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Kimi request failed'
      );
    }
  }

  /**
   * 构建 Kimi 请求体
   */
  private buildRequestBody(config: AIRequestConfig): any {
    return {
      model: config.model || this.config.model,
      messages: this.buildMessages(config.messages),
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens || 4096,  // Kimi 支持更长的输出
      stream: config.stream || false
    };
  }

  /**
   * 提取 Kimi 响应内容
   */
  protected extractContent(response: any): string {
    return response.choices?.[0]?.message?.content || '';
  }

  /**
   * 提取 Kimi 使用量信息
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
 * 创建 Kimi 服务实例的工厂函数
 */
export function createKimiService(apiKey: string): KimiService {
  return new KimiService({
    apiKey,
    baseUrl: 'https://api.moonshot.cn',
    model: 'moonshot-v1-8k',  // 或 moonshot-v1-32k, moonshot-v1-128k
    timeout: 15000,
    maxRetries: 3
  });
}
