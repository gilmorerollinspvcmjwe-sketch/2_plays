/**
 * AI 服务统一类型定义
 */

/**
 * AI 模型提供商
 */
export type AIProvider = 
  | 'minimax'      // MiniMax 2.5 - 评论生成主力
  | 'kimi'         // Kimi 2.5 - 长文本处理
  | 'deepseek'     // DeepSeek - 角色设定
  | 'doubao'       // 豆包 - 多模态
  | 'qwen'         // 通义千问 3.5 - 综合备用
  | 'custom';      // 自定义

/**
 * 任务类型（用于成本优化）
 */
export type TaskType = 
  | 'comment'       // 评论生成（简单任务）
  | 'long_text'    // 长文本处理
  | 'character'    // 角色设定
  | 'multimodal'   // 多模态处理
  | 'general';     // 通用任务

/**
 * 消息角色
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * 消息内容
 */
export interface Message {
  role: MessageRole;
  content: string;
}

/**
 * 图片内容（用于多模态）
 */
export interface ImageContent {
  type: 'image_url';
  image_url: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

/**
 * 多模态消息内容
 */
export type MultiModalContent = string | (string | ImageContent)[];

/**
 * AI 请求配置
 */
export interface AIRequestConfig {
  provider: AIProvider;
  model?: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  timeout?: number;        // 超时时间（毫秒），默认 10000
  stream?: boolean;
  imageUrls?: string[];    // 可选的图片 URLs（多模态）
  taskType?: TaskType;     // 任务类型（用于成本优化）
}

/**
 * AI 响应结果
 */
export interface AIResponse {
  success: boolean;
  content: string;
  provider: AIProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
  fallback?: boolean;      // 是否使用了备用模型
  timeout?: boolean;       // 是否超时
}

/**
 * AI 提供商配置
 */
export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * 超时处理配置
 */
export interface TimeoutConfig {
  defaultTimeout: number;    // 默认超时时间（毫秒）
  fallbackTemplate: string;  // 超时时的预设模板
}

/**
 * 成本优化配置
 */
export interface CostOptimizationConfig {
  taskTypeProviderMap: Record<TaskType, AIProvider>;
  budgetLimit?: number;      // 预算限制（可选）
}

/**
 * 智能切换配置
 */
export interface FallbackConfig {
  primaryProvider: AIProvider;
  fallbackProviders: AIProvider[];
  maxRetries: number;
  retryDelay?: number;       // 重试延迟（毫秒）
}
