# 模拟系统数据前端展示完整分析

## 一、模拟系统数据总览

### 1. 模拟引擎产生的完整数据结构

```
SimulationResult (每层tick产生)
├── macro (宏观层)
│   ├── estimatedDAU
│   ├── estimatedRetention { d1, d7, d30 }
│   ├── estimatedRevenue
│   ├── estimatedSatisfaction
│   └── confidence (置信度)
├── micro (微观层)
│   ├── behaviors[] (玩家行为列表)
│   ├── gachaResults[] (抽卡结果)
│   ├── activityParticipation (活动参与)
│   ├── sentimentDistribution (情绪分布)
│   ├── spendingDistribution (消费分布)
│   └── onlineTimeDistribution (在线时长分布)
├── critical (临界层)
│   └── events[] (重大事件)
├── globalImpact (全局影响)
│   ├── project { dau, retention, rating, satisfaction, revenue }
│   ├── company { cash, reputation }
│   ├── characters Map (角色热度)
│   └── plots Map (剧情数据)
└── daySummary (每日摘要)
    └── keyEvents[]
```

### 2. 各 Simulator 产生的数据

| Simulator | 产生的数据 | 是否已展示 |
|-----------|-----------|-----------|
| **ActivitySimulator** | 参与人数、完成率、活动效果(DAU/满意度/收入/疲劳) | ❌ 未展示 |
| **ConfessionSimulator** | 告白内容、类型分布、情感分布、点赞数 | ✅ 已展示 |
| **FanworkSimulator** | 同人作品、质量分布、类型分布、点赞数 | ✅ 已展示 |
| **EventSimulator** | 运营事件、解决方案 | ✅ 已展示 |
| **CommentSimulator** | 5大平台评论、评分、情感分布、平台统计 | ❌ 未展示 |
| **WorldSimulator** | 竞争对手、市场趋势、行业事件 | ✅ 已展示(部分) |
| **GachaSimulator** | 抽卡结果、统计、保底情况 | ✅ 已展示(简化) |
| **PlayerStateSimulator** | 玩家状态变化、流失/回归 | ❌ 未展示 |
| **TagSystem** | 标签影响矩阵 | ❌ 未展示 |

---

## 二、已展示的数据（✅）

### SimulationPanel.vue
1. **世界变化** - DAU/评分/现金/声誉变化
2. **核心指标** - DAU、留存D1/D7/D30、评分、现金、满意度、声誉
3. **情绪分布** - 正面/中性/负面比例（条形图）
4. **抽卡统计** - SSR/SR/R/N分布（简化版）
5. **运营事件** - 最近3个事件
6. **告白墙** - 最近3条
7. **同人广场** - 最近3件
8. **角色热度** - 人气/抽卡率/讨论度排行
9. **剧情完成率** - 完成率/正面率

### OperationView.vue (玩家数据Tab)
10. **模拟预测数据** - 留存率 + 情绪分布

### MarketDashboard.vue
11. **模拟市场预测** - 世界影响 + 留存预测 + 角色热度

---

## 三、未展示的数据（❌）

### 1. 平台评论数据 (CommentSimulator) - 重要

**已有数据：**
```typescript
interface PlatformComment {
  id: string;
  platform: 'taptap' | 'appstore' | 'weibo' | 'bilibili' | 'xiaohongshu';
  playerId: string;
  content: string;
  rating: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  relatedTags: string[];
  timestamp: number;
}

interface PlatformStatistics {
  totalComments: number;
  byPlatform: Record<Platform, number>;
  sentimentDistribution: { positive, neutral, negative };
  averageRating: number;
  ratingByPlatform: Record<Platform, number>;
}
```

**建议展示位置：** CommentsView.vue（评论视图）

**展示内容：**
- 5大平台评论流
- 各平台评分对比
- 情感趋势图
- 热门标签词云

### 2. 活动参与数据 (ActivitySimulator) - 中重要

**已有数据：**
```typescript
interface ActivityResult {
  participation: {
    totalParticipants: number;
    completionRate: number;
    averageCompletion: number;
  };
  effect: {
    dauChange: number;
    satisfactionChange: number;
    revenueChange: number;
    fatigueIncrease: number;
  };
}
```

**建议展示位置：** OperationView.vue - 活动中心Tab

**展示内容：**
- 参与人数统计
- 完成率进度条
- 活动效果影响

