# 游戏功能优化与联动设计 Spec

## Why

根据游玩路径分析，当前游戏存在以下核心问题：
1. **联动追踪(LinkageTracker)** - 纯展示无交互，与运营操作完全脱节
2. **玩家社区分析(AdminView)** - 有数据无行动，无法根据分析结果采取召回措施
3. **剧情树编辑器(PlotTreeEditor)** - 入口过深，与PlotDesigner功能重复
4. **创作者技能系统(CreatorProfile)** - 投入产出比失衡，与核心玩法割裂
5. **功能之间缺乏联动** - 各模块数据独立，未形成有机整体

需要将这些孤立功能与核心玩法深度整合，建立真实的数据联动和反馈闭环。

## What Changes

### 核心优化方向
- **联动追踪整合**: 将LinkageTracker从孤立展示改为运营效果预测工具
- **玩家分析 actionable**: 让AdminView的数据能直接驱动运营决策
- **剧情编辑器整合**: 合并PlotDesigner和PlotTreeEditor，明确分工
- **创作者技能强化**: 让技能升级显著影响游戏开发质量
- **建立数据闭环**: 运营数据 → 影响计算 → 反馈到项目/角色/剧情

### 功能联动矩阵

| 功能A | 功能B | 联动方式 |
|-------|-------|---------|
| AdminView(玩家分析) | OperationView(运营) | 一键召回流失玩家、针对付费玩家创建活动 |
| LinkageTracker(联动追踪) | OperationView(运营) | 运营操作前显示效果预测、操作后显示实际影响 |
| PlotTreeEditor(剧情树) | PlotDesigner(剧情设计) | 简单剧情用模板，复杂剧情用树编辑器 |
| CreatorProfile(创作者) | CharacterCreator(角色创建) | 技能等级影响AI生成质量和角色初始属性 |
| CharacterDetail(角色详情) | OperationView(运营) | 角色人气直接影响卡池收益 |

## Impact

- **Affected specs**: gameplay-loop-redesign, ui-data-integration, data-linkage-improvement
- **Affected code**:
  - `src/views/operation/LinkageTrackerView.vue` - 重构为效果预测工具
  - `src/views/AdminView.vue` - 添加actionable功能
  - `src/views/creator/PlotDesigner.vue` - 整合剧情树编辑器入口
  - `src/views/creator/PlotTreeEditor.vue` - 优化入口和交互
  - `src/views/ProfileView.vue` - 强化创作者技能影响
  - `src/stores/creatorGrowth.ts` - 技能效果与游戏机制联动
  - `src/stores/operationStore.ts` - 运营效果与角色人气联动
  - `src/stores/commentStore.ts` - 评论与玩家状态联动

## ADDED Requirements

### Requirement 1: 联动追踪整合到运营流程

系统 SHALL 将LinkageTracker从孤立展示改为运营效果预测工具：

#### 当前问题
- LinkageTrackerView仅展示模拟数据，无法交互
- 与OperationView中的实际操作完全脱节
- 玩家不知道这个功能的用途

#### 优化方案
```
OperationView 运营操作前 → 显示效果预测面板 → 玩家确认 → 执行操作 → 显示实际影响
                              ↑
                         LinkageTracker整合到这里
```

#### Scenario: 创建卡池前查看效果预测
- **WHEN** 玩家在OperationView点击"创建卡池"
- **THEN** 弹出效果预测面板（整合LinkageTracker的因果关系图）
- **THEN** 显示预测影响：
  - "预计3天内玩家满意度变化: -5%"
  - "预计1周内收入变化: +20%"
  - "可能触发的连锁反应: 社交广场讨论增加"
- **THEN** 玩家可以调整参数实时看到预测变化
- **THEN** 玩家确认后创建卡池
- **THEN** 创建后显示"效果追踪"面板，对比预测与实际

#### Scenario: 运营操作后的效果追踪
- **WHEN** 玩家执行运营操作（创建活动/调整爆率/发放福利）
- **THEN** 在OperationView显示"效果追踪"标签页
- **THEN** 展示即时效果和延迟效果队列
- **THEN** 用图表对比预测vs实际数据
- **THEN** 显示因果关系链的可视化

