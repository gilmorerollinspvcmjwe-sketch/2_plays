# 项目问题修复报告

## 修复时间

2026-03-06

## 本次修复范围

本次主要修复了三类问题：

- 运行时会直接报错或导致功能失效的问题
- 页面跳转错误和交互流程错误
- 组件与 store 之间的数据结构不匹配问题

## 已修复问题

### 1. 路由与页面跳转

- 修复了 `src/router/index.ts` 中公司创建页守卫错误跳转到 `/home` 的问题，改为跳转到真实存在的首页 `/`
- 为路由守卫补充了 `import()` 失败时的错误处理，避免导航卡死
- 修复了 `src/views/HomeView.vue` 中跳转到不存在的 `/plot-designer` 路径，改为 `/creator/plot`

### 2. 引擎与核心逻辑

- 修复了 `src/engine/crisisTriggerEngine.ts` 中把运行时值用 `import type` 导入的问题，避免危机模板和初始化函数在运行时变成 `undefined`
- 修复了 `src/engine/contentGenerationEngine.ts` 中同人点赞计算使用错误 key 的问题，避免 `NaN` 点赞数

### 3. 评论系统

- 修复了 `src/stores/commentStore.ts` 中对 `computed` 的 `publicOpinion` 和 `sentimentStats` 直接赋值导致的运行时错误
- 将上述两个字段改为可写 `ref`，并增加基于模拟数据的初始化/同步逻辑
- 修复了 `pointsStore` 未注入就被调用的问题
- 修复了回复评论时错误使用不存在的 `replies` 字段，改为累加 `comments`
- 修复了标签统计时未对 `tags` 做空值保护的问题
- 修复了评论列表同步后没有刷新舆情和统计的问题
- 修复了从本地存储恢复后未重新同步舆情数据的问题
- 修复了 `buildGenerationContext()` 里错误读取 `gameStore.characters / gameStore.plots` 的问题，改为从 `currentGame` 中读取

### 4. 评论页面与评论组件

- 修复了 `src/views/CommentsView.vue` 中监听 `CommentGenerator` 不存在的 `generate` 事件的问题
- 修复了控评确认弹窗取消时未捕获异常的问题
- 移除了 `CommentsView` 中无用的 store / filter 代码，避免后续维护混乱
- 修复了 `src/components/comments/CommentGenerator.vue` 中把 `sentiment` 当作“剧情热度”展示的问题，改为使用热度字段
- 修复了 `src/components/comments/CommentList.vue` 中 `comment.tags` 可能为空导致报错的问题
- 修复了 `CommentList` 中情感标签在 `sentiment` 缺失时可能返回 `undefined` 的问题
- 修复了 `CommentList` 中上拉加载时 `loading` 状态没有正确置为 `true` 的问题

### 5. 危机处理

- 修复了 `src/components/crisis/CrisisAlert.vue` 中把 `crisis.options` 字符串数组当对象数组使用的问题
- 改为基于 `CRISIS_OPTIONS` 映射出可展示的处理方案
- 修复了 `CrisisAlert` 中使用不存在字段 `affectedUsers` 的问题，改为 `participants`
- 修复了 `CrisisAlert` 中错误判断 `pending` 状态的问题，改为按未解决状态显示
- 修复了 `CrisisAlert` 里取消处理弹窗时未捕获 rejection 的问题
- 修复了 `src/views/OperationView.vue` 中把 `CrisisResolution.successRate` 当作现有字段使用的问题
- 现在改为基于 `resolveCrisis()` 生成处理结果，并根据 `success / partial / failure` 更新危机状态

### 6. 创作者中心与新手引导

- 修复了 `src/views/CreatorCenterView.vue` 中错误使用 `requiredExp` 的问题，改为正确字段 `expRequired`
- 修复了等级进度计算依赖错误字段导致进度异常的问题
- 修复了 `src/components/OnboardingGuide.vue` 中 `totalSteps` 硬编码为 `6` 的问题，改为读取 `ONBOARDING_STEPS.length`