### 3. 玩家状态变化 (PlayerStateSimulator) - 中重要

**已有数据：**
```typescript
interface StateChange {
  playerId: string;
  fromState: PlayerState;
  toState: PlayerState;
  reason: string;
}

// 状态: NEW → ACTIVE → PAYING → AT_RISK → LOST/RETURNED
```

**建议展示位置：** OperationView.vue - 玩家数据Tab

**展示内容：**
- 状态流转图
- 流失预警列表
- 回归玩家列表

### 4. 抽卡详细统计 (GachaSimulator) - 中重要

**已有数据：**
```typescript
interface GachaStatistics {
  totalDraws: number;
  totalCost: number;
  ssrCount: number;
  srCount: number;
  rCount: number;
  averageSSRPerDraw: number;
  averageCostPerSSR: number;
  guaranteeRate: number;
  upCharacterRate: number;
}
```

**建议展示位置：** SimulationPanel.vue - 抽卡统计区块增强

**展示内容：**
- 总抽卡次数
- SSR平均成本
- 保底触发率
- UP角色出货率

### 5. 标签影响矩阵 (TagSystem) - 低重要

**已有数据：**
```typescript
// 玩家标签影响: 剧情党、社交党、甜宠控等
// 内容标签影响: 甜宠、虐恋、病娇等
// 活动标签影响: 高福利、高难度、情人节等
```

**建议展示位置：** 新增"标签分析"面板或SimulationPanel底部

**展示内容：**
- 当前活跃标签
- 标签影响热力图
- 推荐内容标签

### 6. 模拟置信度 (Macro Layer) - 低重要

**已有数据：**
```typescript
interface MacroResult {
  confidence: number;  // 0-1
}
```

**建议展示位置：** SimulationPanel.vue - 核心指标旁边

**展示内容：**
- 数据可信度指示器

---

## 四、数据整合建议

### 方案A：增强现有面板（推荐）

在现有 UI 基础上，将未展示的数据整合进去：

1. **SimulationPanel 增强**
   - 新增"平台评论"区块（展示5大平台最新评论）
   - 增强"抽卡统计"（展示详细统计数据）
   - 新增"玩家状态流转"迷你图

2. **OperationView 增强**
   - 活动中心Tab：新增活动参与数据
   - 玩家数据Tab：新增状态变化列表

3. **CommentsView 增强**
   - 新增"模拟评论"标签页
   - 展示 CommentSimulator 生成的评论

### 方案B：新增独立面板

新增一个"模拟数据详情"面板，展示所有未展示的数据：

```
📊 模拟数据详情面板
├── 平台评论监控
│   ├── 5大平台实时评论
│   ├── 评分趋势
│   └── 情感分析
├── 活动效果分析
│   ├── 参与数据
│   └── 效果评估
├── 玩家状态分析
│   ├── 状态流转图
│   └── 流失预警
└── 标签影响分析
    ├── 活跃标签
    └── 影响矩阵
```

---

## 五、优先级排序

| 优先级 | 数据 | 理由 |
|-------|------|------|
| 🔴 高 | 平台评论数据 | 5大平台评论是核心功能，已有 CommentsView 但未使用模拟数据 |
| 🟡 中 | 活动参与数据 | 增强活动中心的数据展示 |
| 🟡 中 | 抽卡详细统计 | 增强抽卡数据的可视化 |
| 🟢 低 | 玩家状态变化 | 可作为增强功能 |
| 🟢 低 | 标签影响矩阵 | 可作为高级分析功能 |
| 🟢 低 | 置信度 | 可作为数据质量指示 |

---

## 六、实施建议

### Phase 1: 平台评论整合（高优先级）
1. 在 CommentSimulator 中添加评论收集逻辑
2. 在 simulationStore 中存储评论数据
3. 在 CommentsView 中新增"模拟评论"标签页

### Phase 2: 活动数据增强（中优先级）
1. 在 ActivitySimulator 中完善数据统计
2. 在 OperationView 活动中心展示参与数据

### Phase 3: 抽卡数据增强（中优先级）
1. 使用 GachaSimulator.getStatistics() 获取详细统计
2. 在 SimulationPanel 增强抽卡展示

### Phase 4: 其他数据（低优先级）
1. 玩家状态变化展示
2. 标签影响矩阵可视化
