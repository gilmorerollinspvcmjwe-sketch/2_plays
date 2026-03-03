# 实现差距分析报告

**分析日期**: 2026-03-02  
**分析范围**: 抽卡模拟系统、多平台评论系统、舆论发酵系统、角色人气系统

---

## 📊 总体进度概览

| 系统 | 完成度 | 状态 |
|------|--------|------|
| 抽卡模拟系统 | 85% | ✅ 核心功能完成，缺少自动触发 |
| 多平台评论系统 | 90% | ✅ 模板库和 UI 完成，缺少自动生成 |
| 舆论发酵系统 | 75% | ⚠️ 算法完成，缺少实际影响 |
| 角色人气系统 | 70% | ⚠️ UI 展示完成，缺少联动 |
| 玩家生命周期系统 | 40% | ❌ 数据结构完成，缺少自动转换 |

**总体完成度**: **约 72%**

---

## ✅ 已完成功能清单

### 1. 抽卡模拟系统 (85%)

#### 已完成 ✅
- [x] `playerStore.ts` 创建完成
  - PlayerState 枚举（6 种状态）
  - Player 和 GachaResult 接口
  - 玩家创建和管理
- [x] 抽卡模拟算法
  - 单抽/十连支持
  - 保底机制（硬保底 + 软保底）
  - 幸运值计算
- [x] 欧皇/非酋榜单
  - `getLuckiestPlayers()` - 幸运值排序
  - `getUnluckiestPlayers()` - 非酋排序
  - 实时抽卡播报
- [x] UI 组件
  - `GachaSimulator.vue` - 抽卡动画和榜单展示
  - 幸运值分布图
  - 实时播报滚动

#### 缺失 ❌
- [ ] **玩家状态自动转换逻辑**
  - 缺少定时任务或触发器
  - 目前只在抽卡时更新状态，没有后台自动转换
- [ ] **与评论系统的联动**
  - 玩家流失时没有自动触发退坑评论
  - 玩家回归时没有自动触发真香评论

---

### 2. 多平台评论系统 (90%)

#### 已完成 ✅
- [x] 评论模板库 (`platformComments/index.ts`)
  - 抖音：20 条模板 ✅
  - 小红书：20 条模板 ✅
  - 微博：20 条模板 ✅
  - B 站：20 条模板 ✅
  - 贴吧：20 条模板 ✅
  - 平台特色用语和 emoji
  - 情感分类（positive/neutral/negative）
- [x] `commentStore.ts` 扩展
  - `GameComment` 接口（含 likes, shares, comments, heat）
  - `calculateCommentHeat()` - 热度算法
  - `updateCommentInteraction()` - 互动更新
  - `getHotComments()` - 热门评论
- [x] UI 组件
  - `PlatformComments.vue` - 多平台评论展示
  - `CommentsView.vue` - 评论页面集成

#### 缺失 ❌
- [ ] **评论模板数量不足**
  - Spec 要求：各平台 50 条
  - 当前实现：各平台 20 条
  - 缺少：各平台 30 条（共 150 条）
- [ ] **自动评论生成**
  - 缺少根据游戏事件自动生成评论的逻辑
  - 缺少退坑评论自动生成
  - 缺少真香回归评论自动生成
- [ ] **角色提及统计**
  - 没有分析评论内容统计角色提及次数
  - 讨论热度数据不准确

---

### 3. 舆论发酵系统 (75%)

#### 已完成 ✅
- [x] 舆论数据结构
  - `PublicOpinion` 接口（heat, sentiment, trend）
  - `RhythmEvent` 接口（节奏事件）
- [x] 热度算法
  - 点赞 + 转发×2 + 回复×0.5 + 时间衰减
- [x] 节奏事件触发
  - `checkRhythmEvents()` - 负面评论>100 热度触发
  - 节奏等级（small/large/fire）
- [x] 控评系统
  - `controlOpinion()` - 3 种方式（welfare/control/ignore）
  - 消耗资源计算
- [x] UI 集成
  - `CommentsView.vue` - 控评操作面板
  - 舆论概览卡片

#### 缺失 ❌
- [ ] **节奏事件对声誉的实际影响**
  - Spec 要求：小节奏 -2/小时，大节奏 -5/小时，炎上 -10/小时
  - 当前实现：只记录 `reputationImpact`，没有定时扣除
  - 缺少：定时任务或手动触发声誉扣除
