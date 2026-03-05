/**
 * AI 服务使用示例
 * 
 * 此文件展示如何在项目中使用 AI 服务管理器
 */

import { 
  createAIServiceManager,
  AIServiceManager,
  AIProvider
} from './index';

/**
 * 示例 1: 基础使用 - 创建管理器并发送请求
 */
export async function basicExample() {
  // 1. 创建 AI 服务管理器（从环境变量读取 API Keys）
  const manager = createAIServiceManager({
    apiKeys: {
      minimax: process.env.MINIMAX_API_KEY || '',
      kimi: process.env.KIMI_API_KEY || '',
      deepseek: process.env.DEEPSEEK_API_KEY || '',
      doubao: process.env.DOUBAO_API_KEY || '',
      qwen: process.env.QWEN_API_KEY || ''
    }
  });

  // 2. 发送通用请求
  const response = await manager.sendRequest({
    provider: 'minimax',
    messages: [
      { role: 'system', content: '你是一个有帮助的助手' },
      { role: 'user', content: '你好，请介绍一下自己' }
    ],
    temperature: 0.7,
    maxTokens: 500,
    timeout: 10000
  });

  if (response.success) {
    console.log('AI 回复:', response.content);
    console.log('使用模型:', response.model);
    console.log('Token 使用:', response.usage);
  } else {
    console.error('请求失败:', response.error);
  }
}

/**
 * 示例 2: 使用便捷方法 - 生成游戏评论
 */
export async function generateCommentExample() {
  const manager = createAIServiceManager({
    apiKeys: {
      minimax: process.env.MINIMAX_API_KEY || ''
    }
  });

  // 使用便捷方法生成评论
  const response = await manager.generateComment(
    '请评价这款游戏',
    '这是一款开放世界 RPG 游戏，玩家可以在广阔的奇幻世界中探索、战斗和解谜...'
  );

  if (response.success) {
    console.log('生成的评论:', response.content);
  }
}

/**
 * 示例 3: 生成角色设定
 */
export async function generateCharacterExample() {
  const manager = createAIServiceManager({
    apiKeys: {
      deepseek: process.env.DEEPSEEK_API_KEY || ''
    }
  });

  const response = await manager.generateCharacter(
    '一位来自未来世界的机械少女，拥有强大的战斗能力，但内心渴望普通人的生活'
  );

  if (response.success) {
    console.log('角色设定:', response.content);
  }
}

/**
 * 示例 4: 处理长文本（使用 Kimi）
 */
export async function processLongTextExample() {
  const manager = createAIServiceManager({
    apiKeys: {
      kimi: process.env.KIMI_API_KEY || ''
    }
  });

  const longText = `...很长的文本内容...`;
  
  const response = await manager.processLongText(
    longText,
    '请总结这篇文章的主要观点'
  );

  if (response.success) {
    console.log('文本摘要:', response.content);
  }
}

/**
 * 示例 5: 多模态处理（图片 + 文本）
 */
export async function processMultimodalExample() {
  const manager = createAIServiceManager({
    apiKeys: {
      doubao: process.env.DOUBAO_API_KEY || ''
    }
  });

  const response = await manager.processMultimodal(
    '请描述这张图片的内容和风格',
    ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
  );

  if (response.success) {
    console.log('图片分析:', response.content);
  }
}

/**
 * 示例 6: 自定义配置 - 调整超时和切换策略
 */
export async function customConfigExample() {
  const manager = createAIServiceManager({
    apiKeys: {
      minimax: process.env.MINIMAX_API_KEY || '',
      qwen: process.env.QWEN_API_KEY || '',
      kimi: process.env.KIMI_API_KEY || ''
    },
    // 自定义超时配置
    timeoutConfig: {
      defaultTimeout: 15000,  // 15 秒超时
      fallbackTemplate: '[系统繁忙] 请稍后重试'
    },
    // 自定义切换配置
    fallbackConfig: {
      primaryProvider: 'minimax',
      fallbackProviders: ['qwen', 'kimi'],
      maxRetries: 3,
      retryDelay: 2000  // 重试间隔 2 秒
    },
    // 自定义成本优化配置
    costConfig: {
      taskTypeProviderMap: {
        comment: 'minimax',    // 评论用 MiniMax
        long_text: 'kimi',     // 长文本用 Kimi
        character: 'minimax',  // 角色设定也用 MiniMax（省钱）
        multimodal: 'doubao',
        general: 'minimax'
      }
    }
  });

  const response = await manager.sendRequest({
    messages: [
      { role: 'user', content: '你好' }
    ],
    taskType: 'general'  // 会自动选择 minimax
  });

  console.log('响应:', response);
}

/**
 * 示例 7: 在 Express/Koa 路由中使用
 */
export function setupAIRoutes(app: any) {
  // 创建全局 AI 管理器实例
  const aiManager = createAIServiceManager({
    apiKeys: {
      minimax: process.env.MINIMAX_API_KEY || '',
      kimi: process.env.KIMI_API_KEY || '',
      deepseek: process.env.DEEPSEEK_API_KEY || '',
      doubao: process.env.DOUBAO_API_KEY || '',
      qwen: process.env.QWEN_API_KEY || ''
    }
  });

  // 评论生成接口
  app.post('/api/ai/generate-comment', async (req: any, res: any) => {
    try {
      const { prompt, context } = req.body;
      const response = await aiManager.generateComment(prompt, context);
      
      res.json({
        success: response.success,
        content: response.content,
        provider: response.provider,
        fallback: response.fallback
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 角色设定接口
  app.post('/api/ai/generate-character', async (req: any, res: any) => {
    try {
      const { description } = req.body;
      const response = await aiManager.generateCharacter(description);
      
      res.json({
        success: response.success,
        content: response.content,
        provider: response.provider
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 通用 AI 接口
  app.post('/api/ai/chat', async (req: any, res: any) => {
    try {
      const { messages, provider, taskType } = req.body;
      
      const response = await aiManager.sendRequest({
        provider: provider as AIProvider,
        messages,
        taskType: taskType as any
      });
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

/**
 * 示例 8: 错误处理和重试
 */
export async function errorHandlingExample() {
  const manager = createAIServiceManager({
    apiKeys: {
      minimax: process.env.MINIMAX_API_KEY || ''
    }
  });

  try {
    const response = await manager.sendRequest({
      provider: 'minimax',
      messages: [{ role: 'user', content: '测试' }],
      timeout: 5000
    });

    if (response.success) {
      console.log('成功:', response.content);
    } else if (response.timeout) {
      console.log('请求超时，使用预设模板:', response.content);
    } else {
      console.log('请求失败:', response.error);
    }
  } catch (error) {
    console.error('发生错误:', error);
  }
}

/**
 * 示例 9: 检查可用提供商
 */
export async function checkAvailableProviders() {
  const manager = createAIServiceManager({
    apiKeys: {
      minimax: process.env.MINIMAX_API_KEY || '',
      kimi: process.env.KIMI_API_KEY || ''
      // 只配置了两个 API Key
    }
  });

  const available = manager.getAvailableProviders();
  console.log('可用的 AI 提供商:', available);
  // 输出：['minimax', 'kimi']
}

// 导出默认示例
export default {
  basicExample,
  generateCommentExample,
  generateCharacterExample,
  processLongTextExample,
  processMultimodalExample,
  customConfigExample,
  setupAIRoutes,
  errorHandlingExample,
  checkAvailableProviders
};
