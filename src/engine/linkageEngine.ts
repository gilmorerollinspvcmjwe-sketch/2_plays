/**
 * 运营模块联动引擎
 * 实现7大运营模块之间的因果关系和反馈延迟机制
 */

import { OperationBalanceConfig, LinkageRulesConfig } from '@/config/gameBalance';

// 运营模块类型
export type OperationModule = 
  | 'gacha'      // 卡池管理
  | 'event'      // 活动中心
  | 'welfare'    // 福利发放
  | 'playerData' // 玩家数据
  | 'incident'   // 运营事件
  | 'social'     // 社交广场
  | 'market';    // 市场情报

// 反馈延迟类型
export type FeedbackDelay = 'immediate' | 'short' | 'medium' | 'long';

// 延迟配置
const DELAY_CONFIG: Record<FeedbackDelay, { min: number; max: number }> = {
  immediate: { min: 0, max: 0 },
  short: { min: 1, max: 3 },
  medium: { min: 7, max: 14 },
  long: { min: 30, max: 90 }
};

// 联动效果
export interface LinkageEffect {
  sourceModule: OperationModule;
  targetModule: OperationModule;
  metric: string;
  change: number;
  duration: number;
  delay: FeedbackDelay;
  decayRate: number;
}

// 延迟效果（队列中）
export interface DelayedEffect extends LinkageEffect {
  id: string;
  queuedAt: number;
  delayDays: number;
  daysPassed: number;
}

// 联动上下文
export interface LinkageContext {
  projectId: string;
  currentMetrics: Record<string, number>;
  daysPassed: number;
  [key: string]: any;
}

// 联动规则
export interface LinkageRule {
  id: string;
  sourceModule: OperationModule;
  targetModule: OperationModule;
  action: string;
  condition: (context: LinkageContext) => boolean;
  effect: (value: number, context: LinkageContext) => Partial<LinkageEffect>;
  delay: FeedbackDelay;
  chainThreshold: number;
}

// 连锁反应结果
export interface ChainReactionResult {
  effects: ChainEffect[];
  totalImpact: Record<string, number>;
}

export interface ChainEffect {
  sourceModule: OperationModule;
  targetModule: OperationModule;
  metric: string;
  magnitude: number;
  depth: number;
  sourceEvent: string;
}

// 处理后的效果
export interface ProcessedEffect {
  original: DelayedEffect;
  decayed: LinkageEffect;
  appliedAt: number;
}

export class LinkageEngine {
  private rules: Map<string, LinkageRule> = new Map();
  private effectQueue: DelayedEffect[] = [];
  private subscribers: Map<OperationModule, Set<(effect: LinkageEffect) => void>> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  // 注册联动规则
  registerRule(rule: LinkageRule): void {
    this.rules.set(rule.id, rule);
  }

  // 触发联动
  trigger(
    sourceModule: OperationModule,
    action: string,
    value: number,
    context: LinkageContext
  ): { triggeredRules: number; immediateEffects: LinkageEffect[]; queuedEffects: number } {
    const triggeredRules = this.findTriggeredRules(sourceModule, action, context);
    const immediateEffects: LinkageEffect[] = [];
    let queuedCount = 0;

    for (const rule of triggeredRules) {
      const effect = this.calculateEffect(rule, value, context);
      
      if (rule.delay === 'immediate') {
        this.applyEffect(effect);
        immediateEffects.push(effect);
      } else {
        this.queueEffect(effect, rule.delay);
        queuedCount++;
      }

      // 触发连锁反应
      if (Math.abs(effect.change) > rule.chainThreshold) {
        this.triggerChainReaction(effect, context);
      }
    }

    // 通知订阅者
    this.notifySubscribers(sourceModule, immediateEffects);

    return {
      triggeredRules: triggeredRules.length,
      immediateEffects,
      queuedEffects: queuedCount
    };
  }

  // 处理延迟效果队列（每日调用）
  processDailyEffects(): ProcessedEffect[] {
    const now = Date.now();
    const processed: ProcessedEffect[] = [];
    const remaining: DelayedEffect[] = [];

    for (const effect of this.effectQueue) {
      effect.daysPassed++;
      
      if (effect.daysPassed >= effect.delayDays) {
        // 应用时间衰减
        const decayedEffect = this.applyDecay(effect);
        this.applyEffect(decayedEffect);
        processed.push({
          original: effect,
          decayed: decayedEffect,
          appliedAt: now
        });
      } else {
        remaining.push(effect);
      }
    }

    this.effectQueue = remaining;
    return processed;
  }

  // 订阅特定模块的联动效果
  subscribe(
    module: OperationModule,
    callback: (effect: LinkageEffect) => void
  ): () => void {
    if (!this.subscribers.has(module)) {
      this.subscribers.set(module, new Set());
    }
    this.subscribers.get(module)!.add(callback);

    return () => {
      this.subscribers.get(module)?.delete(callback);
    };
  }