- [ ] **舆论热度仪表盘 UI**
  - `OperationView.vue` 没有显示舆论热度
  - 缺少 0-100 可视化进度条
- [ ] **二次节奏恶化逻辑**
  - 装死失败后的恶化逻辑已实现，但没有实际影响声誉

---

### 4. 角色人气系统 (70%)

#### 已完成 ✅
- [x] 数据结构扩展
  - `CharacterPopularity` 接口
  - `Character` 接口添加 `popularity` 字段
- [x] 人气值管理
  - `initCharacterPopularity()` - 初始化
  - `updateCharacterPopularity()` - 更新
  - `getCharacterPopularity()` - 获取
  - `getPopularityRanking()` - 排行榜
- [x] 人气加成计算
  - `calculatePopularityBonus()` - 人气>80 为 1.5x，人气<30 为 0.7x
- [x] UI 展示
  - `GameDetailView.vue` - 角色人气徽章
  - 人气排行榜（前 3 名特殊样式）
  - 人气进度条

#### 缺失 ❌
- [ ] **人气与卡池收益的实际联动**
  - `operationStore.ts` 的 `createGachaPool()` 和 `simulatePoolGacha()` 没有应用人气加成
  - Spec 要求：人气>80 收入 +50%，人气<30 收入 -30%
  - 当前实现：只计算加成倍率，没有实际应用到收入
- [ ] **CP 热度计算和展示**
  - `cpHeat` 字段存在，但没有实际计算逻辑
  - 缺少：统计两个角色同时被评论提及的次数
  - 缺少：CP 热度 UI 展示
- [ ] **评论中角色提及统计**
  - 没有分析评论内容提取角色名
  - 讨论热度 (`discussionHeat`) 没有实际更新

---

### 5. 玩家生命周期系统 (40%)

#### 已完成 ✅
- [x] 数据结构
  - PlayerState 枚举（NEW, ACTIVE, PAYING, AT_RISK, LOST, RETURNED）
  - `Player` 接口包含状态字段
- [x] 状态判断逻辑
  - `updatePlayerState()` - 根据抽卡次数、登录时间、爆率判断状态
  - `getPlayerStateStats()` - 状态统计
- [x] UI 基础
  - 玩家状态数据可获取

#### 缺失 ❌
- [ ] **玩家状态自动转换**
  - 缺少定时任务定期检查玩家状态
  - 当前只在抽卡时更新状态，不抽卡的玩家不会自动变为流失
  - Spec 要求：超过 30 天未登录自动变为流失
- [ ] **流失/回归事件自动触发**
  - `operationStore.ts` 没有 `triggerLossEvent()` 方法
  - `operationStore.ts` 没有 `triggerReturnEvent()` 方法
- [ ] **退坑评论自动生成**
  - Spec 要求：玩家流失时自动生成"这游戏不值得，退坑了"评论
  - 当前实现：无
- [ ] **真香回归评论自动生成**
  - Spec 要求：玩家回归时自动生成"还是舍不得老公们，我回来了"评论
  - 当前实现：无
- [ ] **玩家状态统计 UI**
  - `OperationView.vue` 没有显示活跃/流失/回归玩家数量
  - 缺少：玩家生命周期分布卡片

---

## 🔴 高优先级缺失功能（影响核心玩法闭环）

### Priority 1: 玩家生命周期自动转换

**问题**: 玩家状态只在抽卡时更新，不抽卡的玩家永远不会自动流失

**需要实现**:
```typescript
// playerStore.ts
function updatePlayerStatesAutomatically() {
  // 定期检查所有玩家
  players.value.forEach(player => {
    const daysSinceLastLogin = getDaysSince(player.lastLoginAt);
    
    // 超过 30 天未登录 -> 流失
    if (daysSinceLastLogin > 30 && player.state !== PlayerState.LOST) {
      player.state = PlayerState.LOST;
      // 触发退坑评论生成
      generateLossComment(player);
    }
    
    // 流失玩家超过 60 天 -> 可能回归
    if (daysSinceLastLogin > 60 && player.state === PlayerState.LOST) {
      if (Math.random() < 0.3) { // 30% 回归概率
        player.state = PlayerState.RETURNED;
        // 触发真香评论生成
        generateReturnComment(player);
      }
    }
  });
}
```

**影响**: 
- 无法自动触发退坑/真香评论
- 玩家数据不真实
- 缺少"毒池→流失→退坑"的爽点闭环

