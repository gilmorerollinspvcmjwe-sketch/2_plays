/**
 * 通义千问 3.5 AI 服务实现
 * 综合备用模型
 */

import { BaseAIService } from '../base';
import { AIProvider, ProviderConfig, AIRequestConfig, AIResponse } from '../types';

export class QwenService extends BaseAIService {
  constructor(config: ProviderConfig) {
    super(config, 'qwen');
  }

  /**
   * 发送请求到通义千问 API
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
        error instanceof Error ? error.message : 'Qwen request failed'
      );
    }
  }

  /**
   * 构建通义千问请求体
   */
  private buildRequestBody(config: AIRequestConfig): any {
    return {
      model: config.model || this.config.model,
      messages: this.buildMessages(config.messages),
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens || 2048,
      stream: config.stream || false,
      // 通义千问特有参数
      top_p: 0.8,
      enable_search: true  // 启用搜索增强
    };
  }

  /**
   * 提取通义千问响应内容
   */
  protected extractContent(response: any): string {
    return response.choices?.[0]?.message?.content || '';
  }

  /**
   * 提取通义千问使用量信息
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
 * 创建通义千问服务实例的工厂函数
 */
export function createQwenService(apiKey: string): QwenService {
  return new QwenService({
    apiKey,
    baseUrl: 'https://dashscope.aliyuncs.com',
    model: 'qwen-max',
    timeout: 10000,
    maxRetries: 3
  });
}