  // 获取当前队列中的效果
  getQueuedEffects(): DelayedEffect[] {
    return [...this.effectQueue];
  }

  // 获取模块统计
  getModuleStats(): Record<OperationModule, { immediate: number; delayed: number }> {
    const stats = {} as Record<OperationModule, { immediate: number; delayed: number }>;
    
    const modules: OperationModule[] = ['gacha', 'event', 'welfare', 'playerData', 'incident', 'social', 'market'];
    modules.forEach(m => {
      stats[m] = { immediate: 0, delayed: 0 };
    });

    this.rules.forEach(rule => {
      if (rule.delay === 'immediate') {
        stats[rule.sourceModule].immediate++;
      } else {
        stats[rule.sourceModule].delayed++;
      }
    });

    return stats;
  }

  // 初始化默认规则
  private initializeDefaultRules(): void {
    // 卡池爆率 → 玩家满意度
    this.registerRule({
      id: 'gacha_rate_satisfaction',
      sourceModule: 'gacha',
      targetModule: 'playerData',
      action: 'rate_change',
      condition: (ctx) => ctx.newRate !== undefined && ctx.oldRate !== undefined,
      effect: (value, ctx) => ({
        sourceModule: 'gacha',
        targetModule: 'playerData',
        metric: 'satisfaction',
        change: value * OperationBalanceConfig.gacha.rateSatisfactionImpact,
        duration: 7,
        delay: 'immediate',
        decayRate: 0.9
      }),
      delay: 'immediate',
      chainThreshold: 10
    });

    // 卡池UP角色 → 收入提升
    this.registerRule({
      id: 'gacha_up_revenue',
      sourceModule: 'gacha',
      targetModule: 'playerData',
      action: 'up_character_change',
      condition: (ctx) => ctx.upCharacterPopularity !== undefined,
      effect: (value, ctx) => ({
        sourceModule: 'gacha',
        targetModule: 'playerData',
        metric: 'dailyRevenue',
        change: value * OperationBalanceConfig.gacha.upCharacterRevenueBoost,
        duration: 14,
        delay: 'immediate',
        decayRate: 0.95
      }),
      delay: 'immediate',
      chainThreshold: 5
    });

    // 活动难度 → 运营事件（太肝了）
    this.registerRule({
      id: 'event_difficulty_incident',
      sourceModule: 'event',
      targetModule: 'incident',
      action: 'difficulty_set',
      condition: (ctx) => ctx.difficulty > 80,
      effect: (value, ctx) => ({
        sourceModule: 'event',
        targetModule: 'incident',
        metric: 'incident_trigger',
        change: 1,
        duration: 3,
        delay: 'short',
        decayRate: 1.0
      }),
      delay: 'short',
      chainThreshold: 5
    });

    // 活动奖励 → 玩家满意度
    this.registerRule({
      id: 'event_reward_satisfaction',
      sourceModule: 'event',
      targetModule: 'playerData',
      action: 'reward_set',
      condition: (ctx) => true,
      effect: (value, ctx) => ({
        sourceModule: 'event',
        targetModule: 'playerData',
        metric: 'satisfaction',
        change: value * OperationBalanceConfig.event.rewardValueSatisfactionImpact,
        duration: 7,
        delay: 'immediate',
        decayRate: 0.9
      }),
      delay: 'immediate',
      chainThreshold: 3
    });

    // 福利发放 → 玩家满意度
    this.registerRule({
      id: 'welfare_satisfaction',
      sourceModule: 'welfare',
      targetModule: 'playerData',
      action: 'welfare_distributed',
      condition: (ctx) => true,
      effect: (value, ctx) => ({
        sourceModule: 'welfare',
        targetModule: 'playerData',
        metric: 'satisfaction',
        change: OperationBalanceConfig.welfare.baseSatisfactionBoost + value * OperationBalanceConfig.welfare.valueMultiplier,
        duration: 7,
        delay: 'immediate',
        decayRate: 0.85
      }),
      delay: 'immediate',
      chainThreshold: 5
    });

    // 玩家满意度 → 留存率（中期）
    this.registerRule({
      id: 'satisfaction_retention',
      sourceModule: 'playerData',
      targetModule: 'playerData',
      action: 'satisfaction_change',
      condition: (ctx) => Math.abs(ctx.satisfactionChange) > 10,
      effect: (value, ctx) => ({
        sourceModule: 'playerData',
        targetModule: 'playerData',
        metric: 'retention',
        change: value * 0.5,
        duration: 14,
        delay: 'medium',
        decayRate: 0.8
      }),
      delay: 'medium',
      chainThreshold: 10
    });

    // DAU变化 → 市场份额（中期）
    this.registerRule({
      id: 'dau_market_share',
      sourceModule: 'playerData',
      targetModule: 'market',
      action: 'dau_change',
      condition: (ctx) => Math.abs(ctx.dauChangeRate) > 0.1,
      effect: (value, ctx) => ({
        sourceModule: 'playerData',
        targetModule: 'market',
        metric: 'marketShare',
        change: value * 0.5,
        duration: 30,
        delay: 'medium',
        decayRate: 0.9
      }),
      delay: 'medium',
      chainThreshold: 5
    });

    // 评分变化 → 市场声誉（中期）
    this.registerRule({
      id: 'rating_reputation',
      sourceModule: 'playerData',
      targetModule: 'market',
      action: 'rating_change',
      condition: (ctx) => Math.abs(ctx.ratingChange) > 0.5,
      effect: (value, ctx) => ({
        sourceModule: 'playerData',
        targetModule: 'market',
        metric: 'reputation',
        change: value,
        duration: 30,
        delay: 'medium',
        decayRate: 0.85
      }),
      delay: 'medium',
      chainThreshold: 3
    });

    // 运营事件 → 社交广场（吐槽传播）
    this.registerRule({
      id: 'incident_social',
      sourceModule: 'incident',
      targetModule: 'social',
      action: 'incident_triggered',
      condition: (ctx) => ctx.incidentSeverity === 'high' || ctx.incidentSeverity === 'medium',
      effect: (value, ctx) => ({
        sourceModule: 'incident',
        targetModule: 'social',
        metric: 'negativeSentiment',
        change: value * 1.5,
        duration: 5,
        delay: 'immediate',
        decayRate: 0.8
      }),
      delay: 'immediate',
      chainThreshold: 5
    });
  }

