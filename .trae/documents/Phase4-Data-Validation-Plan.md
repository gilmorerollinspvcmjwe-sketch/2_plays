# Phase 4: 数据验证与优化详细设计方案

## 一、现状分析

### Phase 1-3 已完成
- ✅ Phase 1: 项目质量评分系统
- ✅ Phase 2: simulationStore.tick() 重构
- ✅ Phase 3: 运营操作与数据关联

### 当前问题
1. **公式参数未经验证**：满意度、留存率计算公式需要实际测试
2. **数据一致性风险**：多store之间数据同步可能出问题
3. **性能未优化**：复杂计算可能影响性能
4. **缺少调试工具**：无法查看中间计算过程

---

## 二、设计目标

### 核心目标
建立**可验证、可调试、高性能**的运营系统：

```
数据验证 → 性能优化 → 调试工具 → 持续监控
```

### 设计原则
1. **可验证**：所有公式和计算可验证、可测试
2. **可调试**：提供调试模式查看中间值
3. **高性能**：计算耗时<500ms，内存占用合理
4. **可配置**：公式参数可调整，便于平衡性调优

---

## 三、验证架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Phase 4: 数据验证与优化架构                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        数据验证层                                    │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │    │
│  │  │ 公式验证   │  │ 数据一致性 │  │ 边界测试   │  │ 回归测试   │    │    │
│  │  │ Validation │  │ Consistency│  │ Boundary   │  │ Regression │    │    │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘    │    │
│  │        │               │               │               │            │    │
│  │        └───────────────┴───────────────┴───────────────┘            │    │
│  │                        │                                            │    │
│  │                        ▼                                            │    │
│  │        ┌─────────────────────────────────────────┐                  │    │
│  │        │         验证报告与修复                   │                  │    │
│  │        │  • 验证结果记录                          │                  │    │
│  │        │  • 问题定位与修复                        │                  │    │
│  │        │  • 回归测试                              │                  │    │
│  │        └─────────────────────────────────────────┘                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        性能优化层                                    │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │    │
│  │  │ 计算缓存   │  │ 算法优化   │  │ 异步处理   │  │ 内存管理   │    │    │
│  │  │ Cache      │  │ Algorithm  │  │ Async      │  │ Memory     │    │    │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘    │    │
│  │        │               │               │               │            │    │
│  │        └───────────────┴───────────────┴───────────────┘            │    │
│  │                        │                                            │    │
│  │                        ▼                                            │    │
│  │        ┌─────────────────────────────────────────┐                  │    │
│  │        │         性能监控                         │                  │    │
│  │        │  • 执行时间统计                          │                  │    │
│  │        │  • 内存占用监控                          │                  │    │
│  │        │  • 性能报告                              │                  │    │
│  │        └─────────────────────────────────────────┘                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        调试工具层                                    │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │    │
│  │  │ 调试面板   │  │ 公式调整   │  │ 数据查看   │  │ 模拟重放   │    │    │
│  │  │ DebugPanel │  │ FormulaEdit│  │ DataViewer │  │ Replay     │    │    │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘    │    │
│  │        │               │               │               │            │    │
│  │        └───────────────┴───────────────┴───────────────┘            │    │
│  │                        │                                            │    │
│  │                        ▼                                            │    │
│  │        ┌─────────────────────────────────────────┐                  │    │
│  │        │         开发者工具                       │                  │    │
│  │        │  • 实时查看计算过程                      │                  │    │
│  │        │  • 调整公式参数                          │                  │    │
│  │        │  • 导出调试数据                          │                  │    │
│  │        └─────────────────────────────────────────┘                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 验证矩阵

