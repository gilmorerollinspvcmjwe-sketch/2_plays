# 完全动态真实的 AI 模拟市场动态系统 Spec

## Why

当前市场动态系统（MarketDashboard）存在以下问题：

1. **数据源不完整** - 竞品新闻（competitorNews）未定义，导致市场风险评估功能失效
2. **静态数据过多** - 节日活动、市场风险等为静态计算，缺乏真实动态变化
3. **AI 模拟不足** - 竞品行为、市场趋势变化缺乏 AI 驱动的动态模拟
4. **数据孤岛** - WorldSimulator 已实现但未充分利用，与 UI 展示脱节
5. **用户体验割裂** - 市场动态展示不够直观，缺乏交互性

需要构建一个完全动态、真实、AI 驱动的市场动态模拟系统，让玩家感受到真实的市场竞争环境。

## What Changes

### 核心功能

#### 1. **竞品新闻系统**
* ❌ **新增**：竞品新闻数据结构和存储
* ❌ **新增**：AI 驱动的竞品行为模拟（发布、更新、活动、公关）
* ❌ **新增**：新闻动态生成和持久化
* ❌ **新增**：新闻影响评估系统

#### 2. **市场风险动态评估**
* ❌ **新增**：基于竞品新闻的风险计算
* ❌ **新增**：多维度风险因素分析
* ❌ **新增**：风险预警和应对策略推荐

#### 3. **市场动态 UI 增强（基于现有 UI 优化）**
* ✅ **优化**：在现有 MarketDashboard 中增加实时新闻推送卡片
* ✅ **优化**：在现有竞争对手情报区域增加新闻动态标签
* ✅ **优化**：在市场概览区域增加风险等级指示器
* ✅ **优化**：复用现有弹窗组件展示新闻详情
* ❌ **不创建**：新的独立页面或复杂组件

#### 4. **AI 模拟增强**
* ❌ **新增**：竞品公司决策 AI
* ❌ **新增**：市场趋势预测 AI
* ❌ **新增**：行业动态事件生成 AI

## Impact

* **Affected specs**: 
  * `daily-simulation-expansion` - 扩展市场竞争系统
  * `data-linkage-improvement` - 增加市场数据联动
  
* **Affected code**: 
  * `src/stores/simulationStore.ts` - 添加竞品新闻数据
  * `src/engine/simulation/worldSimulator.ts` - 扩展竞品 AI 模拟
  * `src/components/market/MarketDashboard.vue` - UI 重构
  * **NEW** `src/engine/market/competitorNewsSystem.ts` - 竞品新闻系统
  * **NEW** `src/engine/market/marketRiskEngine.ts` - 市场风险评估引擎

## ADDED Requirements

### Requirement 1: 竞品新闻系统

#### 1.1 竞品新闻数据结构

The system SHALL 定义完整的竞品新闻数据结构：

**Scenario: 新闻类型定义**

* **WHEN** 定义竞品新闻类型
* **THEN** 包含以下字段：
  * `id`: string - 唯一标识
  * `companyId`: string - 竞品公司 ID
  * `companyName`: string - 竞品公司名称
  * `type`: NewsType - 新闻类型
  * `title`: string - 新闻标题
  * `content`: string - 新闻内容
  * `day`: number - 发生日期（游戏天数）
  * `impact`: NewsImpact - 影响评估
  * `sentiment`: 'positive' | 'negative' | 'neutral' - 情感倾向
  * `duration`: number - 影响持续天数
  * `tags`: string[] - 标签

**Scenario: 新闻类型枚举**

* **WHEN** 定义新闻类型
* **THEN** 包含：
  * `new_game` - 新游发布
  * `major_update` - 重大更新
  * `gacha_event` - 卡池活动
  * `collaboration` - IP 联动
  * `price_war` - 价格战
  * `scandal` - 丑闻
  * `award` - 获奖
  * `financial` - 融资
  * `player_migration` - 玩家流失
  * `market_shift` - 市场风向变化

#### 1.2 竞品新闻生成

The system SHALL 基于竞品 AI 行为生成新闻：

**Scenario: 新游发布新闻**

* **GIVEN** 竞品公司有新游计划
* **WHEN** 达到发布日期
* **THEN** 生成"新游发布"新闻
* **THEN** 影响：市场竞争 +15%，玩家流失风险 +10%
* **THEN** 持续 7 天

**Scenario: 重大更新新闻**

* **GIVEN** 竞品公司进行版本更新
* **WHEN** 更新上线
* **THEN** 生成"重大更新"新闻
* **THEN** 影响：市场竞争 +8%，持续 3 天
* **THEN** 根据更新质量决定情感倾向

**Scenario: 卡池活动新闻**

* **GIVEN** 竞品公司开启卡池活动
* **WHEN** 活动开始
* **THEN** 生成"卡池活动"新闻
* **THEN** 影响：玩家付费分流 +10%
* **THEN** 持续至活动结束

