# UI 模拟数据与未打通功能分析 Spec

## Why

当前游戏已完成核心功能开发，但存在大量 UI 使用模拟数据、前后端未打通的情况，导致用户体验割裂。需要系统性分析并打通所有功能，同时修复 UI 问题（如底部按钮遮挡）。

## What Changes

- **分析 UI 中的模拟数据**：识别所有使用假数据、静态数据的 UI 组件
- **分析未打通的功能**：识别 Store 有逻辑但 UI 未集成的功能
- **修复 UI 问题**：底部导航栏遮挡按钮等布局问题
- **打通前后端**：将 Store 数据实际应用到 UI 展示和交互

## Impact

- **Affected specs**: UI 集成、评论系统、运营系统、角色系统
- **Affected code**: 
  - `src/views/CommentsView.vue` - 舆论系统 UI
  - `src/views/OperationView.vue` - 运营页面 UI
  - `src/views/game/GameDetailView.vue` - 游戏详情页 UI
  - `src/components/community/PlatformComments.vue` - 多平台评论组件
  - `src/stores/commentStore.ts` - 评论 Store
  - `src/stores/operationStore.ts` - 运营 Store
  - `src/stores/gameStore.ts` - 游戏 Store

---

## ADDED Requirements

### Requirement 1: UI 模拟数据排查

系统 SHALL 识别所有使用模拟数据的 UI 组件：

#### 评论区（CommentsView.vue）
- [x] 舆论热度数据 - 来自 `commentStore.publicOpinion`（✅ 已打通）
- [x] 节奏事件提醒 - 来自 `commentStore.getPendingRhythmEvents()`（✅ 已打通）
- [x] 控评操作 - 调用 `commentStore.controlOpinion()`（✅ 已打通）
- [ ] **多平台评论数据** - `PlatformComments` 组件内部使用模拟数据（❌ 未打通）

#### 运营页面（OperationView.vue）
- [x] 运营数据概览 - 来自 `operationStore.stats`（✅ 已打通）
- [x] 卡池管理 - 来自 `operationStore.gachaPools`（✅ 已打通）
- [x] 活动中心 - 来自 `operationStore.events`（✅ 已打通）
- [x] 运营事件 - `IncidentHandler` 组件（✅ 已打通）
- [ ] **抽卡模拟结果** - `GachaSimulator` 组件内部数据独立（❌ 未完全打通）
- [ ] **福利发放实际效果** - 只增加声誉，没有实际发放资源（❌ 未打通）

#### 游戏详情页（GameDetailView.vue）
- [x] 角色人气值 - 来自 `gameStore.getPopularityRanking()`（✅ 已打通）
- [x] 讨论热度 - 来自 `char.popularity.discussionHeat`（✅ 已打通）
- [x] 抽取次数 - 来自 `char.popularity.gachaCount`（✅ 已打通）
- [ ] **CP 热度** - 数据结构存在但没有计算逻辑（❌ 未实现）
- [ ] **人气变化趋势** - 没有趋势图展示（❌ 未实现）

---

### Requirement 2: 未打通功能清单

系统 SHALL 打通以下 Store 有逻辑但 UI 未集成的功能：

#### 评论系统（commentStore.ts）
- [ ] **生成评论功能** - `generateNewComments()` 有逻辑但 UI 无入口
- [ ] **每日评论生成** - `generateDailyComments()` 无自动触发
- [ ] **评论互动** - `updateCommentInteraction()` 无 UI 操作入口
- [ ] **节奏事件检查** - `checkRhythmEvents()` 无自动调用

#### 运营系统（operationStore.ts）
- [ ] **卡池抽卡模拟** - `simulatePoolGacha()` 只在创建卡池时调用一次
- [ ] **卡池统计** - `getPoolGachaStats()` 无 UI 展示
- [ ] **活动效果计算** - `calculateEventImpact()` 无 UI 展示预期效果
- [ ] **每日结算** - `simulateOneDay()` 需手动触发，无自动结算

#### 游戏系统（gameStore.ts）
- [ ] **角色人气更新** - `updateCharacterPopularity()` 无自动触发
- [ ] **人气加成应用** - `calculatePopularityBonus()` 未应用到实际卡池收入
- [ ] **资源分配策略** - `applyResourceStrategy()` 无 UI 入口

