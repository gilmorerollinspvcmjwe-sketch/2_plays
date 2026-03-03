/**
 * 豆包 AI 服务实现
 * 多模态处理专家
 */

import { BaseAIService } from './base';
import { AIProvider, ProviderConfig, AIRequestConfig, AIResponse, Message, ImageContent } from './types';

export class DoubaoService extends BaseAIService {
  constructor(config: ProviderConfig) {
    super(config, 'doubao');
  }

  /**
   * 发送请求到豆包 API
   */
  async sendRequest(config: AIRequestConfig): Promise<AIResponse> {
    try {
      const url = `${this.config.baseUrl}/api/v3/chat/completions`;
      const body = this.buildRequestBody(config);

      const response = await this.executeRequest(
        url,
        body,
        config.timeout || this.config.timeout || 12000
      );

      return this.processResponse(response);
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Doubao request failed'
      );
    }
  }

  /**
   * 构建豆包请求体（支持多模态）
   */
  private buildRequestBody(config: AIRequestConfig): any {
    const messages = config.imageUrls && config.imageUrls.length > 0
      ? this.buildMultiModalMessages(config.messages, config.imageUrls)
      : this.buildMessages(config.messages);

    return {
      model: config.model || this.config.model,
      messages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens || 2048,
      stream: config.stream || false
    };
  }

  /**
   * 构建多模态消息
   */
  private buildMultiModalMessages(messages: Message[], imageUrls: string[]): any[] {
    const lastMessage = messages[messages.length - 1];
    const content: (string | ImageContent)[] = [];

    // 添加图片内容
    imageUrls.forEach(url => {
      content.push({
        type: 'image_url',
        image_url: {
          url,
          detail: 'auto'
        }
      });
    });

    // 添加文本内容
    if (lastMessage && lastMessage.content) {
      content.push(lastMessage.content);
    }

    // 构建消息数组
    const resultMessages = messages.slice(0, -1).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // 添加最后一条多模态消息
    if (lastMessage) {
      resultMessages.push({
        role: lastMessage.role,
        content
      });
    }

    return resultMessages;
  }

  /**
   * 提取豆包响应内容
   */
  protected extractContent(response: any): string {
    return response.choices?.[0]?.message?.content || '';
  }

  /**
   * 提取豆包使用量信息
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
 * 创建豆包服务实例的工厂函数
 */
export function createDoubaoService(apiKey: string): DoubaoService {
  return new DoubaoService({
    apiKey,
    baseUrl: 'https://ark.cn-beijing.volces.com',
    model: 'doubao-pro-4k',
    timeout: 12000,
    maxRetries: 3
  });
}
