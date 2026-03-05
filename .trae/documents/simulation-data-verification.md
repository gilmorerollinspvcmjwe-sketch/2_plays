# 模拟数据前端展示真实性验证报告

## 验证方法
检查每个 UI 组件的数据来源，确认是否真正来自 simulationStore。

---

## 一、SimulationPanel.vue 数据验证

### ✅ 确认来自 simulationStore 的数据（真实模拟数据）

| 数据项 | 数据来源 | 验证依据 |
|--------|---------|---------|
| **worldImpact** (世界变化) | `storeToRefs` 从 simulationStore 获取 | 第263行: `worldImpact` |
| **currentRetention** (留存率) | `storeToRefs` 从 simulationStore 获取 | 第264行: `currentRetention` |
| **sentimentDistribution** (情绪分布) | `storeToRefs` 从 simulationStore 获取 | 第265行: `sentimentDistribution` |
| **gachaDistribution** (抽卡统计) | `storeToRefs` 从 simulationStore 获取 | 第266行: `gachaDistribution` |
| **characterPopularity** (角色热度) | `storeToRefs` 从 simulationStore 获取 | 第267行: `characterPopularity` |
| **plotCompletion** (剧情完成率) | `storeToRefs` 从 simulationStore 获取 | 第268行: `plotCompletion` |
| **recentConfessions** (告白墙) | `storeToRefs` 从 simulationStore 获取 | 第260行: `recentConfessions` |
| **recentFanworks** (同人广场) | `storeToRefs` 从 simulationStore 获取 | 第261行: `recentFanworks` |
| **recentEvents** (运营事件) | `storeToRefs` 从 simulationStore 获取 | 第262行: `recentEvents` |
| **lastResult.globalImpact** (核心指标) | `storeToRefs` 从 simulationStore 获取 | 第256行: `lastResult` |
| **currentDay** | `storeToRefs` 从 simulationStore 获取 | 第254行: `currentDay` |
| **history** | `storeToRefs` 从 simulationStore 获取 | 第257行: `history` |

**结论：SimulationPanel.vue 的所有数据都真实来自 simulationStore ✅**

---

## 二、OperationView.vue 数据验证

### 需要检查的数据来源

根据之前的修改，OperationView.vue 在"玩家数据"Tab 新增了模拟数据区块：

```vue
<!-- 模拟预测数据 -->
<div v-if="simulationStore.isInitialized" class="simulation-data-card">
  <div class="simulation-stats">
    <div class="sim-stat-item">
      <span class="sim-value">{{ simulationStore.currentRetention.d1 }}%</span>
    </div>
  </div>
</div>
```

**验证结果：**
- ✅ `simulationStore.currentRetention` - 来自 simulationStore
- ✅ `simulationStore.sentimentDistribution` - 来自 simulationStore
- ✅ `simulationStore.isInitialized` - 来自 simulationStore

**但是！** OperationView 的其他 Tab 数据：
- ❌ "告白墙" Tab → 使用 `confessionStore`（独立静态数据）
- ❌ "同人广场" Tab → 使用 `fanCreationStore`（独立静态数据）
- ❌ "运营事件" Tab → 使用 `operationStore.incidents`（独立静态数据）
- ❌ "玩家数据" Tab 的其他部分 → 使用 `playerStore`（独立静态数据）

---

## 三、MarketDashboard.vue 数据验证

### 需要检查的数据来源

根据之前的修改，MarketDashboard 新增了模拟市场区块：

```vue
<div v-if="isInitialized" class="simulation-section">
  <div class="world-impact-grid">
    <span>{{ worldImpact.project.dauChange }}</span>
  </div>
</div>
```

**验证结果：**
- ✅ `worldImpact` - 来自 simulationStore（通过 storeToRefs）
- ✅ `currentRetention` - 来自 simulationStore
- ✅ `characterPopularity` - 来自 simulationStore

**但是！** MarketDashboard 的其他部分：
- ❌ 市场趋势 → 独立生成
- ❌ 竞争对手 → 独立生成
- ❌ 节日日历 → 独立生成
- ❌ 收入预测 → 独立生成

---

## 四、CommentsView.vue 数据验证