---

### Priority 2: 退坑/真香评论自动生成

**问题**: 评论系统独立运行，不与玩家状态联动

**需要实现**:
```typescript
// commentStore.ts
function generateLossComment(player: Player) {
  const templates = [
    "这游戏不值得，退坑了",
    "爆率太毒了，再见",
    "累了，不会再爱了"
  ];
  // 生成负面评论并添加到评论列表
}

function generateReturnComment(player: Player) {
  const templates = [
    "还是舍不得老公们，我回来了",
    "真香，重新下载了",
    "听说最近有良心池，回来看看"
  ];
  // 生成正面评论并添加到评论列表
}
```

**影响**:
- 缺少玩家流失的反馈
- 缺少真香回归的爽感
- 评论系统缺乏动态变化

---

### Priority 3: 角色人气与卡池收益实际联动

**问题**: 人气加成只计算不应用

**需要实现**:
```typescript
// operationStore.ts - simulatePoolGacha()
function simulatePoolGacha(poolId: string, playerCount: number) {
  const pool = gachaPools.value.find(p => p.id === poolId);
  if (!pool) return;
  
  // 获取 UP 角色人气加成
  let popularityBonus = 1.0;
  if (pool.upCharacters.length > 0) {
    const gameStore = useGameStore();
    const charId = pool.upCharacters[0]; // 假设第一个是 UP 角色
    popularityBonus = gameStore.calculatePopularityBonus(charId);
  }
  
  // 应用加成到收入
  const baseRevenue = calculateBaseRevenue(pool);
  pool.revenue = baseRevenue * popularityBonus;
}
```

**影响**:
- 人气系统变成纯展示，没有实际作用
- 玩家感受不到"人气角色 UP=必抽"的爽感
- 缺少"冷门角色 UP=跳过"的吐槽

---

### Priority 4: 节奏事件对声誉的实际影响

**问题**: 节奏事件只有提示，没有实际惩罚

**需要实现**:
```typescript
// commentStore.ts 或 operationStore.ts
function applyRhythmDamage() {
  // 每小时调用一次
  rhythmEvents.value.forEach(event => {
    if (!event.resolved) {
      // 根据节奏等级扣除声誉
      const operationStore = useOperationStore();
      operationStore.stats.reputation += event.reputationImpact;
      
      // 持续时间减少
      event.duration--;
      if (event.duration <= 0) {
        event.resolved = true;
      }
    }
  });
}
```

**影响**:
- 舆论系统没有紧迫感
- 玩家不重视控评操作
- 缺少"节奏发酵→声誉下降→需要处理"的玩法

---

## 🟡 中优先级缺失功能（影响体验完整性）

### Priority 5: CP 热度计算和展示

**需要实现**:
- 分析评论内容，统计两个角色同时被提及的次数
- 在 `GameDetailView.vue` 添加 CP 热度展示
- 热门 CP 排行榜

---

### Priority 6: 评论中角色提及统计

**需要实现**:
```typescript
// commentStore.ts
function analyzeCommentMentions(comment: GameComment) {
  const gameStore = useGameStore();
  const characters = gameStore.currentGame?.characters || [];
  
  characters.forEach(char => {
    if (comment.content.includes(char.name)) {
      gameStore.updateCharacterPopularity(char.id, {
        discussionHeat: 1
      });
    }
  });
}
```

---

### Priority 7: 舆论热度仪表盘 UI

**位置**: `OperationView.vue` - 运营事件 Tab

**需要实现**:
- 显示当前舆论热度（0-100 进度条）
- 显示情感倾向（正/负）
- 显示趋势（上升/下降/稳定）

---

### Priority 8: 玩家状态统计 UI

**位置**: `OperationView.vue` - 玩家数据 Tab

**需要实现**:
```vue
<van-card title="玩家生命周期统计">
  <div>活跃玩家：{{ activeCount }}</div>
  <div>流失玩家：{{ lostCount }}</div>
  <div>回归玩家：{{ returnedCount }}</div>
  <div>有风险玩家：{{ atRiskCount }}</div>
</van-card>
```

---

### Priority 9: 评论模板数量扩充

**当前**: 各平台 20 条  
**Spec 要求**: 各平台 50 条  
**需要补充**: 各平台 30 条（共 150 条）

