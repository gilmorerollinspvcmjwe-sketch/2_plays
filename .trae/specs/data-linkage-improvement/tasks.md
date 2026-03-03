# Tasks

## 阶段一：静态数据独立管理（2 小时）

- [x] Task 1: 创建配置数据目录和文件
  - [x] SubTask 1.1: 创建 `src/data/config/` 目录
  - [x] SubTask 1.2: 创建 `gacha.json` 抽卡配置文件
  - [x] SubTask 1.3: 创建 `resourceStrategy.json` 资源策略配置文件
  - [x] SubTask 1.4: 创建 `playerState.json` 玩家状态配置文件

- [x] Task 2: 创建数据加载工具
  - [x] SubTask 2.1: 创建 `src/utils/dataLoader.ts`
  - [x] SubTask 2.2: 添加缓存机制
  - [x] SubTask 2.3: 错误处理

- [x] Task 3: 迁移 Store 中的配置数据
  - [x] SubTask 3.1: 修改 playerStore.ts 使用新的配置加载
  - [x] SubTask 3.2: 修改 operationStore.ts 使用新的配置加载
  - [x] SubTask 3.3: 修改 gameStore.ts 使用新的配置加载
  - [x] SubTask 3.4: 测试配置加载正常

## 阶段二：玩家状态与评论生成联动（3 小时）

- [x] Task 4: 实现退坑评论生成
  - [x] SubTask 4.1: 在 commentStore.ts 添加 `generateLossComment(player: Player)` 方法
    * 从模板库随机选择退坑评论
    * 情感：negative
    * 平台：微博/抖音/贴吧随机
    * 添加到评论列表
  - [x] SubTask 4.2: 创建退坑评论模板（20 条）
  - [x] SubTask 4.3: 在 playerStore.ts 的 `updatePlayerState()` 中调用

- [x] Task 5: 实现真香评论生成
  - [x] SubTask 5.1: 在 commentStore.ts 添加 `generateReturnComment(player: Player)` 方法
    * 从模板库随机选择真香评论
    * 情感：positive
    * 平台：微博/抖音随机
    * 添加到评论列表
  - [x] SubTask 5.2: 创建真香评论模板（15 条）
  - [x] SubTask 5.3: 在 playerStore.ts 的 `updatePlayerState()` 中调用

- [x] Task 6: 测试评论生成联动
  - [x] SubTask 6.1: 模拟玩家流失，验证退坑评论生成
  - [x] SubTask 6.2: 模拟玩家回归，验证真香评论生成
  - [x] SubTask 6.3: 验证评论情感和平台正确

## 阶段三：节奏事件与声誉定时扣除（2 小时）

- [x] Task 7: 实现声誉定时扣除
  - [x] SubTask 7.1: 在 commentStore.ts 添加 `applyRhythmDamage()` 方法
    * 遍历所有未解决的节奏事件
    * 小节奏 -2 声誉/小时
    * 大节奏 -5 声誉/小时
    * 炎上 -10 声誉/小时
    * 持续时间递减
    * 持续时间为 0 时标记为已解决
  - [x] SubTask 7.2: 添加定时器（每小时执行）
  - [x] SubTask 7.3: 在 OperationView 显示倒计时

- [x] Task 8: 完善舆论趋势计算
  - [x] SubTask 8.1: 修改 `updatePublicOpinion()` 方法
    * 负面评论占比>30% → 趋势下降
    * 正面评论占比>70% → 趋势上升
    * 其他情况 → 趋势稳定
  - [x] SubTask 8.2: 测试舆论趋势计算准确

## 阶段四：玩家状态自动转换（2 小时）

- [x] Task 9: 实现玩家状态自动检查
  - [x] SubTask 9.1: 在 playerStore.ts 添加 `updatePlayerStatesAutomatically()` 方法
    * 遍历所有玩家
    * 检查最后登录时间
    * 超过 30 天未登录 → 流失
    * 流失超过 60 天 → 30% 概率回归
  - [x] SubTask 9.2: 添加定时器（每小时执行）
  - [x] SubTask 9.3: 记录状态变化日志

- [x] Task 10: 卡池爆率影响玩家状态
  - [x] SubTask 10.1: 修改 `updatePlayerState()` 方法
    * 连续未出货次数影响状态
    * 爆率低 → 有流失风险
    * 爆率高 → 保持活跃
  - [x] SubTask 10.2: 测试爆率影响逻辑

## 阶段五：活动效果与角色人气联动（2 小时）

- [x] Task 11: 实现活动人气加成
  - [x] SubTask 11.1: 在 operationStore.ts 的 `calculateEventImpact()` 中添加人气逻辑
    * 生日活动 → 角色人气 +5，讨论热度 +10
    * 节日活动 → 角色人气 +2，讨论热度 +5
    * 联动活动 → 参与角色人气 +3
  - [x] SubTask 11.2: 自动生成祝福评论
  - [x] SubTask 11.3: 测试活动人气加成正确

- [x] Task 12: 完善人气变化趋势
  - [x] SubTask 12.1: 在 gameStore.ts 添加人气历史记录
  - [x] SubTask 12.2: 在 GameDetailView 显示人气趋势图
  - [x] SubTask 12.3: 测试趋势图显示正常

## 阶段六：AI 角色对话生成（3 小时）

- [x] Task 13: 实现 AI 对话生成
  - [x] SubTask 13.1: 在 aiService.ts 添加 `generateCharacterDialogue()` 方法
    * 输入：角色 ID、场景
    * 输出：符合角色性格的对话（50 字以内）
    * 消耗：10 积分
  - [x] SubTask 13.2: 在 GameDetailView 添加对话生成按钮
  - [x] SubTask 13.3: 测试对话生成正常

- [x] Task 14: 实现角色设定补充
  - [x] SubTask 14.1: 在 aiService.ts 添加 `expandCharacterProfile()` 方法
    * 输入：基本信息（名称、外貌）
    * 输出：性格标签（5 个）、背景故事（100 字）、互动台词（5 句）
    * 消耗：50 积分
  - [x] SubTask 14.2: 在 CharacterCreator 添加 AI 补充按钮
  - [x] SubTask 14.3: 测试角色设定补充正常

## 阶段七：测试与验证（2 小时）

- [x] Task 15: 系统测试
  - [x] SubTask 15.1: 测试所有配置数据加载正常
  - [x] SubTask 15.2: 测试玩家状态自动转换
  - [x] SubTask 15.3: 测试节奏事件声誉扣除
  - [x] SubTask 15.4: 测试评论生成联动
  - [x] SubTask 15.5: 测试活动人气加成
  - [x] SubTask 15.6: 测试 AI 对话生成
  - [x] SubTask 15.7: 测试 AI 角色设定补充
  - [x] SubTask 15.8: 验证无 TypeScript 错误
  - [x] SubTask 15.9: 验证开发服务器正常运行

# Task Dependencies

- Task 1 → Task 2 → Task 3（配置数据迁移依赖链）
- Task 4 → Task 6（退坑评论生成后测试）
- Task 5 → Task 6（真香评论生成后测试）
- Task 7 → Task 8（声誉扣除完成后完善舆论趋势）
- Task 9 → Task 10（玩家状态自动检查完成后实现爆率影响）
- Task 11 → Task 12（活动人气加成完成后显示趋势）
- Task 13 → Task 15（AI 对话生成后测试）
- Task 14 → Task 15（AI 角色设定补充后测试）
- Task 3,6,8,10,12,13,14 → Task 15（所有功能完成后统一测试）
