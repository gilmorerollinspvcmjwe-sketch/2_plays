# Tasks

- [ ] Task 1: 在 companyStore 中添加资金字段和方法
  - [ ] 添加 funds ref，初始值 50万
  - [ ] 添加 addFunds(amount, reason) 方法
  - [ ] 添加 spendFunds(amount, reason) 方法
  - [ ] 添加 canSpend(amount) 检查方法
  - [ ] 添加 fundsHistory 记录资金变动
  - [ ] 更新 localStorage 持久化逻辑
  - [ ] 添加 fundsStatus 计算属性（充足/紧张/枯竭）

- [ ] Task 2: 在 employeeStore 中添加日工资计算
  - [ ] 添加 dailySalary 计算属性（totalSalary / 365）
  - [ ] 添加 getEmployeeDailySalary(employeeId) 方法
  - [ ] 更新员工创建时的默认薪资为合理数值

- [ ] Task 3: 在 simulationStore 中集成资金结算
  - [ ] 在 tick() 方法中添加资金结算步骤
  - [ ] 计算并添加所有运营项目收入到 companyFunds
  - [ ] 计算并扣除员工工资（dailySalary）
  - [ ] 计算并扣除运营成本（基础5000 + 项目数×2000）
  - [ ] 在每日报告中添加资金变动记录
  - [ ] 资金不足时触发相关事件

- [ ] Task 4: 在项目创建时检查资金
  - [ ] 修改 projectStore.createProject() 方法
  - [ ] 检查 companyFunds >= 10万
  - [ ] 扣除立项费用 10万
  - [ ] 资金不足时返回错误提示

- [ ] Task 5: 在招聘时检查资金
  - [ ] 修改 employeeStore.hireFromPosting() 方法
  - [ ] 检查资金能否支付新员工1个月工资
  - [ ] 资金不足时返回错误提示

- [ ] Task 6: 更新 UI 显示实时资金
  - [ ] 修改 HomeView.vue，使用 companyStore.funds
  - [ ] 修改 CompanyDashboard.vue 显示资金状态
  - [ ] 资金紧张时显示警告样式（黄色）
  - [ ] 资金枯竭时显示危险样式（红色）
  - [ ] 添加资金变动提示 Toast

- [ ] Task 7: 添加特殊收入事件
  - [ ] 在 dailyEventEngine 中添加"投资事件"
  - [ ] 随机触发，一次性收入 10万-100万
  - [ ] 添加"成就奖励"资金发放逻辑

# Task Dependencies
- Task 3 依赖于 Task 1 和 Task 2
- Task 4 和 Task 5 依赖于 Task 1
- Task 6 依赖于 Task 1 和 Task 3
- Task 7 依赖于 Task 1
