# Tasks

## 阶段一：紧急 UI 修复（2 小时）

- [x] Task 1: 修复底部导航栏遮挡问题
  - [x] SubTask 1.1: 分析所有受影响的页面
  - [x] SubTask 1.2: 统一增加底部 padding
  - [x] SubTask 1.3: 测试不同屏幕尺寸的显示效果

## 阶段二：评论系统打通（3 小时）

- [x] Task 2: PlatformComments 组件数据打通
  - [x] SubTask 2.1: 修改 PlatformComments.vue 使用 Store 数据
  - [x] SubTask 2.2: 实现评论互动功能
  - [x] SubTask 2.3: 添加评论生成功能入口

## 阶段三：人气系统打通（3 小时）

- [x] Task 3: 实现人气与卡池收益联动
  - [x] SubTask 3.1: 修改 operationStore.ts 的 simulatePoolGacha()
  - [x] SubTask 3.2: 在卡池详情显示人气加成
  - [x] SubTask 3.3: 测试人气加成效果

## 阶段四：舆论系统完善（2 小时）

- [x] Task 4: 添加舆论热度仪表盘到 OperationView
  - [x] SubTask 4.1: 在"运营事件"Tab 添加舆论热度卡片
  - [x] SubTask 4.2: 实现颜色动态变化
  - [x] SubTask 4.3: 添加节奏事件倒计时

## 阶段五：玩家系统完善（2 小时）

- [x] Task 5: 添加玩家状态统计 UI
  - [x] SubTask 5.1: 在 OperationView 添加"玩家数据"Tab
  - [x] SubTask 5.2: 实现玩家状态自动更新
  - [x] SubTask 5.3: 添加玩家状态变化日志

## 阶段六：福利系统完善（3 小时）

- [x] Task 6: 实现福利发放实际效果
  - [x] SubTask 6.1: 修改 sendWelfare() 消耗资源
  - [x] SubTask 6.2: 生成系统公告评论
  - [x] SubTask 6.3: 增加玩家满意度

## 阶段七：CP 热度系统（4 小时）

- [x] Task 7: 实现 CP 热度计算和展示
  - [x] SubTask 7.1: 分析评论内容统计角色提及
  - [x] SubTask 7.2: 统计 CP 同时提及次数
  - [x] SubTask 7.3: 在 GameDetailView 展示 CP 热度

## 阶段八：测试与验证（4 小时）

- [x] Task 8: 系统测试和最终优化
  - [x] SubTask 8.1: UI 遮挡测试
  - [x] SubTask 8.2: 数据打通测试
  - [x] SubTask 8.3: 添加评论生成功能
  - [x] SubTask 8.4: 性能优化

# Task Dependencies

- Task 1 → 所有任务（UI 修复是基础）
- Task 2 → Task 8（评论打通后才能测试）
- Task 3 → Task 8（人气打通后才能测试）
- Task 4 → Task 5（舆论仪表盘和玩家统计独立）
- Task 6 → Task 8（福利打通后才能测试）
- Task 7 → Task 8（CP 热度完成后测试）
- Task 2,3,4,5,6,7 → Task 8（所有功能完成后统一测试）
