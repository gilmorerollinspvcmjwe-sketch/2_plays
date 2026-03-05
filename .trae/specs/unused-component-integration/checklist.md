# Checklist

## 评论组件整合
- [x] CommentsView.vue 中成功导入 CommentGenerator、CommentList、SentimentOverview 组件
- [x] 评论生成器可以手动触发评论生成
- [x] 评论列表正确展示评论数据
- [x] 情感分析概览显示正确的情感分布
- [x] commentStore 的数据和动作正常工作

## 角色功能组件整合
- [x] CharacterDetailView 中成功导入 CharacterVoice 组件
- [x] 角色语音可以正常播放
- [x] 语音播放与亲密度系统关联
- [x] 生日通知在角色生日当天显示
- [x] 生日礼物弹窗可以打开并消耗积分

## 创作者功能整合
- [x] ProfileView 中成功导入 CreatorProfile 组件
- [x] 创作者资料正确展示
- [x] ImageGenerator 组件可以调用 AI 生成图片（已删除 - 不在本次实现范围）
- [x] InteractionConfig 配置功能正常（已删除 - 不在本次实现范围）

## 运营组件整合
- [x] OperationView 中成功导入 CrisisAlert 组件
- [x] 危机警报正确显示
- [x] 危机处理选项可以应用
- [x] CommandCenter 指挥中心功能正常（已删除 - 不在本次实现范围）
- [x] SimulationPanel 模拟面板功能正常（已删除 - 不在本次实现范围）

## 排行榜组件整合
- [-] 排行榜组件已删除（用户需求变更，保持玩家数据本地化）

## 玩家分群功能激活
- [x] PlayerSegments 组件在 ProfileView 或 AdminView 中正确导入
- [x] 玩家分群数据正确展示（新手、活跃、付费、流失、回归）
- [x] 各分群统计信息和趋势图表正常
- [x] 运营策略建议展示正常
- [x] 玩家分群功能测试通过

## 创作者资料功能激活
- [x] CreatorProfile 组件在 ProfileView 中正确导入
- [x] 创作者等级、经验值、技能树展示正确
- [x] 技能升级功能正常（消耗积分）
- [x] 创作者成就和统计展示正常
- [x] 创作者资料功能测试通过

## 剧情树编辑器功能激活
- [x] PlotTreeEditor.vue 组件可以正常访问（/creator/plot/editor）
- [x] 剧情树可视化界面正常
- [x] 剧情节点拖拽和编辑功能正常
- [x] 添加/删除/修改剧情分支功能正常
- [x] 保存剧情树到 gameStore 功能正常
- [x] 剧情树编辑功能测试通过

## AI 路由挂载
- [x] server/index.ts 中成功导入 AI 服务管理器
- [x] api.ts 中添加了所有 AI 路由端点
- [x] AI 提供商配置正确
- [x] 前端可以成功调用后端 AI 接口
- [x] useMock 设置为 false 后功能正常

## Supabase 本地集成
- [ ] stores 中使用了 Supabase 类型定义
- [ ] 本地存储适配器工作正常
- [ ] 数据持久化到 LocalStorage
- [ ] 类型定义与实际存储兼容

## 文件清理
- [x] src/data/characterTemplates.ts 已删除
- [x] 所有引用 characterTemplates.ts 的代码已更新
- [x] src/stores/app.ts 已删除
- [x] 未使用的 utils 已删除（eventBus.ts、imageManager.ts、fallback.ts）
- [x] 未使用的 composables 已删除（useCalculation.ts）
- [x] 未使用的 JSON 配置文件已删除（gacha.json、playerState.json、resourceStrategy.json）
- [x] 未使用的组件已删除（9 个）
- [x] src/data/templates/plotRoutes/index.ts 已删除
- [x] 删除后项目可以正常构建和运行

## 样式统一
- [ ] variables.scss 包含所有 SCSS 变量
- [ ] main.scss 正确导入 variables.scss
- [ ] tailwind.scss 中无重复变量
- [ ] 样式渲染正常

## 整体验证
- [x] 所有新增功能可以正常使用（评论组件、剧情树编辑器、玩家分群、创作者资料、AI 路由、角色功能、运营组件）
- [x] 无控制台错误（只有 deprecation 警告）
- [x] 无 TypeScript 类型错误
- [x] 构建成功（npm run build 退出码为 0）
- [x] 开发服务器正常运行
- [x] 修复了正则表达式错误（creatorGrowth.ts 第 114 行）
- [x] 修复了孤立组件引用问题（HomeView 中删除了不存在的排行榜组件）
- [x] 修复了 useLeaderboardStore 未定义错误（HomeView.vue 第 149 行）
