# 评论和运营功能实现计划

## 目标
实现完整的评论系统和运营系统，完成整体玩法的 Demo 建设。

---

## 一、现状分析

### 1.1 已完成的基础
- ✅ 积分系统 (points.ts) - 完整实现
- ✅ 类型定义 (template.ts) - CommentTemplate, EventTemplate, IncidentTemplate 已定义
- ✅ 模板管理器 (templateManager.ts) - 基础框架
- ✅ 页面占位 - CommentsView.vue, OperationView.vue 已创建（仅显示"开发中"）

### 1.2 需要实现的核心功能

| 系统 | 当前状态 | 需要实现 |
|------|---------|---------|
| 评论系统 | 仅占位 | AI评论生成、评论列表、舆情监控 |
| 运营系统 | 仅占位 | 卡池管理、活动策划、运营事件 |

---

## 二、评论系统实现计划

### 2.1 功能模块设计

```
CommentsView.vue
├── 舆情概览面板 (SentimentOverview)
│   ├── 情感分布图表 (正面/负面/中性)
│   ├── 今日评论数
│   ├── 热门标签云
│   └── 玩家满意度评分
├── AI评论生成器 (CommentGenerator)
│   ├── 玩家类型选择 (氪金大佬/剧情党/外观党/休闲玩家)
│   ├── 评论类型选择 (吐槽/推荐/剧情/梗图)
│   ├── 生成数量设置
│   └── 消耗积分提示 (20积分/次)
├── 评论列表 (CommentList)
│   ├── 评论卡片 (头像、内容、情感标签、点赞数)
│   ├── 筛选功能 (按类型/情感/玩家类型)
│   ├── 点赞/回复交互
│   └── 加载更多
└── 快捷操作栏
    ├── 生成评论按钮
    ├── 刷新数据按钮
    └── 导出报告按钮
```

### 2.2 数据结构

```typescript
// 评论数据 (本地存储)
interface GameComment {
  id: string;
  content: string;
  type: CommentType;
  sentiment: CommentSentiment;
  intensity: CommentIntensity;
  playerType: PlayerType;
  tags: string[];
  likes: number;
  replies: number;
  createdAt: string;
  gameId?: string;  // 关联的游戏
}

// 舆情统计
interface SentimentStats {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  satisfaction: number;  // 满意度 0-100
  hotTags: { tag: string; count: number }[];
}
```

### 2.3 预设评论模板库

创建 `src/data/templates/comments/index.ts`：

**吐槽类评论 (20条)**
- 爆率吐槽："抽了100连全是R卡，这爆率认真的吗？？？"
- 剧情吐槽："这剧情走向我服了，编剧是不是没谈过恋爱"
- 定价吐槽："一个皮肤要198，你怎么不去抢"
- BUG吐槽："又卡关了，这BUG什么时候修"

**推荐类评论 (15条)**
- 剧情推荐："剧情太甜了！姐妹们快冲！"
- 角色推荐："新老公太帅了，我直接嗨老公"
- 整体推荐："年度最佳乙游，不玩后悔"

**剧情讨论类 (15条)**
- 猜测向："我觉得男主背后一定有故事"
- 讨论向："第5章那个选择你们怎么选的？"
- 感慨向："这结局我哭死，太感人了"

**梗图/玩梗类 (10条)**
- "老公说他心里有我"
- "钱包：你清高，你了不起"
- "抽卡前 vs 抽卡后"

### 2.4 实现步骤

#### Step 1: 创建评论数据存储 (commentStore.ts)

```typescript
export const useCommentStore = defineStore('comment', () => {
  // State
  const comments = ref<GameComment[]>([]);
  const sentimentStats = ref<SentimentStats>({
    total: 0, positive: 0, negative: 0, neutral: 0, satisfaction: 85, hotTags: []
  });
  
  // Actions
  const generateComments = async (params: GenerateParams) => {
    // 1. 检查积分
    // 2. 调用AI或模板生成
    // 3. 更新统计数据
    // 4. 保存到本地
  };
  
  const likeComment = (id: string) => { /* 点赞逻辑 */ };
  const replyToComment = (id: string, content: string) => { /* 回复逻辑 */ };
  const getCommentsByFilter = (filter: FilterOptions) => { /* 筛选逻辑 */ };
  
  return { comments, sentimentStats, generateComments, likeComment };
});
```

