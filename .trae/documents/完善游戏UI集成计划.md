# 完善游戏UI集成计划

## 目标
将已实现的计算引擎（P0/P1）集成到现有UI页面，创建新的数据分析页面，让游戏从Demo阶段进入可玩阶段。

## 当前状态
- ✅ P0/P1计算引擎已实现（项目评估、角色价值、剧情分析、运营联动、数据反馈）
- ✅ 基础UI页面已存在（首页、项目详情、角色创建、剧情设计、运营管理）
- ❌ 计算引擎未集成到UI
- ❌ 缺少数据分析页面

---

## Phase 1: 项目评估系统UI集成（Week 1）

### 1.1 项目卡片增强
**文件**: `src/components/project/ProjectCard.vue`

**修改内容**:
- 添加项目健康度评分显示（使用calculationEngine.evaluateProject）
- 添加风险等级标签（高/中/低）
- 添加预期评分和收入预览
- 添加优化建议提示

**UI元素**:
```
[项目卡片]
├── 健康度: 78/100 [绿色进度条]
├── 风险: 中等 [黄色标签]
├── 预期评分: 7.5/10
├── 预期收入: 50万/月
└── 💡 建议: 增加美术人员
```

### 1.2 项目详情页评估面板
**文件**: `src/views/project/ProjectDetailView.vue`

**新增内容**:
- 项目评估报告卡片
- 健康度详细分析（角色完成度、剧情完成度、团队匹配、预算）
- 风险因素列表
- 改进建议列表

**UI元素**:
```
[项目评估面板]
├── 综合健康度: 78分
├── 各项评分:
│   ├── 角色完成度: 80% ⭐⭐⭐⭐
│   ├── 剧情完成度: 60% ⭐⭐⭐
│   ├── 团队匹配: 70% ⭐⭐⭐
│   └── 预算充足: 85% ⭐⭐⭐⭐
├── 风险因素:
│   ├── ⚠️ 角色数量不足
│   └── ⚠️ 缺少剧情内容
└── 改进建议:
    ├── 1. 增加更多角色
    └── 2. 配置至少1名策划
```

---

## Phase 2: 角色价值系统UI集成（Week 1-2）

### 2.1 角色卡片增强
**文件**: `src/components/character/CharacterCard.vue`（新建）

**功能**:
- 显示角色价值评分（SSR/SR/R/N等级）
- 显示人气、商业价值、CP价值、剧情承载力
- 显示优化建议

**UI元素**:
```
[角色卡片]
├── [头像] 角色名 [SSR标签]
├── 综合价值: 85分
├── 各项评分:
│   ├── 人气: 78
│   ├── 商业价值: 82
│   ├── CP价值: 90
│   └── 剧情承载: 75
└── 💡 建议: 增加剧情曝光
```

### 2.2 角色价值排行榜
**文件**: `src/views/character/CharacterRankingView.vue`（新建）

**功能**:
- 显示所有角色价值排名
- 支持按不同维度排序（人气/商业价值/CP价值）
- 显示价值趋势预测

**UI元素**:
```
[角色价值排行榜]
├── 排序选项: [综合] [人气] [商业] [CP]
├── 角色列表:
│   ├── #1 李泽言 SSR 92分 ↑
│   ├── #2 许墨 SR 85分 →
│   └── #3 白起 SR 78分 ↓
└── 趋势预测面板
```

### 2.3 角色详情页价值分析
**文件**: `src/views/character/CharacterDetailView.vue`（新建或修改现有）

**功能**:
- 详细价值分析
- 人气来源分析（剧情曝光、卡池抽取、社交提及）
- CP热度分析
- 优化建议

---

## Phase 3: 剧情分析系统UI集成（Week 2）

### 3.1 剧情分析面板
**文件**: `src/views/plot/PlotAnalysisView.vue`（新建）

**功能**:
- 剧情完成率追踪
- 情感曲线可视化（图表）
- 流失点识别
- 分支选择分析

**UI元素**:
```
[剧情分析面板]
├── 整体完成率: 65%
├── 情感曲线图 [折线图]
├── 流失点:
│   ├── ⚠️ 第三章: 流失率30% [严重]
│   └── ⚠️ 第五章: 流失率15% [警告]
├── 分支分析:
│   ├── 分支A: 选择率60% [热门]
│   ├── 分支B: 选择率35%
│   └── 分支C: 选择率5% [冷门]
└── 改进建议:
    └── 第三章难度过高，建议增加存档点
```

### 3.2 剧情编辑器增强
**文件**: `src/views/plot/PlotDesigner.vue`

**新增内容**:
- 实时剧情质量评分
- 章节流失率预警
- 情感曲线预览

---

## Phase 4: 运营联动系统UI集成（Week 2-3）

### 4.1 运营影响预测面板
**文件**: `src/views/operation/OperationImpactView.vue`（新建）

**功能**:
- 运营操作前的影响预测
- 显示短期/中期/长期影响
- 风险提示

**UI元素**:
```
[运营影响预测]
├── 操作: 降低卡池爆率 2% → 1.5%
├── 预测影响:
│   ├── 即时: 满意度 -15
│   ├── 短期(7天): 留存率 -5%
│   ├── 中期(30天): 市场份额 -3%
│   └── 长期(90天): 品牌声誉 -10
├── ⚠️ 风险:
│   └── 降低爆率可能引发玩家不满
└── [确认执行] [取消]
```

### 4.2 联动效果追踪
**文件**: `src/views/operation/LinkageTrackerView.vue`（新建）