#### 玩家系统（playerStore.ts）
- [ ] **玩家状态自动转换** - `updatePlayerStates()` 无定时调用
- [ ] **玩家统计** - `getPlayerStateStats()` 无 UI 展示

---

### Requirement 3: UI 问题修复

#### 底部按钮遮挡问题
**问题描述**: 如图所示，底部导航栏遮挡了"选择外貌特征"页面的内容

**影响页面**:
- `CharacterCreator.vue` - 角色创建页面
- 其他长内容页面

**解决方案**:
```scss
// 方案 1: 增加底部 padding
.character-creator {
  min-height: 100vh;
  padding-bottom: calc(50px + env(safe-area-inset-bottom)); // 50px 为导航栏高度
}

// 方案 2: 使用 sticky 布局
.bottom-action {
  position: sticky;
  bottom: 50px; // 导航栏高度
  z-index: 100;
}
```

#### 其他 UI 问题
- [ ] **CommentsView** - 控评面板高度固定 50%，内容多时无法滚动
- [ ] **OperationView** - 抽卡模拟器弹窗高度 85%，在小屏设备上可能显示不全
- [ ] **GameDetailView** - 角色人气排行榜在小屏设备上可能换行

---

### Requirement 4: 评论系统完整打通

#### Scenario: 多平台评论数据打通
- **WHEN** 用户进入评论页面
- **THEN** `PlatformComments` 组件应从 `commentStore.comments` 加载数据
- **THEN** 评论应按平台分类展示
- **THEN** 点赞/转发/回复操作应调用 Store 的 `updateCommentInteraction()`

#### 当前问题
```typescript
// PlatformComments.vue 当前使用模拟数据
const comments = ref([
  { id: '1', content: '模拟评论', likes: 100, platform: 'douyin' }
]);

// 应该使用 Store 数据
const commentStore = useCommentStore();
const comments = computed(() => commentStore.comments);
```

---

### Requirement 5: 运营系统完整打通

#### Scenario: 福利发放实际效果
- **WHEN** 用户发放福利
- **THEN** 应实际消耗钻石/金币资源
- **THEN** 应实际增加玩家满意度或声誉
- **THEN** 应生成一条系统公告或评论

#### 当前问题
```typescript
// operationStore.ts - sendWelfare() 只有声誉增加
async function sendWelfare() {
  stats.value.reputation = Math.min(100, stats.value.reputation + 5);
  // ❌ 缺少：资源消耗、评论生成、玩家反应
}
```

---

### Requirement 6: 角色人气完整打通

#### Scenario: 人气影响卡池收益
- **WHEN** 创建人气角色 UP 卡池
- **THEN** 应应用人气加成到收入计算
- **THEN** 人气>80 时收入 +50%
- **THEN** 人气<30 时收入 -30%

#### 当前问题
```typescript
// operationStore.ts - simulatePoolGacha() 未应用人气加成
function simulatePoolGacha(poolId: string, playerCount: number) {
  // ❌ 没有获取角色人气
  // ❌ 没有应用 popularityBonus
  const baseRevenue = playerCount * 100;
  pool.revenue = baseRevenue; // 应该是 baseRevenue * popularityBonus
}
```

---

## MODIFIED Requirements

### Requirement: 舆论热度仪表盘
**原需求**: 评论页面显示舆论热度

**修改后**: 
- 在 `OperationView.vue` 的"运营事件"Tab 添加舆论热度仪表盘
- 显示 0-100 进度条
- 显示情感倾向（正/负）
- 显示趋势（上升/下降/稳定）

---

### Requirement: 玩家状态统计
**原需求**: 玩家生命周期系统

**修改后**:
- 在 `OperationView.vue` 添加"玩家数据"Tab
- 显示活跃/流失/回归玩家数量
- 显示玩家状态分布饼图
- 显示玩家状态变化趋势

---

## REMOVED Requirements

无

---

## 技术实现要点

### 1. PlatformComments 组件打通

```typescript
// PlatformComments.vue
<script setup lang="ts">
import { useCommentStore } from '@/stores/commentStore';

const commentStore = useCommentStore();

// 使用 Store 数据
const comments = computed(() => commentStore.comments);

// 调用 Store 方法
function handleLike(id: string) {
  commentStore.updateCommentInteraction(id, 'like');
}
</script>
```

