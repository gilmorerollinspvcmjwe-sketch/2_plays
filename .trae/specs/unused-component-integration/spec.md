# 未使用组件整合与 AI 路由挂载 Spec

## Why
项目经过全面分析发现存在约 30-40% 的未使用代码，包括：
- 16 个组件完全未被引用
- AI 服务前后端未打通（前端调用模拟数据，后端路由未挂载）
- Supabase 定义完善但未实际使用
- 评论组件完整但未接入 CommentsView
- 角色模板重复定义
- 部分组件虽被路由引用但未实际使用（PlayerSegments、CreatorProfile、PlotTreeEditor）
- 存在完全未使用的 store 和数据文件

## What Changes
- **挂载未使用的组件到对应页面**：将 16 个未使用的组件整合到相关功能页面
- **在 server/routes/api.ts 中挂载 AI 路由**：打通前后端 AI 服务
- **集成 Supabase 到本地存储**：保留 Supabase 集成，但目前数据仍存本地
- **在 CommentsView.vue 中接入评论组件**：整合现有评论功能
- **删除重复的 characterTemplates.ts**：统一使用 templates/characters/ 下的模板
- **清理未使用的文件**：删除完全未使用的组件、工具、配置文件
- **激活未实际使用的组件**：为玩家分群、创作者资料、剧情树编辑器增加实际使用场景
- **删除未使用的 store 和数据文件**：删除 app.ts 和 5 个未使用的数据文件