**功能**:
- 显示当前生效的联动效果
- 延迟效果倒计时
- 连锁反应可视化

**UI元素**:
```
[联动效果追踪]
├── 即时效果:
│   └── 卡池UP → 收入 +20% [剩余12天]
├── 延迟效果队列:
│   ├── 满意度下降 → 留存率 [2天后生效]
│   └── DAU下降 → 市场份额 [5天后生效]
└── 连锁反应图 [可视化图表]
```

### 4.3 现有运营页面增强
**文件**: `src/views/operation/GachaManagement.vue`, `EventCenter.vue`, etc.

**新增内容**:
- 操作前显示影响预测
- 操作后显示实际效果对比

---

## Phase 5: 数据反馈闭环UI（Week 3）

### 5.1 运营数据看板
**文件**: `src/views/dashboard/OperationDashboard.vue`（新建）

**功能**:
- 关键指标展示（DAU、留存、收入、满意度）
- 趋势图表
- 问题诊断
- 改进建议

**UI元素**:
```
[运营数据看板]
├── 关键指标:
│   ├── DAU: 12,500 ↑ 5%
│   ├── 留存率: 35% ↓ 3%
│   ├── 日收入: ¥50,000 ↑ 10%
│   └── 满意度: 72% ↓ 8%
├── 趋势图 [7天/30天切换]
├── ⚠️ 发现问题:
│   └── 满意度下降，建议发放补偿
└── 改进建议:
    ├── 1. 发放全服补偿 [高优先级]
    └── 2. 优化新手引导 [中优先级]
```

### 5.2 分析报告页面
**文件**: `src/views/dashboard/AnalysisReportView.vue`（新建）

**功能**:
- 生成和查看分析报告
- 历史报告对比
- 执行追踪

### 5.3 首页待处理事项增强
**文件**: `src/views/HomeView.vue`

**新增内容**:
- 显示计算引擎生成的事项
- 显示紧急问题提醒
- 显示改进建议

---

## Phase 6: 游戏循环完善（Week 3-4）

### 6.1 项目状态流转增强
**文件**: `src/stores/projectStore.ts`

**新增内容**:
- 项目发布前的评估检查
- 发布条件验证
- 发布后数据初始化

### 6.2 每日结算系统
**文件**: `src/engine/dayCycleEngine.ts`（新建）

**功能**:
- 每日数据更新
- 联动效果处理
- 员工状态更新
- 生成每日报告

### 6.3 游戏时间系统
**文件**: `src/stores/gameStore.ts`

**新增内容**:
- 游戏时间推进
- 暂停/继续
- 时间加速

---

## 技术实现要点

### 1. 计算引擎集成
```typescript
// 在组件中使用
import { useProjectEvaluation, useCharacterValue } from '@/composables/useCalculation';

const { evaluation, healthStatus } = useProjectEvaluation(project);
const { value, valueRank } = useCharacterValue(character, metrics);
```

### 2. 数据流设计
```
User Action → UI Component → Calculation Engine → Store Update → UI Refresh
```

### 3. 性能优化
- 使用computed缓存计算结果
- 批量计算避免频繁更新
- 虚拟滚动处理大量数据

### 4. 响应式设计
- 使用Vant的响应式组件
- 移动端优先设计
- 适配不同屏幕尺寸

---

## 文件创建清单

### 新建文件
1. `src/components/project/ProjectHealthBadge.vue` - 项目健康度徽章
2. `src/components/character/CharacterCard.vue` - 角色卡片
3. `src/components/character/CharacterValueChart.vue` - 角色价值图表
4. `src/views/character/CharacterRankingView.vue` - 角色排行榜
5. `src/views/character/CharacterDetailView.vue` - 角色详情
6. `src/views/plot/PlotAnalysisView.vue` - 剧情分析
7. `src/components/plot/EmotionCurveChart.vue` - 情感曲线图
8. `src/views/operation/OperationImpactView.vue` - 运营影响预测
9. `src/views/operation/LinkageTrackerView.vue` - 联动追踪
10. `src/views/dashboard/OperationDashboard.vue` - 运营数据看板
11. `src/views/dashboard/AnalysisReportView.vue` - 分析报告
12. `src/engine/dayCycleEngine.ts` - 每日结算引擎

### 修改文件
1. `src/components/project/ProjectCard.vue` - 添加健康度显示
2. `src/views/project/ProjectDetailView.vue` - 添加评估面板
3. `src/views/plot/PlotDesigner.vue` - 添加分析功能
4. `src/views/operation/GachaManagement.vue` - 添加影响预测
5. `src/views/operation/EventCenter.vue` - 添加影响预测
6. `src/views/HomeView.vue` - 增强待处理事项
7. `src/router/index.ts` - 添加新路由

---

## 验收标准

1. **项目评估**: 项目卡片和详情页显示健康度、风险、建议
2. **角色价值**: 角色显示价值等级和详细评分
3. **剧情分析**: 显示完成率、情感曲线、流失点
4. **运营联动**: 操作前显示影响预测，操作后追踪效果
5. **数据反馈**: 看板显示关键指标和改进建议
6. **游戏循环**: 可以完整体验创建→开发→发布→运营的流程

---

## 开发顺序建议

**Week 1**: Phase 1 + Phase 2（项目评估 + 角色价值）
**Week 2**: Phase 3 + Phase 4前半（剧情分析 + 运营预测）
**Week 3**: Phase 4后半 + Phase 5（联动追踪 + 数据看板）
**Week 4**: Phase 6 + 测试优化（游戏循环完善）