### 检查结果

**完全没有使用 simulationStore 的数据！**

CommentsView.vue 使用的是：
- ❌ `commentStore` - 独立静态数据
- ❌ `operationStore` - 独立静态数据

**CommentSimulator 生成的 5大平台评论数据完全没有展示！**

---

## 五、ConfessionWall.vue / FanCreationSquare.vue 数据验证

### 检查结果

**完全没有使用 simulationStore 的数据！**

- ❌ ConfessionWall → 使用 `confessionStore`（独立静态数据）
- ❌ FanCreationSquare → 使用 `fanCreationStore`（独立静态数据）

**ConfessionSimulator 和 FanworkSimulator 生成的数据只在 SimulationPanel 中展示，没有同步到告白墙和同人广场组件！**

---

## 六、总结：真实数据流向

### 真正使用模拟数据的组件（✅）

| 组件 | 使用的模拟数据 | 占比 |
|------|---------------|------|
| **SimulationPanel.vue** | 全部数据都来自 simulationStore | 100% |
| **OperationView.vue** | 只有"模拟预测数据"区块使用 | ~10% |
| **MarketDashboard.vue** | 只有"模拟市场预测"区块使用 | ~15% |

### 完全没有使用模拟数据的组件（❌）

| 组件 | 当前数据来源 | 可整合的模拟数据 |
|------|-------------|-----------------|
| **CommentsView.vue** | commentStore | CommentSimulator 的5大平台评论 |
| **ConfessionWall.vue** | confessionStore | ConfessionSimulator 的告白数据 |
| **FanCreationSquare.vue** | fanCreationStore | FanworkSimulator 的同人数据 |
| **OperationView 其他Tab** | operationStore/playerStore | EventSimulator/ActivitySimulator |

---

## 七、关键问题

### 问题1：数据孤岛
SimulationPanel 是一个"数据孤岛"，展示了完整的模拟数据，但这些数据与其他组件完全隔离。

### 问题2：重复功能
- 告白墙：SimulationPanel 展示模拟告白，ConfessionWall 展示静态告白
- 同人广场：SimulationPanel 展示模拟同人，FanCreationSquare 展示静态同人
- 评论：CommentsView 展示静态评论，模拟评论无处可看

### 问题3：用户体验割裂
用户在不同页面看到不同来源的数据，造成困惑。

---

## 八、建议解决方案

### 方案A：统一数据源（推荐）
将 confessionStore、fanCreationStore、commentStore 的数据源改为 simulationStore：

```
simulationStore (唯一数据源)
    │
    ├──► ConfessionWall.vue (通过 confessionStore 展示)
    ├──► FanCreationSquare.vue (通过 fanCreationStore 展示)
    ├──► CommentsView.vue (通过 commentStore 展示)
    └──► SimulationPanel.vue (直接展示)
```

### 方案B：数据同步机制
在 simulationStore.tick() 中，将模拟数据同步到其他 Store：

```typescript
// simulationStore.ts
async function tick() {
  // ... 模拟逻辑 ...
  
  // 同步到 confessionStore
  confessionStore.mergeSimulatedConfessions(recentConfessions.value);
  
  // 同步到 fanCreationStore
  fanCreationStore.mergeSimulatedFanworks(recentFanworks.value);
  
  // 同步到 commentStore
  commentStore.mergeSimulatedComments(simulatedComments);
}
```

### 方案C：数据切换模式
在 UI 层提供"真实数据/模拟数据"切换：

```vue
<ConfessionWall :data-source="'simulation'" />
<ConfessionWall :data-source="'real'" />
```

---

## 九、实施优先级

| 优先级 | 任务 | 影响 |
|-------|------|------|
| 🔴 高 | 整合 CommentSimulator 到 CommentsView | 5大平台评论是核心功能 |
| 🔴 高 | 打通 confessionStore 与 simulationStore | 告白墙数据统一 |
| 🔴 高 | 打通 fanCreationStore 与 simulationStore | 同人广场数据统一 |
| 🟡 中 | 整合 ActivitySimulator 到 OperationView | 活动数据增强 |
| 🟢 低 | 整合 PlayerStateSimulator | 玩家状态展示 |
