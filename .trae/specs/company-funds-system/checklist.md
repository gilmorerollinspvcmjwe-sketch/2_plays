# Checklist

- [x] companyStore 资金字段
  - [x] funds ref 存在，初始值 50万
  - [x] addFunds(amount, reason) 方法正常工作
  - [x] spendFunds(amount, reason) 方法正常工作
  - [x] canSpend(amount) 检查方法正常工作
  - [x] fundsHistory 记录资金变动历史
  - [x] localStorage 持久化正常工作
  - [x] fundsStatus 计算属性返回正确状态

- [x] employeeStore 日工资计算
  - [x] dailySalary 计算属性正确（年薪/365）
  - [x] getEmployeeDailySalary(employeeId) 方法正常工作
  - [x] 员工创建时薪资在合理范围内

- [x] simulationStore 资金结算
  - [x] tick() 方法中资金结算步骤存在
  - [x] 运营项目收入正确累加到 companyFunds
  - [x] 员工工资正确扣除
  - [x] 运营成本正确扣除（基础5000+项目×2000）
  - [x] 每日报告包含资金变动记录
  - [x] 资金不足时触发相关事件

- [x] 项目创建资金检查
  - [x] createProject() 检查 funds >= 10万
  - [x] 扣除立项费用 10万
  - [x] 资金不足时返回正确错误提示

- [x] 招聘资金检查
  - [x] hireFromPosting() 检查资金能否支付1个月工资
  - [x] 资金不足时返回正确错误提示

- [x] UI 资金显示
  - [x] HomeView.vue 显示 companyStore.funds
  - [x] CompanyDashboard.vue 显示资金状态
  - [x] 资金紧张（10-30万）显示黄色警告
  - [x] 资金枯竭（<10万）显示红色危险
  - [x] 资金变动时显示 Toast 提示

- [x] 特殊收入事件
  - [x] "投资事件"在 dailyEventEngine 中存在
  - [x] 随机触发，收入 10万-100万
  - [x] 成就奖励发放资金

- [x] 数值平衡验证
  - [x] 小型项目日收入 500-2000
  - [x] 中型项目日收入 5000-20000
  - [x] 员工日工资 200-3000
  - [x] 基础运营成本 5000/天
  - [x] 项目运营成本 2000/天/项目
  - [x] 游戏整体收支平衡（不 bankrupt）
