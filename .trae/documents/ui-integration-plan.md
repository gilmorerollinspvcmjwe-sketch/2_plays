# UI 完善与模块化设计计划

## 目标
完善前后端联动，将已有后台逻辑与前端UI整合，采用模块化设计方便后续扩展。

---

## 一、当前问题分析

### 1.1 Store-UI 缺失映射

| Store | 已有功能 | 缺失UI展示 |
|-------|---------|-----------|
| `gameStore` | 游戏/角色/剧情CRUD | 游戏详情页、角色列表、剧情列表 |
| `companyStore` | 公司/团队管理 | 公司信息展示、团队管理页 |
| `commentStore` | 评论生成/管理 | 与游戏关联的评论筛选 |
| `operationStore` | 运营数据 | 与游戏关联的运营统计 |

### 1.2 孤立组件

| 组件 | 状态 | 应集成位置 |
|------|------|-----------|
| `ImageGenerator.vue` | 未使用 | 角色创建流程 |
| `InteractionConfig.vue` | 未使用 | 角色创建流程 |
| `AchievementsView.vue` | 无路由 | 独立页面+Profile入口 |
| `CompanySetupView.vue` | 无路由 | 首次访问引导 |

### 1.3 路由缺失

- `/achievements` - 成就系统
- `/company-setup` - 公司设立
- `/game/:id` - 游戏详情
- `/game/:id/characters` - 角色列表
- `/game/:id/plots` - 剧情列表

---

## 二、模块化设计方案

### 2.1 核心模块划分

```
src/
├── modules/
│   ├── game/                    # 游戏管理模块
│   │   ├── components/
│   │   │   ├── GameCard.vue
│   │   │   ├── GameList.vue
│   │   │   ├── CharacterList.vue
│   │   │   └── PlotList.vue
│   │   ├── views/
│   │   │   ├── GameDetail.vue
│   │   │   └── GameManage.vue
│   │   └── index.ts             # 模块导出
│   │
│   ├── company/                 # 公司管理模块
│   │   ├── components/
│   │   │   ├── CompanyCard.vue
│   │   │   └── TeamList.vue
│   │   ├── views/
│   │   │   └── CompanyManage.vue
│   │   └── index.ts
│   │
│   ├── creator/                 # 创作模块
│   │   ├── components/
│   │   │   ├── CharacterForm/
│   │   │   │   ├── BasicInfo.vue
│   │   │   │   ├── Appearance.vue
│   │   │   │   ├── Personality.vue
│   │   │   │   ├── Background.vue
│   │   │   │   ├── Interaction.vue      # 互动配置
│   │   │   │   └── ImageGen.vue         # 图片生成
│   │   │   └── PlotDesigner/
│   │   │       ├── RouteSelector.vue
│   │   │       ├── ChapterEditor.vue
│   │   │       └── ChoiceManager.vue
│   │   └── index.ts
│   │
│   ├── operation/               # 运营模块
│   │   ├── components/
│   │   │   ├── Dashboard.vue
│   │   │   ├── GachaManager.vue
│   │   │   ├── EventCenter.vue
│   │   │   └── IncidentHandler.vue
│   │   └── index.ts
│   │
│   └── social/                  # 社交模块
│       ├── components/
│       │   ├── CommentList.vue
│       │   ├── CommentGenerator.vue
│       │   └── SentimentDashboard.vue
│       └── index.ts
│
├── shared/                      # 共享组件
│   ├── components/
│   │   ├── AppHeader.vue
│   │   ├── AppFooter.vue
│   │   ├── EmptyState.vue
│   │   └── LoadingState.vue
│   └── utils/
│       ├── formatters.ts
│       └── validators.ts
│
└── router/
    └── modules/                 # 路由模块化
        ├── game.routes.ts
        ├── company.routes.ts
        ├── creator.routes.ts
        └── operation.routes.ts
```

### 2.2 组件设计规范

#### 命名规范
- 页面组件: `XXXView.vue` (如 `GameDetailView.vue`)
- 业务组件: `XXXCard.vue`, `XXXList.vue`, `XXXForm.vue`
- 基础组件: `AppXXX.vue`, `BaseXXX.vue`

