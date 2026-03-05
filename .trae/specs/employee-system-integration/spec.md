# 员工系统简化整合 Spec

## Why

当前员工系统与模拟系统完全隔离。需要实现核心整合：员工能力影响项目进度，并实际从公司现金发放工资。

## What Changes

### 核心功能

1. **员工招募** - 发布招聘、查看应聘者、雇佣员工
2. **配置到项目** - 将员工分配到项目团队
3. **能力影响项目进度** - 员工效率作为乘数影响项目开发速度
4. **实际发工资** - 每日从公司现金扣除员工薪资

## ADDED Requirements

### Requirement: 员工能力影响项目进度

The system SHALL apply employee efficiency multiplier to project progress.

#### Scenario: 计算项目进度
- **GIVEN** 项目有分配的员工
- **WHEN** 模拟系统计算每日进度
- **THEN** 团队平均效率作为乘数影响进度（效率0.5-1.5倍）

### Requirement: 每日发放工资

The system SHALL deduct employee salaries from company cash daily.

#### Scenario: 每日薪资结算
- **GIVEN** 新的一天开始
- **WHEN** 模拟系统tick运行
- **THEN** 从公司现金扣除所有员工日薪（月薪/30）

## 数据映射

| 员工系统 | 模拟系统 | 说明 |
|---------|---------|------|
| employeeStore.totalSalary | 公司现金扣除 | 日薪 = 月薪 / 30 |
| employeeStore.getProjectTeamEfficiency | 项目进度乘数 | 平均效率 0.5-1.5 |
| 员工分配状态 | 项目团队配置 | 哪些员工在哪个项目 |

## UI保持现状

- TeamManagementView - 现有功能不变
- RecruitView - 现有功能不变
- ProjectDetailView - 显示团队效率（可选）