| 验证项目 | 验证内容 | 验证方法 | 通过标准 |
|---------|---------|---------|---------|
| **公式验证** | 满意度/留存率/付费率计算 | 单元测试 | 输出值在合理范围(0-1) |
| **数据一致性** | store间数据同步 | 集成测试 | 数据变更实时同步 |
| **边界测试** | 极端值处理 | 边界测试 | 无崩溃，合理降级 |
| **回归测试** | 历史数据兼容 | 回归测试 | 历史数据正常加载 |
| **性能测试** | tick()执行时间 | 性能测试 | <500ms |
| **内存测试** | 内存占用 | 内存分析 | 增长<10% |

---

## 四、详细设计方案

### 4.1 数据验证系统

#### 4.1.1 验证工具类

```typescript
// src/utils/validation.ts

/**
 * 运营数据验证工具
 */
export class OperationDataValidator {
  /**
   * 验证项目运营数据
   */
  static validateProjectOperationData(data: ProjectOperationData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证基础指标范围
    if (data.satisfaction < 0 || data.satisfaction > 1) {
      errors.push(`满意度 ${data.satisfaction} 超出范围 [0, 1]`);
    }
    if (data.retentionRate < 0 || data.retentionRate > 1) {
      errors.push(`留存率 ${data.retentionRate} 超出范围 [0, 1]`);
    }
    if (data.payRate < 0 || data.payRate > 1) {
      errors.push(`付费率 ${data.payRate} 超出范围 [0, 1]`);
    }

    // 验证玩家数据合理性
    if (data.activePlayers < 0) {
      errors.push(`活跃玩家数 ${data.activePlayers} 不能为负`);
    }
    if (data.payingPlayers > data.activePlayers) {
      errors.push(`付费玩家数 ${data.payingPlayers} 不能超过活跃玩家数 ${data.activePlayers}`);
    }

    // 验证收入数据
    if (data.dailyRevenue < 0) {
      errors.push(`日收入 ${data.dailyRevenue} 不能为负`);
    }

    // 警告检查
    if (data.satisfaction < 0.3) {
      warnings.push(`满意度 ${data.satisfaction} 过低，可能影响留存`);
    }
    if (data.retentionRate < 0.3) {
      warnings.push(`留存率 ${data.retentionRate} 过低`);
    }
    if (data.payRate > 0.3) {
      warnings.push(`付费率 ${data.payRate} 过高，可能不合理`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证预测数据
   */
  static validatePrediction(prediction: OperationPrediction): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const p = prediction.predicted;

    // 验证变化幅度合理性
    if (Math.abs(p.satisfactionChange) > 0.5) {
      warnings.push(`满意度变化 ${p.satisfactionChange} 过大`);
    }
    if (Math.abs(p.retentionChange) > 0.5) {
      warnings.push(`留存变化 ${p.retentionChange} 过大`);
    }
    if (Math.abs(p.payRateChange) > 0.5) {
      warnings.push(`付费率变化 ${p.payRateChange} 过大`);
    }

    // 验证收入预测合理性
    if (p.revenueChangePercent > 200) {
      warnings.push(`收入变化 ${p.revenueChangePercent}% 过高`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证公式计算
   */
  static validateFormulaCalculation(
    input: FormulaInput,
    output: FormulaOutput,
    expected: FormulaOutput,
    tolerance: number = 0.01
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查输出范围
    if (output.satisfaction !== undefined) {
      if (output.satisfaction < 0 || output.satisfaction > 1) {
        errors.push(`满意度输出 ${output.satisfaction} 超出范围`);
      }
    }

    // 对比预期值
    if (expected.satisfaction !== undefined && output.satisfaction !== undefined) {
      const diff = Math.abs(output.satisfaction - expected.satisfaction);
      if (diff > tolerance) {
        warnings.push(`满意度偏差 ${diff} 超过容差 ${tolerance}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

#### 4.1.2 单元测试

