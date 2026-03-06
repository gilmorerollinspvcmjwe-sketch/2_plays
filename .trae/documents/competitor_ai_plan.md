# 竞品AI模拟系统实施计划

## 目标

实现一个**有人格特征**的竞品AI系统，让玩家感受到真实的市场竞争压力。每个竞品公司有独特的运营策略和个性，会根据市场环境和玩家行为做出"智能"反应。

---

## 现状分析

### 当前系统状态

项目目前已经有 `WorldSimulator`（世界模拟器），但功能较为基础：
- 简单的市场竞争模拟
- 基本的 AI 决策

### 需要新增的内容

1. **竞品AI角色** - 6个固定竞品公司，各有人格特征
2. **完整数据模型** - 竞品公司、游戏、角色、策略等
3. **AI决策引擎** - 环境感知、策略选择、行动生成
4. **竞品事件系统** - 生成竞品动态消息推送给玩家

---

## 实施步骤

### Phase 1: 创建数据类型定义（不动旧代码）

#### Step 1.1: 创建 `src/types/competitor.ts`

定义所有竞品相关的类型：

```typescript
// 竞品AI个性类型
export type AIPersonality = 
  | 'innovator'    // 开拓者
  | 'steady'       // 稳健派
  | 'monetizer'    // 氪金王
  | 'disruptor'    // 搅局者
  | 'craftsman'    // 匠人
  | 'learner';     // 学习者

// 竞品AI决策权重
export interface AIDecisionWeights { ... }

// 竞品AI公司
export interface CompetitorAI { ... }

// 竞品游戏
export interface CompetitorGame { ... }

// 游戏状态
export type GameState = 'pre_launch' | 'launched' | 'operating' | 'peak' | 'declining' | 'revival' | 'sunset';

// AI策略类型
export type AIStrategyType = 'aggressive_growth' | 'quality_focus' | 'monetization_push' | ...;

// AI行动类型
export type AIActionType = 'launch_gacha' | 'start_event' | 'release_update' | ...;

// 竞品动态消息
export interface CompetitorNews { ... }
```

#### Step 1.2: 创建竞品公司初始配置

```typescript
// src/data/competitorConfig.ts

export const COMPETITOR_CONFIGS = [
  {
    id: 'ai_1',
    name: '叠纸互娱',
    ceo: '姚',
    avatar: '🎮',
    personality: 'innovator',
    initialStrength: 'S',
    game: '恋与星海'
  },
  // ... 6个竞品公司
]
```

---

### Phase 2: 创建 AI 决策引擎

#### Step 2.1: 创建 `src/engine/competitorAIEngine.ts`

```typescript
export class CompetitorAIEngine {
  // 每日决策
  dailyDecision(competitor, marketState, playerState): AIAction[]
  
  // 环境感知
  private perceiveEnvironment(...): Perception
  
  // 个性化行为
  private personalityDrivenActions(...): AIAction[]
  
  // 策略选择
  private chooseNewStrategy(...): AIStrategy
  
  // 行动生成与评分
  private generateActionCandidates(...): AIAction[]
  private scoreActions(...): ScoredAction[]
}
```

#### Step 2.2: 实现各人格的行为模式

- **innovator**: 10%概率创新
- **monetizer**: 资金不足时开卡池
- **disruptor**: 15%概率制造争议
- **learner**: 模仿排名第一的公司
- **craftsman**: 长周期高质量更新
- **steady**: 维持均衡

---

### Phase 3: 创建竞品事件系统

#### Step 3.1: 创建 `src/engine/competitorEventEngine.ts`

```typescript
export class CompetitorEventEngine {
  // 生成竞品动态
  generateCompetitorNews(actions: AIAction[]): CompetitorNews[]
  
  // 计算对玩家的影响
  calculateImpact(news: CompetitorNews): NewsImpact
  
  // 获取玩家应对选项
  getPlayerResponseOptions(news: CompetitorNews): PlayerResponseOption[]
}
```

#### Step 3.2: 创建消息模板

```typescript
const NEWS_TEMPLATES = {
  new_game: [...],
  gacha_event: [...],
  scandal: [...],
  // ...
}
```

---

### Phase 4: 集成到 simulationStore

#### Step 4.1: 修改 simulationStore.ts

```typescript
// 导入竞品AI引擎
import { CompetitorAIEngine } from '@/engine/competitorAIEngine';
import { CompetitorEventEngine } from '@/engine/competitorEventEngine';

// 添加竞品状态
const competitorAIEngine = ref<CompetitorAIEngine | null>(null);
const competitorEventEngine = ref<CompetitorEventEngine | null>(null);
const competitorNews = ref<CompetitorNews[]>([]);

// 在 tick() 中调用
async function tick() {
  // ... 其他逻辑
  
  // 竞品AI决策
  for (const competitor of competitors.value) {
    const actions = competitorAIEngine.value.dailyDecision(
      competitor, 
      marketState, 
      playerState
    );
    
    // 生成竞品动态
    const news = competitorEventEngine.value.generateCompetitorNews(actions);
    competitorNews.value.push(...news);
  }
}
```

#### Step 4.2: 添加导出

```typescript
return {
  // ... 其他导出
  competitorNews,
  competitors,
};
```

---

### Phase 5: 创建竞品数据展示界面

#### Step 5.1: 创建竞品分析组件

创建 `src/components/competitor/CompetitorPanel.vue`

- 显示6个竞品公司的状态
- 显示竞品动态消息流
- 显示市场趋势图表

#### Step 5.2: 在 AdminView 中集成

```vue
<template>
  <van-tabs v-model:active="activeTab">
    <van-tab title="竞品分析">
      <CompetitorPanel />
    </van-tab>
  </van-tabs>
</template>
```

---

## 测试计划

### Level 1: 编译检查

```bash
npm run build
```

- ✅ 无 TypeScript 类型错误
- ✅ 无导入路径错误

### Level 2: 功能测试

- [ ] 初始化6个竞品公司
- [ ] 每个竞品按人格决策
- [ ] 生成竞品动态消息
- [ ] 计算对玩家的影响

### Level 3: 集成测试

- [ ] simulationStore.tick() 正确调用竞品AI
- [ ] 竞品动态正确显示在界面
- [ ] 玩家可以应对竞品事件

---

## 风险与应对

### 风险 1: 性能问题

**应对**: 
- 竞品AI只在 tick() 时运行，不频繁计算
- 使用缓存避免重复计算

### 风险 2: 决策逻辑过于复杂

**应对**:
- 先实现基础版本
- 逐步增加人格特征

### 风险 3: 与现有 WorldSimulator 冲突

**应对**:
- 保留原有 WorldSimulator
- 竞品AI作为独立模块

---

## 验收标准

- [ ] `types/competitor.ts` 创建完成
- [ ] `competitorAIEngine.ts` 实现
- [ ] `competitorEventEngine.ts` 实现
- [ ] 6个竞品公司正确初始化
- [ ] 每日 tick 触发竞品AI决策
- [ ] 生成竞品动态消息
- [ ] UI 显示竞品信息
- [ ] 编译通过
- [ ] 功能测试通过

---

## 时间估算

| 阶段 | 预估时间 |
|------|---------|
| Phase 1: 数据类型 | 2 小时 |
| Phase 2: AI 引擎 | 4 小时 |
| Phase 3: 事件系统 | 3 小时 |
| Phase 4: 集成 | 2 小时 |
| Phase 5: UI | 2 小时 |
| 测试与修复 | 2 小时 |
| **总计** | **15 小时** ≈ **2 工作日** |
