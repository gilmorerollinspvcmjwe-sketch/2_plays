# Tasks

## Phase 1: 新手引导系统（高优先级）
- [x] Task 1.1: 创建新手引导 Store
  - [x] SubTask 1.1.1: 创建 `src/stores/onboardingStore.ts`
  - [x] SubTask 1.1.2: 定义引导步骤状态
  - [x] SubTask 1.1.3: 实现进度保存和恢复
  - [x] SubTask 1.1.4: 实现奖励发放逻辑

- [x] Task 1.2: 创建引导组件
  - [x] SubTask 1.2.1: 创建 `src/components/onboarding/GuideOverlay.vue` - 引导遮罩组件
  - [x] SubTask 1.2.2: 创建 `src/components/onboarding/GuideTip.vue` - 引导提示框组件
  - [x] SubTask 1.2.3: 创建 `src/components/onboarding/GuideComplete.vue` - 引导完成弹窗

- [ ] Task 1.3: 实现引导流程
  - [ ] SubTask 1.3.1: 在 HomeView.vue 中集成引导入口
  - [ ] SubTask 1.3.2: 实现 7 步引导流程逻辑
  - [ ] SubTask 1.3.3: 添加引导跳过功能
  - [ ] SubTask 1.3.4: 添加引导奖励发放

## Phase 2: 任务系统（高优先级）
- [x] Task 2.1: 创建任务 Store
  - [x] SubTask 2.1.1: 创建 `src/stores/taskStore.ts`
  - [x] SubTask 2.1.2: 定义每日任务数据结构
  - [x] SubTask 2.1.3: 定义每周任务数据结构
  - [x] SubTask 2.1.4: 实现任务刷新逻辑
  - [x] SubTask 2.1.5: 实现任务完成检测

- [x] Task 2.2: 创建任务组件
  - [x] SubTask 2.2.1: 创建 `src/components/task/DailyTaskCard.vue` - 每日任务卡片
  - [x] SubTask 2.2.2: 创建 `src/components/task/WeeklyTaskCard.vue` - 每周任务卡片
  - [x] SubTask 2.2.3: 创建 `src/components/task/TaskCompleteToast.vue` - 任务完成提示

- [ ] Task 2.3: 集成任务系统
  - [ ] SubTask 2.3.1: 在 HomeView.vue 中添加任务入口
  - [ ] SubTask 2.3.2: 在各功能模块中触发任务进度
  - [ ] SubTask 2.3.3: 添加全部完成奖励

## Phase 3: 反馈动画系统（中优先级）
- [x] Task 3.1: 创建反馈动画组件
  - [x] SubTask 3.1.1: 创建 `src/components/feedback/NumberAnimation.vue` - 数值跳动动画
  - [x] SubTask 3.1.2: 创建 `src/components/feedback/AchievementPopup.vue` - 成就弹出动画
  - [ ] SubTask 3.1.3: 创建 `src/components/feedback/MilestoneCard.vue` - 里程碑卡片
  - [ ] SubTask 3.1.4: 创建 `src/components/feedback/CoinStackAnimation.vue` - 金币堆叠动画

- [ ] Task 3.2: 集成反馈动画
  - [ ] SubTask 3.2.1: 在资源变化时触发数值动画
  - [ ] SubTask 3.2.2: 在成就解锁时触发弹出动画
  - [ ] SubTask 3.2.3: 在里程碑达成时显示卡片

- [x] Task 3.3: 创建每日总结报告
  - [x] SubTask 3.3.1: 创建 `src/components/report/DailySummary.vue` - 每日总结弹窗
  - [x] SubTask 3.3.2: 在 simulationStore 中记录每日数据
  - [ ] SubTask 3.3.3: 在日期变更时触发总结弹窗

## Phase 4: 数值平衡优化（中优先级）
- [x] Task 4.1: 调整收入数值
  - [x] SubTask 4.1.1: 修改 gameStore.ts 中的每日基础收入 (500 → 300)
  - [x] SubTask 4.1.2: 调整角色收入加成系数 (100 → 50)
  - [x] SubTask 4.1.3: 调整剧情收入加成系数 (50 → 30)
  - [x] SubTask 4.1.4: 调整人气收入系数 (×0.1 → ×0.05)

- [ ] Task 4.2: 调整消耗数值
  - [x] SubTask 4.2.1: 修改员工工资计算 (调整默认员工工资)
  - [ ] SubTask 4.2.2: 添加卡池创建费用（需要整合金币系统）
  - [ ] SubTask 4.2.3: 添加活动创建费用（需要整合金币系统）

- [ ] Task 4.3: 实现难度梯度
  - [ ] SubTask 4.3.1: 在 simulationStore 中添加难度系数
  - [ ] SubTask 4.3.2: 根据游戏天数调整难度
  - [ ] SubTask 4.3.3: 应用难度系数到各项计算

## Phase 5: 市场模拟深化（中优先级）
- [ ] Task 5.1: 完善竞品 AI 行为
  - [ ] SubTask 5.1.1: 在 simulationStore 中实现竞品发布新游戏逻辑
  - [ ] SubTask 5.1.2: 实现竞品举办活动逻辑
  - [ ] SubTask 5.1.3: 实现竞品降价促销逻辑
  - [ ] SubTask 5.1.4: 实现竞品负面事件逻辑

- [ ] Task 5.2: 实现市场趋势系统
  - [ ] SubTask 5.2.1: 创建题材热度周期系统
  - [ ] SubTask 5.2.2: 创建玩法偏好周期系统
  - [ ] SubTask 5.2.3: 创建付费意愿周期系统
  - [ ] SubTask 5.2.4: 在 MarketDashboard 中显示趋势预警

- [ ] Task 5.3: 实现行业事件系统
  - [ ] SubTask 5.3.1: 创建行业事件配置文件
  - [ ] SubTask 5.3.2: 实现行业事件触发逻辑
  - [ ] SubTask 5.3.3: 创建行业事件处理 UI

## Phase 6: 目标提示优化（低优先级）
- [ ] Task 6.1: 优化里程碑提示
  - [ ] SubTask 6.1.1: 在 GameDetailView 中添加里程碑进度条
  - [ ] SubTask 6.1.2: 显示下一个里程碑条件
  - [ ] SubTask 6.1.3: 显示距离目标的差距

- [ ] Task 6.2: 添加推荐操作提示
  - [ ] SubTask 6.2.1: 创建推荐操作计算逻辑
  - [ ] SubTask 6.2.2: 在 HomeView 中显示推荐操作区
  - [ ] SubTask 6.2.3: 提供快捷操作按钮

# Task Dependencies
- Task 1.x 可以独立开始
- Task 2.x 可以独立开始
- Task 3.x 依赖于 Task 2.x 完成（需要任务完成触发动画）
- Task 4.x 可以独立开始
- Task 5.x 可以独立开始
- Task 6.x 依赖于 Task 1.x 完成（需要引导完成后的目标提示）
