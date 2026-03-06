# Tasks

## Phase 1: 内容生成引擎核心

- [x] Task 1.1: 创建内容生成引擎框架
  - [x] SubTask 1.1.1: 创建 `src/engine/contentGenerationEngine.ts`，定义核心接口和类
  - [x] SubTask 1.1.2: 实现内容生成概率计算算法
  - [x] SubTask 1.1.3: 实现情感分布计算算法
  - [x] SubTask 1.1.4: 实现内容关联系统（与项目/角色/剧情绑定）

- [x] Task 1.2: 创建内容模板系统
  - [x] SubTask 1.2.1: 创建 `src/data/templates/commentTemplates.ts`，按项目/角色/剧情分类
  - [x] SubTask 1.2.2: 创建 `src/data/templates/confessionTemplates.ts`，按角色性格分类
  - [x] SubTask 1.2.3: 创建 `src/data/templates/fanworkTemplates.ts`，按创作类型分类
  - [x] SubTask 1.2.4: 实现模板占位符替换系统

## Phase 2: 评论系统重构

- [x] Task 2.1: 修改评论 Store
  - [x] SubTask 2.1.1: 修改 `src/stores/commentStore.ts`，移除 `initDefaultComments()` 默认评论初始化
  - [x] SubTask 2.1.2: 修改 `generateNewComments()` 方法，接入内容生成引擎
  - [x] SubTask 2.1.3: 添加评论与项目/角色/剧情的关联字段
  - [x] SubTask 2.1.4: 实现基于模拟数据的情感比例计算

- [x] Task 2.2: 修改评论列表组件
  - [x] SubTask 2.2.1: 修改 `src/components/comments/CommentList.vue`，添加空状态展示
  - [x] SubTask 2.2.2: 添加引导提示："暂无评论，上线项目后将根据玩家反馈生成真实评论"
  - [x] SubTask 2.2.3: 在评论卡片中显示关联的项目/角色信息

- [x] Task 2.3: 修改评论生成器组件
  - [x] SubTask 2.3.1: 修改 `src/components/comments/CommentGenerator.vue`，移除手动生成功能
  - [x] SubTask 2.3.2: 改为展示当前模拟数据状态（项目质量、角色人气等）
  - [x] SubTask 2.3.3: 添加提示：评论将在每日模拟时自动生成

## Phase 3: 告白墙系统重构

- [x] Task 3.1: 创建告白 Store
  - [x] SubTask 3.1.1: 创建 `src/stores/confessionStore.ts`，管理告白数据
  - [x] SubTask 3.1.2: 实现告白生成逻辑（基于角色人气阈值）
  - [x] SubTask 3.1.3: 添加告白与角色的关联字段
  - [x] SubTask 3.1.4: 实现告白热度计算

- [x] Task 3.2: 修改告白墙组件
  - [x] SubTask 3.2.1: 修改 `src/components/social/ConfessionWall.vue`，添加空状态展示
  - [x] SubTask 3.2.2: 添加引导提示："告白墙空空如也，等角色获得人气后会有玩家来告白哦"
  - [x] SubTask 3.2.3: 在告白卡片中显示关联的角色信息
  - [x] SubTask 3.2.4: 移除手动发布告白功能（改为自动生成）

## Phase 4: 同人广场系统重构

- [x] Task 4.1: 创建同人 Store
  - [x] SubTask 4.1.1: 创建 `src/stores/fanworkStore.ts`，管理同人作品数据
  - [x] SubTask 4.1.2: 实现同人生成逻辑（基于热度阈值）
  - [x] SubTask 4.1.3: 添加同人与角色/剧情/CP的关联字段
  - [x] SubTask 4.1.4: 实现同人热度计算

- [x] Task 4.2: 修改同人广场组件
  - [x] SubTask 4.2.1: 修改 `src/components/social/FanCreationSquare.vue`，添加空状态展示
  - [x] SubTask 4.2.2: 添加引导提示："还没有同人作品，等项目积累一定热度后会激发创作灵感"
  - [x] SubTask 4.2.3: 在同人卡片中显示关联的角色/剧情信息
  - [x] SubTask 4.2.4: 移除手动创作功能（改为自动生成）

## Phase 5: 模拟系统集成

- [x] Task 5.1: 集成内容生成到每日模拟
  - [x] SubTask 5.1.1: 修改 `src/stores/simulationStore.ts`，在每日模拟时调用内容生成引擎
  - [x] SubTask 5.1.2: 实现评论生成触发逻辑（项目上线后）
  - [x] SubTask 5.1.3: 实现告白生成触发逻辑（角色人气达标后）
  - [x] SubTask 5.1.4: 实现同人生成触发逻辑（热度达标后）

- [x] Task 5.2: 添加内容生成事件
  - [x] SubTask 5.2.1: 在每日模拟结果中显示生成的内容统计
  - [x] SubTask 5.2.2: 添加热门评论/告白/同人的推送通知
  - [x] SubTask 5.2.3: 实现内容生成对游戏状态的影响（如负面评论影响声誉）

## Phase 6: 测试与验证

- [x] Task 6.1: 功能测试
  - [x] SubTask 6.1.1: 测试初始空状态是否正确显示
  - [x] SubTask 6.1.2: 测试项目上线后内容是否正确生成
  - [x] SubTask 6.1.3: 测试内容关联是否正确
  - [x] SubTask 6.1.4: 测试情感比例是否符合模拟数据

- [x] Task 6.2: 集成测试
  - [x] SubTask 6.2.1: 测试每日模拟时内容生成流程
  - [x] SubTask 6.2.2: 测试内容生成对游戏状态的影响
  - [x] SubTask 6.2.3: 测试多项目情况下的内容生成

# Task Dependencies

- Task 1.1 和 Task 1.2 是其他所有任务的基础，需要首先完成
- Task 2.x 可以并行于 Task 3.x 和 Task 4.x
- Task 5.x 依赖于 Task 1.x、Task 2.x、Task 3.x、Task 4.x 的完成
- Task 6.x 依赖于所有其他任务的完成