**Scenario: 丑闻新闻**

* **GIVEN** 竞品公司触发负面事件（1% 概率）
* **WHEN** 事件曝光
* **THEN** 生成"丑闻"新闻
* **THEN** 影响：该公司声誉 -20，玩家可能流向其他公司
* **THEN** 持续 14 天

#### 1.3 新闻影响评估

The system SHALL 评估每条新闻对市场的影响：

**Scenario: 影响计算**

* **GIVEN** 生成新新闻
* **WHEN** 评估新闻影响
* **THEN** 计算以下维度：
  * `marketSentiment`: number (-10 to 10) - 市场情绪影响
  * `competitionIntensity`: number (0-100) - 竞争强度
  * `playerMigrationRisk`: number (-0.5 to 0.5) - 玩家流失风险
  * `revenueImpact`: number (-0.3 to 0.3) - 收入影响
  * `reputationImpact`: number (-10 to 10) - 声誉影响

**Scenario: 影响叠加**

* **GIVEN** 多条新闻同时存在
* **WHEN** 计算综合影响
* **THEN** 正向影响叠加
* **THEN** 负向影响取最大值
* **THEN** 同类型影响不叠加（取最新）

### Requirement 2: 市场风险动态评估

#### 2.1 风险评估模型

The system SHALL 基于多维度数据评估市场风险：

**Scenario: 风险因素采集**

* **WHEN** 每日模拟时
* **THEN** 采集以下数据：
  * 竞品新闻数量（近 7 天）
  * 负面新闻比例
  * 市场竞争强度变化
  * 玩家流失率变化
  * 收入波动率
  * 市场份额变化

**Scenario: 风险等级判定**

* **GIVEN** 采集的风险数据
* **WHEN** 计算综合风险
* **THEN** 判定风险等级：
  * `low` (0-30): 低风险，市场稳定
  * `medium` (31-60): 中风险，需关注
  * `high` (61-100): 高风险，需应对

**Scenario: 风险因素分析**

* **WHEN** 风险评估完成
* **THEN** 生成风险因素列表：
  * 因素名称
  * 风险等级
  * 影响描述
  * 建议应对措施

#### 2.2 风险预警

The system SHALL 提供风险预警机制：

**Scenario: 风险阈值预警**

* **GIVEN** 风险等级从 low 升至 medium
* **WHEN** 检测到变化
* **THEN** 触发预警提示
* **THEN** 显示主要风险因素
* **THEN** 推荐应对策略

**Scenario: 竞品动态预警**

* **GIVEN** 竞品发布重磅新游
* **WHEN** 检测到威胁等级>=4
* **THEN** 触发竞品预警
* **THEN** 显示竞品详情
* **THEN** 推荐应对方案

### Requirement 3: 市场动态 UI 展示（基于现有 UI）

#### 3.1 现有市场概览区域增强

The system SHALL 在现有市场概览区域增加信息：

**Scenario: 风险等级指示器**

* **GIVEN** 现有市场概览卡片
* **WHEN** 展示市场数据
* **THEN** 在市场健康度标签旁边显示风险等级图标
* **THEN** 风险等级使用颜色区分（绿/黄/红）
* **THEN** 点击可查看详细风险因素（复用现有弹窗）

**Scenario: 竞品动态摘要**

* **GIVEN** 现有市场概览区域
* **WHEN** 有重要竞品动态
* **THEN** 显示"竞品动态"角标
* **THEN** 显示近 7 天竞品新闻数量
* **THEN** 点击跳转到竞争对手情报区域

#### 3.2 竞争对手情报区域增强

The system SHALL 在现有竞争对手列表中添加新闻展示：

**Scenario: 竞品新闻标签**

* **GIVEN** 现有竞品公司卡片
* **WHEN** 该公司有最新新闻
* **THEN** 在卡片右上角显示新闻角标
* **THEN** 角标显示新闻数量（1-9+）
* **THEN** 角标颜色根据情感倾向变化

**Scenario: 竞品详情弹窗增强**

* **GIVEN** 现有竞品详情弹窗
* **WHEN** 展示竞品详情
* **THEN** 在弹窗中增加"近期动态"区域
* **THEN** 显示该公司近 30 天新闻列表（最多 5 条）
* **THEN** 每条新闻显示标题、类型、日期

#### 3.3 热门趋势区域增强

The system SHALL 在现有趋势列表中整合新闻数据：

**Scenario: 趋势相关新闻**

* **GIVEN** 现有热门趋势列表
* **WHEN** 趋势有相关新闻
* **THEN** 在趋势卡片底部显示"相关新闻"标签
* **THEN** 显示新闻数量
* **THEN** 点击展开新闻摘要

#### 3.4 复用现有弹窗组件

The system SHALL 复用现有组件展示详情：

**Scenario: 新闻详情展示**