**建议方向**:
- 抖音：增加"卡池分析"、"男主对比"、"活动攻略"类评论
- 小红书：增加"时装搭配"、"约会攻略"、"角色分析"类评论
- 微博：增加"官方互动"、"同人创作"、"剧情解析"类评论
- B 站：增加"二创视频"、"角色手书"、"剧情 MAD"类评论
- 贴吧：增加"数据分析"、"强度榜"、"攻略分享"类评论

---

## 🟢 低优先级优化（锦上添花）

### Priority 10: 新手引导系统集成

**状态**: `OnboardingGuide.vue` 组件已创建，但未在各页面添加引导标记

**需要实现**:
- 在 `OperationView.vue` 添加引导标记
- 在 `CommentsView.vue` 添加引导标记
- 在 `GameDetailView.vue` 添加引导标记

---

### Priority 11: 性能优化

**需要实现**:
- 虚拟列表（长列表场景）
  - 评论列表超过 100 条时
  - 抽卡记录超过 200 条时
- 1000 玩家模拟性能测试
  - 目标：<3 秒完成
- 评论加载优化
  - 分页加载
  - 懒加载

---

### Priority 12: 测试与验证

**需要实现**:
- 抽卡概率准确性测试
  - SSR 概率误差<1%
  - 保底机制 100% 触发
- 节奏触发逻辑测试
  - 负面评论>100 热度必触发
  - 节奏等级判定准确
- 移动端适配测试
  - 主流机型测试
  - 横竖屏适配

---

## 📋 缺失功能优先级排序

| 优先级 | 功能 | 影响范围 | 实现难度 | 预计工时 |
|--------|------|----------|----------|----------|
| **P0** | 玩家生命周期自动转换 | 核心玩法闭环 | 中 | 4 小时 |
| **P0** | 退坑/真香评论自动生成 | 核心爽点 | 中 | 3 小时 |
| **P0** | 人气与卡池收益联动 | 核心玩法 | 中 | 3 小时 |
| **P0** | 节奏事件对声誉的实际影响 | 核心玩法 | 低 | 2 小时 |
| **P1** | CP 热度计算和展示 | 角色系统完整性 | 中 | 4 小时 |
| **P1** | 评论中角色提及统计 | 数据准确性 | 中 | 3 小时 |
| **P1** | 舆论热度仪表盘 UI | UI 完整性 | 低 | 2 小时 |
| **P1** | 玩家状态统计 UI | UI 完整性 | 低 | 2 小时 |
| **P2** | 评论模板数量扩充 | 内容丰富度 | 低 | 4 小时 |
| **P2** | 新手引导集成 | 用户体验 | 低 | 3 小时 |
| **P2** | 性能优化 | 用户体验 | 高 | 6 小时 |
| **P2** | 测试与验证 | 质量保证 | 中 | 4 小时 |

**总计预计工时**: 约 40 小时（约 5 个工作日）

---

## 🎯 下一步行动建议

### 阶段一：核心玩法闭环（P0 优先级）

**目标**: 实现"毒池→流失→退坑评论"和"良心池→回归→真香评论"的完整闭环

**任务**:
1. 修改 `playerStore.ts` 添加 `updatePlayerStatesAutomatically()` 方法
2. 修改 `commentStore.ts` 添加 `generateLossComment()` 和 `generateReturnComment()` 方法
3. 修改 `operationStore.ts` 在 `simulatePoolGacha()` 中应用人气加成
4. 修改 `commentStore.ts` 添加定时任务或手动触发声誉扣除

**验收标准**:
- [ ] 设置毒池后，7 天内活跃玩家下降 30%
- [ ] 玩家流失时自动生成退坑评论
- [ ] 设置良心池后，部分流失玩家回归
- [ ] 玩家回归时自动生成真香评论
- [ ] 人气角色 UP 卡池收入 +50%
- [ ] 冷门角色 UP 卡池收入 -30%
- [ ] 节奏事件每小时自动扣除声誉

---

### 阶段二：数据完整性（P1 优先级）

**目标**: 完善数据统计和 UI 展示

**任务**:
1. 实现 CP 热度计算
2. 实现评论角色提及统计
3. 添加舆论热度仪表盘
4. 添加玩家状态统计卡片

**验收标准**:
- [ ] CP 热度准确统计
- [ ] 讨论热度基于实际提及次数
- [ ] OperationView 显示舆论热度
- [ ] OperationView 显示玩家状态分布

---

### 阶段三：内容丰富度（P2 优先级）

