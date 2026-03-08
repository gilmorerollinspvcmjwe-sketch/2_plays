# Tasks

## Phase 1: 竞品新闻系统基础架构

- [x] **Task 1.1**: 创建竞品新闻系统核心文件 ✅
  - [x] SubTask 1.1.1: 创建 `src/engine/market/competitorNewsSystem.ts` ✅
  - [x] SubTask 1.1.2: 定义竞品新闻数据结构（CompetitorNews, NewsType, NewsImpact）✅
  - [x] SubTask 1.1.3: 实现新闻生成器基础框架 ✅

- [x] **Task 1.2**: 实现竞品新闻生成逻辑 ✅
  - [x] SubTask 1.2.1: 实现新游发布新闻生成 ✅
  - [x] SubTask 1.2.2: 实现重大更新新闻生成 ✅
  - [x] SubTask 1.2.3: 实现卡池活动新闻生成 ✅
  - [x] SubTask 1.2.4: 实现 IP 联动新闻生成 ✅
  - [x] SubTask 1.2.5: 实现负面新闻生成（丑闻、价格战） ✅

- [x] **Task 1.3**: 实现新闻影响评估系统 ✅
  - [x] SubTask 1.3.1: 实现单条新闻影响计算 ✅
  - [x] SubTask 1.3.2: 实现多条新闻影响叠加逻辑 ✅
  - [x] SubTask 1.3.3: 实现新闻情感分析 ✅

- [x] **Task 1.4**: 集成竞品新闻到 WorldSimulator ✅
  - [x] SubTask 1.4.1: 在 WorldSimulator 中添加 competitorNewsSystem ✅
  - [x] SubTask 1.4.2: 在 update() 中调用新闻生成 ✅
  - [x] SubTask 1.4.3: 实现 getCompetitorNews() 方法 ✅
  - [x] SubTask 1.4.4: 在 calculateImpact() 中考虑新闻影响 ✅

---

## Phase 2: 市场风险评估系统

- [ ] **Task 2.1**: 创建市场风险评估引擎
  - [ ] SubTask 2.1.1: 创建 `src/engine/market/marketRiskEngine.ts`
  - [ ] SubTask 2.1.2: 定义风险评估数据结构（MarketRisk, RiskFactor）
  - [ ] SubTask 2.1.3: 实现风险计算模型

- [ ] **Task 2.2**: 实现多维度风险评估
  - [ ] SubTask 2.2.1: 实现竞争强度评估
  - [ ] SubTask 2.2.2: 实现玩家流失风险评估
  - [ ] SubTask 2.2.3: 实现收入波动评估
  - [ ] SubTask 2.2.4: 实现市场份额风险评估

- [ ] **Task 2.3**: 实现风险预警机制
  - [ ] SubTask 2.3.1: 实现风险等级判定（low/medium/high）
  - [ ] SubTask 2.3.2: 实现风险阈值检测
  - [ ] SubTask 2.3.3: 实现预警触发逻辑

- [ ] **Task 2.4**: 实现应对策略推荐
  - [ ] SubTask 2.4.1: 建立应对策略库
  - [ ] SubTask 2.4.2: 实现策略匹配算法
  - [ ] SubTask 2.4.3: 实现策略效果预测

- [ ] **Task 2.5**: 集成到 WorldSimulator
  - [ ] SubTask 2.5.1: 在 WorldSimulator 中添加 marketRiskEngine
  - [ ] SubTask 2.5.2: 实现 getMarketRisk() 方法
  - [ ] SubTask 2.5.3: 在 update() 中调用风险评估

---

## Phase 3: simulationStore 扩展

- [ ] **Task 3.1**: 添加竞品新闻数据
  - [ ] SubTask 3.1.1: 在 simulationStore 中添加 competitorNews ref
  - [ ] SubTask 3.1.2: 实现新闻数据持久化（saveToLocal/loadFromLocal）
  - [ ] SubTask 3.1.3: 在 tick() 中更新竞品新闻

- [ ] **Task 3.2**: 添加市场风险数据
  - [ ] SubTask 3.2.1: 在 simulationStore 中添加 marketRisk ref
  - [ ] SubTask 3.2.2: 实现风险数据持久化
  - [ ] SubTask 3.2.3: 在 tick() 中更新市场风险

- [ ] **Task 3.3**: 导出数据到组件
  - [ ] SubTask 3.3.1: 在 storeToRefs 中添加 competitorNews
  - [ ] SubTask 3.3.2: 在 storeToRefs 中添加 marketRisk
  - [ ] SubTask 3.3.3: 确保响应式更新

---

## Phase 4: MarketDashboard UI 增强（基于现有 UI）

