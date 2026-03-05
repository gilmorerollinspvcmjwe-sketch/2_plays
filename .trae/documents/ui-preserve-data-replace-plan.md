# UI不变，数据源替换方案

## 核心原则

**"保持现有UI完全不变，仅替换底层数据源为模拟系统"**

## 现状分析

从截图可以看到现有UI结构：

### 运营数据面板
- 今日收入: 2324
- 活跃玩家: 568
- 总抽卡数: 273
- 进行中活动: 1
- 游戏声誉: 55/100
- 运营事件: 3个待处理

### Tab导航
1. 卡池管理
2. 活动中心
3. 运营事件
4. 玩家数据
5. 福利发放
6. 告白墙
7. 同人广场
8. 市场情报

### 评论系统
- 舆情概览: 热度232, 情感倾向-5
- 平台标签: 抖音、小红书、微博、B站、贴吧
- 评论列表

---

## 方案：数据源映射替换

### 策略

不改变任何UI组件的模板结构，只修改 `<script>` 部分的数据获取逻辑。

```
现有UI组件
    │
    ├── 模板 (template) → 完全不变
    │
    └── 脚本 (script) → 修改数据源
            │
            ▼
    ┌─────────────────┐
    │  从静态生成改为  │
    │ 从simulationStore│
    │    获取数据     │
    └─────────────────┘
```

---

## 具体实施

### Phase 1: 扩展 simulationStore（生成所有需要的数据）

```typescript
// stores/simulationStore.ts

// 新增：匹配现有UI的数据结构
const operationMetrics = ref({
  todayRevenue: 0,      // 今日收入
  activePlayers: 0,     // 活跃玩家
  totalDraws: 0,        // 总抽卡数
  activeEvents: 0,      // 进行中活动
  reputation: 0,        // 游戏声誉
  pendingIncidents: 0   // 待处理事件
});

// 新增：评论数据（匹配现有CommentsView结构）
const commentMetrics = ref({
  heat: 0,              // 舆情热度
  sentiment: 0,         // 情感倾向
  negativeRatio: 0      // 负面占比
});

const platformComments = ref<{
  platform: string;     // 抖音/小红书/微博/B站/贴吧
  comments: Comment[];
}[]>([]);

// 在 tick() 中生成这些数据
async function tick() {
  // ... 现有模拟逻辑 ...
  
  // 生成运营数据
  operationMetrics.value = {
    todayRevenue: Math.floor(result.globalImpact.project.revenue * 1000),
    activePlayers: result.globalImpact.project.dau,
    totalDraws: gachaStatistics.value?.totalDraws || 0,
    activeEvents: recentEvents.value.filter(e => !e.resolved).length,
    reputation: result.globalImpact.company.reputation,
    pendingIncidents: recentEvents.value.length
  };
  
  // 生成评论数据
  const commentSim = new CommentSimulator();
  const comments = commentSim.simulateCommentsForPlayers(sampledPlayers);
  
  commentMetrics.value = {
    heat: comments.length * 10,
    sentiment: calculateSentimentScore(comments),
    negativeRatio: calculateNegativeRatio(comments)
  };
  
  // 按平台分组
  platformComments.value = [
    { platform: '抖音', comments: comments.filter(c => c.platform === 'douyin') },
    { platform: '小红书', comments: comments.filter(c => c.platform === 'xiaohongshu') },
    { platform: '微博', comments: comments.filter(c => c.platform === 'weibo') },
    { platform: 'B站', comments: comments.filter(c => c.platform === 'bilibili') },
    { platform: '贴吧', comments: comments.filter(c => c.platform === 'tieba') }
  ];
}
```

### Phase 2: 修改各Store（保持API不变，换数据源）

#### operationStore.ts

```typescript
// stores/operationStore.ts
import { useSimulationStore } from './simulationStore';

export const useOperationStore = defineStore('operation', () => {
  const simulationStore = useSimulationStore();
  
  // 保持现有API不变
  const metrics = computed(() => simulationStore.operationMetrics);
  const incidents = computed(() => simulationStore.recentEvents);
  const gachaPools = ref([...]); // 保持现有
  const activities = ref([...]); // 保持现有
  
  // 保持现有方法签名
  function createGachaPool(config: GachaConfig) {
    // 保持现有逻辑
  }
  
  function createActivity(config: ActivityConfig) {
    // 保持现有逻辑
  }
  
  function handleIncident(incidentId: string, solution: string) {
    // 操作模拟系统的事件
    simulationStore.resolveEvent(incidentId, solution);
  }
  
  return {
    metrics,      // 现在来自模拟系统
    incidents,    // 现在来自模拟系统
    gachaPools,
    activities,
    createGachaPool,
    createActivity,
    handleIncident
  };
});
```

#### commentStore.ts

```typescript
// stores/commentStore.ts
import { useSimulationStore } from './simulationStore';

export const useCommentStore = defineStore('comment', () => {
  const simulationStore = useSimulationStore();
  
  // 保持现有API
  const heat = computed(() => simulationStore.commentMetrics.heat);
  const sentiment = computed(() => simulationStore.commentMetrics.sentiment);
  const commentsByPlatform = computed(() => simulationStore.platformComments);
  
  // 保持现有方法
  function generateComments() {
    // 触发模拟系统生成新评论
    simulationStore.generateNewComments();
  }
  
  return {
    heat,                // 来自模拟系统
    sentiment,           // 来自模拟系统
    commentsByPlatform,  // 来自模拟系统
    generateComments
  };
});
```

