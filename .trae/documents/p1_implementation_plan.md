# P1任务实现计划

## 概述

P1阶段包含5个重要功能任务，基于已完成的P0核心功能（虚拟玩家池、分层模拟架构、Tag系统、抽卡模拟、玩家状态模拟）。

---

## P1任务清单

| 任务 | 名称 | 依赖 | 预计时间 |
|------|------|------|----------|
| Task 7 | 活动参与模拟 | Task 1,2,3 | 2天 |
| Task 8 | 社交行为模拟 | Task 1,2,3,6 | 2天 |
| Task 9 | 五平台评价模拟 | Task 1,2,3 | 已完成 |
| Task 10 | 运营事件模拟 | Task 1,2,3 | 2天 |
| Task 11 | UI集成与触发 | Task 2 | 2天 |

---

## Task 7: 活动参与模拟

### 目标
模拟每个玩家的活动参与决策和效果计算

### 实现步骤

#### Step 1: 创建活动模拟器 (1天)
**文件**: `src/engine/simulation/activitySimulator.ts`

1. **定义活动配置接口**
```typescript
interface ActivityConfig {
  id: string;
  name: string;
  type: '限时' | '日常' | '大型';
  tags: string[];  // ActivityTag
  rewardValue: number;  // 奖励价值
  difficulty: number;  // 1-10
  duration: number;  // 持续天数
  requiredLevel: number;
}
```

2. **实现 ActivitySimulator 类**
- `calculateParticipation(player, activity)`: 计算参与概率
- `calculateCompletion(player, activity)`: 计算完成率
- `applyTagEffects(player, activity)`: Tag影响计算

3. **参与决策逻辑**
```
参与概率 = 基础参与率(0.5) 
  × 活动吸引力(奖励/难度)
  × 玩家偏好匹配(有匹配Tag +0.3)
  × 疲劳度衰减(>80 -50%)
```

#### Step 2: 创建活动效果计算 (1天)
**文件**: `src/engine/simulation/activitySimulator.ts` (续)

1. **效果影响接口**
```typescript
interface ActivityEffect {
  dauChange: number;       // DAU变化
  satisfactionChange: number;  // 满意度变化
  revenueChange: number;    // 收入变化
  fatigueChange: number;    // 疲劳度变化
}
```

2. **效果计算规则**
- 高福利活动：满意度+5，DAU+10%，收入-20%
- 高难度活动：完成率-20%，但参与的核心玩家满意度+10%
- 签到活动：满意度+2，疲劳度+5

3. **统计输出**
- 参与人数、完成人数、平均完成率
- 总体效果汇总

#### Step 3: 单元测试
- 测试参与概率计算
- 测试Tag影响
- 测试效果计算

---

## Task 8: 社交行为模拟

### 目标
模拟告白墙和同人广场的玩家行为

### 实现步骤

#### Step 1: 创建告白墙模拟器 (1天)
**文件**: `src/engine/simulation/confessionSimulator.ts`

1. **定义告白接口**
```typescript
interface Confession {
  id: string;
  playerId: string;
  type: '角色告白' | '剧情告白' | '官方告白' | '退坑告白';
  content: string;
  relatedTags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  likes: number;
  timestamp: number;
}
```

2. **实现 ConfessionSimulator 类**
- `shouldConfess(player)`: 决策是否发言
- `assignType(player)`: 分配告白类型
- `generateContent(player, type)`: 生成内容

3. **类型分布规则**
```
70% 角色告白（玩家.偏好 ∩ 角色.Tag）
20% 剧情告白（玩家.剧情偏好 ∩ 剧情.Tag）
8% 官方告白（满意度 > 80）
2% 退坑告白（满意度 < 30 或 AT_RISK）
```

#### Step 2: 创建同人广场模拟器 (1天)
**文件**: `src/engine/simulation/fanworkSimulator.ts`

1. **定义同人接口**
```typescript
interface Fanwork {
  id: string;
  playerId: string;
  type: '绘画' | '文稿' | '视频' | 'COS';
  quality: '优质' | '普通' | '粗糙';
  relatedCharacters: string[];
  tags: string[];
  likes: number;
  timestamp: number;
}
```

2. **实现 FanworkSimulator 类**
- `shouldCreate(player)`: 决策是否创作
- `assignType(player)`: 分配创作类型
- `calculateQuality()`: 质量分布（优质10%/普通60%/粗糙30%）

3. **类型分布规则**
```
40% 绘画（角色.适合绘画 Tag）
35% 文稿（角色.CP热度 > 阈值）
15% 视频（剧情.适合视频化）
10% COS（角色.颜值 > 阈值）
```

#### Step 3: 单元测试
- 测试告白类型分布
- 测试同人类型分布
- 测试Tag驱动内容

---

## Task 9: 五平台评价模拟

### 状态: 已完成 ✅
该任务已在P0阶段作为评论模拟器(CommentSimulator)实现完成。

---

## Task 10: 运营事件模拟

### 目标
基于玩家行为动态生成和触发运营事件

### 实现步骤

#### Step 1: 创建事件系统 (1天)
**文件**: `src/engine/simulation/eventSimulator.ts`

1. **定义事件接口**
```typescript
interface OperationEvent {
  id: string;
  type: '正面' | '负面' | '中性';
  title: string;
  description: string;
  tags: string[];  // EventTag
  solutions: EventSolution[];
  triggered: boolean;
}

interface EventSolution {
  id: string;
  description: string;
  cost: number;
  effects: EventEffect;
}
```

