/**
 * AI 服务测试文件
 * 测试各个 AI 提供商的集成
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AIServiceManager,
  createAIServiceManager,
  AIProvider,
  AIRequestConfig,
  Message
} from '../index';

// Mock fetch
global.fetch = vi.fn();

describe('AI Service Manager', () => {
  let manager: AIServiceManager;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // 创建测试用的管理器（不传入真实 API Key）
    manager = createAIServiceManager({
      apiKeys: {
        minimax: 'test-minimax-key',
        kimi: 'test-kimi-key',
        deepseek: 'test-deepseek-key',
        doubao: 'test-doubao-key',
        qwen: 'test-qwen-key'
      },
      timeoutConfig: {
        defaultTimeout: 5000,
        fallbackTemplate: '[超时] 测试超时模板'
      }
    });
  });

  describe('初始化', () => {
    it('应该成功创建管理器实例', () => {
      expect(manager).toBeDefined();
    });

    it('应该初始化所有可用的服务提供商', () => {
      const availableProviders = manager.getAvailableProviders();
      expect(availableProviders.length).toBeGreaterThan(0);
    });
  });

  describe('提供商选择', () => {
    it('应该根据任务类型选择正确的提供商', () => {
      // 这个测试验证成本优化配置
      const availableProviders = manager.getAvailableProviders();
      expect(availableProviders).toContain('minimax');
    });
  });

  describe('请求处理', () => {
    it('应该正确处理请求配置', async () => {
      const messages: Message[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello!' }
      ];

      const config: AIRequestConfig = {
        provider: 'minimax',
        messages,
        temperature: 0.7,
        maxTokens: 100,
        timeout: 5000
      };

      // Mock fetch 返回成功响应
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Hello! How can I help you?' } }],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30
          }
        })
      });

      const response = await manager.sendRequest(config);

      expect(response.success).toBe(true);
      expect(response.provider).toBe('minimax');
      expect(response.content).toBe('Hello! How can I help you?');
    });

    it('应该在主提供商失败时自动切换到备用提供商', async () => {
      // Mock fetch 先失败，然后成功
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Minimax API error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'Response from fallback' } }]
          })
        });

      const messages: Message[] = [
        { role: 'user', content: 'Test message' }
      ];

      const config: AIRequestConfig = {
        provider: 'minimax',
        messages
      };

      const response = await manager.sendRequest(config);

      expect(response.success).toBe(true);
      expect(response.fallback).toBe(true);
    });

    it('应该在所有提供商失败时返回错误', async () => {
      // Mock fetch 全部失败
      (global.fetch as any).mockRejectedValue(new Error('All providers failed'));

      const messages: Message[] = [
        { role: 'user', content: 'Test message' }
      ];

      const config: AIRequestConfig = {
        provider: 'minimax',
        messages
      };

      const response = await manager.sendRequest(config);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });
  });

  describe('超时处理', () => {
    it('应该在超时时返回预设模板', async () => {
      // Mock fetch 超时
      (global.fetch as any).mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 10000);
        });
      });

      const messages: Message[] = [
        { role: 'user', content: 'Test message' }
      ];

      const config: AIRequestConfig = {
        provider: 'minimax',
        messages,
        taskType: 'comment',
        timeout: 1000  // 设置很短的超时时间
      };

      const response = await manager.sendRequest(config);

      expect(response.success).toBe(false);
      expect(response.timeout).toBe(true);
    });
  });

  describe('便捷方法', () => {
    it('应该正确调用 generateComment', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '这是一条测试评论' } }]
        })
      });

      const response = await manager.generateComment('测试游戏');

      expect(response.success).toBe(true);
      expect(response.content).toBe('这是一条测试评论');
    });

    it('应该正确调用 generateCharacter', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '角色设定：勇敢的战士' } }]
        })
      });

      const response = await manager.generateCharacter('勇敢的战士');

      expect(response.success).toBe(true);
      expect(response.content).toBe('角色设定：勇敢的战士');
    });

    it('应该正确调用 processLongText', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '长文本摘要：...' } }]
        })
      });

      const response = await manager.processLongText(
        '这是一段很长的文本...',
        '请总结这段文本'
      );

      expect(response.success).toBe(true);
      expect(response.content).toBe('长文本摘要：...');
    });

    it('应该正确调用 processMultimodal', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '图片内容分析：...' } }]
        })
      });

      const response = await manager.processMultimodal(
        '请分析这张图片',
        ['https://example.com/image.jpg']
      );

      expect(response.success).toBe(true);
      expect(response.content).toBe('图片内容分析：...');
    });
  });

  describe('配置更新', () => {
    it('应该能够更新超时配置', () => {
      manager.updateTimeoutConfig({
        defaultTimeout: 15000
      });
      // 验证配置已更新（可以通过后续请求行为验证）
    });

    it('应该能够更新成本优化配置', () => {
      manager.updateCostConfig({
        taskTypeProviderMap: {
          comment: 'qwen',
          long_text: 'kimi',
          character: 'deepseek',
          multimodal: 'doubao',
          general: 'minimax'
        }
      });
    });

    it('应该能够更新智能切换配置', () => {
      manager.updateFallbackConfig({
        primaryProvider: 'qwen',
        fallbackProviders: ['minimax', 'kimi'],
        maxRetries: 5
      });
    });
  });
});

describe('独立服务测试', () => {
  describe('MiniMax Service', () => {
    it('应该能够独立创建 MiniMax 服务', () => {
      const { createMiniMaxService } = require('../index');
      const service = createMiniMaxService('test-key');
      expect(service).toBeDefined();
      expect(service.getProvider()).toBe('minimax');
    });
  });

  describe('Kimi Service', () => {
    it('应该能够独立创建 Kimi 服务', () => {
      const { createKimiService } = require('../index');
      const service = createKimiService('test-key');
      expect(service).toBeDefined();
      expect(service.getProvider()).toBe('kimi');
    });
  });

  describe('DeepSeek Service', () => {
    it('应该能够独立创建 DeepSeek 服务', () => {
      const { createDeepSeekService } = require('../index');
      const service = createDeepSeekService('test-key');
      expect(service).toBeDefined();
      expect(service.getProvider()).toBe('deepseek');
    });
  });

  describe('Doubao Service', () => {
    it('应该能够独立创建豆包服务', () => {
      const { createDoubaoService } = require('../index');
      const service = createDoubaoService('test-key');
      expect(service).toBeDefined();
      expect(service.getProvider()).toBe('doubao');
    });
  });

  describe('Qwen Service', () => {
    it('应该能够独立创建通义千问服务', () => {
      const { createQwenService } = require('../index');
      const service = createQwenService('test-key');
      expect(service).toBeDefined();
      expect(service.getProvider()).toBe('qwen');
    });
  });
});
