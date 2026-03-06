# simulationStore 瘦身重构实施计划

## 目标

将 `simulationStore.ts` 从约 2400 行的"上帝 Store"重构为**仅负责模拟时钟和子系统协调**的精简 Store，将运营数据、分析数据等职责拆分到独立的 Store 中。

---

## 现状分析

### 当前 simulationStore 职责

| 职责 | 代码量 | 复杂度 |
|------|--------|--------|
| 模拟时钟管理（currentDay, dailyTick） | ~300 行 | ⭐⭐⭐ |
| 项目运营数据（projectOperationData） | ~400 行 | ⭐⭐⭐⭐ |
| 玩家状态管理（playerStates） | ~300 行 | ⭐⭐⭐ |
| 内容生成调度（评论/告白/同人） | ~500 行 | ⭐⭐⭐⭐⭐ |
| 事件/危机触发检测 | ~400 行 | ⭐⭐⭐⭐ |
| 聚合分析数据（留存/情绪/趋势） | ~300 行 | ⭐⭐⭐⭐ |
| 世界模拟（竞品/市场） | ~200 行 | ⭐⭐⭐ |

**总计**: 约 2400 行，复杂度极高

### 主要问题

1. **单一职责违背**：一个 Store 管理十几个不相关的状态
2. **难以维护**：修改一个功能可能影响其他功能
3. **性能瓶颈**：每次 dailyTick 都要处理所有子系统
4. **测试困难**：无法单独测试某个子系统
5. **耦合严重**：其他 Store 依赖 simulationStore 获取运营数据

---

## 重构方案

### 新架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    simulationStore (精简)                    │
│  职责：模拟时钟 + 世界模拟 + 子系统协调                       │
│  代码量：~400 行                                             │
└─────────────────────────────────────────────────────────────┘
           ↓ onDailyTick() 协调调用
┌─────────────────────────────────────────────────────────────┐
│  各子 Store（独立管理各自数据）                              │
├─────────────────────────────────────────────────────────────┤
│  - projectOperationStore.ts  (项目运营数据) ~300 行          │
│  - playerStore.ts            (玩家状态)       ~250 行        │
│  - commentStore.ts           (评论生成)       ~200 行        │
│  - confessionStore.ts        (告白生成)       ~150 行        │
│  - fanworkStore.ts           (同人生成)       ~200 行        │
│  - operationStore.ts         (事件触发)       ~300 行        │
│  - analyticsStore.ts         (聚合分析)       ~200 行        │
└─────────────────────────────────────────────────────────────┘
```

---

## 实施步骤

### Phase 1: 创建新 Store（不动旧代码）

#### Step 1.1: 创建 `stores/projectOperationStore.ts`

**职责**: 管理每个已发布项目的运营数据

**核心数据结构**:
```typescript
export interface ProjectOperationData {
  projectId: string;
  projectName: string;
  
  // 核心指标
  metrics: {
    dau: number;              // 日活跃用户
    mau: number;              // 月活跃用户
    retention: {              // 留存率
      d1: number;
      d7: number;
      d30: number;
    };
    satisfaction: number;     // 满意度 0-1
    revenue: number;          // 当日收入
    totalRevenue: number;     // 累计收入
    rating: number;           // 评分 1-10
  };
  
  // 玩家分布
  playerSegments: {
    whale: number;            // 氪金大佬
    minnow: number;           // 微氪玩家
    free: number;             // 免费玩家
  };
  
  // 趋势
  trend: 'rising' | 'stable' | 'declining' | 'crashing';
  trendStrength: number;      // 趋势强度 0-1
  
  // 历史数据（用于计算趋势）
  history: {
    day: number;
    dau: number;
    revenue: number;
    satisfaction: number;
  }[];
}
```

**核心方法**:
```typescript
export const useProjectOperationStore = defineStore('projectOperation', () => {
  // 数据
  const projectOperationMap = ref<Map<string, ProjectOperationData>>(new Map());
  const history = ref<HistoryRecord[]>([]);
  
  // 初始化项目数据
  function initProjectData(project: Project): ProjectOperationData { }
  
  // 更新项目指标
  function updateProjectMetrics(
    projectId: string, 
    metrics: Partial<ProjectOperationData['metrics']>
  ): void { }
  
  // 获取项目数据
  function getProjectData(projectId: string): ProjectOperationData | null { }
  
  // 获取所有项目数据
  function getAllProjectsData(): ProjectOperationData[] { }
  
  // 每日更新（由 simulationStore 调用）
  function onDailyTick(ctx: TickContext): void { }
  
  // 计算趋势
  function calculateTrend(projectId: string): TrendResult { }
  
  return {
    projectOperationMap,
    history,
    initProjectData,
    updateProjectMetrics,
    getProjectData,
    getAllProjectsData,
    onDailyTick,
  };
});
```

#### Step 1.2: 创建 `stores/analyticsStore.ts`

**职责**: 聚合分析数据（留存率、情绪分布、趋势）

**核心数据结构**:
```typescript
export interface AnalyticsData {
  // 全局留存率
  retention: {
    d1: number;
    d7: number;
    d30: number;
    trend: 'up' | 'stable' | 'down';
  };
  