#### Step 2: 创建舆情概览组件 (SentimentOverview.vue)

- 使用 Vant 的 Circle 组件显示满意度
- 使用自定义进度条显示情感分布
- 标签云展示热门关键词

#### Step 3: 创建评论生成器组件 (CommentGenerator.vue)

- 玩家类型选择器（单选）
- 评论类型选择器（可多选）
- 数量滑块（1-10条）
- 积分消耗提示
- 生成按钮（带 loading 状态）

#### Step 4: 创建评论列表组件 (CommentList.vue)

- 评论卡片设计（头像、昵称、内容、标签、互动按钮）
- 筛选栏（下拉选择器）
- 下拉刷新 / 上拉加载更多

#### Step 5: 整合 CommentsView.vue

布局结构：
```
<template>
  <div class="comments-view">
    <!-- 舆情概览 -->
    <SentimentOverview :stats="sentimentStats" />
    
    <!-- 生成器 -->
    <CommentGenerator @generate="handleGenerate" />
    
    <!-- 筛选栏 -->
    <CommentFilter v-model="filter" />
    
    <!-- 评论列表 -->
    <CommentList 
      :comments="filteredComments" 
      @like="handleLike"
      @reply="handleReply"
    />
  </div>
</template>
```

---

## 三、运营系统实现计划

### 3.1 功能模块设计

```
OperationView.vue
├── 数据概览面板 (OperationDashboard)
│   ├── 今日收入
│   ├── 活跃玩家数
│   ├── 卡池抽取次数
│   └── 活动参与率
├── 卡池管理 (GachaManager)
│   ├── 当前卡池列表
│   ├── 创建新卡池
│   │   ├── UP角色选择
│   │   ├── 概率配置 (SSR/SR/R)
│   │   ├── 时间设置
│   │   └── 预算设置
│   └── 卡池数据分析
├── 活动中心 (EventCenter)
│   ├── 进行中的活动
│   ├── 创建活动
│   │   ├── 活动类型选择 (节日/生日/联动)
│   │   ├── 奖励配置
│   │   ├── 玩法规则
│   │   └── 预算设置
│   └── 活动效果分析
├── 运营事件 (OperationIncidents)
│   ├── 待处理事件列表
│   │   ├── 爆率争议
│   │   ├── 剧情雷点
│   │   └── 福利节奏
│   └── 事件处理决策
└── 福利发放 (WelfareCenter)
    ├── 全服补偿
    ├── 登录奖励
    └── 兑换码生成
```

### 3.2 数据结构

```typescript
// 卡池数据
interface GachaPool {
  id: string;
  name: string;
  upCharacters: string[];  // UP角色ID
  rates: {
    ssr: number;  // 默认 2%
    sr: number;   // 默认 8%
    r: number;    // 默认 90%
  };
  startTime: string;
  endTime: string;
  budget: BudgetLevel;
  totalDraws: number;
  revenue: number;
}

// 活动数据
interface GameEvent {
  id: string;
  type: EventType;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  rewards: string[];
  mechanics: string[];
  budget: BudgetLevel;
  participants: number;
  status: 'upcoming' | 'ongoing' | 'ended';
}

// 运营事件
interface OperationIncident {
  id: string;
  type: IncidentType;
  name: string;
  description: string;
  severity: IncidentSeverity;
  status: 'pending' | 'processing' | 'resolved';
  playerReactions: string[];
  selectedSolution?: IncidentSolution;
  impact: {
    reputation: number;  // 声誉影响
    revenue: number;     // 收入影响
    players: number;     // 玩家流失
  };
}

// 运营数据
interface OperationStats {
  dailyRevenue: number;
  activePlayers: number;
  totalDraws: number;
  eventParticipation: number;
  reputation: number;  // 游戏声誉 0-100
}
```

### 3.3 预设运营事件库

创建 `src/data/templates/incidents/index.ts`：

**爆率争议事件 (5个)**
1. "百连无SSR" - 玩家连续100抽未获得SSR角色
2. "UP角色不出" - UP角色概率被质疑
3. "暗改爆率" - 玩家怀疑官方暗改概率
4. "对比其他游戏" - 玩家对比竞品游戏爆率
5. "氪金无回报" - 重氪玩家反馈体验差

**剧情雷点事件 (5个)**
1. "角色OOC" - 角色行为不符合设定
2. "剧情逻辑bug" - 剧情出现逻辑漏洞
3. "结局烂尾" - 玩家对结局不满意
4. "CP争议" - 玩家对CP安排不满
5. "敏感内容" - 剧情涉及敏感话题

