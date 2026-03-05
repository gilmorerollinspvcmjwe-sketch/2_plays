# Task 12: 世界变化系统 实现计划

## 概述

Task 12 世界变化系统模拟游戏外部环境的变化，包括：
1. 竞品系统 - 其他游戏公司的动态
2. 市场热点 - 题材热度轮换
3. 行业事件 - 政策/展会/技术变化

这些变化会实时反馈到公司/项目/角色/剧情数据中。

---

## 一、系统架构设计

### 1.1 核心模块结构

```
WorldChangeSimulator
├── CompetitorSystem (竞品系统)
│   ├── 生成3-5个虚拟竞品
│   ├── 竞品状态变化（运营中/上新/凉凉）
│   └── 市场份额计算
│
├── MarketTrendSystem (市场热点)
│   ├── 题材热度轮换（30天周期）
│   ├── 季节热点（节日/假期）
│   └── 社会热点事件
│
└── IndustryEventSystem (行业事件)
    ├── 游戏展会
    ├── 政策变化
    └── 技术革新
```

### 1.2 数据流

```
世界变化
    │
    ├── 竞品变化 ──────────→ 项目.DAU ±10%
    │                           项目.新增 ±15%
    │
    ├── 市场热点 ──────────→ 角色.收入 ±30%
    │                           项目.评分 ±0.5
    │
    └── 行业事件 ──────────→ 公司.支出 ±成本
                                公司.声誉 ±影响
                                项目.口碑 ±影响
```

---

## 二、详细设计

### 2.1 竞品系统

#### 竞品数据结构
```typescript
interface Competitor {
  id: string;
  name: string;
  genre: string;        // 题材：甜宠/虐恋/悬疑
  style: string;        // 风格：唯美/写实/二次元
  releaseDate: number;  // 上线时间
  state: '运营中' | '上线新版本' | '凉凉' | '即将上线';
  
  // 表现数据
  rating: number;       // 评分 1-10
  dau: number;          // DAU
  marketShare: number;  // 市场份额 0-1
  recentTrend: '上升' | '平稳' | '下滑';
}
```

#### 竞品生成规则
- 初始生成3-5个竞品
- 每个竞品随机分配题材/风格
- 状态分布：运营中70%，新版本15%，凉凉15%

#### 竞品状态变化
```
每10天检查一次状态变化：

运营中 → (评分<4) → 凉凉
运营中 → (评分>8) → 上线新版本
上线新版本 → (新版本表现好) → 运营中
上线新版本 → (评分<5) → 凉凉
```

#### 对项目的影响
```
竞品评分 > 你的评分 + 1分 → DAU -10%
竞品上线新版本 → 你的活跃 -15%
竞品凉凉 → 你的新增 +10%
竞品市场份额 > 30% → 你的DAU -5%
```

---

### 2.2 市场热点系统

#### 题材热度
```typescript
interface GenreTrend {
  genre: string;        // 甜宠/虐恋/悬疑/治愈
  heat: number;         // 0-1.5 热度值
  trend: '上升' | '平稳' | '下降';
  cycleDay: number;      // 周期天数
}

// 默认周期：30天
// 甜宠：1.0 → 0.8 → 0.6 → 0.8 (循环)
// 虐恋：0.7 → 1.0 → 0.8 → 0.7 (循环)
// 悬疑：0.5 → 0.6 → 1.0 → 0.5 (循环)
```

#### 季节热点
```typescript
interface SeasonalHot {
  name: string;         // 春节/情人节/周年庆/国庆
  multiplier: number;    // 收益倍数 1.0-1.5
  startDay: number;      // 开始日期
  endDay: number;        // 结束日期
  affectedGenres: string[]; // 影响题材
}
```

#### 对项目/角色的影响
```
题材热度 > 1.0 → 该题材角色收入 +30%
题材热度 < 0.7 → 该题材角色收入 -20%
题材热度上升 → 该题材角色讨论度 +20%
题材热度下降 → 该题材角色流失风险 +10%

季节热点期间 → 全局收入 +20%
情人节 → 甜宠类收入 +40%
周年庆 → 全局收入 +50%
```

---

### 2.3 行业事件系统

#### 事件类型
```typescript
interface IndustryEvent {
  id: string;
  type: '展会' | '政策' | '技术' | '突发事件';
  name: string;
  description: string;
  severity: '低' | '中' | '高';
  
  // 影响
  companyImpact: {
    cash: number;        // 成本/收益
    reputation: number;   // 声誉变化
  };
  projectImpact: {
    dau: number;         // DAU变化
    rating: number;      // 评分变化
    newUsers: number;     // 新增变化
  };
}
```