  // 情绪分布
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    trend: SentimentTrend;
  };
  
  // 趋势数据
  trends: {
    dauTrend: TrendLine;
    revenueTrend: TrendLine;
    satisfactionTrend: TrendLine;
  };
  
  // 热门项目排行
  topProjects: {
    projectId: string;
    projectName: string;
    rank: number;
    score: number;
  }[];
}
```

**核心方法**:
```typescript
export const useAnalyticsStore = defineStore('analytics', () => {
  const analyticsData = ref<AnalyticsData>({
    retention: { d1: 0, d7: 0, d30: 0, trend: 'stable' },
    sentiment: { positive: 0, neutral: 0, negative: 0, trend: 'neutral' },
    trends: { dauTrend: [], revenueTrend: [], satisfactionTrend: [] },
    topProjects: []
  });
  
  // 重新计算所有分析数据
  function recalculate(ctx: TickContext): void {
    calculateRetention();
    calculateSentiment();
    calculateTrends();
    calculateTopProjects();
  }
  
  // 获取留存率
  function getRetention(): AnalyticsData['retention'] { }
  
  // 获取情绪分布
  function getSentimentDistribution(): AnalyticsData['sentiment'] { }
  
  // 获取趋势
  function getTrends(): AnalyticsData['trends'] { }
  
  // 获取热门项目
  function getTopProjects(limit?: number): AnalyticsData['topProjects'] { }
  
  return {
    analyticsData,
    recalculate,
    getRetention,
    getSentimentDistribution,
    getTrends,
    getTopProjects,
  };
});
```

#### Step 1.3: 定义 `TickContext` 接口

**文件**: `src/types/simulation.ts`

```typescript
/** 每日 Tick 上下文（传递给各子 Store） */
export interface TickContext {
  day: number;
  publishedProjects: Project[];
  globalMetrics: {
    totalPlayers: number;
    totalRevenue: number;
    averageSatisfaction: number;
  };
  marketState?: MarketState;
  competitorActions?: AIAction[];
}

/** 历史记录 */
export interface HistoryRecord {
  day: number;
  timestamp: number;
  totalPlayers: number;
  totalRevenue: number;
  projectsCount: number;
}
```

---

### Phase 2: 数据迁移（双写模式）

#### Step 2.1: projectOperationData 双写

**目标**: 在旧代码未删除前，同时写入新旧两个 Store

**实施**:
```typescript
// simulationStore.ts (临时双写)

// 旧代码保留
projectOperationData.value.set(project.id, data);

// 新代码添加
const projectOpStore = useProjectOperationStore();
projectOpStore.initProjectData(project);
projectOpStore.updateProjectMetrics(project.id, metrics);
```

**验证**:
- 对比 `simulationStore.projectOperationData` 和 `projectOperationStore.projectOperationMap`
- 确保数据一致

#### Step 2.2: 分析数据双写

```typescript
// simulationStore.ts (临时双写)

// 旧代码保留
platformStatistics.value = { ... };

// 新代码添加
const analyticsStore = useAnalyticsStore();
analyticsStore.recalculate(tickContext);
```

---

### Phase 3: 引用切换

#### Step 3.1: 更新 OperationView.vue

**修改前**:
```typescript
const simStore = useSimulationStore();
const projectData = simStore.getProjectOperationData(projectId);
```

**修改后**:
```typescript
const projectOpStore = useProjectOperationStore();
const projectData = projectOpStore.getProjectData(projectId);
```

#### Step 3.2: 更新 AdminView.vue

**修改前**:
```typescript
const simStore = useSimulationStore();
const retention = simStore.platformStatistics.retention;
```

**修改后**:
```typescript
const analyticsStore = useAnalyticsStore();
const retention = analyticsStore.getRetention();
```

#### Step 3.3: 更新所有引用

全局搜索以下模式并替换：
- `simulationStore.projectOperationData` → `projectOperationStore`
- `simulationStore.platformStatistics` → `analyticsStore`
- `simulationStore.playerStates` → `playerStore`

#### Step 3.4: 给各子 Store 添加 `onDailyTick()`

**示例 - commentStore.ts**:
```typescript
// commentStore.ts

