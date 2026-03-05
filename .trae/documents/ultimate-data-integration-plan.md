# 终极数据整合方案

## 一、现状诊断

### 1.1 数据孤岛问题

当前系统存在严重的数据割裂：

```
┌─────────────────────────────────────────────────────────────┐
│                    simulationStore                          │
│  (10,000虚拟玩家模拟系统 - 完整数据)                        │
│  ├─ 告白数据 (ConfessionSimulator)                          │
│  ├─ 同人数据 (FanworkSimulator)                             │
│  ├─ 评论数据 (CommentSimulator - 5大平台)                   │
│  ├─ 运营事件 (EventSimulator)                               │
│  ├─ 活动数据 (ActivitySimulator)                            │
│  ├─ 抽卡统计 (GachaSimulator)                               │
│  ├─ 玩家状态 (PlayerStateSimulator)                         │
│  └─ 世界变化 (WorldSimulator)                               │
└───────────────────────────┬─────────────────────────────────┘
                            │ 仅 SimulationPanel 使用
                            ▼
                   ┌─────────────────┐
                   │ SimulationPanel │
                   │   (数据孤岛)    │
                   └─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    独立静态数据系统                          │
│  ├─ confessionStore (告白墙 - 独立生成)                     │
│  ├─ fanCreationStore (同人广场 - 独立生成)                  │
│  ├─ commentStore (评论 - 独立生成)                          │
│  ├─ operationStore (运营 - 独立生成)                        │
│  └─ playerStore (玩家 - 独立生成)                           │
└───────────────────────────┬─────────────────────────────────┘
                            │ 各组件独立使用
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │Confession   │  │ FanCreation │  │  Comments   │
   │Wall         │  │ Square      │  │   View      │
   └─────────────┘  └─────────────┘  └─────────────┘
```

### 1.2 重复功能清单

| 功能 | SimulationPanel | 独立组件 | 问题 |
|------|----------------|----------|------|
| 告白墙 | ✅ 展示模拟告白 | ConfessionWall 展示静态告白 | 重复功能，数据不一致 |
| 同人广场 | ✅ 展示模拟同人 | FanCreationSquare 展示静态同人 | 重复功能，数据不一致 |
| 运营事件 | ✅ 展示模拟事件 | OperationView 展示静态事件 | 重复功能，数据不一致 |
| 评论系统 | ✅ 生成5大平台评论 | CommentsView 展示静态评论 | 模拟评论无处可看 |

### 1.3 未使用的模拟数据

| 模拟器 | 数据 | 当前状态 |
|--------|------|----------|
| CommentSimulator | 5大平台评论、评分、情感分布 | ❌ 完全未展示 |
| ActivitySimulator | 活动参与人数、完成率、效果 | ❌ 完全未展示 |
| PlayerStateSimulator | 玩家状态流转、流失预警 | ❌ 完全未展示 |
| GachaSimulator | 详细抽卡统计、保底率 | ⚠️ 仅展示简化版 |
| TagSystem | 标签影响矩阵 | ❌ 完全未展示 |

---

## 二、终极方案：全面替换

### 2.1 核心原则

**"模拟系统是唯一数据源，全面替换静态数据"**

```
┌─────────────────────────────────────────────────────────────┐
│                    simulationStore                          │
│              (唯一数据源 - 10,000虚拟玩家)                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┬───────────────┐
            ▼               ▼               ▼               ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │Simulation   │  │Confession   │  │FanCreation  │  │  Comments   │
   │Panel        │  │Wall         │  │ Square      │  │   View      │
   │(主控面板)   │  │(模拟数据)   │  │(模拟数据)   │  │(模拟数据)   │
   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

### 2.2 替换策略

#### 策略1：Store 数据源替换

将所有 Store 的数据源改为 simulationStore：

```typescript
// confessionStore.ts - 修改后
export const useConfessionStore = defineStore('confession', () => {
  // 不再独立生成数据，改为从 simulationStore 获取
  const simulationStore = useSimulationStore();
  
  const confessions = computed(() => {
    return simulationStore.recentConfessions;
  });
  
  // 保留发布功能，但数据来自模拟系统
  function publishConfession(content: string, characterId: string) {
    // 将用户发布的告白也同步到模拟系统
    simulationStore.addRealConfession({ content, characterId });
  }
});
```

#### 策略2：数据同步机制

在 simulationStore.tick() 中同步所有数据：

```typescript
// simulationStore.ts
async function tick() {
  // ... 现有模拟逻辑 ...
  
  // 同步到 confessionStore
  confessionStore.confessions = recentConfessions.value;
  
  // 同步到 fanCreationStore
  fanCreationStore.creations = recentFanworks.value;
  
  // 同步到 commentStore
  commentStore.comments = simulatedComments;
  
  // 同步到 operationStore
  operationStore.events = recentEvents.value;
}
```

#### 策略3：UI 组件去重

删除/合并重复功能的组件：

| 当前组件 | 操作 | 说明 |
|----------|------|------|
| SimulationPanel | 保留为主控面板 | 展示完整模拟数据 |
| ConfessionWall | 保留但改数据源 | 改为展示模拟告白 |
| FanCreationSquare | 保留但改数据源 | 改为展示模拟同人 |
| CommentsView | 保留但改数据源 | 改为展示模拟评论 |
| OperationView 事件Tab | 保留但改数据源 | 改为展示模拟事件 |

---

## 三、具体实施步骤

### Phase 1: 基础设施改造（Day 1-2）

#### Step 1.1: 扩展 simulationStore

```typescript
// stores/simulationStore.ts