```typescript
// src/tests/operationFormula.test.ts

import { describe, it, expect } from 'vitest';
import { calculateProjectBaseMetrics } from '@/stores/simulationStore';
import { calculateProjectQuality } from '@/engine/qualityScoring';

describe('运营公式验证', () => {
  describe('calculateProjectBaseMetrics', () => {
    it('应该返回有效的满意度范围', () => {
      const quality = { totalScore: 0.7, characterScore: 0.8, plotScore: 0.6, operationScore: 0.7 };
      const result = calculateProjectBaseMetrics(quality, null);
      
      expect(result.satisfaction).toBeGreaterThanOrEqual(0);
      expect(result.satisfaction).toBeLessThanOrEqual(1);
    });

    it('高质量项目应该产生高满意度', () => {
      const quality = { totalScore: 0.9, characterScore: 0.9, plotScore: 0.9, operationScore: 0.9 };
      const result = calculateProjectBaseMetrics(quality, null);
      
      expect(result.satisfaction).toBeGreaterThan(0.7);
    });

    it('低质量项目应该产生低满意度', () => {
      const quality = { totalScore: 0.3, characterScore: 0.3, plotScore: 0.3, operationScore: 0.3 };
      const result = calculateProjectBaseMetrics(quality, null);
      
      expect(result.satisfaction).toBeLessThan(0.5);
    });

    it('留存率应该在合理范围', () => {
      const quality = { totalScore: 0.7, characterScore: 0.8, plotScore: 0.6, operationScore: 0.7 };
      const result = calculateProjectBaseMetrics(quality, null);
      
      expect(result.retentionRate).toBeGreaterThanOrEqual(0.1);
      expect(result.retentionRate).toBeLessThanOrEqual(0.95);
    });

    it('付费率应该在合理范围', () => {
      const quality = { totalScore: 0.7, characterScore: 0.8, plotScore: 0.6, operationScore: 0.7 };
      const result = calculateProjectBaseMetrics(quality, null);
      
      expect(result.payRate).toBeGreaterThanOrEqual(0.01);
      expect(result.payRate).toBeLessThanOrEqual(0.5);
    });
  });

  describe('calculateProjectQuality', () => {
    it('空项目应该返回默认质量', () => {
      const result = calculateProjectQuality([], []);
      
      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.totalScore).toBeLessThanOrEqual(1);
    });

    it('高质量角色和剧情应该产生高质量', () => {
      const characters = [/* 高质量角色 */];
      const plots = [/* 高质量剧情 */];
      const result = calculateProjectQuality(characters, plots);
      
      expect(result.totalScore).toBeGreaterThan(0.7);
    });
  });
});
```

### 4.2 性能优化

#### 4.2.1 计算缓存

```typescript
// src/utils/computationCache.ts

/**
 * 计算缓存管理器
 */
export class ComputationCache {
  private cache: Map<string, { value: any; timestamp: number; ttl: number }> = new Map();
  private maxSize: number = 100;

  /**
   * 获取缓存值
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  /**
   * 设置缓存值
   */
  set(key: string, value: any, ttl: number = 60000): void {
    // 如果缓存满了，删除最旧的
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 清除缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 生成缓存键
   */
  static generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(k => `${k}:${JSON.stringify(params[k])}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }
}

// 全局缓存实例
export const qualityCache = new ComputationCache();
```

#### 4.2.2 优化后的质量计算

```typescript
// 在 qualityScoring.ts 中使用缓存

export function calculateProjectQualityCached(
  characters: Character[],
  plots: Plot[]
): ProjectQualityScore {
  const cacheKey = ComputationCache.generateKey('projectQuality', {
    charIds: characters.map(c => c.id).sort(),
    plotIds: plots.map(p => p.id).sort()
  });

  const cached = qualityCache.get<ProjectQualityScore>(cacheKey);
  if (cached) return cached;

  const result = calculateProjectQuality(characters, plots);
  qualityCache.set(cacheKey, result, 300000); // 缓存5分钟

  return result;
}
```

#### 4.2.3 性能监控

```typescript
// src/utils/performanceMonitor.ts

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  /**
   * 监控函数执行时间
   */
  static async monitor<T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    }
  }

  /**
   * 记录指标
   */
  static recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // 只保留最近100条记录
    const values = this.metrics.get(name)!;
    if (values.length > 100) {
      values.shift();
    }
  }

  /**
   * 获取统计信息
   */
  static getStats(name: string): PerformanceStats | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      count: sorted.length,
      avg: sum / sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  /**
   * 生成性能报告
   */
  static generateReport(): PerformanceReport {
    const report: PerformanceReport = {};

    this.metrics.forEach((_, name) => {
      report[name] = this.getStats(name);
    });

    return report;
  }

  /**
   * 清除所有指标
   */
  static clear(): void {
    this.metrics.clear();
  }
}

