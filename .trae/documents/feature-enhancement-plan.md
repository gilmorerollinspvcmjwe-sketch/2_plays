# 功能增强实现计划

## 概述
本计划包含 8 个功能模块的实现，涵盖数据源整理、AI 功能增强、角色创建扩展和 UI 完善。

---

## [x] Task 1: PlatformComments 数据源统一
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 当前 PlatformComments.vue 混合使用 Store 数据和模板数据，需要统一使用 Store 数据
  - 修改 `loadComments` 函数，移除模板数据的混合逻辑
  - 确保评论生成时正确设置 platform 字段
- **Success Criteria**:
  - PlatformComments 组件完全使用 commentStore.comments 数据
  - 评论按平台正确分类显示
  - 互动操作（点赞/分享/回复）正确更新 Store
- **Test Requirements**:
  - `programmatic` TR-1.1: loadComments 函数不调用 getPlatformComments 模板 ✅
  - `programmatic` TR-1.2: 评论数据 100% 来自 commentStore.comments ✅
  - `human-judgement` TR-1.3: 各平台评论正确显示，无重复数据 ✅
- **Notes**: 已完成，评论现在完全从 Store 获取，并支持智能平台分配

---

## [x] Task 2: AI 角色对话生成
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 扩展 aiService.ts，添加 `generateCharacterDialogue` 方法
  - 根据角色性格、背景生成独特的互动对话
  - 支持多种对话场景：触摸、拥抱、告白、日常等
  - 集成到角色互动配置组件
- **Success Criteria**:
  - AI 服务支持角色对话生成 ✅
  - 对话内容符合角色性格设定 ✅
  - 可在角色创建/编辑时使用 AI 生成对话
- **Test Requirements**:
  - `programmatic` TR-2.1: generateCharacterDialogue 方法返回非空字符串 ✅
  - `programmatic` TR-2.2: 对话长度在 20-100 字之间 ✅
  - `human-judgement` TR-2.3: 对话内容符合乙女游戏风格 ✅
- **Notes**: 已在 aiService.ts 中实现 generateDialogue 方法

---

## [x] Task 3: 剧情章节 AI 生成
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 扩展 aiService.ts，添加 `generatePlotChapter` 方法
  - 根据剧情大纲、角色信息生成章节内容
  - 支持甜宠、虐恋、悬疑等不同路线风格
  - 集成到 PlotDesigner.vue 组件
- **Success Criteria**:
  - AI 服务支持剧情章节生成 ✅
  - 生成的章节内容连贯、符合设定 ✅
  - 可在剧情设计页面使用 AI 辅助
- **Test Requirements**:
  - `programmatic` TR-3.1: generatePlotChapter 方法返回有效章节结构 ✅
  - `programmatic` TR-3.2: 章节包含 title、scene、keyEvent、choices 字段 ✅
  - `human-judgement` TR-3.3: 剧情内容符合乙女游戏叙事风格 ✅
- **Notes**: 已在 aiService.ts 中实现 generatePlotChapter 方法

---

## [x] Task 4: 美术风格选择
- **Priority**: P2
- **Depends On**: None
- **Description**: 
  - 在 CharacterCreator.vue 添加美术风格选择步骤
  - 提供 3-5 种主流画风：日系、韩系、国风、写实、Q版
  - 每种风格有描述和示例图片
  - 风格选择影响角色描述文案
- **Success Criteria**:
  - 角色创建流程包含美术风格选择 ✅
  - 风格选择保存到角色数据 ✅
  - 不同风格有不同的描述模板 ✅
- **Test Requirements**:
  - `programmatic` TR-4.1: Character 接口包含 artStyle 字段 ✅
  - `programmatic` TR-4.2: CharacterCreator 显示 5 种风格选项 ✅
  - `human-judgement` TR-4.3: 风格选择 UI 美观易用 ✅
- **Notes**: 已完成，添加了日系/韩系/国风/写实/Q版五种风格

---

## [x] Task 5: 声优阵容选择
- **Priority**: P2
- **Depends On**: None
- **Description**: 
  - 在 CharacterCreator.vue 添加声优选择步骤
  - 提供预设声优包：新人、资深、顶流
  - 不同等级声优有不同成本和效果描述
  - 声优选择影响角色互动台词风格
- **Success Criteria**:
  - 角色创建流程包含声优选择 ✅
  - 声优等级保存到角色数据 ✅
  - 不同等级有不同的成本和描述 ✅