#### Props/Events 规范
```typescript
// 统一接口定义
interface GameCardProps {
  game: Game;
  showActions?: boolean;
}

interface GameCardEvents {
  'click': [gameId: string];
  'delete': [gameId: string];
  'publish': [gameId: string];
}
```

---

## 三、具体实施步骤

### Phase 1: 路由完善（第1天）

#### 3.1.1 添加缺失路由

**文件**: `src/router/index.ts`

```typescript
// 新增路由
{
  path: 'achievements',
  name: 'achievements',
  component: () => import('@/views/AchievementsView.vue')
},
{
  path: 'company-setup',
  name: 'companySetup',
  component: () => import('@/views/CompanySetupView.vue')
},
{
  path: 'game/:id',
  name: 'gameDetail',
  component: () => import('@/views/game/GameDetailView.vue')
},
{
  path: 'creator/interaction',
  name: 'interactionConfig',
  component: () => import('@/components/creator/InteractionConfig.vue')
},
{
  path: 'creator/image-gen',
  name: 'imageGenerator',
  component: () => import('@/components/creator/ImageGenerator.vue')
}
```

#### 3.1.2 路由模块化（可选优化）

创建 `src/router/modules/game.routes.ts`:
```typescript
export const gameRoutes = [
  {
    path: 'games',
    name: 'games',
    component: () => import('@/modules/game/views/GameManage.vue')
  },
  {
    path: 'game/:id',
    name: 'gameDetail',
    component: () => import('@/modules/game/views/GameDetail.vue')
  }
];
```

### Phase 2: 首页完善（第2天）

#### 3.2.1 集成 gameStore

**文件**: `src/views/HomeView.vue`

修改点:
1. 使用 `gameStore` 替代 `localStorage` 读取游戏列表
2. 添加游戏状态标签（草稿/已发布）
3. 添加角色数/剧情数显示
4. 添加快捷操作按钮（发布/编辑/删除）

#### 3.2.2 添加功能入口

新增快捷入口:
- 发布游戏 → `/publish`
- 成就系统 → `/achievements`
- 公司信息 → `/company-setup`（或弹窗展示）

### Phase 3: 角色创建流程完善（第3-4天）

#### 3.3.1 集成 InteractionConfig

**文件**: `src/views/creator/CharacterCreator.vue`

修改步骤:
1. 步骤条增加第5步"互动配置"
2. 在第4步后添加 InteractionConfig 组件
3. 保存时将 `interactionConfig` 存入角色数据

```vue
<van-steps :active="currentStep" class="steps">
  <van-step>外貌</van-step>
  <van-step>服装</van-step>
  <van-step>性格</van-step>
  <van-step>背景</van-step>
  <van-step>互动</van-step>
  <van-step>立绘</van-step>
</van-steps>
```

#### 3.3.2 集成 ImageGenerator

1. 作为第6步"立绘生成"
2. 传递角色信息给 ImageGenerator
3. 生成后保存图片URL到角色数据

### Phase 4: Profile 页面完善（第5天）

#### 3.4.1 集成 companyStore

**文件**: `src/views/ProfileView.vue`

添加:
1. 公司信息卡片（Logo、名称、声誉）
2. 团队列表展示
3. 成就系统入口（修复路由）
4. 游戏统计（从 gameStore 读取）

#### 3.4.2 数据统计联动

```typescript
const stats = computed(() => ({
  games: gameStore.games.length,
  published: gameStore.publishedGames.length,
  characters: gameStore.games.reduce((sum, g) => sum + g.characters.length, 0),
  points: pointsStore.balance
}));
```

### Phase 5: 游戏详情页创建（第6-7天）

#### 3.5.1 创建 GameDetailView

**文件**: `src/views/game/GameDetailView.vue`

功能:
1. 游戏基本信息展示
2. 角色列表（可点击进入角色详情）
3. 剧情列表
4. 运营数据概览
5. 评论列表（筛选该游戏的评论）

#### 3.5.2 创建子组件

- `CharacterList.vue` - 角色卡片列表
- `PlotList.vue` - 剧情卡片列表
- `GameStats.vue` - 游戏统计数据

### Phase 6: 评论/运营与游戏关联（第8天）

#### 3.6.1 评论关联

**文件**: `src/stores/commentStore.ts`