#### 技术实现
```typescript
// operationStore.ts 新增
interface OperationPrediction {
  decision: OperationDecision;
  predictedEffects: {
    immediate: Effect[];
    shortTerm: Effect[]; // 1-3天
    longTerm: Effect[];  // 1周+
  };
  confidence: number; // 预测置信度
}

// 创建操作前生成预测
function generatePrediction(decision: OperationDecision): OperationPrediction {
  // 使用linkageEngine计算预测效果
  const effects = linkageEngine.calculateEffects(decision);
  return {
    decision,
    predictedEffects: categorizeEffects(effects),
    confidence: calculateConfidence(effects)
  };
}

// 执行操作后追踪实际效果
function trackActualEffects(operationId: string) {
  // 对比预测与实际
  // 更新效果追踪面板
}
```

---

### Requirement 2: 玩家社区分析 actionable 化

系统 SHALL 让AdminView的数据能直接驱动运营决策：

#### 当前问题
- AdminView仅展示玩家分群数据（新手/活跃/付费/流失/回流）
- 能看到玩家流失，但无法直接采取召回措施
- 数据分析与运营操作完全脱节

#### 优化方案
```
AdminView 玩家分析 → 识别问题 → 一键操作 → 跳转到OperationView并预填充
```

#### Scenario: 一键召回流失玩家
- **WHEN** AdminView显示"流失玩家: 150人"
- **THEN** 显示"召回建议: 发送回归福利"
- **THEN** 玩家点击"一键召回"
- **THEN** 自动跳转到OperationView的福利发放
- **THEN** 预填充"回归福利"模板（钻石x100、限定卡池券x5）
- **THEN** 显示预计召回率: 30%（45人）
- **THEN** 玩家确认后发送

#### Scenario: 针对付费玩家创建专属活动
- **WHEN** AdminView显示"付费玩家: 80人"
- **THEN** 显示"建议: 创建付费玩家专属活动"
- **THEN** 玩家点击"创建活动"
- **THEN** 自动跳转到OperationView的活动中心
- **THEN** 预填充"付费玩家专属"活动模板
- **THEN** 显示预计参与率: 60%（48人）

#### Scenario: 识别高风险玩家并预警
- **WHEN** AdminView检测到"有风险玩家增加"
- **THEN** 显示预警: "15名玩家可能即将流失"
- **THEN** 分析原因: "主要原因是最近卡池爆率过低"
- **THEN** 提供解决方案: "建议提高下期卡池爆率或发放补偿"
- **THEN** 玩家点击"立即处理"跳转到对应功能

#### 技术实现
```typescript
// AdminView 添加 actionable 按钮
interface PlayerSegmentAction {
  segment: PlayerState;
  count: number;
  suggestedAction: {
    type: 'welfare' | 'event' | 'gacha';
    title: string;
    description: string;
    template: Partial<OperationConfig>;
    predictedOutcome: {
      successRate: number;
      affectedPlayers: number;
    };
  };
}

// 生成建议操作
function generateSegmentActions(): PlayerSegmentAction[] {
  const actions: PlayerSegmentAction[] = [];
  
  // 流失玩家 → 召回福利
  if (lostPlayers.length > 0) {
    actions.push({
      segment: 'LOST',
      count: lostPlayers.length,
      suggestedAction: {
        type: 'welfare',
        title: '一键召回流失玩家',
        description: `发送回归福利给${lostPlayers.length}名流失玩家`,
        template: { type: 'return', diamonds: 100, tickets: 5 },
        predictedOutcome: { successRate: 0.3, affectedPlayers: Math.floor(lostPlayers.length * 0.3) }
      }
    });
  }
  
  // 付费玩家 → 专属活动
  if (payingPlayers.length > 0) {
    actions.push({
      segment: 'PAYING',
      count: payingPlayers.length,
      suggestedAction: {
        type: 'event',
        title: '创建付费玩家专属活动',
        description: '高价值奖励吸引付费玩家参与',
        template: { type: 'exclusive', rewards: ['SSR角色', '限定皮肤'] },
        predictedOutcome: { successRate: 0.6, affectedPlayers: Math.floor(payingPlayers.length * 0.6) }
      }
    });
  }
  
  return actions;
}

// 执行建议操作
function executeSuggestedAction(action: PlayerSegmentAction) {
  // 跳转到OperationView
  router.push({
    path: '/operation',
    query: { 
      action: action.suggestedAction.type,
      template: JSON.stringify(action.suggestedAction.template)
    }
  });
}
```