#### confessionStore.ts

```typescript
// stores/confessionStore.ts
import { useSimulationStore } from './simulationStore';

export const useConfessionStore = defineStore('confession', () => {
  const simulationStore = useSimulationStore();
  
  // 保持现有API
  const confessions = computed(() => {
    // 转换模拟数据格式以匹配现有UI
    return simulationStore.recentConfessions.map(c => ({
      id: c.id,
      characterId: inferCharacterId(c.relatedTags),
      characterName: inferCharacterName(c.relatedTags),
      content: c.content,
      authorId: c.authorId,
      authorName: c.authorName,
      likes: c.likes,
      heat: c.likes * 2,
      createdAt: new Date(c.timestamp).toISOString(),
      isHot: c.likes > 50
    }));
  });
  
  // 保持现有方法
  function publishConfession(data: PublishData) {
    // 添加到模拟系统
    simulationStore.addUserConfession(data);
  }
  
  return {
    confessions,  // 来自模拟系统（格式转换后）
    publishConfession
  };
});
```

#### fanCreationStore.ts

```typescript
// stores/fanCreationStore.ts
import { useSimulationStore } from './simulationStore';

export const useFanCreationStore = defineStore('fanCreation', () => {
  const simulationStore = useSimulationStore();
  
  // 保持现有API
  const creations = computed(() => {
    // 转换模拟数据格式
    return simulationStore.recentFanworks.map(f => ({
      id: f.id,
      type: mapFanworkType(f.type),  // 绘画→fanart
      characterId: f.relatedCharacters[0] || '',
      characterName: f.relatedCharacters[0] || '',
      content: f.content,
      authorId: f.authorId,
      authorName: f.authorName,
      likes: f.likes,
      collections: Math.floor(f.likes * 0.3),
      createdAt: new Date(f.timestamp).toISOString()
    }));
  });
  
  return {
    creations  // 来自模拟系统（格式转换后）
  };
});
```

### Phase 3: UI组件验证（无需修改模板）

由于只修改了Store的数据源，所有UI组件的模板完全不需要改动。

验证清单：

| 组件 | 需要修改 | 验证点 |
|------|---------|--------|
| OperationDashboard.vue | ❌ 无需修改 | 检查 `operationStore.metrics` 是否正常显示 |
| OperationView.vue | ❌ 无需修改 | 检查各Tab数据是否正常 |
| CommentsView.vue | ❌ 无需修改 | 检查评论列表和舆情数据 |
| ConfessionWall.vue | ❌ 无需修改 | 检查告白列表 |
| FanCreationSquare.vue | ❌ 无需修改 | 检查同人作品列表 |
| MarketDashboard.vue | ❌ 无需修改 | 检查市场数据 |

---

## 数据映射细节

### 运营数据映射

| UI显示 | 模拟系统数据源 | 转换公式 |
|--------|---------------|---------|
| 今日收入 | `globalImpact.project.revenue` | × 1000 |
| 活跃玩家 | `globalImpact.project.dau` | 直接 |
| 总抽卡数 | `gachaStatistics.totalDraws` | 直接 |
| 进行中活动 | `recentEvents` (未解决) | count |
| 游戏声誉 | `globalImpact.company.reputation` | 直接 |
| 待处理事件 | `recentEvents` | count |

### 评论数据映射

| UI显示 | 模拟系统数据源 | 转换公式 |
|--------|---------------|---------|
| 舆情热度 | `platformComments.length` | × 10 |
| 情感倾向 | `sentimentDistribution` | 计算得分 |
| 负面占比 | `sentimentDistribution.negative` | % |
| 平台评论 | `platformComments` | 按平台分组 |

### 告白墙映射

| UI字段 | 模拟字段 | 转换 |
|--------|---------|------|
| characterId | relatedTags[0] | 标签→角色ID |
| characterName | relatedTags[0] | 标签→角色名 |
| heat | likes | × 2 |
| isHot | likes | > 50 |

### 同人广场映射

| UI字段 | 模拟字段 | 转换 |
|--------|---------|------|
| type | type | 绘画→fanart, 文稿→fanfic |
| characterId | relatedCharacters[0] | 直接 |
| collections | likes | × 0.3 |

---

## 实施步骤

### Step 1: 扩展 simulationStore（2小时）

添加所有需要的数据字段和生成逻辑。

### Step 2: 修改 operationStore（1小时）

改为从 simulationStore 获取运营数据。

### Step 3: 修改 commentStore（1小时）

改为从 simulationStore 获取评论数据。

### Step 4: 修改 confessionStore（1小时）

改为从 simulationStore 获取告白数据，添加格式转换。

### Step 5: 修改 fanCreationStore（1小时）

改为从 simulationStore 获取同人数据，添加格式转换。

### Step 6: 测试验证（2小时）

验证所有UI正常显示模拟数据。

---

## 总结

**方案优势：**
- ✅ UI完全不变，用户无感知
- ✅ 只改数据源，风险最低
- ✅ 保持现有交互逻辑
- ✅ 数据全部来自10,000虚拟玩家模拟

**实施结果：**
用户看到的UI和之前完全一样，但所有数据都来自真实的模拟系统，不再是静态生成的假数据。
