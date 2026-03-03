/**
 * AI 服务基础类
 * 所有 AI 提供商的基类
 */

import {
  AIProvider,
  ProviderConfig,
  AIRequestConfig,
  AIResponse,
  Message
} from './types';

export abstract class BaseAIService {
  protected config: ProviderConfig;
  protected readonly provider: AIProvider;

  constructor(config: ProviderConfig, provider: AIProvider) {
    this.config = config;
    this.provider = provider;
  }

  /**
   * 获取提供商名称
   */
  getProvider(): AIProvider {
    return this.provider;
  }

  /**
   * 发送 AI 请求（抽象方法，子类必须实现）
   */
  abstract sendRequest(config: AIRequestConfig): Promise<AIResponse>;

  /**
   * 构建消息体（默认实现）
   */
  protected buildMessages(messages: Message[]): any[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * 处理响应（默认实现）
   */
  protected processResponse(response: any): AIResponse {
    return {
      success: true,
      content: this.extractContent(response),
      provider: this.provider,
      model: this.config.model,
      usage: this.extractUsage(response)
    };
  }

  /**
   * 提取响应内容（子类实现）
   */
  protected abstract extractContent(response: any): string;

  /**
   * 提取使用量信息（可选）
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

  /**
   * 创建错误响应
   */
  protected createErrorResponse(error: string): AIResponse {
    return {
      success: false,
      content: '',
      provider: this.provider,
      model: this.config.model,
      error
    };
  }

  /**
   * 执行 HTTP 请求
   */
  protected async executeRequest(
    url: string,
    body: any,
    timeout: number = 10000
  ): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `${this.provider} API Error: ${response.status} - ${errorData.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`${this.provider} Request timeout after ${timeout}ms`);
        }
        throw error;
      }
      throw new Error(`${this.provider} Unknown error`);
    }
  }
}
