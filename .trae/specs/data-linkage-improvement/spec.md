# 数据联动与系统完善 Spec

## Why

根据代码分析报告，当前系统存在多个关键的数据联动缺失，导致玩法闭环不完整。需要实现玩家状态与评论生成、节奏事件与声誉扣除、活动效果与角色人气等核心联动，同时完善 AI 生成应用和静态数据管理。

## What Changes

- **实现缺失的数据联动**：玩家状态→评论生成、节奏事件→声誉扣除、卡池爆率→玩家状态
- **完善 AI 生成应用**：角色对话生成、角色设定补充、剧情章节生成
- **静态数据独立管理**：将配置数据从 Store 分离到 JSON 文件
- **定时任务系统**：玩家状态自动转换、节奏事件声誉扣除

## Impact

- **Affected specs**: 抽卡模拟系统、评论系统、舆论系统、角色人气系统、运营系统
- **Affected code**: 
  - `src/stores/playerStore.ts` - 玩家状态自动转换
  - `src/stores/commentStore.ts` - 退坑/真香评论生成、声誉定时扣除
  - `src/stores/operationStore.ts` - 活动效果与角色人气联动
  - `src/data/config/` - 新增配置数据目录
  - `src/utils/dataLoader.ts` - 新增数据加载工具

---

## ADDED Requirements

### Requirement 1: 玩家状态与评论生成联动

系统 SHALL 在玩家状态变化时自动生成对应评论：

#### Scenario: 玩家流失生成退坑评论
- **WHEN** 玩家状态变为 LOST
- **THEN** 自动生成 1-3 条退坑评论
- **THEN** 评论情感为 negative
- **THEN** 评论平台为微博/抖音/贴吧
- **THEN** 评论内容如"这游戏不值得，退坑了"、"爆率太毒了，再见"

#### Scenario: 玩家回归生成真香评论
- **WHEN** 玩家状态变为 RETURNED
- **THEN** 自动生成 1-2 条真香评论
- **THEN** 评论情感为 positive
- **THEN** 评论平台为微博/抖音
- **THEN** 评论内容如"还是舍不得老公们，我回来了"、"听说最近有良心池，回来看看"

---

### Requirement 2: 节奏事件声誉定时扣除

系统 SHALL 每小时自动扣除节奏事件的声誉影响：

#### Scenario: 每小时扣除声誉
- **WHEN** 每小时整点
- **THEN** 遍历所有未解决的节奏事件
- **THEN** 小节奏扣除 2 点声誉
- **THEN** 大节奏扣除 5 点声誉
- **THEN** 炎上事件扣除 10 点声誉
- **THEN** 持续时间减 1 小时
- **THEN** 持续时间为 0 时标记为已解决

---

### Requirement 3: 玩家状态自动转换

系统 SHALL 每小时检查并自动转换玩家状态：

#### Scenario: 玩家长期未登录自动流失
- **WHEN** 玩家超过 30 天未登录
- **THEN** 状态自动变为 LOST
- **THEN** 记录流失时间
- **THEN** 触发退坑评论生成

#### Scenario: 流失玩家概率回归
- **WHEN** 玩家流失超过 60 天
- **THEN** 30% 概率自动回归
- **THEN** 状态变为 RETURNED
- **THEN** 触发真香评论生成

---

### Requirement 4: 活动效果与角色人气联动

系统 SHALL 在举办活动时增加参与角色的人气：

#### Scenario: 生日活动增加人气
- **WHEN** 创建生日活动
- **THEN** 生日角色人气 +5
- **THEN** 讨论热度 +10
- **THEN** 自动生成祝福评论

#### Scenario: 节日活动增加人气
- **WHEN** 创建节日活动
- **THEN** 参与角色人气 +2
- **THEN** 讨论热度 +5

---

### Requirement 5: AI 角色对话生成

系统 SHALL 使用 AI 生成角色互动对话：

#### Scenario: 点击角色生成对话
- **WHEN** 玩家点击角色头部
- **THEN** 根据角色性格生成独特对话
- **THEN** 对话符合角色设定（50 字以内）
- **THEN** 消耗 10 积分

#### Scenario: 角色设定补充
- **WHEN** 创建新角色时
- **THEN** 输入基本信息后 AI 自动补充
- **THEN** 生成性格标签（5 个）
- **THEN** 生成背景故事（100 字）
- **THEN** 生成互动台词（5 句）

---

### Requirement 6: 静态数据独立管理

系统 SHALL 将配置数据从 Store 分离到独立 JSON 文件：

#### Scenario: 抽卡配置独立
- **WHEN** 需要修改抽卡概率
- **THEN** 只需修改 `src/data/config/gacha.json`
- **THEN** 无需修改 Store 代码
- **THEN** 支持热更新

#### Scenario: 资源策略配置独立
- **WHEN** 需要调整资源分配比例
- **THEN** 只需修改 `src/data/config/resourceStrategy.json`
- **THEN** 无需修改 Store 代码

---

## MODIFIED Requirements

### Requirement: 评论生成逻辑
**原需求**: 随机生成评论

**修改后**:
- 生成评论时自动分析角色提及
- 根据评论情感调整角色人气
- 提及多个角色时增加 CP 热度
- 流失玩家生成退坑评论
- 回归玩家生成真香评论

---

### Requirement: 舆论系统
**原需求**: 评论互动和热度计算

**修改后**:
- 每小时检查节奏事件
- 自动扣除声誉
- 负面评论占比>30% 时趋势下降
- 正面评论占比>70% 时趋势上升

---

## REMOVED Requirements

无