interface PerformanceStats {
  count: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}

type PerformanceReport = Record<string, PerformanceStats | null>;
```

### 4.3 调试工具

#### 4.3.1 调试配置

```typescript
// src/config/debugConfig.ts

/**
 * 调试配置
 */
export const debugConfig = {
  // 是否启用调试模式
  enabled: import.meta.env.DEV || localStorage.getItem('debug_mode') === 'true',

  // 调试选项
  options: {
    // 显示详细计算过程
    showCalculationDetails: true,

    // 显示公式中间值
    showFormulaIntermediate: true,

    // 显示数据变更日志
    showDataChanges: true,

    // 显示性能指标
    showPerformanceMetrics: true,

    // 允许修改公式参数
    allowFormulaEditing: true
  },

  // 公式参数（可调）
  formulaParams: {
    satisfaction: {
      baseValue: 0.5,
      qualityWeight: 0.4,
      rateWeight: 0.35,
      welfareWeight: 0.25
    },
    retention: {
      baseValue: 0.6,
      satisfactionWeight: 0.4,
      characterWeight: 0.3,
      activityWeight: 0.2,
      communityWeight: 0.1
    },
    payRate: {
      baseValue: 0.05,
      characterWeight: 0.15,
      gachaWeight: 0.15,
      economyWeight: 0.05
    }
  }
};

/**
 * 更新公式参数
 */
export function updateFormulaParam(
  category: keyof typeof debugConfig.formulaParams,
  param: string,
  value: number
): void {
  const categoryParams = debugConfig.formulaParams[category];
  if (categoryParams && param in categoryParams) {
    (categoryParams as any)[param] = value;
    // 清除缓存，使新参数生效
    qualityCache.clear();
  }
}
```

#### 4.3.2 调试面板组件

```vue
<!-- components/debug/DebugPanel.vue -->
<template>
  <div v-if="isDebugMode" class="debug-panel">
    <div class="debug-header">
      <h3>调试面板</h3>
      <van-button size="small" @click="togglePanel">
        {{ expanded ? '收起' : '展开' }}
      </van-button>
    </div>

    <div v-show="expanded" class="debug-content">
      <!-- 性能指标 -->
      <div class="debug-section">
        <h4>性能指标</h4>
        <div v-for="(stats, name) in performanceReport" :key="name" class="metric-row">
          <span class="name">{{ name }}</span>
          <span class="value">{{ stats ? `${stats.avg.toFixed(2)}ms` : 'N/A' }}</span>
        </div>
      </div>

      <!-- 公式参数调整 -->
      <div class="debug-section">
        <h4>公式参数</h4>
        <div v-for="(params, category) in formulaParams" :key="category" class="param-category">
          <h5>{{ getCategoryName(category) }}</h5>
          <div v-for="(value, param) in params" :key="param" class="param-row">
            <span class="name">{{ param }}</span>
            <input
              type="number"
              v-model.number="formulaParams[category][param]"
              step="0.01"
              min="0"
              max="1"
              @change="updateParam(category, param, formulaParams[category][param])"
            />
          </div>
        </div>
      </div>

      <!-- 计算详情 -->
      <div class="debug-section">
        <h4>最近计算</h4>
        <div v-for="(detail, index) in calculationDetails" :key="index" class="calc-detail">
          <pre>{{ JSON.stringify(detail, null, 2) }}</pre>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="debug-actions">
        <van-button size="small" type="danger" @click="clearCache">
          清除缓存
        </van-button>
        <van-button size="small" @click="exportData">
          导出数据
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { debugConfig, updateFormulaParam } from '@/config/debugConfig';
import { PerformanceMonitor } from '@/utils/performanceMonitor';
import { qualityCache } from '@/utils/computationCache';

