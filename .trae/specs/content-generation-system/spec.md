# 内容生成系统 Spec

## Why

当前游戏中的评论、告白墙、同人广场等内容系统存在以下问题：

1. **评论系统** - 初始就有大量评论，与游戏实际状态脱节，没有真实反映项目、角色、剧情的表现
2. **告白墙** - 初始就有告白内容，但玩家还没有真正运营任何项目，缺乏真实感
3. **同人广场** - 同样初始就有同人作品，没有与游戏内实际运营的项目建立关联

需要设计一个**基于游戏状态的内容生成系统**，让所有这些内容都与实际运营的项目、角色、剧情深度绑定，初始为空，随着游戏进行逐步生成。

## What Changes

### 核心设计理念

```
┌─────────────────────────────────────────────────────────────────┐
│                    内容生成系统架构                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  初始状态：所有内容系统为空                                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                         │
│  │ 评论: 0 │  │ 告白: 0 │  │ 同人: 0 │                         │
│  └─────────┘  └─────────┘  └─────────┘                         │
│                                                                 │
│  触发条件：项目上线后，每日模拟时生成内容                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 项目质量评分 → 内容生成概率                              │   │
│  │ 角色人气 → 角色相关内容权重                              │   │
│  │ 剧情表现 → 剧情讨论热度                                  │   │
│  │ 运营活动 → 活动相关讨论                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  内容关联：每条内容都与具体游戏元素绑定                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 评论 → 关联项目/角色/剧情/活动                           │   │
│  │ 告白 → 关联具体角色                                      │   │
│  │ 同人 → 关联角色CP/剧情场景/活动                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1. 评论系统重构

**现状问题**：
- 初始就有随机评论
- 评论内容与游戏状态无关
- 没有体现项目、角色、剧情的真实表现

**新设计**：
- **初始状态**：评论列表为空
- **生成触发**：项目上线后，每日模拟时根据项目表现生成
- **内容关联**：每条评论都关联具体的项目、角色、剧情或活动
- **情感计算**：基于项目质量、角色人气、剧情评分计算正面/负面比例

### 2. 告白墙系统重构

**现状问题**：
- 初始就有告白内容
- 告白对象与游戏内角色无关

**新设计**：
- **初始状态**：告白墙为空
- **生成触发**：
  - 项目上线后，角色获得一定人气后触发告白生成
  - 角色生日、特殊剧情节点增加告白概率
  - 角色CP热度高时生成CP向告白
- **内容关联**：每条告白都关联具体角色
- **热度计算**：基于角色人气、亲密度、剧情表现

### 3. 同人广场系统重构

**现状问题**：
- 初始就有同人作品
- 作品内容与游戏内实际元素无关

**新设计**：
- **初始状态**：同人广场为空
- **生成触发**：
  - 项目上线后，角色/剧情/CP获得一定热度后触发
  - 活动热度高时生成活动相关同人
  - 特定剧情节点（虐恋、甜宠）触发对应类型同人
- **内容分类**：
  - 同人文：基于剧情场景、角色互动
  - 同人图：基于角色形象、经典场景
  - 表情包：基于角色台词、剧情梗
- **热度计算**：基于原作热度、创作质量、社区反馈

### 4. 内容生成引擎

**核心算法**：

```typescript
// 内容生成概率计算
function calculateContentGenerationProbability(
  projectQuality: number,      // 项目质量 0-1
  characterPopularity: number, // 角色人气 0-100
  plotHeat: number,            // 剧情热度 0-100
  activityHeat: number,        // 活动热度 0-100
  daySinceLaunch: number       // 上线天数
): number {
  // 基础概率
  const baseProbability = 0.1;
  
  // 质量加成
  const qualityBonus = projectQuality * 0.3;
  
  // 热度加成
  const heatBonus = (characterPopularity + plotHeat + activityHeat) / 300 * 0.4;
  
  // 时间衰减（上线越久，生成概率越低，趋于稳定）
  const timeDecay = Math.max(0.3, 1 - daySinceLaunch / 365);
  
  return Math.min(0.8, (baseProbability + qualityBonus + heatBonus) * timeDecay);
}