### 2. 舆论热度仪表盘

```vue
<!-- OperationView.vue -->
<div class="opinion-gauge">
  <div class="gauge-header">
    <span>舆论热度</span>
    <span>{{ commentStore.publicOpinion.heat }}</span>
  </div>
  <van-progress
    :percentage="commentStore.publicOpinion.heat"
    :color="getHeatColor(commentStore.publicOpinion.heat)"
    stroke-width="10"
  />
  <div class="gauge-meta">
    <span :class="getSentimentClass(commentStore.publicOpinion.sentiment)">
      {{ commentStore.publicOpinion.sentiment > 0 ? '正面' : '负面' }}
    </span>
    <span>{{ commentStore.publicOpinion.trend === 'up' ? '📈' : '📉' }}</span>
  </div>
</div>
```

### 3. 人气加成应用

```typescript
// operationStore.ts
function simulatePoolGacha(poolId: string, playerCount: number) {
  const pool = gachaPools.value.find(p => p.id === poolId);
  if (!pool) return;
  
  const gameStore = useGameStore();
  let popularityBonus = 1.0;
  
  // 获取 UP 角色人气加成
  if (pool.upCharacters.length > 0) {
    const charId = pool.upCharacters[0];
    popularityBonus = gameStore.calculatePopularityBonus(charId);
  }
  
  // 应用加成到收入
  const baseRevenue = playerCount * 100;
  pool.revenue = baseRevenue * popularityBonus;
}
```

### 4. 底部遮挡修复

```scss
// 全局样式修复
.page-container {
  min-height: 100vh;
  padding-bottom: calc(50px + env(safe-area-inset-bottom));
}

// 或者针对特定页面
.character-creator,
.comments-view,
.operation-view {
  padding-bottom: 80px; // 已有部分页面实现
}
```

---

## 优先级排序

| 优先级 | 功能 | 影响范围 | 实现难度 | 预计工时 |
|--------|------|----------|----------|----------|
| **P0** | 底部按钮遮挡修复 | UI 体验 | 低 | 1 小时 |
| **P0** | PlatformComments 数据打通 | 评论系统 | 中 | 3 小时 |
| **P0** | 人气与卡池收益联动 | 核心玩法 | 中 | 3 小时 |
| **P1** | 舆论热度仪表盘 UI | UI 完整性 | 低 | 2 小时 |
| **P1** | 玩家状态统计 UI | UI 完整性 | 低 | 2 小时 |
| **P1** | 福利发放实际效果 | 系统联动 | 中 | 3 小时 |
| **P2** | 评论生成 UI 入口 | 功能完整性 | 低 | 2 小时 |
| **P2** | CP 热度计算和展示 | 角色系统 | 中 | 4 小时 |
| **P2** | 人气变化趋势图 | UI 展示 | 中 | 3 小时 |

**总计预计工时**: 约 23 小时（约 3 个工作日）

---

## 总结

### 已打通的功能（✅）
1. 评论 Store 基础数据流
2. 舆论热度展示
3. 节奏事件提醒
4. 控评操作
5. 卡池管理
6. 活动中心
7. 运营事件处理
8. 角色人气值展示
9. 抽卡模拟器 UI

### 未打通的功能（❌）
1. **PlatformComments 使用模拟数据** - 最严重，评论页面核心功能
2. **人气与卡池收益未联动** - 核心玩法闭环缺失
3. **福利发放无实际效果** - 只有声誉增加，无资源消耗
4. **评论互动无 UI 入口** - 点赞/转发/回复无法操作
5. **玩家状态统计无 UI** - 只有数据无展示
6. **舆论热度仪表盘缺失** - 运营页面缺少舆情概览
7. **CP 热度未实现** - 数据结构存在但无计算逻辑

### 下一步重点
**优先实现 P0 的 3 个功能**：
1. 修复底部遮挡问题（1 小时）
2. 打通 PlatformComments 数据（3 小时）
3. 实现人气与卡池收益联动（3 小时）

预计 **7 小时** 完成 P0 功能，显著改善用户体验。