**福利节奏事件 (5个)**
1. "福利太少" - 玩家认为福利不够
2. "肝度太高" - 活动要求过于肝
3. "逼氪嫌疑" - 玩家认为在逼氪
4. "对比外服" - 对比外服福利差异
5. "节日无活动" - 重要节日没有活动

### 3.4 实现步骤

#### Step 1: 创建运营数据存储 (operationStore.ts)

```typescript
export const useOperationStore = defineStore('operation', () => {
  // State
  const gachaPools = ref<GachaPool[]>([]);
  const events = ref<GameEvent[]>([]);
  const incidents = ref<OperationIncident[]>([]);
  const stats = ref<OperationStats>({
    dailyRevenue: 0, activePlayers: 0, totalDraws: 0, 
    eventParticipation: 0, reputation: 80
  });
  
  // Actions
  const createGachaPool = (pool: GachaPool) => { /* 创建卡池 */ };
  const createEvent = (event: GameEvent) => { /* 创建活动 */ };
  const handleIncident = (id: string, solution: IncidentSolution) => { /* 处理事件 */ };
  const sendWelfare = (type: string, content: string) => { /* 发放福利 */ };
  const simulateOneDay = () => { /* 模拟一天运营数据 */ };
  
  return { gachaPools, events, incidents, stats, createGachaPool };
});
```

#### Step 2: 创建数据概览组件 (OperationDashboard.vue)

- 4个数据卡片（收入、活跃玩家、抽卡数、参与率）
- 声誉值显示（进度条 + 表情图标）
- 快速操作按钮（创建卡池、创建活动）

#### Step 3: 创建卡池管理组件 (GachaManager.vue)

- 卡池列表（卡片式布局）
- 创建卡池弹窗
  - UP角色选择（从已有角色中选择）
  - 概率滑块（SSR 1-5%，SR 5-15%）
  - 时间选择器
  - 预算选择（低/中/高）

#### Step 4: 创建活动中心组件 (EventCenter.vue)

- 活动列表（时间轴样式）
- 创建活动弹窗
  - 活动类型选择
  - 奖励配置（多选）
  - 玩法规则输入
  - 预算选择

#### Step 5: 创建运营事件组件 (OperationIncidents.vue)

- 事件列表（紧急程度标识）
- 事件详情弹窗
  - 事件描述
  - 玩家反应展示
  - 解决方案选择（多个选项）
  - 预期影响提示

#### Step 6: 创建福利中心组件 (WelfareCenter.vue)

- 全服补偿（输入补偿内容）
- 登录奖励设置
- 兑换码生成器

#### Step 7: 整合 OperationView.vue

使用 Tab 切换不同模块：
```
<template>
  <div class="operation-view">
    <OperationDashboard :stats="stats" />
    
    <van-tabs v-model="activeTab">
      <van-tab title="卡池管理">
        <GachaManager />
      </van-tab>
      <van-tab title="活动中心">
        <EventCenter />
      </van-tab>
      <van-tab title="运营事件">
        <OperationIncidents />
      </van-tab>
      <van-tab title="福利发放">
        <WelfareCenter />
      </van-tab>
    </van-tabs>
  </div>
</template>
```

---

## 四、与积分系统的关联

### 4.1 评论系统积分消耗/奖励

| 操作 | 积分变化 | 说明 |
|------|---------|------|
| 生成评论 | -20 | AI生成评论消耗 |
| 首次查看评论 | +10 | 成就奖励 |
| 处理负面评论 | +5 | 维护社区氛围 |
| 评论获赞10+ | +10 | 热门评论奖励 |

### 4.2 运营系统积分消耗/奖励

| 操作 | 积分变化 | 说明 |
|------|---------|------|
| 创建卡池 | -30 | 使用AI优化卡池 |
| 创建活动 | -20 | 使用AI生成活动方案 |
| 处理运营事件 | +15 | 成功处理事件奖励 |
| 日收入过万 | +50 | 成就奖励 |
| 声誉达90+ | +100 | 成就奖励 |

---

## 五、文件结构规划