- [ ] **Task 4.1**: 增强市场概览区域
  - [ ] SubTask 4.1.1: 在市场健康度标签旁添加风险等级图标
  - [ ] SubTask 4.1.2: 实现风险等级颜色区分（绿/黄/红）
  - [ ] SubTask 4.1.3: 添加竞品动态角标和数量显示
  - [ ] SubTask 4.1.4: 实现点击跳转到竞争对手区域

- [ ] **Task 4.2**: 增强竞争对手情报区域
  - [ ] SubTask 4.2.1: 在竞品卡片右上角添加新闻角标
  - [ ] SubTask 4.2.2: 实现角标数量显示和颜色变化
  - [ ] SubTask 4.2.3: 在竞品详情弹窗中添加"近期动态"区域
  - [ ] SubTask 4.2.4: 实现近 30 天新闻列表展示（最多 5 条）

- [ ] **Task 4.3**: 增强热门趋势区域
  - [ ] SubTask 4.3.1: 在趋势卡片底部添加"相关新闻"标签
  - [ ] SubTask 4.3.2: 实现新闻数量显示
  - [ ] SubTask 4.3.3: 实现点击展开新闻摘要

- [ ] **Task 4.4**: 复用现有弹窗组件
  - [ ] SubTask 4.4.1: 扩展现有事件详情弹窗支持新闻展示
  - [ ] SubTask 4.4.2: 实现新闻详情展示（标题、内容、影响）
  - [ ] SubTask 4.4.3: 实现风险详情展示（风险因素、应对策略）
  - [ ] SubTask 4.4.4: 确保样式统一和响应式布局

---

## Phase 5: AI 模拟增强

- [ ] **Task 5.1**: 竞品公司决策 AI
  - [ ] SubTask 5.1.1: 实现竞品发布决策逻辑
  - [ ] SubTask 5.1.2: 实现竞品活动决策逻辑
  - [ ] SubTask 5.1.3: 实现竞品响应玩家行为

- [ ] **Task 5.2**: 市场趋势预测 AI
  - [ ] SubTask 5.2.1: 实现趋势预测算法
  - [ ] SubTask 5.2.2: 实现题材热度预测
  - [ ] SubTask 5.2.3: 实现预测可视化

- [ ] **Task 5.3**: 行业动态事件生成
  - [ ] SubTask 5.3.1: 实现政策变化事件
  - [ ] SubTask 5.3.2: 实现技术突破事件
  - [ ] SubTask 5.3.3: 实现市场风向变化事件

---

## Phase 6: 集成测试和优化

- [ ] **Task 6.1**: 功能测试
  - [ ] SubTask 6.1.1: 测试竞品新闻生成
  - [ ] SubTask 6.1.2: 测试市场风险评估
  - [ ] SubTask 6.1.3: 测试 UI 展示和交互
  - [ ] SubTask 6.1.4: 测试数据持久化

- [ ] **Task 6.2**: 性能优化
  - [ ] SubTask 6.2.1: 优化新闻数据加载
  - [ ] SubTask 6.2.2: 优化风险计算性能
  - [ ] SubTask 6.2.3: 优化 UI 渲染性能

- [ ] **Task 6.3**: 平衡性调整
  - [ ] SubTask 6.3.1: 调整竞品 AI 决策概率
  - [ ] SubTask 6.3.2: 调整新闻影响数值
  - [ ] SubTask 6.3.3: 调整风险阈值

- [ ] **Task 6.4**: 文档和注释
  - [ ] SubTask 6.4.1: 添加代码注释
  - [ ] SubTask 6.4.2: 更新用户文档
  - [ ] SubTask 6.4.3: 创建开发者指南

---

# Task Dependencies

## Phase 依赖关系

- **Phase 2** (市场风险) 依赖于 **Phase 1** (竞品新闻系统)
- **Phase 3** (Store 扩展) 依赖于 **Phase 1** 和 **Phase 2**
- **Phase 4** (UI 重构) 依赖于 **Phase 3** (数据就绪)
- **Phase 5** (AI 增强) 依赖于 **Phase 1** (基础架构)
- **Phase 6** (测试优化) 依赖于 **Phase 4** 和 **Phase 5**

## 关键路径

```
Phase 1 (竞品新闻系统)
    ↓
Phase 2 (市场风险) 
    ↓
Phase 3 (Store 扩展)
    ↓
Phase 4 (UI 重构)
    ↓
Phase 5 (AI 增强)
    ↓
Phase 6 (测试优化)
```

## 并行任务

- Phase 1 和 Phase 5.1 可部分并行（AI 决策依赖新闻系统）
- Phase 4.1 和 Phase 4.2 可并行开发
- Phase 6.1 和 Phase 6.2 可并行进行

## 建议执行顺序

1. **Week 1**: Phase 1 (竞品新闻系统基础)
2. **Week 2**: Phase 2 (市场风险) + Phase 3 (Store 扩展)
3. **Week 3**: Phase 4 (UI 重构)
4. **Week 4**: Phase 5 (AI 增强) + Phase 6 (测试优化)