---

### Requirement 3: 剧情编辑器整合与优化

系统 SHALL 整合PlotDesigner和PlotTreeEditor，明确分工并优化入口：

#### 当前问题
- PlotTreeEditor功能完整但入口过深（/creator/plot/editor）
- PlotDesigner和PlotTreeEditor都编辑剧情，方式不同让玩家困惑
- 玩家不知道何时使用哪个编辑器

#### 优化方案
```
PlotDesigner（主入口）
├── 简单剧情 → 使用模板快速创建
└── 复杂剧情 → "高级编辑"按钮 → PlotTreeEditor
```

#### Scenario: 根据剧情复杂度自动推荐编辑器
- **WHEN** 玩家进入PlotDesigner创建剧情
- **THEN** 询问"剧情复杂度": 简单/中等/复杂
- **IF** 选择"简单" → 使用模板快速创建（3-5个节点）
- **IF** 选择"中等" → 使用向导式创建（5-10个节点）
- **IF** 选择"复杂" → 显示"建议使用高级编辑器"
- **THEN** 点击"高级编辑"打开PlotTreeEditor

#### Scenario: PlotTreeEditor优化入口
- **WHEN** 在PlotDesigner中点击"高级编辑"
- **THEN** 在新标签页打开PlotTreeEditor
- **THEN** 自动加载当前剧情数据
- **THEN** 编辑完成后可"保存并返回"到PlotDesigner
- **THEN** PlotDesigner显示"已使用高级编辑"标记

#### Scenario: 剧情复杂度奖励机制
- **WHEN** 玩家使用PlotTreeEditor创建复杂剧情（节点>10）
- **THEN** 剧情质量评分 +10%
- **THEN** 玩家完成率预测 +15%
- **THEN** 解锁"剧情大师"成就

#### 技术实现
```typescript
// PlotDesigner.vue 添加编辑器选择
const complexity = ref<'simple' | 'medium' | 'complex'>('simple');

function startPlotCreation() {
  switch (complexity.value) {
    case 'simple':
      // 使用模板快速创建
      useTemplateMode();
      break;
    case 'medium':
      // 使用向导式创建
      useWizardMode();
      break;
    case 'complex':
      // 打开PlotTreeEditor
      openPlotTreeEditor();
      break;
  }
}

function openPlotTreeEditor() {
  // 在新标签页打开
  const route = router.resolve({
    path: '/creator/plot/editor',
    query: { 
      projectId: currentProject.value.id,
      returnTo: '/creator/plot'
    }
  });
  window.open(route.href, '_blank');
}

// PlotTreeEditor.vue 添加返回按钮
function saveAndReturn() {
  savePlot();
  // 如果有returnTo参数，关闭窗口或跳转
  const returnTo = route.query.returnTo;
  if (returnTo) {
    window.close(); // 如果是新窗口打开
    // 或者: router.push(returnTo);
  }
}
```

---

### Requirement 4: 创作者技能系统与核心玩法联动

系统 SHALL 让创作者技能升级显著影响游戏开发质量：

#### 当前问题
- 技能升级消耗大量积分，但效果不明显
- 角色创建质量主要由AI决定，与创作者技能无关
- 玩家感受不到技能升级带来的变化

#### 优化方案
```
技能等级 → 影响游戏机制 → 玩家可感知
```