#### 预定义事件库
```typescript
// 展会事件
- 参加ChinaJoy：成本+500，DAU+10%，声誉+5
- 参加TGS：成本+300，海外DAU+15%
- 举办线下联动：成本+200，本地活跃+8%

// 政策事件
- 版号收紧：新游戏上线难度+50%
- 审核加速：新游戏上线速度+30%
- 内容监管：某些角色/剧情需修改

// 技术事件
- 支持光追：研发成本+200，评分+0.3
- 云游戏支持：成本+100，DAU+5%
- AI技术突破：研发效率+20%
```

#### 触发规则
```
每15天触发一次行业事件
随机选择事件类型
严重程度分布：低60%，中30%，高10%
```

---

## 三、对公司/项目/角色/剧情的影响反馈

### 3.1 影响传导表

| 变化源 | 影响目标 | 影响项 | 计算方式 |
|--------|----------|--------|----------|
| 竞品评分高 | 项目 | DAU | -10% |
| 竞品上新 | 项目 | 活跃 | -15% |
| 竞品凉凉 | 项目 | 新增 | +10% |
| 竞品份额高 | 项目 | DAU | -5% |
| 题材热度高 | 角色 | 收入 | +30% |
| 题材热度低 | 角色 | 收入 | -20% |
| 题材热度升 | 角色 | 讨论度 | +20% |
| 季节热点 | 项目 | 收入 | +20%~50% |
| 展会参加 | 公司 | 支出 | +成本 |
| 展会效果 | 项目 | DAU | +10% |
| 政策变化 | 项目 | 上线难度 | ±50% |
| 技术革新 | 项目 | 评分 | +0.3 |

### 3.2 实时反馈示例

**示例1：竞品上线新版本**
```
事件：竞品"甜梦恋语"上线新版本
状态：运营中 → 上线新版本

影响：
├── 项目.DAU -= 150 (-15%)
├── 项目.活跃度 -= 10%
├── 你的玩家.满意度 -= 3
└── 评论.新增 ~20条关于竞品的讨论
```

**示例2：市场热点切换**
```
事件：虐恋题材热度从0.7上升到1.0

影响：
├── 虐恋类角色收入 += 30%
├── 虐恋类角色讨论度 += 20%
├── 项目.评分 += 0.2 (因为热门)
└── 告白墙.虐恋相关 += 5条
```

**示例3：参加Chinajoy**
```
事件：公司决定参加ChinaJoy

成本：-500钻石
收益：
├── 项目.DAU += 100 (+10%)
├── 项目.新增 += 50 (+5%)
├── 公司.声誉 += 5
├── 告白墙.出现"期待CJ"相关
└── 下一周期展会曝光 +1000
```

---

## 四、代码实现

### 4.1 文件结构
```
src/engine/simulation/
├── worldSimulator.ts        # 主模拟器
├── competitorSystem.ts      # 竞品系统
├── marketTrendSystem.ts     # 市场热点系统
└── industryEventSystem.ts   # 行业事件系统
```

### 4.2 核心接口

```typescript
// worldSimulator.ts
export interface WorldImpact {
  company: {
    cashChange: number;
    reputationChange: number;
  };
  project: {
    dauChange: number;
    ratingChange: number;
    newUsersChange: number;
  };
  characters: Map<string, {
    revenueChange: number;
    discussionChange: number;
  }>;
}

export class WorldSimulator {
  // 初始化
  initialize(day: number): void;
  
  // 每tick更新
  update(day: number): WorldImpact;
  
  // 竞品相关
  getCompetitorEffect(): CompetitorEffect;
  updateCompetitorState(): void;
  
  // 市场热点
  getGenreHeat(genre: string): number;
  getSeasonalMultiplier(): number;
  
  // 行业事件
  triggerIndustryEvent(): IndustryEvent | null;
  applyEventEffect(event: IndustryEvent): void;
}
```

---

## 五、实施步骤

### Step 1: 创建竞品系统 (0.5天)
- competitorSystem.ts
- 竞品生成、状态变化、影响计算

### Step 2: 创建市场热点系统 (0.5天)
- marketTrendSystem.ts
- 题材热度轮换、季节热点

### Step 3: 创建行业事件系统 (0.5天)
- industryEventSystem.ts
- 事件定义、触发、影响

### Step 4: 创建主模拟器 (0.5天)
- worldSimulator.ts
- 整合三个子系统、统一影响输出

### Step 5: 集成到simulationStore (0.5天)
- 与现有模拟引擎对接

---

## 六、验收标准

- [ ] 竞品系统正确生成3-5个竞品
- [ ] 竞品状态按规则变化
- [ ] 竞品对DAU/新增有真实影响
- [ ] 题材热度30天周期轮换
- [ ] 季节热点正确触发
- [ ] 行业事件15天触发一次
- [ ] 事件对公司/项目/角色有真实影响
- [ ] 所有影响正确传导到数据
- [ ] 与simulationStore正确集成