```
src/
├── stores/
│   ├── points.ts           (已有)
│   ├── commentStore.ts     (新建)
│   └── operationStore.ts   (新建)
├── data/
│   └── templates/
│       ├── comments/       (新建)
│       │   └── index.ts    (评论模板库)
│       ├── incidents/      (新建)
│       │   └── index.ts    (运营事件模板库)
│       └── events/         (新建)
│           └── index.ts    (活动模板库)
├── views/
│   ├── CommentsView.vue    (重写)
│   ├── OperationView.vue   (重写)
│   └── creator/            (已有)
├── components/
│   ├── comments/           (新建)
│   │   ├── SentimentOverview.vue
│   │   ├── CommentGenerator.vue
│   │   ├── CommentList.vue
│   │   └── CommentFilter.vue
│   └── operation/          (新建)
│       ├── OperationDashboard.vue
│       ├── GachaManager.vue
│       ├── EventCenter.vue
│       ├── OperationIncidents.vue
│       └── WelfareCenter.vue
└── types/
    └── template.ts         (已有)
```

---

## 六、实施时间表

### 阶段一：评论系统 (2-3天)

| 天数 | 任务 | 产出 |
|------|------|------|
| Day 1 | 创建评论模板库、commentStore | 数据层完成 |
| Day 2 | 实现舆情概览、评论生成器 | 核心组件完成 |
| Day 3 | 实现评论列表、整合页面 | CommentsView完成 |

### 阶段二：运营系统 (3-4天)

| 天数 | 任务 | 产出 |
|------|------|------|
| Day 1 | 创建运营事件/活动模板库、operationStore | 数据层完成 |
| Day 2 | 实现数据概览、卡池管理 | 核心组件完成 |
| Day 3 | 实现活动中心、运营事件 | 核心组件完成 |
| Day 4 | 实现福利中心、整合页面 | OperationView完成 |

### 阶段三：联调优化 (1-2天)

| 天数 | 任务 | 产出 |
|------|------|------|
| Day 1 | 积分系统关联、数据持久化 | 功能完整 |
| Day 2 | UI优化、测试修复 | Demo可演示 |

**总计：6-9天完成**

---

## 七、技术要点

### 7.1 AI生成模拟

由于后端AI接口尚未实现，前端使用模板库 + 随机组合模拟AI生成：

```typescript
// 模拟AI生成评论
const generateAIComment = (playerType: PlayerType, commentType: CommentType) => {
  const templates = commentTemplates[commentType];
  const template = randomPick(templates);
  
  // 根据玩家类型替换关键词
  const keywords = getKeywordsByPlayerType(playerType);
  const content = template.replace(/\{keyword\}/g, randomPick(keywords));
  
  return {
    content,
    type: commentType,
    playerType,
    sentiment: analyzeSentiment(content),
    // ...
  };
};
```

### 7.2 数据持久化

使用 localStorage 存储所有数据：

```typescript
// 初始化时加载
onMounted(() => {
  commentStore.loadFromLocal();
  operationStore.loadFromLocal();
});

// 数据变化时保存
watch(() => commentStore.comments, () => {
  commentStore.saveToLocal();
}, { deep: true });
```

### 7.3 模拟运营数据

提供"模拟一天"功能，自动产生随机数据：

```typescript
const simulateOneDay = () => {
  // 生成随机收入
  stats.dailyRevenue = random(1000, 10000);
  
  // 生成随机活跃玩家
  stats.activePlayers = random(100, 1000);
  
  // 随机触发运营事件
  if (Math.random() < 0.3) {
    generateRandomIncident();
  }
  
  // 更新评论数据
  generateDailyComments();
};
```

---

## 八、验收标准

### 8.1 评论系统验收

- [ ] 可以生成不同类型的AI评论
- [ ] 评论列表正常显示，支持筛选
- [ ] 舆情概览数据准确
- [ ] 生成评论正确消耗积分
- [ ] 数据可以持久化保存

### 8.2 运营系统验收

- [ ] 可以创建卡池并设置概率
- [ ] 可以创建活动并配置奖励
- [ ] 可以处理运营事件
- [ ] 数据概览实时更新
- [ ] 可以发放福利
- [ ] 数据可以持久化保存

### 8.3 整体验收

- [ ] 两个系统与积分系统正常联动
- [ ] 移动端UI显示正常
- [ ] 操作流程顺畅无卡顿
- [ ] 可以作为完整Demo演示

---

**计划版本**: v1.0  
**创建时间**: 2026-03-02  
**预计完成**: 6-9个工作日