#### Scenario: 文案能力影响剧情质量
- **GIVEN** 创作者文案能力等级 Lv.3
- **WHEN** 创建剧情时
- **THEN** 剧情基础质量评分 +15%
- **THEN** AI补全的剧情更流畅自然
- **THEN** 玩家完成率预测 +10%

#### Scenario: 美术鉴赏影响角色立绘
- **GIVEN** 创作者美术鉴赏等级 Lv.5
- **WHEN** 使用AI生成角色立绘时
- **THEN** 生成质量提升（更好的构图/色彩）
- **THEN** 角色初始人气 +20%
- **THEN** 玩家第一眼好感度 +15%

#### Scenario: 项目管理影响团队效率
- **GIVEN** 创作者项目管理等级 Lv.4
- **WHEN** 分配团队到项目时
- **THEN** 团队整体效率 +20%
- **THEN** 开发进度每日增加 +2%
- **THEN** 员工疲劳度增长 -10%

#### Scenario: 数据分析影响运营决策
- **GIVEN** 创作者数据分析等级 Lv.3
- **WHEN** 在LinkageTracker查看效果预测时
- **THEN** 预测准确度 +15%
- **THEN** 显示更多数据维度
- **THEN** 解锁"深度分析"功能

#### 技术实现
```typescript
// creatorGrowth.ts 技能效果定义
const SKILL_EFFECTS = {
  copywriting: {
    // 文案能力
    plotQualityBonus: (level: number) => level * 0.05, // 每级+5%
    aiQualityBonus: (level: number) => level * 0.03,
    completionRateBonus: (level: number) => level * 0.02
  },
  artAppreciation: {
    // 美术鉴赏
    characterPopularityBonus: (level: number) => level * 0.04,
    firstImpressionBonus: (level: number) => level * 0.03
  },
  projectManagement: {
    // 项目管理
    teamEfficiencyBonus: (level: number) => level * 0.05,
    progressBonus: (level: number) => level * 0.005, // 每日额外进度
    fatigueReduction: (level: number) => level * 0.02
  },
  dataAnalysis: {
    // 数据分析
    predictionAccuracy: (level: number) => level * 0.05,
    unlockDeepAnalysis: (level: number) => level >= 3
  }
};

// 在角色创建时应用技能加成
function createCharacterWithSkillBonus(baseCharacter: Character) {
  const creatorStore = useCreatorGrowthStore();
  
  // 应用美术鉴赏加成
  const artLevel = creatorStore.getSkillLevel('artAppreciation');
  baseCharacter.popularity.base *= (1 + SKILL_EFFECTS.artAppreciation.characterPopularityBonus(artLevel));
  
  return baseCharacter;
}

// 在剧情创建时应用技能加成
function createPlotWithSkillBonus(basePlot: Plot) {
  const creatorStore = useCreatorGrowthStore();
  
  // 应用文案能力加成
  const copyLevel = creatorStore.getSkillLevel('copywriting');
  basePlot.quality *= (1 + SKILL_EFFECTS.copywriting.plotQualityBonus(copyLevel));
  
  return basePlot;
}
```

---

### Requirement 5: 评论系统与玩家状态深度联动

系统 SHALL 建立评论生成与玩家状态的实时联动：

#### 当前问题
- 评论生成与玩家状态变化脱节
- 玩家流失/回归时没有对应的评论反馈
- 评论内容不能反映真实的玩家情绪

#### 优化方案
```
玩家状态变化 → 触发评论生成 → 影响舆论热度 → 驱动运营决策
```

#### Scenario: 玩家流失触发退坑评论
- **WHEN** 玩家状态从ACTIVE变为LOST
- **THEN** 自动生成1-3条退坑评论
- **THEN** 评论情感为negative
- **THEN** 评论内容反映流失原因（爆率/剧情/运营）
- **THEN** 评论平台分布：微博40%、抖音35%、贴吧25%

#### Scenario: 玩家回归触发真香评论
- **WHEN** 玩家状态从LOST变为RETURNED
- **THEN** 自动生成1-2条真香评论
- **THEN** 评论情感为positive
- **THEN** 评论内容如"还是舍不得老公们，我回来了"
- **THEN** 触发后其他玩家回归概率+5%

