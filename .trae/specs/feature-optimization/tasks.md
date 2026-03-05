# 功能优化与联动设计 Tasks

## 任务列表

### 任务1: 联动追踪整合到运营流程
- [ ] 在OperationView添加"效果预测"面板
  - [ ] 创建OperationPredictionPanel组件
  - [ ] 整合linkageEngine的因果关系计算
  - [ ] 显示即时/短期/长期效果预测
- [ ] 在OperationView添加"效果追踪"标签页
  - [ ] 对比预测vs实际数据
  - [ ] 显示因果关系链可视化
- [ ] 修改operationStore添加预测功能
  - [ ] 实现generatePrediction方法
  - [ ] 实现trackActualEffects方法

### 任务2: 玩家社区分析actionable化
- [ ] 在AdminView添加actionable按钮区域
  - [ ] 一键召回流失玩家按钮
  - [ ] 针对付费玩家创建活动按钮
  - [ ] 高风险玩家预警提示
- [ ] 实现generateSegmentActions函数
  - [ ] 分析玩家分群数据
  - [ ] 生成建议操作列表
- [ ] 实现executeSuggestedAction函数
  - [ ] 跳转到OperationView
  - [ ] 通过query参数传递操作模板
- [ ] 修改OperationView接收模板参数
  - [ ] 解析URL中的action和template
  - [ ] 预填充对应功能表单

### 任务3: 剧情编辑器整合与优化
- [ ] 在PlotDesigner添加复杂度选择
  - [ ] 添加简单/中等/复杂选项
  - [ ] 根据选择推荐不同编辑模式
- [ ] 在PlotDesigner添加"高级编辑"入口
  - [ ] 点击打开PlotTreeEditor（新标签页）
  - [ ] 通过URL传递projectId和returnTo
- [ ] 修改PlotTreeEditor支持返回功能
  - [ ] 添加"保存并返回"按钮
  - [ ] 解析returnTo参数
  - [ ] 支持关闭窗口或跳转返回
- [ ] 添加剧情复杂度奖励机制
  - [ ] 节点>10时质量评分+10%
  - [ ] 解锁"剧情大师"成就

### 任务4: 创作者技能系统与核心玩法联动
- [ ] 在creatorGrowth.ts定义SKILL_EFFECTS
  - [ ] 文案能力效果定义
  - [ ] 美术鉴赏效果定义
  - [ ] 项目管理效果定义
  - [ ] 数据分析效果定义
- [ ] 在CharacterCreator应用技能加成
  - [ ] 应用美术鉴赏到角色人气
  - [ ] 显示技能加成提示
- [ ] 在PlotDesigner应用技能加成
  - [ ] 应用文案能力到剧情质量
  - [ ] 显示技能加成提示
- [ ] 在teamManagement应用技能加成
  - [ ] 应用项目管理到团队效率
  - [ ] 应用项目管理到疲劳度增长
- [ ] 在LinkageTracker应用技能加成
  - [ ] 应用数据分析到预测准确度
  - [ ] 解锁深度分析功能

### 任务5: 评论系统与玩家状态深度联动
- [ ] 修改playerStore状态变化逻辑
  - [ ] ACTIVE→LOST时触发退坑评论
  - [ ] LOST→RETURNED时触发真香评论
  - [ ] 变为PAYING时触发安利评论
- [ ] 在commentStore添加评论生成函数
  - [ ] generateQuitComments函数
  - [ ] generateReturnComments函数
  - [ ] generateRecommendationComments函数
- [ ] 添加评论模板数据
  - [ ] 退坑评论模板（4条）
  - [ ] 真香评论模板（4条）
  - [ ] 安利评论模板（4条）

### 任务6: 角色人气与卡池收益实时联动
- [ ] 修改operationStore卡池收益计算
  - [ ] 实现calculateGachaRevenue函数
  - [ ] 根据人气值计算收益倍数
  - [ ] 显示人气加成提示
- [ ] 添加卡池运营提升人气逻辑
  - [ ] 实现updateCharacterPopularityFromGacha函数
  - [ ] 每日曝光增加人气
  - [ ] 福利好的卡池额外增加
- [ ] 在OperationView添加角色人气排行
  - [ ] 显示Top10角色
  - [ ] 标记"建议UP"角色
  - [ ] 点击直接创建UP卡池

## 任务依赖关系

```
任务1 (联动追踪整合)
    └── 依赖: linkageEngine已存在

任务2 (玩家分析actionable)
    ├── 依赖: 任务1完成（使用相同的预测机制）
    └── 依赖: AdminView已存在

任务3 (剧情编辑器整合)
    └── 依赖: PlotDesigner和PlotTreeEditor已存在

任务4 (创作者技能联动)
    ├── 依赖: creatorGrowth.ts已存在
    ├── 依赖: 任务3完成（剧情质量加成）
    └── 依赖: 任务1完成（数据分析加成）

任务5 (评论玩家联动)
    ├── 依赖: playerStore已存在
    └── 依赖: commentStore已存在

任务6 (人气收益联动)
    ├── 依赖: operationStore已存在
    ├── 依赖: gameStore已存在
    └── 依赖: 任务5完成（人气影响玩家行为）
```

## 优先级排序

| 优先级 | 任务 | 原因 |
|--------|------|------|
| P0 | 任务1 | 核心功能，影响所有运营操作 |
| P0 | 任务6 | 核心经济循环，影响游戏平衡 |
| P1 | 任务2 | 提升AdminView实用性 |
| P1 | 任务5 | 增强游戏真实感 |
| P2 | 任务3 | 改善用户体验 |
| P2 | 任务4 | 长期成长系统 |

## 预计工时

- 任务1: 8小时
- 任务2: 6小时
- 任务3: 4小时
- 任务4: 6小时
- 任务5: 4小时
- 任务6: 6小时

**总计: 34小时（约4-5个工作日）**
