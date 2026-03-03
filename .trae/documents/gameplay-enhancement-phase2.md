# 游戏性增强第二阶段实施计划

## 目标
实现角色创建系统增强、剧情分支可视化系统和动态市场系统，进一步提升游戏的真实感和自由度。

---

## Task 8: 角色创建系统增强

### 8.1 扩展角色数据模型
**文件**: `src/types/character.ts` (新建或扩展)

添加以下角色深度设定字段：
- `hiddenAttributes`: 隐藏性格参数（傲娇值、温柔值、腹黑值等）
- `growthArc`: 成长弧线预设（从弱小到强大/从冷漠到温柔等）
- `relationships`: 角色关系网络（与其他角色的关系）
- `secrets`: 角色秘密设定
- `aiPersonality`: AI生成的人格特征

### 8.2 创建角色AI人格系统
**文件**: `src/utils/characterAI.ts` (新建)

实现功能：
- `generatePersonality()`: 基于角色设定生成AI人格参数
- `generateBehavior()`: 生成角色行为模式
- `generateInnerMonologue()`: 生成角色内心独白
- `generateReaction()`: 基于情境生成角色反应

### 8.3 增强角色创建UI
**文件**: `src/views/creator/CharacterCreator.vue` (修改)

添加新的表单区块：
1. **隐藏属性设定面板**
   - 滑块控制各项隐藏属性值
   - 属性冲突检测提示

2. **成长弧线选择器**
   - 预设成长弧线模板
   - 可视化成长曲线预览

3. **角色关系编辑器**
   - 添加/删除关系
   - 关系类型选择（友好/敌对/暧昧等）
   - 关系强度设定

4. **角色秘密设定**
   - 秘密类型选择
   - 秘密揭示时机设定

5. **AI人格预览**
   - 实时生成角色人格报告
   - 示例对话展示

### 8.4 添加角色模板库
**文件**: `src/data/characterTemplates.ts` (新建)

扩展经典乙游角色模板：
- 霸道总裁型
- 温柔学长型
- 腹黑弟弟型
- 高冷男神型
- 阳光运动型
- 神秘转学生型
- 青梅竹马型

每个模板包含完整的角色设定数据。

---

## Task 3: 剧情分支可视化系统

### 3.1 设计剧情树数据结构
**文件**: `src/types/plotBranch.ts` (新建)

定义核心类型：
```typescript
interface PlotNode {
  id: string;
  type: 'start' | 'dialogue' | 'choice' | 'condition' | 'ending';
  content: string;
  position: { x: number; y: number };
  connections: string[]; // 连接的节点ID
  conditions?: PlotCondition[];
  effects?: PlotEffect[];
}

interface PlotBranch {
  nodes: PlotNode[];
  endings: Ending[];
  emotionCurve: number[];
}
```

### 3.2 创建剧情树可视化组件
**文件**: `src/components/plot/PlotTreeEditor.vue` (新建)

使用SVG实现：
1. **画布区域**
   - 可拖拽的画布
   - 缩放控制
   - 网格背景

2. **节点组件**
   - 不同类型节点的视觉样式
   - 节点拖拽移动
   - 节点选中高亮

3. **连接线**
   - 贝塞尔曲线连接
   - 条件分支标签
   - 连线拖拽创建

4. **工具栏**
   - 添加节点按钮
   - 删除节点按钮
   - 保存/加载按钮

### 3.3 实现分支预览功能
**文件**: `src/components/plot/BranchPreview.vue` (新建)

功能：
- 剧情走向模拟器
- 不同选择的路径高亮
- 多结局预览面板
- 剧情时长估算

### 3.4 添加剧情质量评估
**文件**: `src/utils/plotAnalyzer.ts` (新建)

实现评估算法：
- `checkLogic()`: 检测剧情逻辑漏洞
- `calculateEmotionDensity()`: 计算情感浓度
- `evaluateBranchRichness()`: 评估分支丰富度
- `generateSuggestions()`: 生成优化建议

---

## Task 4: 动态市场系统

### 4.1 创建市场环境数据模型
**文件**: `src/types/market.ts` (新建)