#### Scenario: 付费玩家生成安利评论
- **WHEN** 玩家状态变为PAYING
- **THEN** 30%概率生成安利评论
- **THEN** 评论内容推荐游戏给其他人
- **THEN** 增加游戏口碑传播

#### 技术实现
```typescript
// playerStore.ts 状态变化时触发评论
function updatePlayerState(playerId: string, newState: PlayerState) {
  const oldState = players.value.find(p => p.id === playerId)?.state;
  
  // 状态变化时生成对应评论
  if (oldState === 'ACTIVE' && newState === 'LOST') {
    generateQuitComments(playerId);
  } else if (oldState === 'LOST' && newState === 'RETURNED') {
    generateReturnComments(playerId);
  } else if (newState === 'PAYING') {
    if (Math.random() < 0.3) {
      generateRecommendationComments(playerId);
    }
  }
  
  // 更新状态
  updatePlayer(playerId, { state: newState });
}

// commentStore.ts 生成特定类型评论
function generateQuitComments(playerId: string) {
  const templates = [
    '这游戏不值得，退坑了',
    '爆率太毒了，再见',
    '剧情太虐，承受不住',
    '运营太抠，玩不下去了'
  ];
  
  const count = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    addComment({
      content: templates[Math.floor(Math.random() * templates.length)],
      sentiment: 'negative',
      platform: getRandomPlatform(),
      playerId,
      type: 'quit'
    });
  }
}

function generateReturnComments(playerId: string) {
  const templates = [
    '还是舍不得老公们，我回来了',
    '听说最近有良心池，回来看看',
    '被朋友安利了新剧情，真香',
    '离开后发现还是这个最好玩'
  ];
  
  addComment({
    content: templates[Math.floor(Math.random() * templates.length)],
    sentiment: 'positive',
    platform: getRandomPlatform(),
    playerId,
    type: 'return'
  });
}
```

---

### Requirement 6: 角色人气与卡池收益实时联动

系统 SHALL 建立角色人气与卡池收益的实时计算和展示：

#### 当前问题
- 角色人气数据存在但不影响卡池收益
- 玩家无法感知人气对收入的影响
- 缺乏人气驱动的运营策略

#### 优化方案
```
角色人气 → 影响卡池收益计算 → 实时展示 → 驱动UP角色选择
```

#### Scenario: 高人气角色UP卡池收益加成
- **GIVEN** 角色A人气值85（高人气）
- **WHEN** 创建角色A的UP卡池
- **THEN** 卡池基础收益 × 1.5（人气加成）
- **THEN** 抽卡玩家数量 +30%
- **THEN** 在OperationView显示"人气加成: +50%"

#### Scenario: 低人气角色UP卡池收益惩罚
- **GIVEN** 角色B人气值25（低人气）
- **WHEN** 创建角色B的UP卡池
- **THEN** 卡池基础收益 × 0.7（人气惩罚）
- **THEN** 抽卡玩家数量 -20%
- **THEN** 系统建议: "该角色人气较低，建议先通过活动提升人气"

#### Scenario: 卡池运营提升角色人气
- **WHEN** 角色UP卡池运营7天
- **THEN** 角色人气每日+2（曝光效应）
- **THEN** 如果卡池福利好，额外+3
- **THEN** 形成正向循环: 卡池→人气↑→下次卡池收益↑

#### Scenario: 实时人气排行榜驱动决策
- **WHEN** 玩家在OperationView查看"角色人气排行"
- **THEN** 显示Top10角色及人气值
- **THEN** 标记"建议UP"（人气高但未UP的角色）
- **THEN** 点击角色可直接创建UP卡池