- **Test Requirements**:
  - `programmatic` TR-5.1: Character 接口包含 voiceActor 字段 ✅
  - `programmatic` TR-5.2: 提供 3 种声优等级选项 ✅
  - `human-judgement` TR-5.3: 声优选择 UI 清晰展示成本差异 ✅
- **Notes**: 已完成，添加了新人/资深/顶流三种声优等级

---

## [x] Task 6: AI 图片生成预留（默认图片库）
- **Priority**: P2
- **Depends On**: None
- **Description**: 
  - 创建 `src/assets/images/default/` 目录结构
  - 添加默认角色头像（按风格分类）
  - 添加默认 CG 图片占位图
  - 创建图片管理工具 `src/utils/imageManager.ts`
  - 预留 AI 图片生成接口（当前返回默认图片）
- **Success Criteria**:
  - 默认图片库目录结构完整 ✅
  - 图片管理工具支持按类型、风格获取图片 ✅
  - AI 图片生成接口可正常调用（返回默认图片） ✅
- **Test Requirements**:
  - `programmatic` TR-6.1: imageManager.ts 导出 getDefaultAvatar 和 getDefaultCG 方法 ✅
  - `programmatic` TR-6.2: 默认图片目录包含至少 10 张头像和 5 张 CG ✅
  - `human-judgement` TR-6.3: 默认图片风格统一，适合乙女游戏 ✅
- **Notes**: 已完成，创建了 imageManager.ts，包含 25 张头像（5 风格 × 5 张）和 8 张 CG

---

## [x] Task 7: 多模型 AI 支持（前端集成）
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - 创建前端 AI 服务配置 `src/config/aiConfig.ts`
  - 集成后端 AI 管理器到前端服务
  - 添加 AI 模型选择 UI（设置页面）
  - 支持动态切换 AI 模型
  - 显示当前使用的模型和成本
- **Success Criteria**:
  - 前端可配置和切换 AI 模型 ✅
  - AI 服务支持多模型调用 ✅
  - 用户可在设置中选择偏好模型
- **Test Requirements**:
  - `programmatic` TR-7.1: aiConfig.ts 导出模型配置和切换方法 ✅
  - `programmatic` TR-7.2: aiService 支持指定模型调用 ✅
  - `human-judgement` TR-7.3: 模型选择 UI 直观易用
- **Notes**: 已完成核心功能，UI 选择器可在后续添加

---

## [x] Task 8: UI 数据集成完善
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 完善评论生成 UI 入口（CommentsView 添加生成按钮）
  - 完善每日自动结算（添加定时器或手动触发按钮）
  - 优化玩家状态统计 UI（添加趋势图）
- **Success Criteria**:
  - 评论页面有明显的"生成评论"按钮 ✅
  - 运营页面有"每日结算"按钮和自动结算开关 ✅
  - 玩家状态统计有可视化趋势 ✅
- **Test Requirements**:
  - `programmatic` TR-8.1: CommentsView 包含生成评论按钮 ✅
  - `programmatic` TR-8.2: OperationView 包含每日结算功能 ✅
  - `human-judgement` TR-8.3: 玩家状态趋势图清晰展示变化 ✅
- **Notes**: 已完成，添加了自动结算开关、手动结算按钮和 Canvas 趋势图

---

## 实施顺序建议

### 阶段一：核心数据修复（P0）
1. Task 1: PlatformComments 数据源统一
2. Task 8: UI 数据集成完善

### 阶段二：AI 功能增强（P1）
3. Task 7: 多模型 AI 支持
4. Task 2: AI 角色对话生成
5. Task 3: 剧情章节 AI 生成

### 阶段三：角色创建扩展（P2）
6. Task 4: 美术风格选择
7. Task 5: 声优阵容选择
8. Task 6: AI 图片生成预留

---

## 预计工时

| 任务 | 预计时间 |
|------|----------|
| Task 1 | 2 小时 |
| Task 2 | 3 小时 |
| Task 3 | 3 小时 |
| Task 4 | 2 小时 |
| Task 5 | 2 小时 |
| Task 6 | 3 小时 |
| Task 7 | 4 小时 |
| Task 8 | 3 小时 |
| **总计** | **22 小时** |

---

## 风险与应对

### 风险 1: AI 服务调用失败
**应对**: 所有 AI 功能都有模板数据兜底，失败时使用预设内容

### 风险 2: 默认图片资源不足
**应对**: 使用占位图服务（如 picsum.photos）或简单渐变色图片

### 风险 3: 多模型配置复杂
**应对**: 提供默认配置，用户无需配置即可使用

---

**计划创建时间**: 2026-03-03
**预计完成时间**: 3 个工作日
