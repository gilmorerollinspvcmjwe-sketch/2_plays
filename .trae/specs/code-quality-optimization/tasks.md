# Tasks

## Phase 1: 路由错误处理增强 ✅
- [x] Task 1.1: 修复 MarketDashboard.vue 路由返回逻辑
- [x] Task 1.2: 修复 GameDetailView.vue 路由跳转错误处理
- [x] Task 1.3: 扫描其他视图文件添加路由错误处理

## Phase 2: 静态数据动态化 ✅
- [x] Task 2.1: HomeView.vue 市场动态动态化
- [x] Task 2.2: CharacterCreator.vue 选项配置化
- [x] Task 2.3: PlotDesigner.vue 剧情模板数据化
- [x] Task 2.4: MarketDashboard.vue 节日数据配置化
- [x] Task 2.5: simulationStore.ts 模拟数据配置化

## Phase 3: 未使用功能接入 ✅
- [x] Task 3.1: 里程碑系统 UI 接入
- [x] Task 3.2: 羁绊系统 UI 接入
- [x] Task 3.3: 角色心声系统 UI 接入
- [x] Task 3.4: 游戏评分系统 UI 接入
- [x] Task 3.5: 项目评估系统 UI 接入

## Phase 4: 代码清理 ✅
- [x] Task 4.1: 扫描并标记未使用代码
  - [x] SubTask 4.1.1: 扫描 gameStore 未使用方法
  - [x] SubTask 4.1.2: 扫描 projectStore 未使用方法
  - [x] SubTask 4.1.3: 扫描 companyStore 未使用方法

- [x] Task 4.2: 添加废弃标记
  - [x] SubTask 4.2.1: 为确认未使用的方法添加 @deprecated 注释
  - [x] SubTask 4.2.2: 添加 TODO 标记待删除代码

- [x] Task 4.3: 类型检查增强
  - [x] SubTask 4.3.1: 为路由参数添加严格类型检查
  - [x] SubTask 4.3.2: 为 Store 方法返回值添加类型定义

# Task Dependencies
- Task 2.x 之间可以并行执行（不同文件）
- Task 3.x 之间可以并行执行（不同功能模块）
- Task 3.x 依赖于 Task 2.x 完成（数据流依赖）
- Task 4.x 在所有其他任务完成后执行