* **GIVEN** 用户点击新闻
* **WHEN** 展示新闻详情
* **THEN** 复用现有事件详情弹窗结构
* **THEN** 显示新闻标题、内容、影响分析
* **THEN** 显示相关新闻链接

**Scenario: 风险详情展示**

* **GIVEN** 用户点击风险等级
* **WHEN** 展示风险详情
* **THEN** 复用现有弹窗组件
* **THEN** 显示风险因素列表
* **THEN** 显示应对策略建议

### Requirement 4: AI 模拟增强

#### 4.1 竞品公司决策 AI

The system SHALL 模拟竞品公司的决策行为：

**Scenario: 竞品发布决策**

* **GIVEN** 竞品公司 AI
* **WHEN** 评估市场机会
* **THEN** 基于以下因素决定是否发布新游：
  * 市场热度
  * 竞争强度
  * 公司资源
  * 历史成功率
* **THEN** 发布决策符合公司人设

**Scenario: 竞品活动决策**

* **GIVEN** 竞品公司 AI
* **WHEN** 评估活动效果
* **THEN** 定期举办卡池活动
* **THEN** 节假日举办特别活动
* **THEN** 根据活动效果调整策略

#### 4.2 市场趋势预测 AI

The system SHALL 预测市场趋势变化：

**Scenario: 趋势预测**

* **GIVEN** 当前市场数据
* **WHEN** 预测未来趋势
* **THEN** 使用以下数据：
  * 历史趋势
  * 季节性因素
  * 竞品动态
  * 行业动态
* **THEN** 输出未来 7-30 天预测

**Scenario: 题材热度预测**

* **GIVEN** 题材历史数据
* **WHEN** 预测题材热度
* **THEN** 考虑：
  * 当前热度
  * 增长率
  * 饱和度
  * 季节性
* **THEN** 推荐潜力题材

#### 4.3 行业动态事件生成 AI

The system SHALL 生成行业动态事件：

**Scenario: 政策变化事件**

* **WHEN** 随机触发（每月 1-2 次）
* **THEN** 生成行业政策变化
* **THEN** 影响所有公司
* **THEN** 持续至政策改变

**Scenario: 技术突破事件**

* **WHEN** 随机触发（每季度 1 次）
* **THEN** 生成技术突破新闻
* **THEN** 采用新技术的公司获得加成
* **THEN** 持续 30 天

**Scenario: 市场风向变化**

* **WHEN** 随机触发（每 2 月 1 次）
* **THEN** 玩家偏好发生变化
* **THEN** 某些题材热度上升
* **THEN** 某些题材热度下降

## MODIFIED Requirements

### Requirement: WorldSimulator 更新

**原实现**: WorldSimulator 已实现但功能不完整

**修改后**:
- 增加 `getCompetitorNews()` 方法返回竞品新闻列表
- 增加 `getMarketRisk()` 方法返回风险评估
- 在 `update()` 中调用竞品新闻生成
- 在 `calculateImpact()` 中考虑新闻影响

### Requirement: MarketDashboard 数据源

**原实现**: 部分数据为静态计算

**修改后**:
- `marketRisk` computed 改为从 worldSimulator 获取真实数据
- `allMarketEvents` 整合竞品新闻和市场事件
- 增加实时新闻推送组件
- 增加风险可视化组件

## REMOVED Requirements

### Requirement: 静态节日活动计算

**Reason**: 已有 seasonUtils 和节假日系统，无需重复实现

**Migration**: 直接使用现有的 seasonUtils 和 holidays.json 配置

***

## 数据流图

```
每日模拟循环
    ↓
simulationStore.tick()
    ↓
worldSimulator.update(day)
    ├── competitorSystem.update()
    │     └── 生成竞品新闻
    ├── marketTrendSystem.update()
    │     └── 更新市场趋势
    └── industryEventSystem.simulate()
          └── 生成行业事件
    ↓
calculateImpact()
    ├── 计算竞品影响
    ├── 计算市场影响
    └── 计算事件影响
    ↓
更新 simulationStore.worldImpact
    ↓
MarketDashboard 组件
    ├── 获取竞品新闻
    ├── 获取市场风险
    ├── 获取市场趋势
    └── 实时展示
```

***

## 性能考虑

1. **新闻数据分页** - 只加载近 30 天新闻，支持加载更多
2. **影响缓存** - 新闻影响计算结果缓存，避免重复计算
3. **增量更新** - UI 只更新变化的数据
4. **异步加载** - 复杂计算使用 requestAnimationFrame 分片
5. **数据清理** - 定期清理 90 天前的旧新闻

***

## 测试策略

1. **单元测试** - 竞品新闻生成逻辑、风险评估算法
2. **集成测试** - WorldSimulator 与 simulationStore 数据流
3. **UI 测试** - MarketDashboard 组件渲染和交互
4. **性能测试** - 大量新闻数据下的渲染性能
5. **平衡性测试** - 竞品 AI 决策合理性验证