**目标**: 扩充评论模板，优化性能

**任务**:
1. 补充评论模板至各平台 50 条
2. 集成新手引导
3. 性能优化（虚拟列表、分页）
4. 测试与验证

**验收标准**:
- [ ] 各平台 50 条评论模板
- [ ] 新手引导覆盖所有核心页面
- [ ] 1000 玩家模拟<3 秒
- [ ] 抽卡概率误差<1%

---

## 📝 技术实现建议

### 1. 定时任务实现

**方案 A**: 使用 `setInterval`（简单，适合开发阶段）
```typescript
// playerStore.ts
setInterval(() => {
  updatePlayerStatesAutomatically();
}, 3600000); // 每小时检查一次
```

**方案 B**: 基于游戏时间的触发（推荐，适合正式版本）
```typescript
// operationStore.ts - simulateOneDay()
function simulateOneDay() {
  // 每日结算时检查玩家状态
  updatePlayerStatesAutomatically();
  // 每小时节奏伤害
  applyRhythmDamage();
}
```

### 2. 评论自动生成

**方案**: 在 `commentStore.ts` 添加事件监听
```typescript
function onPlayerLoss(player: Player) {
  generateLossComment(player);
}

function onPlayerReturn(player: Player) {
  generateReturnComment(player);
}
```

### 3. 人气联动

**方案**: 修改 `operationStore.ts` 的卡池模拟逻辑
```typescript
function simulatePoolGacha(poolId: string, playerCount: number) {
  const pool = gachaPools.value.find(p => p.id === poolId);
  if (!pool) return;
  
  const gameStore = useGameStore();
  let popularityBonus = 1.0;
  
  if (pool.upCharacters.length > 0) {
    const charId = pool.upCharacters[0];
    popularityBonus = gameStore.calculatePopularityBonus(charId);
  }
  
  // 应用加成到收入计算
  const baseRevenue = playerCount * 100; // 假设人均消耗 100
  pool.revenue = baseRevenue * popularityBonus;
}
```

---

## 📊 对比 Spec 的完整性

| Spec 要求 | 当前实现 | 差距 |
|-----------|----------|------|
| 抽卡模拟 100-1000 玩家 | ✅ 支持 | 无 |
| 欧皇/非酋榜单 | ✅ 已实现 | 无 |
| 实时抽卡播报 | ✅ 已实现 | 无 |
| 玩家生命周期 6 状态 | ⚠️ 数据结构完成，缺少自动转换 | 缺少自动触发 |
| 多平台评论（5 平台） | ✅ 已实现 | 模板数量不足 |
| 评论热度算法 | ✅ 已实现 | 无 |
| 节奏事件触发 | ✅ 已实现 | 缺少实际影响 |
| 控评系统（3 方式） | ✅ 已实现 | 无 |
| 角色人气值（0-100） | ✅ 已实现 | 无 |
| 人气影响卡池收益 | ⚠️ 计算完成，未应用 | 缺少实际应用 |
| CP 热度 | ❌ 未实现 | 完全缺失 |
| 退坑评论自动生成 | ❌ 未实现 | 完全缺失 |
| 真香回归评论自动生成 | ❌ 未实现 | 完全缺失 |

---

## 🎉 总结

### 已完成的亮点
1. ✅ **抽卡模拟算法完整**：保底机制、幸运值计算、实时播报
2. ✅ **多平台评论模板丰富**：5 个平台各 20 条，风格鲜明
3. ✅ **舆论发酵算法完善**：热度计算、节奏触发、控评系统
4. ✅ **角色人气 UI 美观**：排行榜、徽章、进度条
5. ✅ **代码结构清晰**：Store 分离、类型完整、注释详细

### 需要补全的核心
1. ❌ **玩家生命周期自动转换**：只有数据结构，没有实际触发
2. ❌ **退坑/真香评论自动生成**：缺少系统间联动
3. ❌ **人气与卡池收益实际联动**：计算完成但未应用
4. ❌ **节奏事件对声誉的实际影响**：只有记录没有扣除

### 下一步重点
**优先实现 P0 优先级的 4 个核心功能**，让玩家能体验到完整的"毒池→流失→退坑→良心池→回归→真香"的爽点闭环。

**预计需要 12 小时**（约 1.5 个工作日）完成 P0 功能。

---

**报告生成时间**: 2026-03-02  
**下次更新**: 实现 P0 功能后
