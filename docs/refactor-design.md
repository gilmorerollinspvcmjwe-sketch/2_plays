# 乙游模拟器 — 架构重构 & 竞品AI系统设计文档

> 版本: v1.0  
> 日期: 2026-03-06  
> 范围: OperationView 拆分、角色创建优化、Store 合并、SimulationStore 瘦身、竞品AI系统

---

## 目录

1. [OperationView.vue 拆分方案](#1-operationviewvue-拆分方案)
2. [角色创建12步向导优化](#2-角色创建12步向导优化)
3. [fanCreationStore / fanworkStore 合并方案](#3-fancreationstore--fanworkstore-合并方案)
4. [simulationStore 瘦身重构](#4-simulationstore-瘦身重构)
5. [竞品AI模拟系统设计](#5-竞品ai模拟系统设计)
6. [测试策略](#6-测试策略)

---

## 1. OperationView.vue 拆分方案

### 1.1 现状分析

`OperationView.vue` 总计 **2390 行**，包含：

| 区域 (行号范围) | 功能 | 行数 |
|---|---|---|
| 1-13 | OperationDashboard（已抽组件） | 13 |
| 15-27 | 玩家社区分析入口 | 13 |
| 30-156 | Tab: 卡池管理 | 126 |
| 158-210 | Tab: 活动中心 | 52 |
| 212-238 | Tab: 运营事件（舆论仪表盘+事件处理） | 26 |
| 240-379 | Tab: 玩家数据（统计/趋势/模拟预测） | 139 |
| 381-424 | Tab: 福利发放 | 43 |
| 426-430 | Tab: 告白墙（已抽组件） | 4 |
| 432-436 | Tab: 同人广场（已抽组件） | 4 |
| 438-442 | Tab: 市场情报（已抽组件） | 4 |
| 444-498 | Tab: 效果追踪 | 54 |
| 500-700 | 弹窗区域（创建卡池/活动/模板/抽卡/预测/社区/事件） | 200 |
| 702-1439 | `<script setup>` 逻辑 | 737 |
| 1441-2390 | `<style>` 样式 | 949 |

**核心问题：**
- 9个Tab的模板+逻辑+样式全部内联
- 7个弹窗的状态和处理逻辑混在一起
- 手绘Canvas图表代码占100+行
- 样式代码949行远超模板本身

### 1.2 拆分后的组件树

```
OperationView.vue (容器, ~150行)
├── OperationDashboard.vue          ← 已有, 保持不变
├── CommunityAnalysisEntry.vue      ← 新建, 社区分析入口+弹窗
│
├── <van-tabs> 管理以下 Tab 组件:
│   ├── GachaPoolTab.vue            ← 新建
│   │   ├── CharacterPopularityRanking.vue  ← 新建
│   │   ├── GachaPoolList.vue               ← 新建
│   │   └── GachaPoolCreateDialog.vue       ← 新建 (含预测入口)
│   │
│   ├── EventCenterTab.vue          ← 新建
│   │   └── EventCreateDialog.vue           ← 新建
│   │
│   ├── IncidentTab.vue             ← 新建 (舆论仪表盘 + IncidentHandler)
│   │   └── OpinionGauge.vue                ← 新建
│   │
│   ├── PlayerDataTab.vue           ← 新建
│   │   ├── PlayerLifecycleStats.vue        ← 新建
│   │   ├── PlayerTrendChart.vue            ← 新建 (封装Canvas逻辑)
│   │   └── SimulationPreview.vue           ← 新建
│   │
│   ├── WelfareTab.vue              ← 新建
│   │
│   ├── ConfessionWall.vue          ← 已有, 保持不变
│   ├── FanCreationSquare.vue       ← 已有, 保持不变
│   ├── MarketDashboard.vue         ← 已有, 保持不变
│   │
│   └── EffectTrackingTab.vue       ← 新建
│
├── CrisisAlert.vue                 ← 已有, 保持不变
├── OperationPredictionPanel.vue    ← 已有(弹窗)
└── IncidentResolveDialog.vue       ← 新建 (从内联弹窗抽出)
```

### 1.3 各组件职责与接口

#### OperationView.vue（瘦身后 ~150行）

```vue
<template>
  <div class="operation-view">
    <OperationDashboard ... />
    <CommunityAnalysisEntry />
    
    <van-tabs v-model="activeTab" class="operation-tabs">
      <van-tab title="卡池管理">
        <GachaPoolTab @show-prediction="handleShowPrediction" />
      </van-tab>
      <van-tab title="活动中心">
        <EventCenterTab />
      </van-tab>
      <van-tab title="运营事件">
        <IncidentTab />
      </van-tab>
      <van-tab title="玩家数据">
        <PlayerDataTab />
      </van-tab>
      <van-tab title="福利发放">
        <WelfareTab />
      </van-tab>
      <van-tab title="告白墙"><ConfessionWall /></van-tab>
      <van-tab title="同人广场"><FanCreationSquare /></van-tab>
      <van-tab title="市场情报"><MarketDashboard /></van-tab>
      <van-tab title="效果追踪">
        <EffectTrackingTab />
      </van-tab>
    </van-tabs>

    <CrisisAlert :crises="crises" @resolve="handleResolveCrisis" />
    <OperationPredictionPopup v-model:show="showPrediction" ... />
  </div>
</template>

<script setup>
// 仅保留：
// 1. Tab 切换逻辑
// 2. 危机处理（跨Tab）
// 3. 预测面板（跨Tab）
// 4. URL参数解析（路由级逻辑）
// 5. 模拟一天按钮逻辑
</script>
```

#### GachaPoolTab.vue（~200行）

**Props:** 无（直接读 Store）  
**Emits:** `show-prediction(decision, prediction)`  
**职责：**
- 角色人气排行（Top10）
- 卡池列表展示
- 建议UP角色
- 创建卡池弹窗（内含预测入口）
- 抽卡模拟器入口

**内部状态：**
```ts
const showCreatePool = ref(false)
const showGachaSimulator = ref(false)
const poolForm = ref({ name: '', upCharacters: '', rates: {...}, budget: '中' })
```

#### PlayerDataTab.vue（~250行）

**Props:** 无  
**职责：**
- 自动结算开关
- 玩家生命周期统计
- 趋势图（Canvas封装到 PlayerTrendChart.vue）
- 模拟预测数据

**关键：** 将 `drawTrendChart` 整个Canvas绘制逻辑封装到 `PlayerTrendChart.vue` 中：

```vue
<!-- PlayerTrendChart.vue -->
<template>
  <div class="trend-chart-card">
    <div class="chart-header">
      <span>📈 玩家状态趋势</span>
      <van-button size="mini" round @click="refresh">刷新</van-button>
    </div>
    <canvas ref="canvasRef" class="trend-canvas" />
    <div class="chart-legend">...</div>
  </div>
</template>

<script setup>
const props = defineProps<{
  data: { dates: string[]; active: number[]; lost: number[]; new: number[] }
}>()
// 全部Canvas绘制逻辑内聚在此
</script>
```

### 1.4 拆分执行步骤

```
Phase 1: 提取纯展示组件（不动逻辑）
  ├── Step 1: 创建 OpinionGauge.vue (模板+样式搬迁)
  ├── Step 2: 创建 PlayerTrendChart.vue (Canvas逻辑封装)
  ├── Step 3: 创建 PlayerLifecycleStats.vue
  └── Step 4: 创建 CharacterPopularityRanking.vue

Phase 2: 提取Tab组件（模板+对应逻辑+样式一起搬）
  ├── Step 5: 创建 GachaPoolTab.vue (含弹窗)
  ├── Step 6: 创建 EventCenterTab.vue (含弹窗)
  ├── Step 7: 创建 IncidentTab.vue
  ├── Step 8: 创建 PlayerDataTab.vue
  ├── Step 9: 创建 WelfareTab.vue
  └── Step 10: 创建 EffectTrackingTab.vue

Phase 3: 提取弹窗组件
  ├── Step 11: 创建 IncidentResolveDialog.vue
  └── Step 12: 创建 CommunityAnalysisEntry.vue (含弹窗)

Phase 4: 瘦身 OperationView.vue
  └── Step 13: 清理，只保留容器逻辑
```

**每个Step完成后立即运行 `npm run build` 验证无编译错误。**

### 1.5 UI 设计优化

在拆分的同时，对Tab的交互做以下优化：

**问题：** 9个Tab在手机端显示为可滑动的Tab条，用户很容易忽略后面的Tab。

**方案：** 将9个Tab重新分组为 **3个一级Tab + 二级内容**：

```
一级Tab:
├── 运营管理（卡池管理 / 活动中心 / 福利发放）
├── 数据分析（玩家数据 / 运营事件 / 效果追踪）
└── 社区动态（告白墙 / 同人广场 / 市场情报）
```

每个一级Tab内部用 `van-grid` 宫格或 `van-collapse` 折叠面板来组织子功能。

```vue
<!-- 运营管理 Tab 内部 -->
<van-grid :column-num="3" :gutter="10">
  <van-grid-item icon="gem-o" text="卡池管理" @click="subTab='gacha'" />
  <van-grid-item icon="flag-o" text="活动中心" @click="subTab='event'" />
  <van-grid-item icon="gift-o" text="福利发放" @click="subTab='welfare'" />
</van-grid>
<component :is="subTabComponent" />
```

---

## 2. 角色创建12步向导优化

### 2.1 现状分析

当前12步：

| 步骤 | 内容 | 类型 | 用户操作 |
|------|------|------|---------|
| 1 | 外貌 | 单选列表 | 从5-6个选项选一个 |
| 2 | 服装 | 单选列表 | 从5-6个选项选一个 |
| 3 | 性格标签 | 多选 | 选1-3个性格标签 |
| 4 | 深度设定 | 滑块×5 | 调5个滑块 |
| 5 | 成长弧线 | 卡片选择 | 选一种成长模式 |
| 6 | 美术风格 | 卡片选择 | 选一种风格 |
| 7 | 声优 | 卡片选择 | 选一个等级 |
| 8 | 背景 | 文本输入 | 输入背景故事 |
| 9 | 关系 | 配置表 | 设定与其他角色关系 |
| 10 | 秘密 | 文本输入 | 输入隐藏设定 |
| 11 | AI预览 | 只读展示 | 查看AI生成的预览 |
| 12 | 生日 | 日期选择 | 选日期 |

**问题：**
- 手机端走完12步约需2-3分钟，过于冗长
- 步骤1-2（外貌/服装）信息密度低，一步就是选一个选项
- 步骤8/10（背景/秘密）都是文本输入，语义接近
- 没有快速模板/草稿保存
- AI预览在倒数第二步，太晚了

### 2.2 重新设计：5步合并方案

```
新步骤1: 基础形象（合并原1+2+6+12）
  ├── 外貌选择（横滑卡片）
  ├── 服装选择（横滑卡片）
  ├── 美术风格（3个选项卡片）
  └── 生日（日期选择器，可选）

新步骤2: 性格与成长（合并原3+4+5）
  ├── 性格标签（多选标签云）
  ├── 深度属性（雷达图滑块，可折叠展开）
  └── 成长弧线（3选1卡片）

新步骤3: 故事背景（合并原8+9+10）
  ├── 背景设定（文本域）
  ├── 角色关系（下拉选择关系类型）
  └── 隐藏秘密（文本域，标记为"可选"）

新步骤4: 声优选择（保持原7）
  └── 声优等级（3选1，显示成本差异）

新步骤5: AI预览与确认（保持原11，移到最后）
  ├── AI 生成的角色概要
  ├── 角色卡片预览
  └── 确认创建 / 返回修改
```

### 2.3 新增"快速创建"模式

在进入角色创建页面时，提供两个入口：

```
┌─────────────────────────────┐
│  选择创建方式                │
│                             │
│  ┌───────┐  ┌───────┐      │
│  │ 🎨    │  │ ⚡     │      │
│  │ 自定义 │  │ 快速   │      │
│  │ 创建   │  │ 创建   │      │
│  │       │  │       │      │
│  │ 5步完成│  │ 1步完成│      │
│  │ 深度   │  │ 模板   │      │
│  │ 定制   │  │ 生成   │      │
│  └───────┘  └───────┘      │
│                             │
│  📁 从草稿继续 (2个草稿)     │
└─────────────────────────────┘
```

**快速创建流程：**
1. 选择一个角色模板（8个预设模板已有：`src/data/templates/characters/`）
2. 修改名字（可选）
3. 确认创建

**模板来源：** 复用已有的 `childhoodSweetheart.ts`, `coldGod.ts`, `president.ts` 等8个模板。

### 2.4 草稿自动保存

```ts
// composables/useCharacterDraft.ts
export function useCharacterDraft() {
  const DRAFT_KEY = 'character_creator_draft'
  
  // 每步切换时自动保存
  function saveDraft(step: number, data: Partial<CharacterFormData>) {
    const draft = {
      step,
      data,
      savedAt: Date.now(),
      projectId: currentProjectId
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }
  
  // 恢复草稿
  function loadDraft(): { step: number; data: Partial<CharacterFormData> } | null {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw)
    // 草稿超过7天自动失效
    if (Date.now() - draft.savedAt > 7 * 86400000) {
      localStorage.removeItem(DRAFT_KEY)
      return null
    }
    return draft
  }
  
  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY)
  }
  
  return { saveDraft, loadDraft, clearDraft }
}
```

### 2.5 UI 重设计要点

**步骤1（基础形象）的UI：**

```
┌─────────────────────────────────┐
│  创建角色  Step 1/5             │
│  ━━━━━━━━━━━━━ ○ ○ ○ ○          │
│                                 │
│  选择外貌                       │
│  ┌────┐┌────┐┌────┐┌────┐      │
│  │银发 ││黑发 ││金发 ││棕发 │← 横滑 │
│  │冷峻 ││温柔 ││阳光 ││文静 │      │
│  └────┘└────┘└────┘└────┘      │
│                                 │
│  选择服装                       │
│  ┌────┐┌────┐┌────┐            │
│  │校服 ││西装 ││和风 │← 横滑     │
│  └────┘└────┘└────┘            │
│                                 │
│  美术风格                       │
│  [日系] [韩系] [国风]           │
│                                 │
│  生日 (可选)  📅 3月14日         │
│                                 │
│        [ 下一步 → ]             │
└─────────────────────────────────┘
```

**关键设计原则：**
- 每个步骤在一屏内能看到所有选项，不需要滚动
- 选项用卡片/标签形式，点击即选，减少操作成本
- "可选"的字段明确标注，减少心理压力
- 底部固定"下一步"按钮，上方有全局进度条

### 2.6 执行步骤

```
Phase 1: 创建基础设施
  ├── Step 1: 创建 composables/useCharacterDraft.ts
  └── Step 2: 创建 composables/useQuickCreate.ts (模板加载)

Phase 2: 重构 CharacterCreator.vue
  ├── Step 3: 创建 CharacterCreatorEntry.vue (选择创建方式)
  ├── Step 4: 重写 Step 1 模板 (合并外貌+服装+美术+生日)
  ├── Step 5: 重写 Step 2 模板 (合并性格+深度+弧线)
  ├── Step 6: 重写 Step 3 模板 (合并背景+关系+秘密)
  ├── Step 7: Step 4 保持声优不变
  ├── Step 8: Step 5 保持AI预览，移到最后
  └── Step 9: 更新 router，CharacterCreator 改用新入口

Phase 3: 快速创建
  ├── Step 10: 创建 QuickCharacterCreate.vue
  └── Step 11: 模板选择 + 一键确认
```

---

## 3. fanCreationStore / fanworkStore 合并方案

### 3.1 现状对比

| 特性 | fanCreationStore | fanworkStore |
|------|-----------------|-------------|
| 作品类型 | fanfic / fanart / emoji | 绘画 / 文稿 / 视频 / COS |
| 数据来源 | 用户创作 + simulationStore同步 | contentGenerationEngine生成 + simulationStore同步 |
| 点赞 | ✅ | ✅ |
| 收藏 | ✅ | ❌ |
| 热度计算 | ❌ | ✅ (时间衰减) |
| 质量分级 | ❌ | ✅ (优质/普通/粗糙) |
| 项目关联 | ❌ | ✅ (projectId, characterId, cpPair) |
| 积分消耗 | ✅ (创作要花积分) | ❌ |
| 持久化 | localStorage | localStorage |
| 引用方 | FanCreationSquare.vue, FanCreationModal.vue | FanCreationSquare.vue (部分) |

### 3.2 合并策略

**目标：** 合并为统一的 `fanworkStore.ts`，同时保留两者的最佳特性。

**统一数据模型：**

```ts
// stores/fanworkStore.ts (合并后)

/** 统一的同人作品类型 */
export type FanworkType = 'fanart' | 'fanfic' | 'video' | 'cos' | 'emoji';

/** 作品来源 */
export type FanworkSource = 'user' | 'simulated' | 'generated';

/** 统一的同人作品接口 */
export interface Fanwork {
  id: string;
  type: FanworkType;
  quality: 'premium' | 'normal' | 'rough';
  source: FanworkSource;
  
  // 内容
  title: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  
  // 作者
  authorId: string;
  authorName: string;
  
  // 互动数据
  likes: number;
  views: number;
  collections: number;
  heat: number; // 计算字段，由 calculateHeat() 得出
  
  // 用户交互状态
  isLiked: boolean;
  isCollected: boolean;
  
  // 关联信息
  projectId?: string;
  projectName?: string;
  characterId?: string;
  characterName?: string;
  cpPair?: string[];
  cpPairNames?: string[];
  plotId?: string;
  plotTitle?: string;
  
  // 时间
  createdAt: string;
}
```

**合并后的 Store API：**

```ts
export const useFanworkStore = defineStore('fanwork', () => {
  // === 状态 ===
  const fanworks: Ref<Fanwork[]>
  const activeFilter: Ref<FanworkType | 'all'>
  
  // === 计算属性 ===
  const filteredFanworks: ComputedRef<Fanwork[]>
  const userCreations: ComputedRef<Fanwork[]>       // source === 'user'
  const simulatedCreations: ComputedRef<Fanwork[]>  // source === 'simulated' | 'generated'
  const fanworksByType: ComputedRef<Record<FanworkType, Fanwork[]>>
  const totalHeat: ComputedRef<number>
  const averageQuality: ComputedRef<number>
  
  // === 用户创作（原fanCreationStore逻辑）===
  function createFanwork(params: CreateFanworkParams): Promise<Result>
  // 包含积分消耗、角色人气更新、成就解锁
  
  // === 内容生成引擎创作（原fanworkStore逻辑）===
  function generateFanworks(context?: GenerationContext): Fanwork[]
  // 由模拟系统调用，基于项目热度生成
  
  // === 交互 ===
  function toggleLike(fanworkId: string): Promise<Result>
  function toggleCollect(fanworkId: string): Promise<Result>
  function deleteFanwork(fanworkId: string): boolean
  
  // === 查询 ===
  function getFanworksByCharacter(characterId: string): Fanwork[]
  function getFanworksByProject(projectId: string): Fanwork[]
  function getHotFanworks(limit?: number): Fanwork[]
  
  // === 同步 ===
  function syncFromSimulation(): void
  
  // === 持久化 ===
  function saveToLocal(): void
  function loadFromLocal(): void
})
```

### 3.3 迁移步骤

```
Phase 1: 数据模型统一
  ├── Step 1: 在 fanworkStore.ts 中定义统一的 Fanwork 接口
  ├── Step 2: 添加 source 字段区分来源
  └── Step 3: 添加 collections 字段（从fanCreationStore迁入）

Phase 2: 功能合并
  ├── Step 4: 将 fanCreationStore 的 createFanCreation() 迁入为 createFanwork()
  │           (保留积分消耗逻辑)
  ├── Step 5: 将 fanCreationStore 的 collectCreation() 迁入为 toggleCollect()
  ├── Step 6: 将 fanCreationStore 的 generateMockCreations() 迁入
  └── Step 7: 合并两个 syncFromSimulation / simulatedCreations 逻辑

Phase 3: 更新引用
  ├── Step 8: 更新 FanCreationSquare.vue → useFanworkStore
  ├── Step 9: 更新 FanCreationModal.vue → useFanworkStore
  ├── Step 10: 更新 simulationStore.ts 中对 fanCreationStore 的引用
  └── Step 11: 更新 OperationView.vue 中的引用

Phase 4: 清理
  ├── Step 12: 删除 fanCreationStore.ts
  ├── Step 13: localStorage 迁移（读旧key，写新key）
  └── Step 14: 全项目搜索 'fanCreation' 确认无遗留引用
```

### 3.4 同样处理重复的 commentTemplates

`src/data/commentTemplates.ts` 和 `src/data/templates/commentTemplates.ts` 存在重复。

**方案：**
- 将 `src/data/commentTemplates.ts` 的内容合并到 `src/data/templates/commentTemplates.ts`
- 更新 `commentStore.ts` 中的 import 路径
- 删除旧文件

---

## 4. simulationStore 瘦身重构

### 4.1 现状分析

`simulationStore.ts` **2381行**，职责清单：

| 职责 | 行数(约) | 应归属 |
|------|---------|--------|
| 初始化模拟引擎(playerPool/simulator等) | 100 | ✅ 保留 |
| 项目运营数据管理(ProjectOperationData) | 200 | → projectOperationStore |
| dailyTick()主循环 | 300 | ✅ 保留(精简后) |
| 内容生成调度(评论/告白/同人) | 200 | → 各内容Store自行管理 |
| 事件触发检测(危机/事件) | 150 | → eventStore |
| 玩家行为聚合统计 | 150 | → playerStore |
| Legacy兼容层 | 200 | ❌ 删除 |
| 重复的计算属性(getter) | 300 | → 下沉到各自Store |
| 趋势/留存/情绪分布计算 | 200 | → analyticsStore |

### 4.2 拆分方案

```
simulationStore.ts (瘦身后 ~400行)
  - 职责: 仅负责"模拟时钟tick"和"子系统协调"
  - 保留: initSimulation(), dailyTick(), currentDay, isInitialized
  - 模式: 调用其他Store的方法，不直接操作数据

新增 stores/projectOperationStore.ts (~300行)
  - 职责: 每个已发布项目的运营数据 (ProjectOperationData)
  - 方法: initProjectData(), updateProjectMetrics(), getProjectData()
  - 数据: projectOperationMap, history

新增 stores/analyticsStore.ts (~200行)
  - 职责: 聚合分析数据（留存率、情绪分布、趋势）
  - 方法: calculateRetention(), getSentimentDistribution(), getTrends()
  - 数据: retention, sentiment, trends

移动职责到现有Store:
  - commentStore: 自行管理内容生成调度
  - confessionStore: 自行管理内容生成调度
  - fanworkStore: 自行管理内容生成调度
  - operationStore: 事件触发检测移入
```

### 4.3 dailyTick() 重构

**重构前（伪代码，实际约300行）：**

```ts
async function dailyTick() {
  // 直接操作十几个子系统的数据
  // 直接调用引擎计算
  // 直接修改 projectOperationData
  // 直接生成评论/告白/同人
  // 直接检测危机/事件
  // 直接更新玩家状态
  // ...
}
```

**重构后（发布-订阅模式）：**

```ts
// simulationStore.ts (重构后)
async function dailyTick() {
  currentDay.value++
  
  const tickContext: TickContext = {
    day: currentDay.value,
    publishedProjects: projectStore.operatingProjects,
    globalMetrics: analyticsStore.globalMetrics,
  }
  
  // 1. 世界模拟（竞品/市场/行业）
  worldSimulator.update(tickContext.day)
  
  // 2. 通知各子Store执行日更新
  await projectOperationStore.onDailyTick(tickContext)
  await playerStore.onDailyTick(tickContext)
  await commentStore.onDailyTick(tickContext)
  await confessionStore.onDailyTick(tickContext)
  await fanworkStore.onDailyTick(tickContext)
  await operationStore.onDailyTick(tickContext)
  
  // 3. 事件检测（基于更新后的数据）
  const crisisResult = checkCrisisTrigger(tickContext)
  const eventResult = checkIncidentTrigger(tickContext)
  
  // 4. 聚合分析数据
  analyticsStore.recalculate(tickContext)
  
  // 5. 发出tick完成事件
  tickHistory.value.push({ day: currentDay.value, timestamp: Date.now() })
}
```

**每个子Store实现 `onDailyTick(ctx)` 方法，只关心自己的数据：**

```ts
// commentStore.ts
function onDailyTick(ctx: TickContext) {
  for (const project of ctx.publishedProjects) {
    const opData = projectOperationStore.getProjectData(project.id)
    const newComments = contentGenerationEngine.generateComments(project, opData)
    comments.value.push(...newComments)
  }
}
```

### 4.4 Legacy 兼容层处理

当前存在的 Legacy 兼容代码（如 `recentComments`, `recentConfessions`, `recentFanworks` 等属性直接挂在 simulationStore 上），其他组件正在引用。

**迁移策略：**

```ts
// Phase 1: 添加 deprecated 标记和转发
/** @deprecated 请直接使用 commentStore.recentComments */
const recentComments = computed(() => commentStore.recentComments)

// Phase 2: 逐个文件更新引用
// 全局搜索 simulationStore.recentComments → commentStore.recentComments

// Phase 3: 删除转发属性
```

### 4.5 执行步骤

```
Phase 1: 创建新Store（不动旧代码）
  ├── Step 1: 创建 stores/projectOperationStore.ts
  ├── Step 2: 创建 stores/analyticsStore.ts
  └── Step 3: 定义 TickContext 接口

Phase 2: 数据迁移（双写模式）
  ├── Step 4: projectOperationData 双写到新Store
  ├── Step 5: 分析数据双写到 analyticsStore
  └── Step 6: 验证双写数据一致

Phase 3: 引用切换
  ├── Step 7: 更新 OperationView → 从新Store读数据
  ├── Step 8: 更新 AdminView → analyticsStore
  ├── Step 9: 更新其他所有引用 simulationStore 的组件
  └── Step 10: 给各子Store添加 onDailyTick()

Phase 4: 精简 dailyTick
  ├── Step 11: 重写 dailyTick() 为协调者模式
  └── Step 12: 删除 Legacy 兼容代码

Phase 5: 清理
  └── Step 13: 删除 simulationStore 中迁出的代码
```

---

## 5. 竞品AI模拟系统设计

### 5.1 设计目标

创建一个有**人格特征**的竞品AI系统，让玩家感受到真实的市场竞争压力。每个竞品公司有独特的运营策略和个性，会根据市场环境和玩家行为做出"智能"反应。

### 5.2 竞品AI角色设定

设计 **6个** 固定竞品AI公司，每个有鲜明的个性：

| ID | 公司名 | 代表作 | AI人格 | 策略倾向 | 初始实力 |
|----|--------|--------|--------|---------|---------|
| ai_1 | 叠纸互娱 | 恋与星海 | 开拓者 | 敢于创新，高投入高回报 | S级 |
| ai_2 | 星梦工坊 | 暮色之约 | 稳健派 | 稳扎稳打，注重口碑 | A级 |
| ai_3 | 蜜桃游戏 | 甜心循环 | 氪金王 | 商业化激进，卡池频繁 | A级 |
| ai_4 | 银河游戏 | 星际恋人 | 搅局者 | 喜欢搞事件，蹭热度 | B级 |
| ai_5 | 樱花社 | 千秋恋歌 | 匠人 | 慢工出细活，更新慢但质量高 | B级 |
| ai_6 | 月光工作室 | 月下誓言 | 新人 | 资源少但成长快，学习型 | C级 |

### 5.3 数据模型

```ts
// types/competitor.ts

/** 竞品AI个性类型 */
export type AIPersonality = 
  | 'innovator'    // 开拓者：追求创新，愿意冒险
  | 'steady'       // 稳健派：注重长期口碑
  | 'monetizer'    // 氪金王：商业化激进
  | 'disruptor'    // 搅局者：喜欢制造事件
  | 'craftsman'    // 匠人：慢工出细活
  | 'learner';     // 学习者：观察并模仿成功者

/** 竞品AI决策权重配置 */
export interface AIDecisionWeights {
  revenue: number;        // 收入权重 (0-1)
  reputation: number;     // 口碑权重 (0-1)
  marketShare: number;    // 市场份额权重 (0-1)
  innovation: number;     // 创新权重 (0-1)
  playerSatisfaction: number; // 玩家满意度权重 (0-1)
}

/** 竞品AI公司 */
export interface CompetitorAI {
  id: string;
  name: string;           // 公司名
  ceo: string;            // CEO名字（拟人化）
  personality: AIPersonality;
  avatar: string;         // 公司logo emoji
  
  // 决策系统
  decisionWeights: AIDecisionWeights;
  riskTolerance: number;  // 风险承受能力 0-1
  adaptability: number;   // 适应能力 0-1（影响对市场变化的反应速度）
  
  // 旗下游戏
  games: CompetitorGame[];
  
  // 公司状态
  treasury: number;       // 资金储备
  reputation: number;     // 公司声誉 0-100
  totalRevenue: number;   // 累计总收入
  foundedDay: number;     // 成立日（游戏天数）
  
  // AI状态机
  currentStrategy: AIStrategy;
  strategyHistory: AIStrategyRecord[];
  
  // 与玩家的关系
  relationToPlayer: 'neutral' | 'friendly' | 'hostile' | 'fearful';
  playerAwareness: number; // 对玩家实力的感知 0-100
}

/** 竞品游戏（扩展版） */
export interface CompetitorGame {
  id: string;
  companyId: string;
  name: string;
  genre: string;
  subGenre: string;
  
  // 核心指标
  rating: number;           // 评分 1-10
  dau: number;              // 日活
  mau: number;              // 月活
  revenue: number;          // 月收入
  totalRevenue: number;     // 累计收入
  marketShare: number;      // 市场份额 0-1
  
  // 游戏状态
  state: GameState;
  version: string;          // 当前版本
  daysSinceLastUpdate: number;
  
  // 运营数据
  gachaPoolCount: number;   // 当前卡池数
  eventActive: boolean;     // 是否有活动
  lastGachaDate: number;    // 最近一次卡池日期
  lastEventDate: number;    // 最近一次活动日期
  
  // 角色数据
  characters: CompetitorCharacter[];
  
  // 趋势
  trend: 'rising' | 'stable' | 'declining' | 'crashing';
  trendStrength: number;    // 趋势强度 0-1
}

export type GameState = 
  | 'pre_launch'    // 预上线
  | 'launched'      // 刚上线（30天内）
  | 'operating'     // 稳定运营
  | 'peak'          // 巅峰期
  | 'declining'     // 下滑期
  | 'revival'       // 回春期
  | 'sunset';       // 日落期

/** 竞品角色 */
export interface CompetitorCharacter {
  id: string;
  gameId: string;
  name: string;
  popularity: number;      // 人气 0-100
  archetype: string;       // 角色类型（傲娇/温柔/腹黑...）
  releaseDate: number;
}

/** AI策略 */
export interface AIStrategy {
  type: AIStrategyType;
  startDay: number;
  targetMetric: string;
  actions: AIAction[];
}

export type AIStrategyType = 
  | 'aggressive_growth'    // 激进增长（大量投入抢市场）
  | 'quality_focus'        // 品质优先（慢更新但高质量）
  | 'monetization_push'    // 变现冲刺（密集卡池/付费活动）
  | 'player_retention'     // 留存优先（福利/活动吸引回流）
  | 'market_defense'       // 市场防御（应对竞品攻势）
  | 'event_hijack'         // 事件劫持（蹭热度/搞事件）
  | 'new_game_launch'      // 新游上线
  | 'cost_cutting'         // 缩减开支（资金不足时）
  | 'copycat';             // 模仿策略（学习成功者）

/** AI行动 */
export interface AIAction {
  id: string;
  type: AIActionType;
  day: number;              // 执行日
  params: Record<string, any>;
  result?: AIActionResult;
}

export type AIActionType = 
  | 'launch_gacha'         // 开卡池
  | 'start_event'          // 开活动
  | 'release_update'       // 发版本更新
  | 'new_character'        // 推出新角色
  | 'welfare_distribution' // 发福利
  | 'price_war'            // 价格战（打折）
  | 'marketing_campaign'   // 营销推广
  | 'collaboration'        // 联动合作
  | 'scandal_response'     // 丑闻应对
  | 'launch_new_game';     // 上线新游戏

/** AI行动结果 */
export interface AIActionResult {
  success: boolean;
  revenueImpact: number;
  dauImpact: number;
  reputationImpact: number;
  playerReaction: string;  // 生成的玩家反应文案
}
```

### 5.4 AI决策引擎

```ts
// engine/competitorAIEngine.ts

export class CompetitorAIEngine {
  
  /**
   * 每日AI决策
   * 每个竞品公司独立决策，互不影响
   */
  dailyDecision(
    competitor: CompetitorAI,
    marketState: MarketState,
    playerState: PlayerCompanyState
  ): AIAction[] {
    const actions: AIAction[] = []
    
    // 1. 感知环境
    const perception = this.perceiveEnvironment(competitor, marketState, playerState)
    
    // 2. 评估当前策略是否需要调整
    if (this.shouldChangeStrategy(competitor, perception)) {
      competitor.currentStrategy = this.chooseNewStrategy(competitor, perception)
    }
    
    // 3. 根据策略和个性生成行动
    const candidates = this.generateActionCandidates(competitor, perception)
    
    // 4. 根据决策权重评分并选择
    const scored = this.scoreActions(competitor, candidates, perception)
    const selected = this.selectActions(scored, competitor.riskTolerance)
    
    // 5. 添加个性化随机事件
    const personalityActions = this.personalityDrivenActions(competitor, perception)
    
    return [...selected, ...personalityActions]
  }
  
  /**
   * 环境感知
   */
  private perceiveEnvironment(
    competitor: CompetitorAI,
    market: MarketState,
    player: PlayerCompanyState
  ): Perception {
    return {
      // 市场热度
      hotGenres: market.trendingGenres,
      seasonBonus: market.seasonEffect,
      
      // 竞争态势
      playerThreatLevel: this.assessPlayerThreat(competitor, player),
      competitorPositions: market.competitorRankings,
      marketSaturation: market.saturation,
      
      // 自身状态评估
      financialHealth: competitor.treasury / (competitor.totalRevenue * 0.1 + 10000),
      gamesHealth: competitor.games.map(g => ({
        gameId: g.id,
        health: this.assessGameHealth(g),
        urgency: this.assessUrgency(g)
      })),
      
      // 机会窗口
      opportunities: this.detectOpportunities(competitor, market, player),
    }
  }
  
  /**
   * 个性化行为（每种AI人格有独特的行为模式）
   */
  private personalityDrivenActions(
    competitor: CompetitorAI, 
    perception: Perception
  ): AIAction[] {
    switch (competitor.personality) {
      case 'innovator':
        // 10%概率做一个"创新"行动（新题材、新玩法）
        if (Math.random() < 0.1) {
          return [this.createInnovativeAction(competitor)]
        }
        break
        
      case 'monetizer':
        // 资金低于阈值时立刻开卡池
        if (competitor.treasury < 50000) {
          return [this.createUrgentGacha(competitor)]
        }
        break
        
      case 'disruptor':
        // 15%概率制造争议事件（蹭热度）
        if (Math.random() < 0.15) {
          return [this.createControversialAction(competitor)]
        }
        break
        
      case 'learner':
        // 观察排名第一的公司并模仿
        const topCompany = perception.competitorPositions[0]
        if (topCompany && topCompany.recentAction) {
          return [this.createCopycatAction(competitor, topCompany)]
        }
        break
        
      case 'craftsman':
        // 版本更新间隔必须>30天
        // 但更新一次质量很高
        break
        
      case 'steady':
        // 维持均衡，不做极端操作
        break
    }
    return []
  }
}
```

### 5.5 AI策略状态机

```
                    ┌──────────────┐
                    │  初始化/评估  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌────────────┐ ┌───────────┐ ┌──────────┐
     │ 激进增长   │ │ 品质优先  │ │ 变现冲刺 │
     │            │ │           │ │          │
     │ 条件:      │ │ 条件:     │ │ 条件:    │
     │ 市场有机会 │ │ 口碑<70   │ │ 资金紧张 │
     │ 资金充足   │ │ 评分下降  │ │ 需要收入 │
     └─────┬──────┘ └─────┬─────┘ └─────┬────┘
           │              │             │
           │    ┌─────────┼─────────┐   │
           ▼    ▼         ▼         ▼   ▼
     ┌───────────┐  ┌──────────┐  ┌──────────┐
     │ 留存优先  │  │ 市场防御 │  │ 事件劫持 │
     │           │  │          │  │          │
     │ 条件:     │  │ 条件:    │  │ 条件:    │
     │ DAU下降   │  │ 被超越   │  │ 有热点   │
     │ 流失加重  │  │ 份额被抢 │  │ 可蹭热度 │
     └───────────┘  └──────────┘  └──────────┘
           │              │             │
           └──────────────┼─────────────┘
                          ▼
                  ┌───────────────┐
                  │   重新评估    │
                  │  (每30天一次) │
                  └───────────────┘
```

### 5.6 竞品事件系统

竞品AI会产生各种事件，以新闻/动态形式推送给玩家：

```ts
/** 竞品动态消息 */
export interface CompetitorNews {
  id: string;
  companyId: string;
  companyName: string;
  companyAvatar: string;
  type: CompetitorNewsType;
  title: string;
  content: string;
  day: number;
  impact: NewsImpact;
  isRead: boolean;
  
  // 玩家可选的应对行动
  playerOptions?: PlayerResponseOption[];
}

export type CompetitorNewsType =
  | 'new_game'           // 新游上线
  | 'major_update'       // 大版本更新
  | 'gacha_event'        // 卡池活动
  | 'scandal'            // 丑闻/争议
  | 'collaboration'      // 联动合作
  | 'price_war'          // 价格战
  | 'award'              // 获奖
  | 'financial'          // 财务消息（裁员/融资）
  | 'player_migration'   // 玩家迁移
  | 'market_shift';      // 市场变化

/** 新闻对玩家的影响 */
export interface NewsImpact {
  playerDAU: number;          // 对玩家DAU的影响
  playerNewUsers: number;     // 对新用户获取的影响
  marketSentiment: number;    // 市场情绪影响
  description: string;
}

/** 玩家应对选项 */
export interface PlayerResponseOption {
  id: string;
  action: string;            // 行动描述
  cost: number;              // 成本
  successRate: number;        // 成功率
  reward: string;            // 成功效果描述
  risk: string;              // 失败风险描述
}
```

**事件示例模板：**

```ts
const NEWS_TEMPLATES: Record<CompetitorNewsType, NewsTemplate[]> = {
  new_game: [
    {
      title: '{company}新作《{game}》正式上线！',
      content: '{company}旗下全新乙女游戏《{game}》今日正式上线，首日下载量突破{downloads}万。{genre}题材配合{style}美术风格，引发玩家热议。',
      impactRange: { playerDAU: [-5, -15], playerNewUsers: [-10, -30] },
      playerOptions: [
        { action: '紧急推出限时活动应对', cost: 50000, successRate: 0.7, reward: '成功留住大部分玩家', risk: '活动仓促质量不高' },
        { action: '冷静观察不做反应', cost: 0, successRate: 0.5, reward: '节省资源等待时机', risk: '可能流失部分玩家' },
        { action: '发放大量福利留住玩家', cost: 30000, successRate: 0.8, reward: '玩家满意度上升', risk: '养成免费玩家习惯' }
      ]
    }
  ],
  scandal: [
    {
      title: '{company}爆出{scandal_type}争议！',
      content: '{company}旗下《{game}》被玩家曝出{scandal_detail}，社交媒体上#抵制{game}#话题热度飙升。',
      impactRange: { playerDAU: [5, 15], playerNewUsers: [10, 30] }, // 竞品丑闻对玩家有利
      playerOptions: [
        { action: '趁机推出优惠活动吸引流失玩家', cost: 20000, successRate: 0.8, reward: '吸引大量新玩家', risk: '可能被认为趁火打劫' },
        { action: '保持沉默', cost: 0, successRate: 1.0, reward: '自然获得一些流入', risk: '无' }
      ]
    }
  ],
  // ... 更多模板
}
```

### 5.7 UI设计：竞品情报中心

替换现有的 `MarketDashboard`，新建 `CompetitorIntelView.vue`：

```
┌─────────────────────────────────┐
│  📊 市场情报中心                │
│                                 │
│  ┌──────────────────────────┐   │
│  │   畅销榜 TOP 10          │   │
│  │   1. 🏆 恋与星海  ¥850万 │   │
│  │   2. ▲ 暮色之约  ¥720万  │   │
│  │   3. ● 甜心循环  ¥680万  │   │
│  │   4. ▼ ⭐我的游戏 ¥550万  │   │
│  │   ...                    │   │
│  └──────────────────────────┘   │
│                                 │
│  ┌──────────────────────────┐   │
│  │  🔔 最新动态 (3条未读)    │   │
│  │                          │   │
│  │  ⚡ 叠纸互娱推出新卡池    │   │
│  │  「星海之约」限定角色UP    │   │
│  │  📅 今天 | 影响: DAU-5%   │   │
│  │  [应对 →]                │   │
│  │                          │   │
│  │  💥 蜜桃游戏爆率争议      │   │
│  │  玩家晒图证实隐藏概率...  │   │
│  │  📅 昨天 | 机会: 新用户+  │   │
│  │  [查看详情 →]            │   │
│  └──────────────────────────┘   │
│                                 │
│  ┌──────────────────────────┐   │
│  │  🏢 竞品公司档案          │   │
│  │                          │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐│   │
│  │  │叠纸 │ │星梦 │ │蜜桃 ││   │
│  │  │互娱 │ │工坊 │ │游戏 ││   │
│  │  │ S级 │ │ A级 │ │ A级 ││   │
│  │  └─────┘ └─────┘ └─────┘│   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐│   │
│  │  │银河 │ │樱花 │ │月光 ││   │
│  │  │游戏 │ │社  │ │工作室││   │
│  │  │ B级 │ │ B级 │ │ C级 ││   │
│  │  └─────┘ └─────┘ └─────┘│   │
│  └──────────────────────────┘   │
│                                 │
│  点击公司进入详情页面:           │
│  - 公司基础信息                 │
│  - 旗下游戏列表                 │
│  - 运营策略分析                 │
│  - 历史动态时间线               │
│  - 与我的对比雷达图             │
└─────────────────────────────────┘
```

**竞品公司详情页：**

```
┌─────────────────────────────────┐
│  ← 叠纸互娱                    │
│                                 │
│  ┌──────────────────────────┐   │
│  │  CEO: 林未来              │   │
│  │  人格: 🚀 开拓者          │   │
│  │  声誉: ⭐⭐⭐⭐☆ (82分)    │   │
│  │  资金: ¥2,350万           │   │
│  │  策略: 激进增长 📈         │   │
│  │  对我态度: 中立 😐         │   │
│  └──────────────────────────┘   │
│                                 │
│  旗下游戏                       │
│  ┌──────────────────────────┐   │
│  │  恋与星海                 │   │
│  │  评分: 8.7 | DAU: 12万   │   │
│  │  月收入: ¥850万           │   │
│  │  状态: 巅峰期 🔥          │   │
│  │  趋势: 上升 ▲             │   │
│  └──────────────────────────┘   │
│                                 │
│  对比雷达图                     │
│  ┌──────────────────────────┐   │
│  │      收入                 │   │
│  │       ▲                   │   │
│  │      / \   ── 叠纸互娱    │   │
│  │  口碑/   \DAU ── 我的游戏  │   │
│  │    /     \                │   │
│  │  创新 ─── 满意度           │   │
│  └──────────────────────────┘   │
│                                 │
│  最近动态                       │
│  📅 Day 45: 推出新角色「星辰」  │
│  📅 Day 42: 启动周年庆活动      │
│  📅 Day 38: 版本2.0大更新       │
│  📅 Day 30: 与知名IP联动        │
└─────────────────────────────────┘
```

### 5.8 与现有系统的集成

```
竞品AI系统集成点:

simulationStore.dailyTick()
  └── competitorAIStore.onDailyTick()
        ├── 每个AI执行决策
        ├── 生成竞品新闻/事件
        ├── 计算对玩家的影响
        └── 更新排行榜

operationStore
  └── 竞品动态影响玩家DAU/新用户/收入

commentStore
  └── 竞品事件触发特殊评论（"隔壁xxx好像凉了"）

leaderboardStore
  └── 替换现有的随机数竞品数据，使用AI生成的真实数据
```

### 5.9 文件结构

```
src/
├── types/
│   └── competitor.ts              // 竞品AI类型定义
├── engine/
│   ├── competitorAIEngine.ts      // AI决策引擎（替换旧competitorEngine.ts）
│   └── simulation/
│       └── competitorSystem.ts    // 保留但重构，使用新AI引擎
├── stores/
│   └── competitorAIStore.ts       // 竞品AI状态管理
├── data/
│   └── templates/
│       ├── competitors/
│       │   ├── index.ts           // 6个AI公司初始化数据
│       │   └── newsTemplates.ts   // 新闻模板库
│       └── competitorActions/
│           └── index.ts           // AI行动模板
├── components/
│   └── competitor/
│       ├── CompetitorRankingCard.vue    // 排行榜卡片
│       ├── CompetitorNewsItem.vue       // 新闻条目
│       ├── CompetitorProfileCard.vue    // 公司档案卡
│       ├── CompetitorRadarChart.vue     // 对比雷达图
│       └── PlayerResponseDialog.vue     // 应对选择弹窗
└── views/
    └── competitor/
        ├── CompetitorIntelView.vue      // 市场情报中心主页
        └── CompetitorDetailView.vue     // 竞品详情页
```

### 5.10 执行步骤

```
Phase 1: 类型定义与数据
  ├── Step 1: 创建 types/competitor.ts
  ├── Step 2: 创建 data/templates/competitors/index.ts (6个AI角色)
  └── Step 3: 创建 data/templates/competitors/newsTemplates.ts

Phase 2: AI引擎
  ├── Step 4: 创建 engine/competitorAIEngine.ts (决策核心)
  ├── Step 5: 实现环境感知模块
  ├── Step 6: 实现策略状态机
  └── Step 7: 实现个性化行为

Phase 3: Store
  ├── Step 8: 创建 stores/competitorAIStore.ts
  ├── Step 9: 实现 onDailyTick() 调度
  └── Step 10: 集成到 simulationStore.dailyTick()

Phase 4: UI
  ├── Step 11: 创建排行榜、新闻、档案组件
  ├── Step 12: 创建 CompetitorIntelView.vue
  ├── Step 13: 创建 CompetitorDetailView.vue
  ├── Step 14: 添加路由
  └── Step 15: 替换 OperationView 中的市场情报Tab

Phase 5: 联动
  ├── Step 16: 竞品事件影响 commentStore（生成相关评论）
  ├── Step 17: 竞品事件影响玩家DAU/收入
  └── Step 18: 替换 leaderboardStore 的随机数据
```

---

## 6. 测试策略

### 6.1 OperationView 拆分后的测试

**原则：** 每拆出一个组件，立即验证。

```
Level 1: 编译检查
  - 每完成一个组件，运行 npm run build
  - 确认无 TypeScript 类型错误

Level 2: 功能对照测试 (手动)
  准备一份操作检查表：
  
  □ 卡池管理
    □ 角色人气排行显示正确
    □ 创建卡池弹窗正常弹出/关闭
    □ 填写表单 → 创建成功 → 列表更新
    □ 效果预测面板能正常展示
    □ 抽卡模拟器弹窗正常
  
  □ 活动中心
    □ 活动列表展示正确
    □ 从模板创建活动正常
    □ 手动创建活动正常
  
  □ 运营事件
    □ 舆论热度仪表盘数据正确
    □ IncidentHandler 正常工作
  
  □ 玩家数据
    □ 生命周期统计数字正确
    □ 趋势图Canvas正常绘制
    □ 自动结算开关正常
    □ 手动结算正常
    □ 模拟预测数据显示正确
  
  □ 福利发放
    □ 全服补偿发放正常
    □ 兑换码生成正常
  
  □ 社区Tab（告白墙/同人/市场）保持不变
  
  □ 效果追踪
    □ 追踪列表展示正确
    □ 准确率计算正确
  
  □ 跨Tab功能
    □ 危机警报弹出正常
    □ URL参数解析正常（从其他页面跳转带参数）
    □ 模拟一天按钮影响所有Tab数据

Level 3: 数据一致性验证
  - 在 DevTools 中对比拆分前后 Store 数据结构
  - 验证 localStorage 读写兼容
```

### 6.2 角色创建优化的测试

```
Level 1: 创建流程完整性
  □ 自定义创建（5步）
    □ Step1: 选择外貌+服装+美术+生日 → 下一步
    □ Step2: 选择性格+调属性+选弧线 → 下一步
    □ Step3: 填写背景+关系+秘密 → 下一步
    □ Step4: 选择声优 → 下一步
    □ Step5: AI预览 → 确认创建
    □ 创建成功 → gameStore 中有新角色

  □ 快速创建
    □ 选择模板 → 修改名字 → 确认
    □ 创建成功 → 模板数据正确写入

  □ 草稿功能
    □ 在Step2退出 → 重新进入 → 提示恢复草稿
    □ 恢复后 → Step和数据一致
    □ 超过7天的草稿 → 自动清理

Level 2: 数据对比
  - 旧12步创建的角色 vs 新5步创建的角色
  - gameStore 中保存的字段完全一致
  - 已有角色的数据不受影响
```

### 6.3 Store 合并的测试

```
Level 1: 数据迁移
  □ 旧 fanCreationStore localStorage 数据 → 新 fanworkStore 能正确读取
  □ 旧 fanworkStore localStorage 数据 → 新 fanworkStore 能正确读取
  □ 两个旧Store的数据合并后无重复

Level 2: API 兼容
  □ createFanwork() 保留积分消耗逻辑
  □ toggleLike() 对两种来源的作品都有效
  □ toggleCollect() 正常工作
  □ getFanworksByCharacter() 返回所有来源的作品
  □ syncFromSimulation() 正常同步

Level 3: UI 验证
  □ FanCreationSquare 展示所有作品（用户+模拟+引擎生成）
  □ FanCreationModal 创建作品 → 列表立即更新
  □ 筛选功能正常（按类型）
  □ 热度排序正确
```

### 6.4 simulationStore 瘦身的测试

```
Level 1: dailyTick 等价性
  - 重构前后分别运行10次dailyTick
  - 对比关键指标: DAU、收入、满意度、留存率
  - 允许5%以内的随机偏差

Level 2: 子Store独立性
  □ projectOperationStore.onDailyTick() 单独调用 → 数据正确
  □ commentStore.onDailyTick() 单独调用 → 评论生成正确
  □ analyticsStore.recalculate() → 聚合数据正确

Level 3: 无遗留引用
  - 全局搜索 simulationStore.recentComments → 0 results
  - 全局搜索 simulationStore.recentConfessions → 0 results
  - 全局搜索 simulationStore.recentFanworks → 0 results
```

### 6.5 竞品AI系统的测试

```
Level 1: AI决策逻辑
  □ 每种AI人格执行100天模拟 → 行为符合人格设定
  □ innovator: 创新行动概率 > 其他人格
  □ monetizer: 卡池频率 > 其他人格
  □ craftsman: 更新间隔 > 其他人格
  □ learner: 会模仿排名第一的策略

Level 2: 事件系统
  □ 竞品上线新游 → 玩家收到新闻 → DAU受影响
  □ 竞品爆出丑闻 → 玩家获得机会 → 可选应对行动
  □ 价格战 → 影响全市场

Level 3: 平衡性
  □ 长期运行(365天) → 没有AI一直垄断市场
  □ 玩家有合理的追赶机会
  □ AI不会所有人同时做一样的事
```

---

## 附录：优先级排序

| 优先级 | 任务 | 预估工时 | 风险 |
|--------|------|---------|------|
| P0 | OperationView 拆分 | 3-4天 | 低（纯重构不改逻辑） |
| P0 | fanCreation/fanwork 合并 | 1-2天 | 低 |
| P1 | 角色创建优化 | 2-3天 | 中（UI需重新设计） |
| P1 | simulationStore 瘦身 | 3-4天 | 高（核心逻辑改动） |
| P2 | 竞品AI系统 | 5-7天 | 中（新系统，需调平衡） |

**建议执行顺序：** P0先做（基础重构） → P1（核心改善） → P2（新功能）

总预估工时：**14-20天**