### 7. 签到与积分系统

- 修复了 `src/components/signin/SignInCalendar.vue` 中对签到结果的危险类型断言，改为显式构造 `rewardInfo`
- 修复了 `src/stores/points.ts` 中 `checkTitleUnlocks()` 未显式处理异步调用的问题
- 修复了 `points.ts` 中签到日期格式不一致的问题，统一使用 `YYYY-MM-DD`

### 8. 告白墙

- 修复了 `src/stores/confessionStore.ts` 中把 `character.popularity` 当数字使用的问题，改为读取 `character.popularity?.popularity`
- 修复了告白生成数量计算中的同类问题
- 修复了 `src/components/social/ConfessionWall.vue` 中列表不会随 store 更新自动刷新的问题
- 去掉了组件里硬编码的点赞用户 ID，改为统一的本地用户标识

### 9. 同人广场 / 同人创作

- 修复了 `src/components/social/FanCreationSquare.vue` 中 `getExcerpt()` 在内容为空时可能抛错的问题
- 将广场刷新监听改为监听当前筛选结果长度，避免深度 watch 导致不必要重载
- 修复了 `src/stores/fanCreationStore.ts` 中向 `computed` 的 `creations` 直接 `push` 的问题，改为写入 `userCreations`
- 修复了 `fanCreationStore` 中模拟作品作者字段映射错误的问题
- 修复了 `src/stores/fanworkStore.ts` 中从错误的 `@/types` 导入 `Plot` 的问题
- 修复了 `fanworkStore` 中错误读取 `char.popularity?.current`、`char.intimacy?.current` 的问题
- 修复了 `fanworkStore` 中错误读取 `gameStore.characters / gameStore.plots` 的问题，改为直接使用 `project.characters / project.plots`
- 修复了同人生成上下文指标组装不符合项目指标结构的问题

## 验证结果

### IDE 诊断

- 已对本次修改文件执行诊断检查
- 当前无新增 linter 报错

### 构建验证

已执行：

```bash
npm run build
```

结果：

- 构建成功
- PWA 产物成功生成

## 当前仍存在但未作为阻塞处理的问题

以下内容目前不影响构建通过，但属于后续可继续优化的技术债：

- 构建日志里仍有较多 Sass `legacy-js-api` / `@import` 弃用警告
- `App.vue` 中部分组件存在“同时静态导入和动态导入”的 chunk 警告
- `operationStore.ts` 仍存在较多设计层面的状态来源不清晰问题，尤其是 `stats` 来自 `computed` 却被多个地方写入，这一块更适合单独重构
- 评论系统中 `CommentTemplate` / `GameComment` 的业务字段仍有一定历史包袱，虽然当前关键运行时错误已修复，但类型设计仍可进一步收敛

## 本次涉及的主要文件

- `src/router/index.ts`
- `src/engine/crisisTriggerEngine.ts`
- `src/engine/contentGenerationEngine.ts`
- `src/stores/commentStore.ts`
- `src/stores/points.ts`
- `src/stores/confessionStore.ts`
- `src/stores/fanworkStore.ts`
- `src/stores/fanCreationStore.ts`
- `src/views/HomeView.vue`
- `src/views/CommentsView.vue`
- `src/views/OperationView.vue`
- `src/views/CreatorCenterView.vue`
- `src/components/comments/CommentGenerator.vue`
- `src/components/comments/CommentList.vue`
- `src/components/crisis/CrisisAlert.vue`
- `src/components/social/ConfessionWall.vue`
- `src/components/social/FanCreationSquare.vue`
- `src/components/signin/SignInCalendar.vue`
- `src/components/OnboardingGuide.vue`

## 结论

本次已完成核心逻辑错误、页面跳转错误、危机处理错误、评论系统运行时错误、签到与创作系统关键问题的修复，并确认项目可以成功构建。