  // 查找触发的规则
  private findTriggeredRules(
    sourceModule: OperationModule,
    action: string,
    context: LinkageContext
  ): LinkageRule[] {
    return Array.from(this.rules.values()).filter(rule =>
      rule.sourceModule === sourceModule &&
      rule.action === action &&
      rule.condition(context)
    );
  }

  // 计算效果
  private calculateEffect(
    rule: LinkageRule,
    value: number,
    context: LinkageContext
  ): LinkageEffect {
    const baseEffect = rule.effect(value, context);
    
    return {
      sourceModule: rule.sourceModule,
      targetModule: rule.targetModule,
      metric: baseEffect.metric || '',
      change: baseEffect.change || 0,
      duration: baseEffect.duration || 7,
      delay: rule.delay,
      decayRate: baseEffect.decayRate || 0.9
    };
  }

  // 应用效果
  private applyEffect(effect: LinkageEffect): void {
    // 这里会将效果应用到实际的数据存储
    // 实际实现中需要与Store交互
    console.log(`[Linkage] ${effect.sourceModule} -> ${effect.targetModule}: ${effect.metric} ${effect.change > 0 ? '+' : ''}${effect.change.toFixed(2)}`);
  }

  // 将效果加入队列
  private queueEffect(effect: LinkageEffect, delay: FeedbackDelay): void {
    const delayConfig = DELAY_CONFIG[delay];
    const delayDays = Math.floor(Math.random() * (delayConfig.max - delayConfig.min + 1)) + delayConfig.min;
    
    const delayedEffect: DelayedEffect = {
      ...effect,
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      queuedAt: Date.now(),
      delayDays,
      daysPassed: 0
    };
    
    this.effectQueue.push(delayedEffect);
  }

  // 应用时间衰减
  private applyDecay(effect: DelayedEffect): LinkageEffect {
    const daysOverdue = effect.daysPassed - effect.delayDays;
    const decayFactor = Math.pow(effect.decayRate, daysOverdue);
    
    return {
      sourceModule: effect.sourceModule,
      targetModule: effect.targetModule,
      metric: effect.metric,
      change: effect.change * decayFactor,
      duration: effect.duration,
      delay: effect.delay,
      decayRate: effect.decayRate
    };
  }

  // 触发连锁反应
  private triggerChainReaction(effect: LinkageEffect, context: LinkageContext): void {
    // 简化实现：如果效果足够大，触发次级效果
    if (Math.abs(effect.change) > 10) {
      console.log(`[Chain] 连锁反应触发: ${effect.targetModule} 受到 ${effect.change.toFixed(2)} 影响`);
    }
  }

  // 通知订阅者
  private notifySubscribers(
    module: OperationModule,
    effects: LinkageEffect[]
  ): void {
    const callbacks = this.subscribers.get(module);
    if (callbacks) {
      effects.forEach(effect => {
        callbacks.forEach(cb => cb(effect));
      });
    }
  }
}

// 单例导出
export const linkageEngine = new LinkageEngine();
