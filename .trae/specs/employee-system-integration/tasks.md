# Tasks - 员工系统简化整合

## Task 1: 实现每日薪资扣除
**Priority**: High
**Description**: 在 simulationStore.tick() 中扣除员工薪资
- [x] SubTask 1.1: 在 simulationStore 中引入 employeeStore
- [x] SubTask 1.2: 在 tick() 中计算并扣除日薪（月薪/30）
- [x] SubTask 1.3: 将薪资支出记录到运营数据

## Task 2: 员工效率影响项目进度
**Priority**: High
**Description**: 项目进度计算引入员工效率乘数
- [x] SubTask 2.1: 在 projectStore 中引入 employeeStore
- [x] SubTask 2.2: 项目进度计算时获取团队效率
- [x] SubTask 2.3: 应用效率乘数（0.5-1.5倍）到进度计算

## Task 3: 测试验证
**Priority**: High
**Description**: 验证核心功能正常工作
- [x] SubTask 3.1: 测试每日薪资正确扣除
- [x] SubTask 3.2: 测试员工效率正确影响项目进度
- [x] SubTask 3.3: 测试无员工时项目进度正常

# Task Dependencies
- Task 2 depends on Task 1
