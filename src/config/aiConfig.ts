/**
 * AI 服务配置
 * 支持多模型切换、成本优化、智能降级
 */

export type AIProvider = 'minimax' | 'kimi' | 'deepseek' | 'doubao' | 'qwen';

export interface AIModelConfig {
  name: string;
  provider: AIProvider;
  model: string;
  description: string;
  costPerRequest: number;
  maxTokens: number;
  supportedTasks: string[];
}

export interface AIGlobalConfig {
  currentProvider: AIProvider;
  fallbackProviders: AIProvider[];
  timeout: number;
  maxRetries: number;
  useMock: boolean;
}

export const AI_MODELS: Record<AIProvider, AIModelConfig> = {
  minimax: {
    name: 'MiniMax',
    provider: 'minimax',
    model: 'abab6.5-chat',
    description: '性价比高，适合评论生成',
    costPerRequest: 0.01,
    maxTokens: 4096,
    supportedTasks: ['comment', 'dialogue', 'general']
  },
  kimi: {
    name: 'Kimi',
    provider: 'kimi',
    model: 'moonshot-v1-8k',
    description: '长文本处理强，适合剧情生成',
    costPerRequest: 0.02,
    maxTokens: 8192,
    supportedTasks: ['plot', 'long_text', 'character']
  },
  deepseek: {
    name: 'DeepSeek',
    provider: 'deepseek',
    model: 'deepseek-chat',
    description: '创造性高，适合角色设定',
    costPerRequest: 0.015,
    maxTokens: 4096,
    supportedTasks: ['character', 'dialogue', 'plot']
  },
  doubao: {
    name: '豆包',
    provider: 'doubao',
    model: 'doubao-pro-4k',
    description: '多模态支持，适合图片分析',
    costPerRequest: 0.012,
    maxTokens: 4096,
    supportedTasks: ['multimodal', 'comment', 'general']
  },
  qwen: {
    name: '通义千问',
    provider: 'qwen',
    model: 'qwen-turbo',
    description: '综合能力强，适合通用任务',
    costPerRequest: 0.008,
    maxTokens: 4096,
    supportedTasks: ['comment', 'character', 'general']
  }
};

export const TASK_PROVIDER_MAP: Record<string, AIProvider> = {
  comment: 'minimax',
  dialogue: 'deepseek',
  plot: 'kimi',
  character: 'deepseek',
  long_text: 'kimi',
  multimodal: 'doubao',
  general: 'qwen'
};

const DEFAULT_CONFIG: AIGlobalConfig = {
  currentProvider: 'minimax',
  fallbackProviders: ['qwen', 'kimi', 'deepseek'],
  timeout: 10000,
  maxRetries: 3,
  useMock: true
};

let globalConfig = { ...DEFAULT_CONFIG };

export function getConfig(): AIGlobalConfig {
  return { ...globalConfig };
}

export function setProvider(provider: AIProvider): void {
  globalConfig.currentProvider = provider;
  saveConfig();
}

export function setUseMock(useMock: boolean): void {
  globalConfig.useMock = useMock;
  saveConfig();
}

export function getProviderForTask(task: string): AIProvider {
  return TASK_PROVIDER_MAP[task] || globalConfig.currentProvider;
}

export function getModelConfig(provider: AIProvider): AIModelConfig {
  return AI_MODELS[provider];
}

export function getAllProviders(): AIProvider[] {
  return Object.keys(AI_MODELS) as AIProvider[];
}

export function getAvailableProviders(): AIProvider[] {
  return globalConfig.useMock 
    ? getAllProviders() 
    : getAllProviders();
}

function saveConfig(): void {
  try {
    localStorage.setItem('ai_config', JSON.stringify(globalConfig));
  } catch (e) {
    console.error('保存 AI 配置失败:', e);
  }
}

function loadConfig(): void {
  try {
    const saved = localStorage.getItem('ai_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      globalConfig = { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error('加载 AI 配置失败:', e);
  }
}

loadConfig();

export function resetConfig(): void {
  globalConfig = { ...DEFAULT_CONFIG };
  saveConfig();
}

export function estimateCost(provider: AIProvider, requestCount: number): number {
  const config = AI_MODELS[provider];
  return config.costPerRequest * requestCount;
}

export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `${(cost * 1000).toFixed(2)} 厘`;
  }
  return `${cost.toFixed(2)} 元`;
}
