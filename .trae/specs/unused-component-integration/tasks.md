# Tasks

- [x] Task 1: 在 CommentsView.vue 中接入评论组件
  - [x] SubTask 1.1: 在 CommentsView.vue 中导入 CommentGenerator、CommentList、SentimentOverview 组件
  - [x] SubTask 1.2: 整合 commentStore 的数据和动作
  - [x] SubTask 1.3: 调整组件布局，合理展示三个子组件
  - [x] SubTask 1.4: 测试评论生成、列表展示和情感分析功能

- [ ] Task 2: 在 CharacterDetailView 中整合角色功能组件
  - [ ] SubTask 2.1: 在 CharacterDetailView 中导入 CharacterVoice 组件
  - [ ] SubTask 2.2: 整合语音播放功能与亲密度系统
  - [ ] SubTask 2.3: 添加生日通知和礼物弹窗功能
  - [ ] SubTask 2.4: 测试生日触发和语音播放

- [ ] Task 3: 在 ProfileView 中整合创作者功能组件
  - [ ] SubTask 3.1: 在 ProfileView 中导入 CreatorProfile 组件
  - [ ] SubTask 3.2: 整合 ImageGenerator 组件（AI 图片生成）
  - [ ] SubTask 3.3: 添加 InteractionConfig 配置功能
  - [ ] SubTask 3.4: 测试创作者资料展示和图片生成功能

- [ ] Task 4: 在 OperationView 中整合运营相关组件
  - [ ] SubTask 4.1: 在 OperationView 中导入 CrisisAlert 组件
  - [ ] SubTask 4.2: 整合 CommandCenter 指挥中心组件
  - [ ] SubTask 4.3: 整合 SimulationPanel 模拟面板组件
  - [ ] SubTask 4.4: 测试危机处理和运营指挥功能

- [ ] Task 5: 在 HomeView 或其他页面整合排行榜组件
  - [ ] SubTask 5.1: 评估排行榜组件最佳展示位置
  - [ ] SubTask 5.2: 在选定位置导入 BestsellerList 和 PopularityRanking 组件
  - [ ] SubTask 5.3: 整合 leaderboardStore 数据
  - [ ] SubTask 5.4: 测试排行榜展示和更新

- [x] Task 5.1: 激活玩家分群组件功能
  - [x] SubTask 5.1.1: 在 ProfileView 或新建 AdminView 中导入 PlayerSegments 组件
  - [x] SubTask 5.1.2: 整合 playerStore 和 simulationStore 的玩家分群数据
  - [x] SubTask 5.1.3: 展示各分群统计信息和趋势图表
  - [x] SubTask 5.1.4: 添加运营策略建议展示
  - [x] SubTask 5.1.5: 测试玩家分群功能

- [x] Task 5.2: 激活创作者资料组件功能
  - [x] SubTask 5.2.1: 在 ProfileView 中导入 CreatorProfile 组件
  - [x] SubTask 5.2.2: 整合 creatorGrowth 类型和相关数据
  - [x] SubTask 5.2.3: 实现技能升级功能（消耗积分）
  - [x] SubTask 5.2.4: 展示创作者成就和统计
  - [x] SubTask 5.2.5: 测试创作者资料功能

- [x] Task 5.3: 激活剧情树编辑器功能
  - [x] SubTask 5.3.1: 检查 PlotTreeEditor.vue 组件当前状态
  - [x] SubTask 5.3.2: 整合 plotBranch 类型和 gameStore 的剧情数据
  - [x] SubTask 5.3.3: 实现剧情节点拖拽和编辑功能
  - [x] SubTask 5.3.4: 实现保存剧情树到 gameStore
  - [x] SubTask 5.3.5: 测试剧情树编辑和保存功能

- [x] Task 6: 在 server/routes/api.ts 中挂载 AI 路由
  - [x] SubTask 6.1: 在 server/index.ts 中导入 AI 服务管理器
  - [x] SubTask 6.2: 在 api.ts 中添加 AI 相关路由端点
  - [x] SubTask 6.3: 配置 AI 提供商和 API Key
  - [x] SubTask 6.4: 测试 AI 路由调用（从前端到后端）
  - [x] SubTask 6.5: 将前端 aiService.ts 的 useMock 改为 false

- [ ] Task 7: 集成 Supabase 到本地存储
  - [ ] SubTask 7.1: 在 stores 中导入 Supabase 类型定义
  - [ ] SubTask 7.2: 创建本地存储适配器（使用 Supabase 接口但存 LocalStorage）
  - [ ] SubTask 7.3: 在 gameStore、playerStore 等核心 store 中使用 Supabase 类型
  - [ ] SubTask 7.4: 测试数据持久化功能

- [x] Task 8: 删除重复和未使用的文件
  - [x] SubTask 8.1: 删除 src/data/characterTemplates.ts
  - [x] SubTask 8.2: 更新所有引用 characterTemplates.ts 的代码
  - [x] SubTask 8.3: 删除 src/stores/app.ts
  - [x] SubTask 8.4: 删除未使用的 utils（eventBus.ts、imageManager.ts、fallback.ts）
  - [x] SubTask 8.5: 删除未使用的 composables（useCalculation.ts）
  - [x] SubTask 8.6: 删除未使用的 JSON 配置文件（gacha.json、playerState.json、resourceStrategy.json）
  - [x] SubTask 8.7: 删除未使用的组件（9 个）
  - [x] SubTask 8.8: 删除 src/data/templates/plotRoutes/index.ts

- [ ] Task 9: 统一 SCSS 变量定义
  - [ ] SubTask 9.1: 将 tailwind.scss 中的变量移动到 variables.scss
  - [ ] SubTask 9.2: 在 main.scss 中先导入 variables.scss
  - [ ] SubTask 9.3: 删除 tailwind.scss 中的重复变量定义
  - [ ] SubTask 9.4: 测试样式渲染

- [x] Task 10: 验证和测试
  - [x] SubTask 10.1: 测试所有新增的组件功能
  - [x] SubTask 10.2: 测试 AI 路由调用
  - [x] SubTask 10.3: 测试数据持久化
  - [x] SubTask 10.4: 运行构建确保无错误
  - [x] SubTask 10.5: 检查控制台警告和错误

# Task Dependencies
- [Task 6] depends on [Task 1] (AI 路由需要先测试评论生成)
- [Task 7] depends on [Task 6] (数据库集成在 AI 路由之后)
- [Task 8] depends on [Task 1, 2, 3, 4, 5, 5.1, 5.2, 5.3] (确保组件整合完成后再删除)
- [Task 9] is independent
- [Task 10] depends on [All Tasks]