2. **实现触发条件**
```typescript
// 随机触发: 每日1%
shouldRandomTrigger(): boolean

// 阈值触发
shouldThresholdTrigger(satisfaction: number): boolean

// Tag触发
shouldTagTrigger(tags: string[]): boolean
```

3. **事件类型**
- **正面**: 好评如潮、意外爆红、竞品翻车
- **负面**: BUG炎上、节奏爆发、角色炎上
- **中性**: 玩家讨论、梗流行、二创爆发

#### Step 2: 事件影响计算 (1天)
**文件**: `src/engine/simulation/eventSimulator.ts` (续)

1. **影响接口**
```typescript
interface EventEffect {
  shortTerm: {  // 当日
    satisfaction: number;
    dau: number;
    revenue: number;
  };
  mediumTerm: {  // 1-2周
    reputation: number;
  };
  longTerm: {  // 1月+
    brandValue: number;
  };
}
```

2. **影响计算规则**
- 正面事件: 满意度+5~10，DAU+5~10%
- 负面事件: 满意度-5~15，DAU-5~15%
- 危机事件需要解决方案

3. **解决方案效果**
- 不同选项有不同成本和效果
- 玩家选择后应用对应效果

#### Step 3: 单元测试
- 测试触发条件
- 测试事件类型
- 测试影响计算

---

## Task 11: UI集成与触发

### 目标
将模拟引擎集成到游戏UI，实现"点击下一天"触发

### 实现步骤

#### Step 1: 创建模拟Store (0.5天)
**文件**: `src/stores/simulationStore.ts`

1. **定义Store**
```typescript
import { defineStore } from 'pinia';
import { VirtualPlayerPool, SimulationEngine } from '@/engine/simulation';

export const useSimulationStore = defineStore('simulation', {
  state: () => ({
    currentDay: number;
    isRunning: boolean;
    lastResult: SimulationResult | null;
    history: SimulationResult[];
    playerPool: VirtualPlayerPool | null;
  }),
  
  actions: {
    async initialize(): Promise<void>;
    async tick(): Promise<SimulationResult>;
    getHistory(): SimulationResult[];
  }
});
```

#### Step 2: 创建运营页面组件 (1天)
**文件**: `src/components/operation/SimulationPanel.vue`

1. **"下一天"按钮**
```vue
<template>
  <button 
    @click="handleNextDay"
    :disabled="isRunning"
  >
    {{ isRunning ? '模拟中...' : '下一天' }}
  </button>
</template>
```

2. **结果展示面板**
- 单日变化摘要
- 关键事件高亮
- 数据趋势图表

3. **数据更新显示**
- 公司数据变化（收入/支出/现金流/声誉）
- 项目数据变化（DAU/留存/评分/满意度）
- 角色数据变化（人气/抽取率/讨论度）
- 剧情数据变化（完成率/好评率）

#### Step 3: 集成到现有运营页面 (0.5天)
**文件**: `src/views/OperationView.vue`

1. 添加"下一天"按钮
2. 集成SimulationPanel组件
3. 连接simulationStore

#### Step 4: 历史记录功能 (0.5天)

1. **历史记录页面**
- 按天查看历史
- 数据趋势图表

2. **数据持久化**
- LocalStorage存储
- 定期清理旧数据

---

## 实施顺序

```
Week 1:
  Day 1-2: Task 7 (活动参与模拟)
  Day 3-4: Task 8 (社交行为模拟)
  
Week 2:
  Day 1-2: Task 10 (运营事件模拟)
  Day 3-4: Task 11 (UI集成)
```

---

## 技术依赖

- **P0已完成**:
  - `src/engine/simulation/types.ts`
  - `src/engine/simulation/playerPool.ts`
  - `src/engine/simulation/simulationEngine.ts`
  - `src/engine/simulation/tagSystem.ts`
  - `src/engine/simulation/gachaSimulator.ts`
  - `src/engine/simulation/playerStateSimulator.ts`
  - `src/engine/simulation/commentSimulator.ts`

- **新增文件**:
  - `src/engine/simulation/activitySimulator.ts`
  - `src/engine/simulation/confessionSimulator.ts`
  - `src/engine/simulation/fanworkSimulator.ts`
  - `src/engine/simulation/eventSimulator.ts`
  - `src/stores/simulationStore.ts`
  - `src/components/operation/SimulationPanel.vue`

---

## 验收标准

### Task 7: 活动参与模拟
- [ ] 玩家独立决策是否参与活动
- [ ] 参与率 = 基础×吸引力×偏好×疲劳度
- [ ] Tag正确影响（高福利+30%）
- [ ] 效果正确应用到DAU/满意度/收入

### Task 8: 社交行为模拟
- [ ] 告白类型分布正确（70%/20%/8%/2%）
- [ ] 同人类型分布正确（40%/35%/15%/10%）
- [ ] Tag驱动内容
- [ ] 质量分布正确

### Task 10: 运营事件模拟
- [ ] 随机触发（1%）
- [ ] 阈值触发（满意度<30%）
- [ ] 解决方案正确应用
- [ ] 短期/中期/长期影响正确

### Task 11: UI集成与触发
- [ ] "下一天"按钮触发模拟
- [ ] 结果正确展示
- [ ] 公司/项目/角色/剧情数据正确更新
- [ ] 历史记录可查看
