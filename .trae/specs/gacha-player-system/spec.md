# 抽卡模拟器与玩家系统 Spec

## Why
当前游戏只能配置卡池概率，但无法看到玩家实际抽卡结果，缺少乙游最核心的"欧皇/非酋"反差体验。需要实现真实的抽卡模拟系统、玩家生命周期系统、多平台评论系统，让玩家（游戏创作者）体验运营方的视角，感受玩家在概率面前的众生相。

## What Changes
- **新增抽卡模拟系统**：模拟真实玩家抽卡行为，记录抽卡结果
- **新增欧皇/非酋榜单**：展示极端案例，制造反差感
- **新增玩家生命周期系统**：新玩家→活跃→付费→流失/留存
- **新增多平台评论系统**：抖音、小红书、微博、B 站等不同平台风格的评论
- **新增社区舆论发酵系统**：评论点赞、热门评论、节奏发酵
- **新增角色人气系统**：角色人气影响卡池收益

## Impact
- **Affected specs**: 扩展评论系统、运营系统、角色系统
- **Affected code**: 
  - `src/stores/operationStore.ts` - 添加抽卡模拟逻辑
  - `src/stores/commentStore.ts` - 扩展多平台评论
  - `src/stores/gameStore.ts` - 添加角色人气
  - 新增 `src/stores/playerStore.ts` - 玩家行为模拟
  - 新增 `src/components/gacha/GachaSimulator.vue` - 抽卡模拟器
  - 新增 `src/components/community/PlatformComments.vue` - 多平台评论

## ADDED Requirements

### Requirement 1: 抽卡模拟系统
系统 SHALL 提供真实的玩家抽卡行为模拟功能：
- 模拟 100-1000 个虚拟玩家参与卡池抽卡
- 记录每个玩家的抽卡次数、SSR 数量、总消耗
- 计算"幸运值"（实际出货概率/期望概率）
- 支持单抽/十连的抽卡动画和播报

#### Scenario: 欧皇诞生
- **WHEN** 玩家创建卡池并设置 SSR 概率为 2%
- **THEN** 系统模拟 500 个玩家抽卡，其中约 10 个玩家一发入魂（欧皇）
- **THEN** 显示欧皇榜前 10 名，展示"XX 玩家单抽出 SSR！"

#### Scenario: 非酋沉船
- **WHEN** 卡池概率较低（1%）
- **THEN** 系统生成非酋榜，展示"XX 玩家 150 抽未出 SSR"
- **THEN** 触发非酋节奏事件，声誉下降

### Requirement 2: 欧皇/非酋榜单
系统 SHALL 提供实时滚动的抽卡播报和榜单：
- 欧皇榜：按"最少抽数出 SSR"排序
- 非酋榜：按"最多抽数未出 SSR"排序
- 实时播报："玩家 XXX 抽到了 SSR！"
- 幸运值分布图：展示玩家群体的运气分布

### Requirement 3: 玩家生命周期系统
系统 SHALL 模拟真实的玩家行为模型：
- 新玩家：注册→新手引导→首次抽卡
- 活跃玩家：每日登录→做任务→抽卡
- 付费玩家：根据爆率/活动决定是否充值
- 流失玩家：爆率太低/剧情太烂→退坑→触发退坑评论
- 回归玩家：真香→触发回归评论

#### Scenario: 玩家流失
- **WHEN** 连续设置 3 个"毒池"（SSR 概率<1.5%）
- **THEN** 大量玩家流失，活跃玩家数下降 30%
- **THEN** 触发退坑评论："这游戏不值得，退坑了"
- **THEN** 声誉下降 10 点

#### Scenario: 真香回归
- **WHEN** 设置高爆率"良心池"（SSR 概率>3%）
- **THEN** 部分流失玩家回归
- **THEN** 触发真香评论："还是舍不得老公们，我回来了"

### Requirement 4: 多平台评论系统
系统 SHALL 提供不同平台风格的评论展示：
- **抖音**（抖阴）：短视频风格，"家人们谁懂啊"、"绝绝子"
- **小红书**（红书）：种草风格，"姐妹们冲"、"亲测好用"
- **微博**（围脖）：热搜风格，"XXX 塌房"、"求图"
- **B 站**（B 站）：弹幕风格，"前方高能"、"泪目"
- **贴吧**（贴 Bar）：老哥风格，"有一说一"、"白嫖党"

