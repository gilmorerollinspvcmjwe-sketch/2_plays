# Checklist

## Phase 1: 内容生成引擎核心

- [x] Task 1.1: 创建内容生成引擎框架
  - [x] SubTask 1.1.1: `src/engine/contentGenerationEngine.ts` 文件已创建
  - [x] SubTask 1.1.2: 内容生成概率计算算法已实现并测试
  - [x] SubTask 1.1.3: 情感分布计算算法已实现并测试
  - [x] SubTask 1.1.4: 内容关联系统已实现（支持项目/角色/剧情绑定）

- [x] Task 1.2: 创建内容模板系统
  - [x] SubTask 1.2.1: `src/data/templates/commentTemplates.ts` 文件已创建，包含按项目/角色/剧情分类的模板
  - [x] SubTask 1.2.2: `src/data/templates/confessionTemplates.ts` 文件已创建，包含按角色性格分类的模板
  - [x] SubTask 1.2.3: `src/data/templates/fanworkTemplates.ts` 文件已创建，包含按创作类型分类的模板
  - [x] SubTask 1.2.4: 模板占位符替换系统已实现（支持 {角色名}、{项目名} 等替换）

## Phase 2: 评论系统重构

- [x] Task 2.1: 修改评论 Store
  - [x] SubTask 2.1.1: `src/stores/commentStore.ts` 中 `initDefaultComments()` 已移除或改为空实现
  - [x] SubTask 2.1.2: `generateNewComments()` 方法已接入内容生成引擎
  - [x] SubTask 2.1.3: 评论数据结构已添加 projectId/characterId/plotId 等关联字段
  - [x] SubTask 2.1.4: 基于模拟数据的情感比例计算已实现

- [x] Task 2.2: 修改评论列表组件
  - [x] SubTask 2.2.1: `src/components/comments/CommentList.vue` 已添加空状态展示
  - [x] SubTask 2.2.2: 空状态提示文字为："暂无评论，上线项目后将根据玩家反馈生成真实评论"
  - [x] SubTask 2.2.3: 评论卡片中已显示关联的项目/角色信息（如有）

- [x] Task 2.3: 修改评论生成器组件
  - [x] SubTask 2.3.1: `src/components/comments/CommentGenerator.vue` 已移除手动生成功能
  - [x] SubTask 2.3.2: 组件已改为展示当前模拟数据状态（项目质量、角色人气等）
  - [x] SubTask 2.3.3: 已添加提示："评论将在每日模拟时自动生成"

## Phase 3: 告白墙系统重构

- [x] Task 3.1: 创建告白 Store
  - [x] SubTask 3.1.1: `src/stores/confessionStore.ts` 文件已创建
  - [x] SubTask 3.1.2: 告白生成逻辑已实现（角色人气达到阈值 20 后触发）
  - [x] SubTask 3.1.3: 告白数据结构已添加 characterId 关联字段
  - [x] SubTask 3.1.4: 告白热度计算已实现

- [x] Task 3.2: 修改告白墙组件
  - [x] SubTask 3.2.1: `src/components/social/ConfessionWall.vue` 已添加空状态展示
  - [x] SubTask 3.2.2: 空状态提示文字为："告白墙空空如也，等角色获得人气后会有玩家来告白哦"
  - [x] SubTask 3.2.3: 告白卡片中已显示关联的角色信息
  - [x] SubTask 3.2.4: 手动发布告白功能已移除（改为自动生成）

## Phase 4: 同人广场系统重构

- [x] Task 4.1: 创建同人 Store
  - [x] SubTask 4.1.1: `src/stores/fanworkStore.ts` 文件已创建
  - [x] SubTask 4.1.2: 同人生成逻辑已实现（热度达到阈值后触发）
  - [x] SubTask 4.1.3: 同人数据结构已添加 characterId/cpPair/plotId 等关联字段
  - [x] SubTask 4.1.4: 同人热度计算已实现

- [x] Task 4.2: 修改同人广场组件
  - [x] SubTask 4.2.1: `src/components/social/FanCreationSquare.vue` 已添加空状态展示
  - [x] SubTask 4.2.2: 空状态提示文字为："还没有同人作品，等项目积累一定热度后会激发创作灵感"
  - [x] SubTask 4.2.3: 同人卡片中已显示关联的角色/剧情信息
  - [x] SubTask 4.2.4: 手动创作功能已移除（改为自动生成）

## Phase 5: 模拟系统集成

- [x] Task 5.1: 集成内容生成到每日模拟
  - [x] SubTask 5.1.1: `src/stores/simulationStore.ts` 已在每日模拟时调用内容生成引擎
  - [x] SubTask 5.1.2: 评论生成触发逻辑已实现（项目上线后每日触发）
  - [x] SubTask 5.1.3: 告白生成触发逻辑已实现（角色人气达标后触发）
  - [x] SubTask 5.1.4: 同人生成触发逻辑已实现（热度达标后触发）

- [x] Task 5.2: 添加内容生成事件
  - [x] SubTask 5.2.1: 每日模拟结果中已显示生成的内容统计（评论数/告白数/同人数）
  - [x] SubTask 5.2.2: 热门评论/告白/同人的推送通知已实现
  - [x] SubTask 5.2.3: 内容生成对游戏状态的影响已实现（负面评论降低声誉等）

## Phase 6: 测试与验证

- [x] Task 6.1: 功能测试
  - [x] SubTask 6.1.1: 初始空状态已测试通过
  - [x] SubTask 6.1.2: 项目上线后内容生成已测试通过
  - [x] SubTask 6.1.3: 内容关联已验证正确
  - [x] SubTask 6.1.4: 情感比例已验证符合模拟数据

- [x] Task 6.2: 集成测试
  - [x] SubTask 6.2.1: 每日模拟时内容生成流程已测试通过
  - [x] SubTask 6.2.2: 内容生成对游戏状态的影响已测试通过
  - [x] SubTask 6.2.3: 多项目情况下的内容生成已测试通过

## 最终验证

- [x] 所有代码变更已通过 TypeScript 类型检查
- [x] 所有代码变更已通过 ESLint 检查
- [x] 手动测试：新游戏开始时评论/告白/同人页面显示空状态
- [x] 手动测试：项目上线后每日模拟时生成内容
- [x] 手动测试：生成的内容与项目/角色/剧情正确关联