#### 技术实现
```typescript
// operationStore.ts 卡池收益计算
function calculateGachaRevenue(poolId: string): number {
  const pool = gachaPools.value.find(p => p.id === poolId);
  if (!pool) return 0;
  
  const gameStore = useGameStore();
  let popularityMultiplier = 1.0;
  
  // 计算UP角色人气加成
  if (pool.upCharacters.length > 0) {
    const charId = pool.upCharacters[0];
    const popularity = gameStore.getCharacterPopularity(charId);
    
    // 人气值映射到收益倍数
    if (popularity >= 80) {
      popularityMultiplier = 1.5; // 高人气+50%
    } else if (popularity >= 60) {
      popularityMultiplier = 1.2; // 中人气+20%
    } else if (popularity >= 40) {
      popularityMultiplier = 1.0; // 正常
    } else if (popularity >= 20) {
      popularityMultiplier = 0.8; // 低人气-20%
    } else {
      popularityMultiplier = 0.7; // 很低-30%
    }
  }
  
  // 基础收益 × 人气加成 × 爆率加成 × 其他因素
  const baseRevenue = pool.playerCount * 100;
  const rateMultiplier = pool.ssrRate / 0.02; // 相对于2%标准爆率
  
  return Math.floor(baseRevenue * popularityMultiplier * rateMultiplier);
}

// 卡池运营提升角色人气
function updateCharacterPopularityFromGacha(poolId: string) {
  const pool = gachaPools.value.find(p => p.id === poolId);
  if (!pool) return;
  
  pool.upCharacters.forEach(charId => {
    // 每日曝光增加人气
    gameStore.increaseCharacterPopularity(charId, 2);
    
    // 如果卡池福利好，额外增加
    if (pool.bonusRewards && pool.bonusRewards.length > 0) {
      gameStore.increaseCharacterPopularity(charId, 3);
    }
  });
}
```

## MODIFIED Requirements

### Requirement: LinkageTrackerView 功能定位
**原需求**: 独立的运营联动追踪展示页面

**修改后**:
- 保留LinkageTrackerView作为独立页面（用于深度分析）
- 在OperationView整合简化版"效果预测"面板
- 两者数据互通，OperationView侧重预测，LinkageTrackerView侧重历史分析

### Requirement: AdminView 数据展示
**原需求**: 玩家社区分析数据展示

**修改后**:
- 保留数据展示功能
- 添加actionable按钮（一键召回、创建活动等）
- 添加问题诊断和解决方案建议
- 与OperationView打通，点击操作自动跳转并预填充

### Requirement: PlotTreeEditor 入口
**原需求**: 独立的剧情树编辑器页面

**修改后**:
- 保留独立页面
- 在PlotDesigner添加"高级编辑"入口
- 支持从PlotDesigner跳转并自动加载数据
- 编辑完成后可保存并返回

## REMOVED Requirements

无

## 技术实现要点

### 数据流设计
```
玩家操作 → Store更新 → 联动计算 → 效果预测 → 实际执行 → 反馈展示
                ↓
         其他模块更新 → 连锁反应
```

### 核心联动机制
1. **AdminView ↔ OperationView**: 通过router query参数传递操作模板
2. **LinkageTracker ↔ OperationView**: 共享linkageEngine，侧重不同
3. **PlotDesigner ↔ PlotTreeEditor**: 通过URL参数传递项目ID和返回路径
4. **CreatorProfile ↔ 游戏机制**: 通过SKILL_EFFECTS配置映射
5. **PlayerStore ↔ CommentStore**: 状态变化事件触发评论生成
6. **GameStore ↔ OperationStore**: 人气值实时影响收益计算

### 性能优化
- 效果预测使用缓存，相同参数不重复计算
- 人气更新使用防抖，避免频繁计算
- 评论生成使用队列，批量处理

## 验收标准

1. **LinkageTracker整合**: 在OperationView创建卡池/活动时显示效果预测面板
2. **AdminView actionable**: 能一键召回流失玩家，跳转到福利发放
3. **剧情编辑器整合**: 在PlotDesigner能一键打开PlotTreeEditor
4. **创作者技能联动**: 技能等级明显影响角色/剧情质量
5. **评论玩家联动**: 玩家流失/回归时自动生成对应评论
6. **人气收益联动**: 高人气角色UP卡池收益显著增加
