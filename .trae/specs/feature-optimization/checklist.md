# 功能优化与联动设计 Checklist

## 联动追踪整合到运营流程

- [x] OperationPredictionPanel组件创建完成
- [x] 效果预测面板能显示即时/短期/长期效果
- [x] 因果关系图在效果预测中可视化展示
- [x] 效果追踪标签页能对比预测vs实际数据
- [x] operationStore.generatePrediction方法实现
- [x] operationStore.trackActualEffects方法实现
- [x] 创建卡池前自动弹出效果预测面板
- [x] 玩家可以调整参数实时看到预测变化
- [x] 创建后显示效果追踪面板

## 玩家社区分析actionable化

- [x] AdminView显示一键召回流失玩家按钮
- [x] AdminView显示针对付费玩家创建活动按钮
- [x] AdminView显示高风险玩家预警提示
- [x] generateSegmentActions函数实现
- [x] executeSuggestedAction函数实现
- [x] 点击一键召回跳转到福利发放并预填充
- [x] 点击创建活动跳转到活动中心并预填充
- [x] OperationView能解析URL中的action和template参数
- [x] 预填充后玩家可以修改再确认执行

## 剧情编辑器整合与优化

- [x] PlotDesigner添加复杂度选择（简单/中等/复杂）
- [x] 根据复杂度推荐不同编辑模式
- [x] PlotDesigner添加"高级编辑"按钮
- [x] 点击高级编辑在新标签页打开PlotTreeEditor
- [x] PlotTreeEditor能解析projectId和returnTo参数
- [x] PlotTreeEditor添加"保存并返回"按钮
- [x] 编辑完成后能正确返回PlotDesigner
- [x] 复杂剧情（节点>10）质量评分+10%
- [x] 使用高级编辑器解锁"剧情大师"成就

## 创作者技能系统与核心玩法联动

- [x] SKILL_EFFECTS定义完成（4个技能）
- [x] 文案能力影响剧情质量（每级+5%）
- [x] 美术鉴赏影响角色人气（每级+4%）
- [x] 项目管理影响团队效率（每级+5%）
- [x] 数据分析影响预测准确度（每级+5%）
- [x] CharacterCreator显示技能加成提示
- [x] PlotDesigner显示技能加成提示
- [x] teamManagement应用项目管理加成
- [x] LinkageTracker解锁深度分析功能（Lv.3+）

## 评论系统与玩家状态深度联动

- [x] ACTIVE→LOST时自动生成退坑评论
- [x] LOST→RETURNED时自动生成真香评论
- [x] 变为PAYING时30%概率生成安利评论
- [x] generateQuitComments函数实现
- [x] generateReturnComments函数实现
- [x] generateRecommendationComments函数实现
- [x] 退坑评论模板至少4条
- [x] 真香评论模板至少4条
- [x] 安利评论模板至少4条
- [x] 评论情感与玩家状态匹配

## 角色人气与卡池收益实时联动

- [x] calculateGachaRevenue函数实现
- [x] 人气>=80时收益+50%
- [x] 人气>=60时收益+20%
- [x] 人气<40时收益-20%
- [x] 人气<20时收益-30%
- [x] OperationView显示人气加成提示
- [x] updateCharacterPopularityFromGacha函数实现
- [x] 卡池运营每日增加角色人气
- [x] 福利好的卡池额外增加人气
- [x] OperationView显示角色人气排行Top10
- [x] 标记"建议UP"角色（人气高但未UP）
- [x] 点击角色可直接创建UP卡池

## 整体验证

- [x] 所有功能可以正常使用
- [x] 功能之间联动正常
- [x] 无控制台错误
- [x] 无TypeScript类型错误
- [x] 构建成功（npm run build 退出码为 0）
- [x] 开发服务器正常运行
