# Tasks

## Phase 1: 基础架构和数据类型定义

- [x] **Task 1.1**: 扩展数据类型定义 ✅
  - [x] SubTask 1.1.1: 扩展现有 `src/types/employee.ts` - 添加团队默契度、随机事件类型 ✅
  - [x] SubTask 1.1.2: 扩展现有 `src/types/character.ts` - 添加口碑、互动数据、CP 热度类型 ✅

- [x] **Task 1.2**: 创建每日事件引擎 ✅
  - [x] SubTask 1.2.1: 创建 `src/engine/dailyEventEngine.ts` - 每日事件生成引擎 ✅
  - [x] SubTask 1.2.2: 实现员工随机事件（生病、获奖、请假）✅
  - [x] SubTask 1.2.3: 实现正面随机事件（网红推荐、爆火）✅
  - [x] SubTask 1.2.4: 实现负面随机事件（服务器故障、负面舆论）✅
  - [x] SubTask 1.2.5: 实现中性事件（玩家请求、合作邀请）✅

- [x] **Task 1.3**: 创建角色每日更新引擎 ✅
  - [x] SubTask 1.3.1: 创建 `src/engine/characterDailyEngine.ts` - 角色每日更新逻辑 ✅
  - [x] SubTask 1.3.2: 实现亲密度衰减计算 ✅
  - [x] SubTask 1.3.3: 实现人气变化计算 ✅
  - [x] SubTask 1.3.4: 实现生日检测和事件触发 ✅
  - [x] SubTask 1.3.5: 实现评论提及统计 ✅
  - [x] SubTask 1.3.6: 实现 CP 热度计算 ✅
  - [x] SubTask 1.3.7: 实现口碑评分计算 ✅

---

## Phase 2: 员工系统扩展

- [x] **Task 2.1**: 扩展员工 Store 每日更新逻辑 ✅
  - [x] SubTask 2.1.1: 修改 `employeeStore.simulateDailyUpdate()` - 添加疲劳度动态管理 ✅
  - [x] SubTask 2.1.2: 实现满意度与项目表现挂钩 ✅
  - [x] SubTask 2.1.3: 实现经验增长逻辑（基于项目进度）✅
  - [x] SubTask 2.1.4: 集成随机事件触发 ✅
  - [x] SubTask 2.1.5: 实现离职机制优化（与满意度、疲劳度挂钩）✅

- [x] **Task 2.2**: 实现团队协同效应 ✅
  - [x] SubTask 2.2.1: 扩展 `src/types/employee.ts` - 添加团队默契度类型 ✅
  - [x] SubTask 2.2.2: 在 employeeStore 中添加默契度计算逻辑 ✅
  - [x] SubTask 2.2.3: 实现默契度每日增长 ✅
  - [x] SubTask 2.2.4: 实现默契度加成计算 ✅
  - [x] SubTask 2.2.5: 在项目进度计算中应用默契度加成 ✅

- [x] **Task 2.3**: 实现员工成长系统 ✅
  - [x] SubTask 2.3.1: 扩展升级系统 - 自动检测可升级员工 ✅
  - [x] SubTask 2.3.2: 实现转职系统框架（管理岗/技术专家）✅
  - [x] SubTask 2.3.3: 创建 UI 提示 - 玩家可以点击升级 ✅

---

## Phase 3: 角色系统扩展

- [x] **Task 3.1**: 实现角色每日更新 ✅
  - [x] SubTask 3.1.1: 在 gameStore 或新 store 中添加 `updateCharacterDaily()` 函数 ✅
  - [x] SubTask 3.1.2: 实现亲密度衰减逻辑 ✅
  - [x] SubTask 3.1.3: 实现人气变化逻辑（基于项目表现）✅
  - [x] SubTask 3.1.4: 实现生日系统检测和事件触发 ✅
  - [x] SubTask 3.1.5: 集成评论提及统计 ✅

- [x] **Task 3.2**: 实现角色互动数据追踪 ✅
  - [x] SubTask 3.2.1: 在 commentStore 中添加角色提及分析 ✅
  - [x] SubTask 3.2.2: 实现 CP 热度计算和存储 ✅
  - [x] SubTask 3.2.3: 实现角色口碑评分计算 ✅
  - [x] SubTask 3.2.4: 扩展角色数据类型 - 添加被提及次数、口碑评分等字段 ✅

---

## Phase 4: 季节和节假日系统

- [x] **Task 4.1**: 实现季节系统 ✅
  - [x] SubTask 4.1.1: 创建 `src/utils/seasonUtils.ts` - 季节计算工具 ✅
  - [x] SubTask 4.1.2: 实现季节加成计算 ✅
  - [x] SubTask 4.1.3: 在 `simulationStore.tick()` 中应用季节加成 ✅

- [x] **Task 4.2**: 实现节假日系统 ✅
  - [x] SubTask 4.2.1: 创建节假日配置数据 `src/data/config/holidays.json` ✅
  - [x] SubTask 4.2.2: 实现节假日检测和加成计算 ✅
  - [x] SubTask 4.2.3: 实现春节、情人节等特殊节日效果 ✅
  - [x] SubTask 4.2.4: 实现项目周年庆检测和事件触发 ✅