// 新增：平台评论数据
const platformComments = ref<PlatformComment[]>([]);
const platformStatistics = ref<PlatformStatistics | null>(null);

// 新增：活动参与数据
const activityParticipation = ref<ActivityParticipation | null>(null);

// 新增：玩家状态变化
const stateChanges = ref<StateChange[]>([]);

// 新增：详细抽卡统计
const gachaStatistics = ref<GachaStatistics | null>(null);

// 新增：标签影响数据
const activeTags = ref<TagEffect[]>([]);

// 在 tick() 中生成这些数据
async function tick() {
  // ... 现有逻辑 ...
  
  // 生成平台评论
  const commentSim = new CommentSimulator();
  platformComments.value = commentSim.simulateCommentsForPlayers(sampledPlayers);
  platformStatistics.value = commentSim.getPlatformStatistics(platformComments.value);
  
  // 生成玩家状态变化
  const stateSim = new PlayerStateSimulator();
  stateChanges.value = stateSim.simulateTransitions(sampledPlayers);
  
  // 生成详细抽卡统计
  const gachaSim = new GachaSimulator(poolConfig);
  const gachaResults = sampledPlayers.map(p => gachaSim.simulatePlayerDraw(p, poolConfig));
  gachaStatistics.value = gachaSim.getStatistics(gachaResults);
}
```

#### Step 1.2: 修改 confessionStore

```typescript
// stores/confessionStore.ts
import { useSimulationStore } from './simulationStore';

export const useConfessionStore = defineStore('confession', () => {
  const simulationStore = useSimulationStore();
  
  // 从 simulationStore 获取数据
  const confessions = computed(() => simulationStore.recentConfessions);
  const hotConfessions = computed(() => 
    simulationStore.recentConfessions.filter(c => c.likes > 50)
  );
  
  // 保留发布功能，但发送到 simulationStore
  async function publishConfession(data: PublishData) {
    // 添加用户发布的告白到模拟系统
    simulationStore.addUserConfession({
      ...data,
      id: `user_${Date.now()}`,
      timestamp: Date.now()
    });
  }
  
  return {
    confessions,
    hotConfessions,
    publishConfession
  };
});
```

#### Step 1.3: 修改 fanCreationStore

```typescript
// stores/fanCreationStore.ts
import { useSimulationStore } from './simulationStore';

export const useFanCreationStore = defineStore('fanCreation', () => {
  const simulationStore = useSimulationStore();
  
  // 从 simulationStore 获取数据
  const creations = computed(() => simulationStore.recentFanworks);
  
  return {
    creations,
    // ... 其他方法
  };
});
```

#### Step 1.4: 修改 commentStore

```typescript
// stores/commentStore.ts
import { useSimulationStore } from './simulationStore';