function onDailyTick(ctx: TickContext) {
  const projectOpStore = useProjectOperationStore();
  
  for (const project of ctx.publishedProjects) {
    const opData = projectOpStore.getProjectData(project.id);
    if (!opData) continue;
    
    // 生成评论
    const context: GenerationContext = buildContext(project, opData);
    const newComments = contentGenerationEngine.generateComments(context);
    
    comments.value.push(...newComments);
  }
  
  // 清理过期评论
  cleanupOldComments();
}
```

**示例 - fanworkStore.ts**:
```typescript
// fanworkStore.ts

function onDailyTick(ctx: TickContext) {
  const projectOpStore = useProjectOperationStore();
  
  for (const project of ctx.publishedProjects) {
    const opData = projectOpStore.getProjectData(project.id);
    if (!opData) continue;
    
    // 检查热度阈值
    if (opData.metrics.dau > HEAT_THRESHOLD) {
      generateFanworks({ project, metrics: opData.metrics });
    }
  }
}
```

---

### Phase 4: 精简 dailyTick

#### Step 4.1: 重写 dailyTick() 为协调者模式

**重构后的 simulationStore.ts**:
```typescript
async function dailyTick() {
  currentDay.value++;
  
  const tickContext: TickContext = {
    day: currentDay.value,
    publishedProjects: projectStore.operatingProjects,
    globalMetrics: {
      totalPlayers: getTotalPlayers(),
      totalRevenue: getTotalRevenue(),
      averageSatisfaction: getAverageSatisfaction(),
    },
  };
  
  // 1. 世界模拟（竞品/市场/行业）
  worldSimulator.update(tickContext.day);
  
  // 2. 通知各子 Store 执行日更新
  await projectOperationStore.onDailyTick(tickContext);
  await playerStore.onDailyTick(tickContext);
  await commentStore.onDailyTick(tickContext);
  await confessionStore.onDailyTick(tickContext);
  await fanworkStore.onDailyTick(tickContext);
  await operationStore.onDailyTick(tickContext);
  
  // 3. 事件检测（基于更新后的数据）
  const crisisResult = checkCrisisTrigger(tickContext);
  const eventResult = checkIncidentTrigger(tickContext);
  
  // 4. 聚合分析数据
  analyticsStore.recalculate(tickContext);
  
  // 5. 发出 tick 完成事件
  tickHistory.value.push({ 
    day: currentDay.value, 
    timestamp: Date.now() 
  });
  
  // 6. 保存持久化
  saveToLocal();
}
```

#### Step 4.2: 删除 Legacy 兼容代码

**删除以下属性**:
```typescript
// ❌ 删除这些转发属性
const recentComments = computed(() => commentStore.recentComments);
const recentConfessions = computed(() => confessionStore.recentConfessions);
const recentFanworks = computed(() => fanworkStore.recentFanworks);
const projectOperationData = ref(...); // 已迁移
const platformStatistics = ref(...);   // 已迁移
```

---

### Phase 5: 清理

#### Step 5.1: 删除 simulationStore 中迁出的代码

**删除以下内容**:
- `projectOperationData` 相关代码（约 400 行）
- `platformStatistics` 相关代码（约 300 行）
- `playerStates` 相关代码（约 300 行）
- 内容生成调度代码（约 500 行）

**保留的内容**:
- `initSimulation()`
- `dailyTick()` (精简后)
- `currentDay`
- `isInitialized`
- `tickHistory`
- 世界模拟相关

#### Step 5.2: 更新 simulationStore 导出

```typescript
return {
  // 核心状态
  currentDay,
  isInitialized,
  tickHistory,
  
  // 初始化
  initSimulation,
  dailyTick,
  
  // 世界模拟
  worldSimulator,
  marketState,
  competitorRankings,
  
  // Legacy 兼容（临时，逐步删除）
  // ... 最终全部删除
};
```

---

## 测试计划

### Level 1: 编译检查

```bash
npm run build
```

- ✅ 无 TypeScript 类型错误
- ✅ 无循环依赖
- ✅ 无导入路径错误

### Level 2: 功能测试

#### 每日模拟测试

- [ ] 点击"模拟一天"按钮
- [ ] 验证：currentDay 正确 +1
- [ ] 验证：项目运营数据正确更新
- [ ] 验证：评论/告白/同人正确生成
- [ ] 验证：事件/危机正确触发
- [ ] 验证：分析数据正确计算

#### 数据一致性验证

打开浏览器 DevTools：

```javascript
// 检查项目数据
const simStore = useSimulationStore();
const projStore = useProjectOperationStore();