- [x] **Task 4.3**: 实现特殊日期 buff ✅
  - [x] SubTask 4.3.1: 实现周末加成 ✅
  - [x] SubTask 4.3.2: 实现寒暑假加成 ✅
  - [x] SubTask 4.3.3: 创建 UI 提示 - 显示当前季节和节假日加成 ✅

---

## Phase 5: 随机事件系统集成

- [x] **Task 5.1**: 集成随机事件到模拟循环 ✅
  - [x] SubTask 5.1.1: 在 `simulationStore.tick()` 中调用 `dailyEventEngine.triggerEvents()` ✅
  - [x] SubTask 5.1.2: 实现正面事件影响计算 ✅
  - [x] SubTask 5.1.3: 实现负面事件影响计算 ✅
  - [x] SubTask 5.1.4: 实现中性事件选择和影响 ✅

- [x] **Task 5.2**: 创建随机事件 UI 组件 ✅
  - [x] SubTask 5.2.1: 创建 `src/components/events/EventNotification.vue` - 事件通知组件 ✅
  - [x] SubTask 5.2.2: 实现事件弹窗展示 ✅
  - [x] SubTask 5.2.3: 实现事件选择交互（中性事件）✅

---

## Phase 6: 集成和测试

- [x] **Task 6.1**: 集成所有模块到 simulationStore.tick() ✅
  - [x] SubTask 6.1.1: 按顺序调用所有每日更新函数 ✅
  - [x] SubTask 6.1.2: 确保数据一致性 ✅
  - [x] SubTask 6.1.3: 优化性能（批量处理、异步执行）✅
  - [x] SubTask 6.1.4: 添加错误处理和日志记录 ✅

- [x] **Task 6.2**: 数据持久化优化 ✅
  - [x] SubTask 6.2.1: 实现批量保存到 localStorage ✅
  - [x] SubTask 6.2.2: 实现数据清理（过期数据）✅
  - [x] SubTask 6.2.3: 实现数据加载优化 ✅

- [x] **Task 6.3**: 系统测试 ✅
  - [x] SubTask 6.3.1: 测试员工系统每日更新 ✅
  - [x] SubTask 6.3.2: 测试角色系统每日更新 ✅
  - [x] SubTask 6.3.3: 测试季节和节假日系统 ✅
  - [x] SubTask 6.3.4: 测试随机事件触发 ✅
  - [x] SubTask 6.3.5: 性能测试（连续模拟 100 天）✅

- [x] **Task 6.4**: UI 集成测试 ✅
  - [x] SubTask 6.4.1: 测试员工状态显示 ✅
  - [x] SubTask 6.4.2: 测试角色数据展示 ✅
  - [x] SubTask 6.4.3: 测试季节性提示 ✅
  - [x] SubTask 6.4.4: 测试事件通知 ✅

---

## Phase 7: 文档和优化

- [x] **Task 7.1**: 代码文档 ✅
  - [x] SubTask 7.1.1: 为新模块添加 JSDoc 注释 ✅
  - [x] SubTask 7.1.2: 更新 README 说明新系统 ✅
  - [x] SubTask 7.1.3: 创建数据类型文档 ✅

- [x] **Task 7.2**: 性能优化 ✅
  - [x] SubTask 7.2.1: 分析性能瓶颈 ✅
  - [x] SubTask 7.2.2: 优化大数据量计算 ✅
  - [x] SubTask 7.2.3: 实现懒加载和缓存 ✅

- [x] **Task 7.3**: 用户体验优化 ✅
  - [x] SubTask 7.3.1: 添加新手引导说明新系统 ✅
  - [x] SubTask 7.3.2: 优化 UI 响应速度 ✅
  - [x] SubTask 7.3.3: 添加数据可视化图表 ✅

---

# Task Dependencies

## Phase 依赖关系
- **Phase 2** (员工扩展) 依赖于 **Phase 1.1** (数据类型定义) 和 **Phase 1.2** (事件引擎)
- **Phase 3** (角色扩展) 依赖于 **Phase 1.1** 和 **Phase 1.3** (角色引擎)
- **Phase 4** (季节节假日) 依赖于 **Phase 1.2** (事件引擎)
- **Phase 5** (随机事件) 依赖于 **Phase 1.2** (事件引擎)
- **Phase 6** (集成测试) 依赖于 **Phase 2-5** 全部完成
- **Phase 7** (文档优化) 依赖于 **Phase 6** (测试完成)

## 关键路径
```
Phase 1 (基础架构) 
  ↓
Phase 2-5 (并行开发各模块)
  ↓
Phase 6 (集成测试)
  ↓
Phase 7 (文档优化)
```

## 建议执行顺序
1. **Week 1**: Phase 1 (基础架构) + Phase 2 (员工扩展)
2. **Week 2**: Phase 3 (角色扩展) + Phase 4 (季节节假日)
3. **Week 3**: Phase 5 (随机事件) + Phase 6 (集成测试)
4. **Week 4**: Phase 7 (文档优化) + 修复和调优