export const useCommentStore = defineStore('comment', () => {
  const simulationStore = useSimulationStore();
  
  // 从 simulationStore 获取数据
  const allComments = computed(() => simulationStore.platformComments);
  const taptapComments = computed(() => 
    simulationStore.platformComments.filter(c => c.platform === 'taptap')
  );
  // ... 其他平台
  
  const statistics = computed(() => simulationStore.platformStatistics);
  
  return {
    allComments,
    taptapComments,
    statistics
  };
});
```

### Phase 2: UI 组件改造（Day 3-4）

#### Step 2.1: ConfessionWall.vue 改造

```vue
<template>
  <div class="confession-wall">
    <!-- 数据源切换（可选） -->
    <div class="data-source-toggle">
      <van-radio-group v-model="dataSource" direction="horizontal">
        <van-radio name="simulation">模拟数据</van-radio>
        <van-radio name="user">用户发布</van-radio>
        <van-radio name="mixed">混合</van-radio>
      </van-radio-group>
    </div>
    
    <!-- 告白列表 -->
    <div class="confession-list">
      <div 
        v-for="confession in displayedConfessions" 
        :key="confession.id"
        class="confession-card"
      >
        <div class="confession-header">
          <span class="confession-type">{{ confession.type }}</span>
          <span class="confession-likes">❤️ {{ confession.likes }}</span>
        </div>
        <p class="confession-content">{{ confession.content }}</p>
        <div class="confession-footer">
          <span class="confession-author">{{ confession.authorName }}</span>
          <span class="confession-time">{{ formatTime(confession.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useConfessionStore } from '@/stores/confessionStore';

const confessionStore = useConfessionStore();
const dataSource = ref<'simulation' | 'user' | 'mixed'>('simulation');

const displayedConfessions = computed(() => {
  switch (dataSource.value) {
    case 'simulation':
      return confessionStore.confessions;
    case 'user':
      return confessionStore.userConfessions;
    case 'mixed':
    default:
      return [...confessionStore.confessions, ...confessionStore.userConfessions];
  }
});
</script>
```

#### Step 2.2: CommentsView.vue 改造

```vue
<template>
  <div class="comments-view">
    <!-- 平台切换标签 -->
    <van-tabs v-model="activePlatform">
      <van-tab title="全部" name="all"></van-tab>
      <van-tab title="TapTap" name="taptap"></van-tab>
      <van-tab title="AppStore" name="appstore"></van-tab>
      <van-tab title="微博" name="weibo"></van-tab>
      <van-tab title="B站" name="bilibili"></van-tab>
      <van-tab title="小红书" name="xiaohongshu"></van-tab>
    </van-tabs>
    
    <!-- 统计卡片 -->
    <div class="statistics-cards" v-if="statistics">
      <div class="stat-card">
        <span class="stat-value">{{ statistics.totalComments }}</span>
        <span class="stat-label">总评论</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ statistics.averageRating.toFixed(1) }}</span>
        <span class="stat-label">平均评分</span>
      </div>
      <div class="stat-card sentiment-positive">
        <span class="stat-value">{{ statistics.sentimentDistribution.positive }}%</span>
        <span class="stat-label">好评</span>
      </div>
    </div>
    
    <!-- 评论列表 -->
    <div class="comment-list">
      <div 
        v-for="comment in filteredComments" 
        :key="comment.id"
        class="comment-card"
        :class="comment.sentiment"
      >
        <div class="comment-header">
          <span class="platform-badge">{{ comment.platform }}</span>
          <span class="comment-rating" v-if="comment.rating">
            {{ comment.rating }}分
          </span>
        </div>
        <p class="comment-content">{{ comment.content }}</p>
        <div class="comment-tags">
          <van-tag v-for="tag in comment.relatedTags" :key="tag" size="small">
            {{ tag }}
          </van-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCommentStore } from '@/stores/commentStore';
import type { Platform } from '@/engine/simulation';

const commentStore = useCommentStore();
const activePlatform = ref<Platform | 'all'>('all');

const statistics = computed(() => commentStore.statistics);