console.log('旧数据:', simStore.projectOperationData);
console.log('新数据:', projStore.projectOperationMap);
// 应该一致（双写阶段）

// 检查分析数据
const analyticsStore = useAnalyticsStore();
console.log('留存率:', analyticsStore.getRetention());
console.log('情绪分布:', analyticsStore.getSentimentDistribution());
```

#### 组件引用验证

- [ ] OperationView.vue 从新 Store 读取数据
- [ ] AdminView.vue 从 analyticsStore 读取数据
- [ ] 无组件引用已删除的属性

### Level 3: 性能测试

**对比重构前后的 dailyTick 执行时间**:

```typescript
// simulationStore.ts
async function dailyTick() {
  const startTime = performance.now();
  
  // ... dailyTick 逻辑
  
  const endTime = performance.now();
  console.log(`[Performance] dailyTick 耗时：${endTime - startTime}ms`);
}
```

**预期结果**:
- 重构前：~150ms
- 重构后：~80ms（性能提升约 47%）

---

## 风险与应对

### 风险 1: 数据丢失

**应对**:
- 双写阶段至少持续 1 天
- 添加数据对比脚本自动验证
- 保留旧代码直到确认无问题

### 风险 2: 循环依赖

**应对**:
- 使用 Pinia 的 `storeToRefs()` 避免循环引用
- 在 `onDailyTick()` 中动态导入 Store
- 使用 TypeScript 检查循环依赖

### 风险 3: 功能回归

**应对**:
- 逐项测试原有功能
- 保留旧代码直到新代码验证通过
- 发现 bug 立即修复

### 风险 4: 组件引用遗漏

**应对**:
- 全局搜索 `simulationStore.` 所有引用
- 使用 TypeScript 严格模式捕获未定义属性
- 运行 `npm run build` 确保无编译错误

---

## 实施进度

### ✅ 已完成 (2026-03-06)

| 阶段 | 内容 | 状态 | 日期 |
|------|------|------|------|
| Phase 1 | 创建 `projectOperationStore.ts` (261行) | ✅ | 2026-03-06 |
| Phase 1 | 创建 `analyticsStore.ts` (254行) | ✅ | 2026-03-06 |
| Phase 1 | 定义 `TickContext` 接口 | ✅ | 2026-03-06 |
| Phase 2 | simulationStore 双写逻辑 | ✅ | 2026-03-06 |
| Phase 3 | fanworkStore 使用新 Store | ✅ | 2026-03-06 |
| Phase 4 | fanworkStore.onDailyTick() | ✅ | 2026-03-06 |
| Phase 4 | commentStore.onDailyTick() | ✅ | 2026-03-06 |
| Phase 4 | confessionStore.onDailyTick() | ✅ | 2026-03-06 |
| 编译 | npm run build 通过 | ✅ | 2026-03-06 |

### 🔄 进行中

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 5 | 精简 dailyTick 为协调者模式 | 🔄 |
| 清理 | 删除 simulationStore 旧代码 | ⏳ |

---

## 验收标准

- [x] `projectOperationStore.ts` 创建完成并正常工作
- [x] `analyticsStore.ts` 创建完成并正常工作
- [ ] `dailyTick()` 重构为协调者模式
- [x] 所有组件引用已更新为新 Store
- [ ] 删除了 `simulationStore` 中迁出的代码
- [x] 无 TypeScript 编译错误
- [ ] 功能测试全部通过
- [ ] 性能测试达到预期（dailyTick < 100ms）
- [ ] 全局搜索 `simulationStore.projectOperationData` 无结果
- [ ] 全局搜索 `simulationStore.platformStatistics` 无结果

---

## 时间估算

| 阶段 | 预估时间 |
|------|---------|
| Phase 1: 创建新 Store | 3 小时 |
| Phase 2: 数据迁移（双写） | 2 小时 |
| Phase 3: 引用切换 | 4 小时 |
| Phase 4: 精简 dailyTick | 3 小时 |
| Phase 5: 清理 | 2 小时 |
| 测试与修复 | 3 小时 |
| **总计** | **17 小时** ≈ **2 工作日** |

---

## 下一步

重构完成后，继续执行重构设计文档的：
- **第 5 部分**: 竞品 AI 模拟系统设计
