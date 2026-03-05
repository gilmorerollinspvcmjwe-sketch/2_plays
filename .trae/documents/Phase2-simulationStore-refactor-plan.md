# Phase 2: 重构 simulationStore.tick() 详细设计方案

## 状态: ✅ 已完成

**完成日期**: 2026-03-05  
**实施人员**: AI Assistant  
**验证状态**: 构建通过 ✓

---

## 一、现状分析

### 当前 simulationStore.tick() 的问题

```typescript
// 当前实现（简化）
async function tick(): Promise<SimulationResult | null> {
  // 1. 采样虚拟玩家 - 问题：与真实项目无关
  const sampledPlayers = playerPool.value.sample(200);
  
  // 2. 活动模拟 - 问题：使用硬编码活动
  const activityResult = activitySim.simulateBatch(sampledPlayers, getCurrentActivity());
  
  // 3. 告白墙模拟 - 问题：使用随机角色标签
  const confessionResult = confessionSim.simulateBatch(sampledPlayers, getCurrentCharacterTags());
  
  // 4. 同人作品模拟 - 问题：使用硬编码角色名
  const fanworkResult = fanworkSim.simulateBatch(sampledPlayers, getCurrentCharacterNames());
  
  // 5. 抽卡模拟 - 问题：纯随机，不考虑真实卡池配置
  const gachaCounts = { SSR: 0, SR: 0, R: 0, N: 0 };
  sampledPlayers.forEach(p => {
    const pulls = Math.floor(Math.random() * 10) + 1;
    for (let i = 0; i < pulls; i++) {
      const rand = Math.random();
      if (rand < 0.03) gachaCounts.SSR++;
      // ...
    }
  });
  
  // 6. 更新项目进度 - 唯一关联项目的地方
  developingProjects.forEach(project => {
    const teamEfficiency = employeeStore.getProjectTeamEfficiency(project.id);
    // 仅更新进度，不影响运营数据
  });
}
```

### 核心问题
1. **虚拟玩家池**：200个虚拟玩家，与真实项目数据完全无关
2. **硬编码活动**：使用预设活动模板，而非玩家创建的活动
3. **随机角色数据**：告白/同人使用硬编码角色名
4. **随机抽卡**：不考虑真实卡池配置和角色人气
5. **无质量影响**：剧情质量、角色人气不影响任何运营指标

---

## 二、重构目标

### 目标架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    重构后的 simulationStore.tick()                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  输入：                                                                      │
│  ├─ operatingProjects: 已发布的真实项目列表                                  │
│  ├─ projectQuality: 项目质量评分（角色+剧情+运营）                           │
│  ├─ gachaPools: 真实卡池配置                                                 │
│  ├─ events: 真实活动配置                                                     │
│  └─ historicalData: 历史运营数据                                             │
│                                                                              │
│  计算流程：                                                                   │
│  ├─ 1. 计算项目基础指标（满意度、留存率、付费率）                            │
│  ├─ 2. 应用运营操作影响（卡池/活动/福利）                                    │
│  ├─ 3. 生成真实玩家行为（抽卡/付费/留存）                                    │
│  ├─ 4. 生成真实UGC内容（评论/告白/同人）                                     │
│  └─ 5. 更新项目进度（开发中项目）                                            │
│                                                                              │
│  输出：                                                                       │
│  ├─ 真实运营数据（收入/玩家数/满意度）                                       │
│  ├─ 真实UGC内容（基于真实角色和剧情）                                        │
│  └─ 项目进度更新                                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 三、实施结果

### 3.1 已创建文件

| 文件 | 说明 |
|------|------|
| `src/types/simulation.ts` | 新增类型定义（ProjectOperationData, SimulationConfig, ProjectSimulationResult 等） |

### 3.2 已修改文件

| 文件 | 变更内容 |
|------|---------|
| `src/stores/simulationStore.ts` | 完全重构，添加新 state、核心算法、UGC生成、数据持久化 |

### 3.3 核心实现

#### 新增 State
- `projectOperationData: Map<string, ProjectOperationData>` - 项目运营数据映射
- `globalMetrics: GlobalMetrics` - 全局运营指标
- `projectComments: Map<string, ProjectComment[]>` - 项目评论
- `projectConfessions: Map<string, ProjectConfession[]>` - 项目告白

#### 核心算法
1. **calculateProjectBaseMetrics** - 基于项目质量计算满意度、留存率、付费率
2. **calculateOperationImpacts** - 计算运营操作对指标的影响
3. **generatePlayerBehavior** - 生成真实玩家行为数据
4. **calculateCommentSentiment** - 计算评论情感分布

#### UGC生成（使用真实数据）
1. **generateRealCharacterComments** - 基于真实角色的评论
2. **generateRealPlotComments** - 基于真实剧情的评论
3. **generateRealConfessions** - 基于真实角色的告白

#### 重构后的 tick() 方法
- 获取所有已发布项目
- 为每个项目计算运营数据（质量评分 → 基础指标 → 运营影响 → 玩家行为 → UGC内容）
- 更新全局指标
- 更新开发中项目进度
- 保存数据

#### 向后兼容
- 保留 `runLegacyTick()` 方法，当没有已发布项目时使用原有虚拟模拟

---

## 四、验证结果

### 构建验证
```
✓ built in 16.66s
✓ 663 modules transformed
✓ 无错误，无警告
```

### 功能验证
- [x] 项目发布后，运营数据基于真实项目计算
- [x] 角色人气影响抽卡收入
- [x] 剧情质量影响玩家满意度
- [x] 评论使用真实角色名和剧情标签
- [x] 告白使用真实角色数据
- [x] 数据持久化正常工作

---

## 五、关键代码片段

### 满意度计算
```typescript
// 基础满意度 0.5，根据质量调整
const baseSatisfaction = 0.5;
const qualityBonus = (projectQuality.totalScore - 0.5) * 0.4;
const satisfaction = Math.max(0, Math.min(1, baseSatisfaction + qualityBonus));
```

### 留存率计算
```typescript
// 基础留存率 60%，满意度影响 40%，角色吸引力影响 30%
const baseRetention = 0.6;
const satisfactionImpact = (satisfaction - 0.5) * 0.4;
const characterImpact = (characterAppeal - 0.5) * 0.3;
const retentionRate = Math.max(0.1, Math.min(0.95, baseRetention + satisfactionImpact + characterImpact));
```

### 付费率计算
```typescript
// 基础付费率 5%，角色人气影响 15%，剧情质量影响 5%
const basePayRate = 0.05;
const characterBonus = projectQuality.characterScore * 0.15;
const plotBonus = projectQuality.plotScore * 0.05;
const payRate = Math.max(0.01, Math.min(0.5, basePayRate + characterBonus + plotBonus));
```

---

## 六、后续工作

### Phase 3: 运营操作与数据关联
- 实现效果预测系统
- 改造 operationStore
- 创建预测弹窗和追踪面板

### Phase 4: 数据验证与优化
- 实现数据验证工具
- 添加性能优化
- 创建调试工具

---

## 七、总结

Phase 2 已成功完成，simulationStore.tick() 现在：
1. 使用真实项目数据生成运营指标
2. 角色人气影响抽卡收入和付费率
3. 剧情质量影响玩家满意度
4. UGC内容使用真实角色名和剧情标签
5. 支持数据持久化
6. 向后兼容（无项目时使用虚拟模拟）

**下一步**: 实施 Phase 3，建立运营操作与数据的关联。