const filteredComments = computed(() => {
  if (activePlatform.value === 'all') {
    return commentStore.allComments;
  }
  return commentStore.allComments.filter(c => c.platform === activePlatform.value);
});
</script>
```

#### Step 2.3: FanCreationSquare.vue 改造

```vue
<template>
  <div class="fan-creation-square">
    <!-- 筛选标签 -->
    <div class="filter-tags">
      <van-tag 
        v-for="type in creationTypes" 
        :key="type"
        :class="{ active: selectedType === type }"
        @click="selectedType = type"
      >
        {{ type }}
      </van-tag>
    </div>
    
    <!-- 作品列表 -->
    <div class="creation-grid">
      <div 
        v-for="creation in filteredCreations" 
        :key="creation.id"
        class="creation-card"
        :class="creation.quality"
      >
        <div class="creation-type">{{ creation.type }}</div>
        <div class="creation-quality">{{ creation.quality }}</div>
        <p class="creation-content">{{ creation.content }}</p>
        <div class="creation-stats">
          <span>❤️ {{ creation.likes }}</span>
          <span v-if="creation.relatedCharacters.length">
            角色: {{ creation.relatedCharacters.join(', ') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFanCreationStore } from '@/stores/fanCreationStore';

const fanCreationStore = useFanCreationStore();
const selectedType = ref<string>('全部');
const creationTypes = ['全部', '绘画', '文稿', '表情包', '视频', '音乐'];

const filteredCreations = computed(() => {
  if (selectedType.value === '全部') {
    return fanCreationStore.creations;
  }
  return fanCreationStore.creations.filter(c => c.type === selectedType.value);
});
</script>
```

#### Step 2.4: SimulationPanel.vue 精简

由于其他组件已经展示详细数据，SimulationPanel 精简为"模拟控制面板"：

```vue
<template>
  <div class="simulation-panel">
    <div class="panel-header">
      <h3>🎮 玩家模拟系统</h3>
      <div class="day-indicator">第 {{ currentDay }} 天</div>
    </div>

    <div class="panel-controls">
      <button class="next-day-btn" @click="handleNextDay" :disabled="isRunning">
        {{ isRunning ? '模拟中...' : '▶ 下一天' }}
      </button>
      <button class="init-btn" @click="handleInitialize" :disabled="isRunning">
        🔄 初始化
      </button>
    </div>

    <!-- 核心指标概览 -->
    <div v-if="lastResult" class="core-metrics">
      <div class="metric-item">
        <span class="metric-label">DAU</span>
        <span class="metric-value">{{ lastResult.globalImpact.project.dau }}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">留存</span>
        <span class="metric-value">{{ currentRetention.d1 }}%</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">评分</span>
        <span class="metric-value">{{ lastResult.globalImpact.project.rating.toFixed(1) }}</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">收入</span>
        <span class="metric-value">¥{{ formatMoney(lastResult.globalImpact.project.revenue) }}</span>
      </div>
    </div>

    <!-- 快速链接 -->
    <div class="quick-links">
      <router-link to="/operation/confessions" class="quick-link">
        💌 告白墙 ({{ recentConfessions.length }})
      </router-link>
      <router-link to="/operation/fanworks" class="quick-link">
        🎨 同人广场 ({{ recentFanworks.length }})
      </router-link>
      <router-link to="/comments" class="quick-link">
        💬 评论监控 ({{ platformComments.length }})
      </router-link>
    </div>

    <!-- 世界变化 -->
    <div v-if="worldImpact" class="world-impact">
      <h4>🌍 世界变化</h4>
      <div class="impact-grid">
        <span :class="worldImpact.project.dauChange >= 0 ? 'positive' : 'negative'">
          DAU {{ worldImpact.project.dauChange >= 0 ? '+' : '' }}{{ worldImpact.project.dauChange }}
        </span>
        <span :class="worldImpact.project.ratingChange >= 0 ? 'positive' : 'negative'">
          评分 {{ worldImpact.project.ratingChange >= 0 ? '+' : '' }}{{ worldImpact.project.ratingChange.toFixed(1) }}
        </span>
      </div>
    </div>
  </div>
</template>
```

### Phase 3: 删除重复代码（Day 5）

#### Step 3.1: 删除 confessionStore 的独立生成逻辑

```typescript
// confessionStore.ts - 删除以下代码

// ❌ 删除独立生成函数
// function generateMockConfessions() { ... }

// ❌ 删除本地存储相关（改为不持久化模拟数据）
// const STORAGE_KEY = 'otome_confessions';
// function saveToLocal() { ... }
// function loadFromLocal() { ... }
```

#### Step 3.2: 删除 fanCreationStore 的独立生成逻辑

```typescript
// fanCreationStore.ts - 删除以下代码

// ❌ 删除独立生成函数
// function generateMockCreations() { ... }
```

#### Step 3.3: 删除 commentStore 的独立生成逻辑

```typescript
// commentStore.ts - 删除以下代码

// ❌ 删除独立生成函数
// function generateMockComments() { ... }
```

### Phase 4: 路由和导航调整（Day 5）

#### Step 4.1: 调整路由

```typescript
// router/index.ts

const routes = [
  // ... 其他路由
  {
    path: '/operation',
    component: OperationView,
    children: [
      {
        path: '',
        redirect: '/operation/simulation'  // 默认显示模拟面板
      },
      {
        path: 'simulation',
        component: SimulationPanel  // 作为主面板
      },
      {
        path: 'confessions',
        component: ConfessionWall  // 独立的告白墙页面
      },
      {
        path: 'fanworks',
        component: FanCreationSquare  // 独立的同人广场页面
      }
    ]
  },
  {
    path: '/comments',
    component: CommentsView  // 独立的评论监控页面
  }
];
```

---

## 四、数据映射表

### 4.1 告白数据映射

| simulationStore | confessionStore | 转换逻辑 |
|----------------|-----------------|---------|
| id | id | 直接复制 |
| type | type | 直接复制 |
| content | content | 直接复制 |
| authorId | authorId | 直接复制 |
| authorName | authorName | 直接复制 |
| relatedTags | tags | 直接复制 |
| likes | likes | 直接复制 |
| timestamp | createdAt | 格式转换 |

### 4.2 同人数据映射

| simulationStore | fanCreationStore | 转换逻辑 |
|----------------|------------------|---------|
| id | id | 直接复制 |
| type | type | 映射：绘画→fanart, 文稿→fanfic, 表情包→emoji |
| content | content | 直接复制 |
| authorId | authorId | 直接复制 |
| authorName | authorName | 直接复制 |
| quality | quality | 直接复制 |
| likes | likes | 直接复制 |
| relatedCharacters | characterIds | 直接复制 |
| timestamp | createdAt | 格式转换 |

### 4.3 评论数据映射

| simulationStore | commentStore | 转换逻辑 |
|----------------|--------------|---------|
| id | id | 直接复制 |
| platform | platform | 直接复制 |
| playerId | userId | 直接复制 |
| content | content | 直接复制 |
| rating | rating | 直接复制 |
| sentiment | sentiment | 直接复制 |
| relatedTags | tags | 直接复制 |
| timestamp | createdAt | 格式转换 |

---

## 五、文件修改清单

### 需要修改的文件

| 文件 | 修改内容 | 优先级 |
|------|---------|--------|
| `stores/simulationStore.ts` | 新增平台评论、活动数据、状态变化、抽卡统计 | 🔴 高 |
| `stores/confessionStore.ts` | 改为从 simulationStore 获取数据 | 🔴 高 |
| `stores/fanCreationStore.ts` | 改为从 simulationStore 获取数据 | 🔴 高 |
| `stores/commentStore.ts` | 改为从 simulationStore 获取数据 | 🔴 高 |
| `stores/operationStore.ts` | 事件数据改为从 simulationStore 获取 | 🟡 中 |
| `components/operation/SimulationPanel.vue` | 精简为控制面板 | 🟡 中 |
| `components/social/ConfessionWall.vue` | 改为展示模拟数据 | 🔴 高 |
| `components/social/FanCreationSquare.vue` | 改为展示模拟数据 | 🔴 高 |
| `views/CommentsView.vue` | 改为展示5大平台模拟评论 | 🔴 高 |
| `views/OperationView.vue` | 调整 Tab 结构 | 🟡 中 |
| `router/index.ts` | 调整路由 | 🟡 中 |

### 需要删除的代码

| 位置 | 删除内容 |
|------|---------|
| `confessionStore.ts` | generateMockConfessions(), 本地存储逻辑 |
| `fanCreationStore.ts` | generateMockCreations(), 本地存储逻辑 |
| `commentStore.ts` | generateMockComments(), 本地存储逻辑 |

---

## 六、预期效果

### 改造前

```
SimulationPanel: 展示模拟数据（孤岛）
ConfessionWall:  展示静态数据（独立）
FanCreationSquare: 展示静态数据（独立）
CommentsView:    展示静态数据（独立）

问题：数据割裂、重复功能、用户体验不一致
```

### 改造后

```
SimulationPanel:  模拟控制面板（核心指标+快速链接）
ConfessionWall:   展示模拟告白数据
FanCreationSquare: 展示模拟同人数据
CommentsView:     展示5大平台模拟评论

优势：
✅ 数据统一，全部来自10,000虚拟玩家模拟
✅ 消除重复功能
✅ 用户体验一致
✅ 符合"模拟经营"游戏逻辑
```

---

## 七、风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 用户数据丢失 | 高 | 保留用户发布功能，仅替换系统生成数据 |
| 性能问题 | 中 | 模拟数据不持久化，每次重新生成 |
| 用户困惑 | 中 | 添加数据源切换选项（模拟/用户/混合） |
| 开发时间 | 低 | 分4个Phase实施，每阶段可独立测试 |

---

## 八、总结

本方案的核心是**"全面替换"**：

1. **数据源统一**：所有 Store 都从 simulationStore 获取数据
2. **UI 去重**：删除/合并重复功能的组件
3. **体验一致**：用户在任何页面看到的数据都来自同一套模拟系统
4. **保留互动**：用户发布的告白/同人/评论仍然可以保留

实施完成后，系统将形成统一的数据流：

```
10,000虚拟玩家模拟系统
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
告白墙    同人广场   评论系统   运营数据
```