每个平台 SHALL 有独特的：
- 评论文案风格
- 点赞/转发机制
- 热门评论排序
- 平台特有 emoji 和梗

### Requirement 5: 社区舆论发酵系统
系统 SHALL 提供评论传播和节奏发酵机制：
- 评论有点赞数，高赞评论置顶
- 负面评论超过阈值（100 赞）触发"节奏事件"
- 需要消耗资源"控评"或"发福利平息"
- 舆论热度值：0-100，影响声誉变化速度

#### Scenario: 节奏发酵
- **WHEN** 一条负面评论获得 200 个赞
- **THEN** 触发"节奏事件"，声誉每小时下降 2 点
- **THEN** 需要选择：发福利（消耗钻石）/控评（消耗金币）/装死
- **THEN** 处理不当引发二次节奏

### Requirement 6: 角色人气系统
系统 SHALL 提供角色人气与卡池收益联动：
- 每个角色有"人气值"（0-100）
- 人气值影响该角色 UP 卡池的收入
- 角色讨论热度：评论中提及次数
- CP 热度：两个角色同时被提及的次数

#### Scenario: 人气角色 UP
- **WHEN** 创建"人气角色"（人气>80）的 UP 卡池
- **THEN** 卡池收入 +50%
- **THEN** 触发"老公来了"、"必抽"等评论
- **THEN** 角色人气进一步上升

#### Scenario: 冷门角色 UP
- **WHEN** 创建"冷门角色"（人气<30）的 UP 卡池
- **THEN** 卡池收入 -30%
- **THEN** 触发"为什么不是我老公"、"跳过"等评论
- **THEN** 可能触发"要求换人"节奏

## MODIFIED Requirements

### Requirement: 评论系统扩展
**原需求**：评论系统只有 4 种类型（吐槽/推荐/讨论/梗图）和 4 种玩家类型

**修改后**：
- 增加平台维度：抖音、小红书、微博、B 站、贴吧
- 每个平台有独特的文案风格和梗库
- 评论有点赞、转发、回复数
- 评论有"热度值"，影响是否触发节奏事件

### Requirement: 运营事件系统
**原需求**：20+ 运营事件模板

**修改后**：
- 增加"节奏事件"：由负面评论发酵触发
- 增加"玩家流失事件"：由毒池/烂剧情触发
- 增加"真香回归事件"：由良心池触发
- 事件处理方案增加"控评"、"发福利"选项

## REMOVED Requirements
无

---

## 技术实现要点

### 1. 抽卡模拟算法
```typescript
interface GachaResult {
  playerId: string;
  draws: number;      // 抽了多少抽
  ssrCount: number;   // 出了几个 SSR
  srCount: number;
  rCount: number;
  luckValue: number;  // 幸运值 = 期望概率/实际概率
  isSSR: boolean;     // 是否出货
  totalCost: number;  // 总消耗（钻石）
}

function simulateGacha(
  playerCount: number,
  ssrRate: number,
  pityThreshold: number // 保底抽数
): GachaResult[]
```

### 2. 玩家状态机
```typescript
enum PlayerState {
  NEW = 'new',           // 新玩家
  ACTIVE = 'active',     // 活跃玩家
  PAYING = 'paying',     // 付费玩家
  AT_RISK = 'at_risk',   // 有流失风险
  LOST = 'lost',         // 已流失
  RETURNED = 'returned'  // 回归玩家
}
```

### 3. 多平台评论模板
```typescript
interface PlatformComment {
  platform: 'douyin' | 'xiaohongshu' | 'weibo' | 'bilibili' | 'tieba';
  content: string;
  likes: number;
  comments: number;
  shares: number;
  heat: number;  // 热度值
  style: {
    emoji: string[];
    slang: string[];  // 平台特有梗
    tone: string;     // 语气风格
  };
}
```

### 4. 舆论发酵算法
```typescript
interface PublicOpinion {
  heat: number;        // 热度 0-100
  sentiment: number;   // 情感 -100 到 100
  trend: 'up' | 'down' | 'stable';
  triggers: string[];  // 触发事件
}

function calculateOpinionHeat(
  comments: Comment[],
  events: Event[]
): PublicOpinion
```