修改:
1. `GameComment` 接口添加 `gameId` 字段
2. `generateNewComments` 方法接受 `gameId` 参数
3. CommentsView 添加游戏筛选器

#### 3.6.2 运营关联

**文件**: `src/stores/operationStore.ts`

修改:
1. `GachaPool`, `GameEvent`, `OperationIncident` 添加 `gameId`
2. 创建方法自动关联 `currentGame`
3. OperationView 显示当前游戏的运营数据

---

## 四、组件详细设计

### 4.1 GameCard 组件

```vue
<template>
  <van-card class="game-card" @click="$emit('click', game.id)">
    <template #title>
      <div class="game-title">
        <span class="title">{{ game.title }}</span>
        <van-tag :type="statusType">{{ statusText }}</van-tag>
      </div>
    </template>
    <template #desc>
      <div class="game-meta">
        <span>角色: {{ game.characters.length }}</span>
        <span>剧情: {{ game.plots.length }}</span>
      </div>
    </template>
    <template #footer>
      <van-button size="mini" @click.stop="$emit('edit', game.id)">编辑</van-button>
      <van-button size="mini" type="danger" @click.stop="$emit('delete', game.id)">删除</van-button>
    </template>
  </van-card>
</template>
```

### 4.2 CompanyCard 组件

```vue
<template>
  <div class="company-card">
    <div class="company-logo">
      <span class="logo-emoji">{{ company.logo.emoji }}</span>
      <span class="logo-text">{{ company.logo.text }}</span>
    </div>
    <div class="company-info">
      <h4>{{ company.name }}</h4>
      <van-progress :percentage="company.reputation" />
    </div>
    <div class="team-preview">
      <span v-for="member in company.team.slice(0, 3)" :key="member.id">
        {{ member.avatar }}
      </span>
    </div>
  </div>
</template>
```

---

## 五、数据流设计

### 5.1 游戏创建流程

```
HomeView (点击创建)
  ↓
CharacterCreator
  - Step1: 外貌选择
  - Step2: 服装选择
  - Step3: 性格选择
  - Step4: 背景选择
  - Step5: 互动配置 (InteractionConfig)
  - Step6: 立绘生成 (ImageGenerator)
  ↓
gameStore.addCharacter() → 保存到当前游戏
  ↓
PlotDesigner → 创建剧情
  ↓
gameStore.addPlot() → 保存到当前游戏
  ↓
PublishView → 发布游戏
  ↓
gameStore.publishGame() → 状态变更
```

### 5.2 数据关联关系

```
Company (1)
  └── Games (N)
       ├── Characters (N)
       │    └── InteractionConfig (1)
       │    └── Avatar (1)
       ├── Plots (N)
       │    └── Chapters (N)
       ├── Comments (N) [关联]
       └── OperationData (1) [关联]
            ├── GachaPools (N)
            ├── Events (N)
            └── Incidents (N)
```

---

## 六、实施时间表

| 阶段 | 任务 | 预计时间 | 产出 |
|------|------|---------|------|
| Phase 1 | 路由完善 | 1天 | 完整路由配置 |
| Phase 2 | 首页完善 | 1天 | 功能完整的HomeView |
| Phase 3 | 角色创建完善 | 2天 | 6步创建流程 |
| Phase 4 | Profile完善 | 1天 | 完整个人信息页 |
| Phase 5 | 游戏详情页 | 2天 | GameDetailView |
| Phase 6 | 数据关联 | 1天 | 评论/运营关联 |
| **总计** | | **8天** | 完整联动的系统 |

---

## 七、验收标准

### 7.1 功能完整性
- [ ] 所有Store数据都能在UI中展示
- [ ] 角色创建包含6个完整步骤
- [ ] 游戏详情页展示角色/剧情/运营/评论
- [ ] Profile页展示公司/成就/统计
- [ ] 所有路由可正常访问

### 7.2 用户体验
- [ ] 操作流程顺畅无卡顿
- [ ] 数据实时同步显示
- [ ] 空状态有友好提示
- [ ] 错误处理完善

### 7.3 代码质量
- [ ] 组件职责单一
- [ ] Props/Events定义清晰
- [ ] 代码复用率高
- [ ] 易于扩展新功能