// 内容情感分布计算
function calculateSentimentDistribution(
  projectQuality: number,
  playerSatisfaction: number,
  recentEvents: GameEvent[]
): SentimentDistribution {
  // 基础分布
  let positive = 0.4;
  let neutral = 0.3;
  let negative = 0.3;
  
  // 质量影响
  positive += projectQuality * 0.3;
  negative -= projectQuality * 0.2;
  
  // 满意度影响
  positive += playerSatisfaction * 0.2;
  negative -= playerSatisfaction * 0.15;
  
  // 近期事件影响
  recentEvents.forEach(event => {
    if (event.type === 'positive') positive += 0.1;
    if (event.type === 'negative') negative += 0.15;
  });
  
  // 归一化
  const total = positive + neutral + negative;
  return {
    positive: positive / total,
    neutral: neutral / total,
    negative: negative / total
  };
}
```

## Impact

### Affected Components
- `src/stores/commentStore.ts` - 评论生成逻辑重构
- `src/components/comments/CommentList.vue` - 空状态展示
- `src/components/comments/CommentGenerator.vue` - 基于项目生成
- `src/components/social/ConfessionWall.vue` - 告白生成逻辑
- `src/components/social/FanCreationSquare.vue` - 同人生成逻辑
- `src/stores/simulationStore.ts` - 内容生成触发

### NEW Files
- `src/engine/contentGenerationEngine.ts` - 内容生成引擎
- `src/data/templates/commentTemplates.ts` - 评论模板（按项目/角色/剧情分类）
- `src/data/templates/confessionTemplates.ts` - 告白模板（按角色分类）
- `src/data/templates/fanworkTemplates.ts` - 同人模板（按类型分类）

## ADDED Requirements

### Requirement 1: 评论系统初始为空

**Scenario: 游戏初始状态**
- **GIVEN** 玩家刚开始游戏，还没有上线任何项目
- **WHEN** 进入评论页面
- **THEN** 评论列表显示为空状态提示："暂无评论，上线项目后将根据玩家反馈生成真实评论"

**Scenario: 项目上线后生成评论**
- **GIVEN** 项目已上线运营
- **WHEN** 每日模拟执行时
- **THEN** 根据项目质量、角色表现、剧情评分生成对应评论
- **AND** 评论内容与具体项目/角色/剧情关联

### Requirement 2: 告白墙初始为空

**Scenario: 游戏初始状态**
- **GIVEN** 玩家刚开始游戏
- **WHEN** 进入告白墙页面
- **THEN** 显示空状态提示："告白墙空空如也，等角色获得人气后会有玩家来告白哦"

**Scenario: 角色获得人气后生成告白**
- **GIVEN** 项目已上线，角色人气达到阈值（>20）
- **WHEN** 每日模拟执行时
- **THEN** 根据角色人气、亲密度、剧情表现生成告白
- **AND** 告白内容与具体角色关联

### Requirement 3: 同人广场初始为空

**Scenario: 游戏初始状态**
- **GIVEN** 玩家刚开始游戏
- **WHEN** 进入同人广场页面
- **THEN** 显示空状态提示："还没有同人作品，等项目积累一定热度后会激发创作灵感"

**Scenario: 热度达到阈值后生成同人**
- **GIVEN** 项目/角色/剧情热度达到阈值
- **WHEN** 每日模拟执行时
- **THEN** 根据热度类型生成对应同人作品
- **AND** 同人内容与具体角色/剧情/CP关联

### Requirement 4: 内容生成引擎

**Scenario: 每日内容生成**
- **GIVEN** 项目已上线，每日模拟执行
- **WHEN** 调用内容生成引擎
- **THEN** 根据以下因素计算生成概率：
  - 项目质量评分
  - 角色人气值
  - 剧情热度
  - 活动热度
  - 上线天数（时间衰减）
- **AND** 根据正面/负面比例生成对应情感的内容

**Scenario: 内容关联验证**
- **GIVEN** 生成了新的评论/告白/同人
- **THEN** 每条内容都包含关联信息：
  - 评论：关联项目ID/角色ID/剧情ID
  - 告白：关联角色ID
  - 同人：关联角色ID/CP组合/剧情ID

### Requirement 5: 内容模板系统

**Scenario: 模板分类**
- **GIVEN** 内容生成引擎需要生成内容
- **THEN** 根据关联元素选择对应模板：
  - 评论模板按项目类型、角色类型、剧情类型分类
  - 告白模板按角色性格分类
  - 同人模板按创作类型（文/图/表情包）分类

**Scenario: 模板个性化**
- **GIVEN** 使用模板生成内容
- **THEN** 根据具体元素替换占位符：
  - {角色名} → 实际角色名称
  - {项目名} → 实际项目名称
  - {剧情场景} → 实际剧情场景

## MODIFIED Requirements

### Requirement: 现有评论生成逻辑

**原逻辑**：
- 随机生成评论，与游戏状态无关

**新逻辑**：
- 基于项目质量、角色人气、剧情表现生成
- 评论内容与具体游戏元素关联
- 情感比例根据模拟数据动态计算

### Requirement: 现有告白墙逻辑

**原逻辑**：
- 初始就有告白内容

**新逻辑**：
- 初始为空
- 角色人气达到阈值后触发生成
- 告白内容与具体角色关联

### Requirement: 现有同人广场逻辑

**原逻辑**：
- 初始就有同人作品

**新逻辑**：
- 初始为空
- 热度达到阈值后触发生成
- 同人内容与具体游戏元素关联

## REMOVED Requirements

### Requirement: 初始默认内容

**Reason**: 破坏游戏真实感，与游戏状态脱节
**Migration**: 
- 删除 `initDefaultComments()` 等初始化默认内容的函数
- 替换为空状态提示
- 通过新的内容生成引擎在适当时候生成真实内容