定义核心类型：
```typescript
interface MarketEnvironment {
  trend: MarketTrend;
  competitors: Competitor[];
  festivals: Festival[];
  hotTopics: string[];
  overallHeat: number;
}

interface MarketTrend {
  type: 'sweet' | 'dramatic' | 'mystery' | 'fantasy';
  strength: number; // 0-100
  cycle: number; // 周期天数
}
```

### 4.2 实现市场事件系统
**文件**: `src/utils/marketEvents.ts` (新建)

实现事件类型：
- **竞品事件**: 竞品发售、竞品活动
- **趋势事件**: 题材热潮、风格转变
- **节日事件**: 情人节、七夕、圣诞等
- **社会事件**: 影响玩家情绪的社会热点

事件触发逻辑和效果计算。

### 4.3 创建市场仪表盘
**文件**: `src/components/market/MarketDashboard.vue` (新建)

UI组件：
1. **市场趋势图**
   - 折线图展示趋势变化
   - 当前热门题材标签

2. **竞品动态列表**
   - 竞品游戏信息
   - 竞品活动提醒

3. **节日日历**
   -  upcoming节日提醒
   - 节日需求预测

4. **机会窗口提示**
   - 最佳发布时间推荐
   - 题材热度预警

### 4.4 添加市场预测功能
**文件**: `src/utils/marketPrediction.ts` (新建)

实现预测算法：
- `predictTrend()`: 基于历史数据预测趋势
- `recommendReleaseTime()`: 推荐最佳发布时间
- `calculateMarketOpportunity()`: 计算市场机会指数
- `forecastRevenue()`: 收入预测

---

## 实施顺序

### 第一阶段：角色创建增强（预计2-3小时）
1. 创建 `src/types/character.ts` 扩展数据模型
2. 创建 `src/utils/characterAI.ts` AI人格系统
3. 修改 `src/views/creator/CharacterCreator.vue` 增强UI
4. 创建 `src/data/characterTemplates.ts` 模板库

### 第二阶段：剧情分支可视化（预计3-4小时）
1. 创建 `src/types/plotBranch.ts` 数据模型
2. 创建 `src/components/plot/PlotTreeEditor.vue` 可视化编辑器
3. 创建 `src/components/plot/BranchPreview.vue` 分支预览
4. 创建 `src/utils/plotAnalyzer.ts` 质量评估

### 第三阶段：动态市场系统（预计2-3小时）
1. 创建 `src/types/market.ts` 数据模型
2. 创建 `src/utils/marketEvents.ts` 事件系统
3. 创建 `src/components/market/MarketDashboard.vue` 仪表盘
4. 创建 `src/utils/marketPrediction.ts` 预测功能

---

## 文件清单

### 新建文件
- `src/types/character.ts` - 角色扩展类型
- `src/utils/characterAI.ts` - AI人格系统
- `src/data/characterTemplates.ts` - 角色模板库
- `src/types/plotBranch.ts` - 剧情分支类型
- `src/components/plot/PlotTreeEditor.vue` - 剧情树编辑器
- `src/components/plot/BranchPreview.vue` - 分支预览
- `src/utils/plotAnalyzer.ts` - 剧情分析器
- `src/types/market.ts` - 市场类型
- `src/utils/marketEvents.ts` - 市场事件
- `src/components/market/MarketDashboard.vue` - 市场仪表盘
- `src/utils/marketPrediction.ts` - 市场预测

### 修改文件
- `src/views/creator/CharacterCreator.vue` - 增强角色创建UI

---

## 验收标准

### 角色创建增强
- [ ] 可以设置角色的隐藏属性
- [ ] 可以选择成长弧线模板
- [ ] 可以编辑角色关系网络
- [ ] 可以设定角色秘密
- [ ] AI人格预览正常显示
- [ ] 角色模板库可用

### 剧情分支可视化
- [ ] 可以拖拽创建剧情节点
- [ ] 可以连接节点形成分支
- [ ] 可以预览不同选择的结果
- [ ] 剧情质量评估给出合理建议
- [ ] 多结局管理功能正常

### 动态市场系统
- [ ] 市场趋势实时变化
- [ ] 竞品动态正确显示
- [ ] 节日效应正确计算
- [ ] 发布时间推荐合理
- [ ] 市场预测有参考价值