## Impact
- **Affected specs**: 与 gameplay-enhancement、ui-data-integration 相关
- **Affected code**: 
  - CommentsView.vue
  - server/routes/api.ts
  - src/components/comments/*
  - src/components/character/*
  - src/components/creator/*
  - src/components/operation/*
  - src/components/crisis/*
  - src/components/leaderboard/*
  - src/components/community/PlayerSegments.vue
  - src/data/characterTemplates.ts
  - src/data/config/* (未使用的 JSON 文件)
  - src/stores/app.ts
  - src/utils/* (未使用的)
  - src/views/profile/ (可能需要新增)
  - src/views/admin/ (可能需要新增)

## ADDED Requirements

### Requirement: 评论组件整合
系统 SHALL 在 CommentsView.vue 中整合以下评论相关组件：
- CommentGenerator.vue - 评论生成器
- CommentList.vue - 评论列表展示
- SentimentOverview.vue - 情感概览分析

#### Scenario: 用户查看评论页面
- **WHEN** 用户访问 `/comments` 路由
- **THEN** 可以看到评论生成器、评论列表和情感分析概览
- **AND** 可以手动触发评论生成
- **AND** 可以查看情感分布统计

### Requirement: 角色生日功能整合
系统 SHALL 在 CharacterDetailView 或 ProfileView 中整合角色生日相关组件：
- BirthdayGiftModal.vue - 生日礼物弹窗
- BirthdayNotification.vue - 生日通知

#### Scenario: 角色生日当天
- **WHEN** 用户访问角色详情页且今天是该角色生日
- **THEN** 显示生日通知组件
- **WHEN** 用户点击发送礼物
- **THEN** 打开生日礼物弹窗
- **AND** 消耗积分赠送礼物

### Requirement: 角色语音功能整合
系统 SHALL 在 CharacterDetailView 中整合 CharacterVoice.vue 组件

#### Scenario: 查看角色语音
- **WHEN** 用户在角色详情页点击语音按钮
- **THEN** 可以播放角色语音
- **AND** 语音与角色亲密度相关

### Requirement: 创作者功能整合
系统 SHALL 在 ProfileView 或 CreatorEntryView 中整合创作者相关组件：
- CreatorProfile.vue - 创作者资料展示
- ImageGenerator.vue - AI 图片生成
- InteractionConfig.vue - 交互配置

### Requirement: 危机处理功能整合
系统 SHALL 在 OperationView 中整合 CrisisAlert.vue 组件

#### Scenario: 运营危机发生
- **WHEN** 运营过程中触发危机事件
- **THEN** 显示危机警报组件
- **WHEN** 用户选择处理方案
- **THEN** 应用处理结果并更新危机状态

### Requirement: 排行榜功能整合
系统 SHALL 在 HomeView 或独立页面整合排行榜组件：
- BestsellerList.vue - 畅销榜
- PopularityRanking.vue - 人气排行

### Requirement: 运营指挥中心整合
系统 SHALL 在 OperationView 中整合：
- CommandCenter.vue - 运营指挥中心
- SimulationPanel.vue - 模拟面板

### Requirement: AI 路由挂载
系统 SHALL 在 server/routes/api.ts 中挂载 AI 相关路由：
- POST /api/ai/polish-character - AI 润色角色
- POST /api/ai/fill-plot - AI 补全剧情
- POST /api/ai/generate-comments - 生成评论
- POST /api/ai/generate-dialogue - 生成对话
- POST /api/ai/generate-plot - 生成剧情
- POST /api/ai/generate-image - 生成图片
- GET /api/ai/health - 健康检查

### Requirement: Supabase 本地集成
系统 SHALL：
- 保留 Supabase 客户端定义
- 在 stores 中使用 Supabase 类型定义
- 但数据实际存储在 LocalStorage
- 为未来迁移到真实数据库做准备

### Requirement: 模板系统统一
系统 SHALL：
- 删除 src/data/characterTemplates.ts
- 统一使用 src/data/templates/characters/ 下的模板
- 更新所有引用 characterTemplates.ts 的代码

### Requirement: 玩家分群功能激活
系统 SHALL 在 AdminView 或 ProfileView 中激活 PlayerSegments.vue 组件的实际使用：
- 展示玩家分群数据（新手玩家、活跃玩家、付费玩家、流失玩家、回归玩家）
- 显示各分群的统计信息和趋势
- 提供针对不同分群的运营策略建议

#### Scenario: 查看玩家分群
- **WHEN** 用户访问玩家分群页面
- **THEN** 可以看到各玩家分群的分布和统计
- **AND** 可以查看各分群的详细数据
- **AND** 可以获得针对性的运营建议

### Requirement: 创作者资料功能激活
系统 SHALL 在 ProfileView 中激活 CreatorProfile.vue 组件的实际使用：
- 展示创作者等级、经验值、技能树
- 显示创作者成就和统计
- 提供技能升级入口

#### Scenario: 查看创作者资料
- **WHEN** 用户访问个人中心
- **THEN** 可以看到创作者资料面板
- **WHEN** 用户点击技能升级
- **THEN** 消耗积分升级技能

### Requirement: 剧情树编辑器功能激活
系统 SHALL 确保 PlotTreeEditor.vue 组件在 `/creator/plot/editor` 路由下实际可用：
- 可视化展示剧情分支树
- 支持拖拽编辑剧情节点
- 支持添加/删除/修改剧情分支
- 保存剧情树结构到 gameStore

#### Scenario: 编辑剧情树
- **WHEN** 用户访问剧情编辑器页面
- **THEN** 可以看到剧情树可视化界面
- **WHEN** 用户拖拽节点或添加分支
- **THEN** 实时更新剧情树结构
- **WHEN** 用户点击保存
- **THEN** 保存剧情树到游戏数据

### Requirement: 删除未使用的 store
系统 SHALL 删除 src/stores/app.ts：
- 该 store 仅包含简单计数器，无任何实际用途
- 删除后不影响任何功能

### Requirement: 删除未使用的数据文件
系统 SHALL 删除以下 5 个未使用的数据文件：
- src/data/config/gacha.json - 抽卡概率配置（已在 gameBalance.ts 中定义）
- src/data/config/playerState.json - 玩家状态配置（已在 playerStore 中定义）
- src/data/config/resourceStrategy.json - 资源策略配置（已在 gameBalance.ts 中定义）
- src/data/characterTemplates.ts - 重复的角色模板
- src/data/templates/plotRoutes/index.ts - 未使用的剧情路线模板

## MODIFIED Requirements

### Requirement: CommentsView 功能增强
**原需求**：CommentsView 仅显示平台评论
**修改后**：CommentsView 整合评论生成器、评论列表和情感分析，提供完整的评论管理功能

### Requirement: OperationView 功能增强
**原需求**：OperationView 显示运营仪表盘
**修改后**：OperationView 整合危机处理、指挥中心、模拟面板，提供完整的运营控制台

## REMOVED Requirements

### Requirement: 独立的 app store
**Reason**: useAppStore 仅包含简单计数器，无任何实际用途
**Migration**: 删除 src/stores/app.ts，如有需要直接在组件中使用 ref

### Requirement: 未使用的工具函数
**Reason**: eventBus.ts、imageManager.ts、fallback.ts 完全未被使用
**Migration**: 直接删除，如未来需要重新实现

### Requirement: 未使用的 composable
**Reason**: useCalculation.ts 未被任何组件引用
**Migration**: 删除，其封装的引擎功能已通过 engine/index.ts 导出

### Requirement: 未使用的 JSON 配置文件
**Reason**: gacha.json、playerState.json、resourceStrategy.json 未被引用
**Migration**: 删除，相关配置已在 gameBalance.ts 中定义

### Requirement: 重复的角色模板
**Reason**: characterTemplates.ts 与 templates/characters/ 功能重复
**Migration**: 使用 templates/characters/ 下的模板