const isDebugMode = computed(() => debugConfig.enabled);
const expanded = ref(true);
const performanceReport = ref(PerformanceMonitor.generateReport());
const formulaParams = ref(debugConfig.formulaParams);
const calculationDetails = ref<any[]>([]);

function togglePanel() {
  expanded.value = !expanded.value;
}

function updateParam(category: string, param: string, value: number) {
  updateFormulaParam(category as any, param, value);
}

function clearCache() {
  qualityCache.clear();
  PerformanceMonitor.clear();
  performanceReport.value = {};
}

function exportData() {
  const data = {
    performance: performanceReport.value,
    formulaParams: formulaParams.value,
    timestamp: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `debug-data-${Date.now()}.json`;
  a.click();
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    satisfaction: '满意度',
    retention: '留存率',
    payRate: '付费率'
  };
  return names[category] || category;
}
</script>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
  z-index: 9999;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.debug-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #333;
}

.debug-section h4 {
  margin: 0 0 12px 0;
  color: #4CAF50;
}

.metric-row, .param-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.param-row input {
  width: 80px;
  background: #333;
  color: #fff;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 4px;
}

.calc-detail pre {
  background: #1a1a1a;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}

.debug-actions {
  display: flex;
  gap: 8px;
}
</style>
```

### 4.4 数据迁移

#### 4.4.1 迁移工具

```typescript
// src/utils/dataMigration.ts

/**
 * 数据迁移工具
 */
export class DataMigration {
  /**
   * 迁移旧版本数据
   */
  static migrate(): void {
    const version = this.getCurrentVersion();

    if (version < 2) {
      this.migrateV1ToV2();
    }

    if (version < 3) {
      this.migrateV2ToV3();
    }

    // 更新版本号
    localStorage.setItem('data_version', '3');
  }

  /**
   * 获取当前数据版本
   */
  private static getCurrentVersion(): number {
    const version = localStorage.getItem('data_version');
    return version ? parseInt(version, 10) : 1;
  }

  /**
   * V1 -> V2 迁移
   * 添加项目运营数据结构
   */
  private static migrateV1ToV2(): void {
    console.log('Migrating data from V1 to V2...');

    // 迁移 simulation 数据
    const simulationData = localStorage.getItem('simulation_data');
    if (simulationData) {
      const data = JSON.parse(simulationData);

      // 添加新的数据结构
      if (!data.projectOperationData) {
        data.projectOperationData = [];
      }
      if (!data.globalMetrics) {
        data.globalMetrics = {
          totalRevenue: 0,
          totalActivePlayers: 0,
          averageSatisfaction: 0.5,
          totalDraws: 0
        };
      }

      localStorage.setItem('simulation_data', JSON.stringify(data));
    }

    console.log('Migration V1->V2 completed');
  }

  /**
   * V2 -> V3 迁移
   * 添加运营预测数据结构
   */
  private static migrateV2ToV3(): void {
    console.log('Migrating data from V2 to V3...');

    // 迁移 operation 数据
    const operationData = localStorage.getItem('operation_data');
    if (operationData) {
      const data = JSON.parse(operationData);

      // 添加预测相关数据结构
      if (!data.operationPredictions) {
        data.operationPredictions = [];
      }
      if (!data.activeOperationEffects) {
        data.activeOperationEffects = [];
      }
      if (!data.completedOperationEffects) {
        data.completedOperationEffects = [];
      }

      localStorage.setItem('operation_data', JSON.stringify(data));
    }

    console.log('Migration V2->V3 completed');
  }
}
```

---

## 五、实施步骤

### Step 1: 创建验证工具 (1小时)
- 创建 `src/utils/validation.ts`
- 实现 `OperationDataValidator` 类
- 实现数据验证方法

### Step 2: 编写单元测试 (2小时)
- 创建 `src/tests/operationFormula.test.ts`
- 编写公式验证测试
- 编写数据一致性测试
- 编写边界测试

### Step 3: 实现性能优化 (2小时)
- 创建 `src/utils/computationCache.ts`
- 创建 `src/utils/performanceMonitor.ts`
- 在 qualityScoring 中添加缓存
- 在 simulationStore 中添加性能监控

### Step 4: 创建调试工具 (2小时)
- 创建 `src/config/debugConfig.ts`
- 创建 `src/components/debug/DebugPanel.vue`
- 在 App.vue 中集成调试面板

### Step 5: 实现数据迁移 (1小时)
- 创建 `src/utils/dataMigration.ts`
- 在应用启动时执行迁移
- 测试迁移逻辑

### Step 6: 全面测试 (2小时)
- 运行所有单元测试
- 验证数据一致性
- 测试性能指标
- 测试调试工具

---

## 六、关键变更点

### 6.1 文件变更清单

| 文件 | 变更类型 | 变更内容 |
|------|---------|---------|
| `src/utils/validation.ts` | 新增 | 数据验证工具 |
| `src/utils/computationCache.ts` | 新增 | 计算缓存 |
| `src/utils/performanceMonitor.ts` | 新增 | 性能监控 |
| `src/utils/dataMigration.ts` | 新增 | 数据迁移 |
| `src/config/debugConfig.ts` | 新增 | 调试配置 |
| `src/components/debug/DebugPanel.vue` | 新增 | 调试面板 |
| `src/tests/operationFormula.test.ts` | 新增 | 单元测试 |
| `src/engine/qualityScoring.ts` | 修改 | 添加缓存 |
| `src/stores/simulationStore.ts` | 修改 | 添加验证和监控 |
| `src/App.vue` | 修改 | 集成调试面板 |

### 6.2 验证清单

| 验证项 | 验证方法 | 通过标准 |
|-------|---------|---------|
| 公式计算正确 | 单元测试 | 所有测试通过 |
| 数据范围有效 | 边界测试 | 无越界值 |
| 数据一致性 | 集成测试 | store间同步 |
| 性能达标 | 性能测试 | tick<500ms |
| 内存合理 | 内存分析 | 增长<10% |
| 调试工具可用 | 功能测试 | 面板正常显示 |
| 数据迁移成功 | 回归测试 | 历史数据正常 |

---

## 七、验收标准

### 功能验收
- [ ] 所有单元测试通过
- [ ] 数据验证无错误
- [ ] 性能监控正常工作
- [ ] 调试面板可正常显示
- [ ] 数据迁移成功

### 性能验收
- [ ] tick() 执行时间 < 500ms
- [ ] 内存占用增长 < 10%
- [ ] 缓存命中率 > 50%

### 数据验收
- [ ] 公式输出值在合理范围
- [ ] 多store数据同步正常
- [ ] 历史数据兼容

### 调试验收
- [ ] 可查看计算详情
- [ ] 可调整公式参数
- [ ] 可导出调试数据
- [ ] 可清除缓存

---

## 八、风险评估

### 技术风险
1. **测试覆盖不足** → 增加测试用例，使用覆盖率工具
2. **性能优化过度** → 保留原始代码，便于回滚
3. **调试工具影响生产** → 仅在开发模式启用

### 数据风险
1. **迁移失败** → 备份原始数据，提供回滚方案
2. **数据丢失** → 定期备份，验证备份可用性

---

## 九、预期效果

### 短期效果
- 运营系统稳定可靠
- 性能满足要求
- 问题可快速定位

### 长期效果
- 可持续迭代优化
- 新功能易于测试
- 数据质量有保障
