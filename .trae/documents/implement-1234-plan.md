# 实现计划：新手引导 + 资源管理 + 活动模板 + 事件模板

## 概述
实现以下4个功能模块：
1. **新手引导系统** - 帮助新用户理解游戏流程
2. **资源管理系统完善** - 资源获取、消耗、分配策略
3. **活动模板库** - 20个活动模板（已完成数据结构，需完善使用场景）
4. **事件模板完善** - 20个事件模板（已完成数据结构，需完善使用场景）

---

## 1. 新手引导系统

### 1.1 功能设计

**引导步骤**（共6步）：
1. 欢迎来到乙游创作者模拟器
2. 创建你的第一个角色
3. 设计剧情
4. 发布游戏
5. 查看玩家评论
6. 运营你的游戏

**引导特性**：
- 分步遮罩高亮
- 手势操作提示
- 可随时跳过
- 标记已完成步骤
- 仅首次访问显示

### 1.2 数据结构

```typescript
// src/types/onboarding.ts
interface OnboardingState {
  isFirstVisit: boolean;
  isCompleted: boolean;
  currentStep: number;
  completedSteps: number[];
  skipped: boolean;
}
```

### 1.3 实现步骤

#### Step 1: 创建类型定义
- **文件**: `src/types/onboarding.ts`
- **内容**: OnboardingState 接口定义

#### Step 2: 创建引导状态Store
- **文件**: `src/stores/onboardingStore.ts`
- **功能**:
  - 管理引导状态
  - 步骤切换逻辑
  - 完成标记
  - 本地存储持久化

#### Step 3: 创建引导组件
- **文件**: `src/components/OnboardingGuide.vue`
- **功能**:
  - 遮罩层实现
  - 高亮区域计算
  - 步骤内容展示
  - 导航按钮（上一步/下一步/跳过）
  - 进度指示器

#### Step 4: 集成到App.vue
- **文件**: `src/App.vue`
- **修改**: 添加OnboardingGuide组件，首次访问时自动显示

#### Step 5: 各页面添加引导标记
- **文件**: 
  - `HomeView.vue` - 标记步骤1、2入口
  - `CharacterCreator.vue` - 标记步骤3
  - `PlotDesigner.vue` - 标记步骤4
  - `PublishView.vue` - 标记步骤5
  - `CommentsView.vue` - 标记步骤6
  - `OperationView.vue` - 标记步骤7

---

## 2. 资源管理系统完善

### 2.1 当前状态
- `gameStore.ts` 已有资源字段（gold, diamond, popularity, devPoints）
- `GameDetailView.vue` 已有资源展示UI
- **缺失**: 资源获取/消耗逻辑、分配策略UI

### 2.2 功能设计

**资源获取途径**：
| 途径 | 获得资源 | 说明 |
|------|----------|------|
| 时间推进 | 金币、开发点 | 每日自动获得 |
| 发布游戏 | 人气、金币 | 根据游戏质量 |
| 运营活动 | 钻石、人气 | 活动成功奖励 |
| 玩家付费 | 钻石 | 模拟玩家充值 |
| 成就达成 | 各资源 | 一次性奖励 |

**资源分配策略**：
| 策略 | 金币分配 | 开发点分配 | 特点 |
|------|----------|------------|------|
| 稳健型 | 50%运营 30%开发 20%储备 | 均衡分配 | 风险低，增长稳定 |
| 激进型 | 70%运营 20%开发 10%储备 | 重点突破 | 高风险高回报 |
| 保守型 | 40%运营 40%开发 20%储备 | 保守分配 | 稳扎稳打 |

### 2.3 实现步骤

#### Step 1: 扩展gameStore资源管理
- **文件**: `src/stores/gameStore.ts`
- **新增方法**:
  - `addResources()` - 增加资源
  - `consumeResources()` - 消耗资源
  - `applyResourceStrategy()` - 应用分配策略
  - `simulateDailyIncome()` - 模拟每日收入

#### Step 2: 创建资源管理组件
- **文件**: `src/components/game/ResourceManager.vue`
- **功能**:
  - 资源获取记录
  - 资源消耗记录
  - 分配策略选择器
  - 一键分配按钮
  - 资源趋势图表（简化版）

#### Step 3: 在GameDetailView集成资源管理
- **文件**: `src/views/game/GameDetailView.vue`
- **修改**: 添加资源管理入口，点击展开资源管理面板

#### Step 4: 添加资源变动提示
- **全局**: 使用Toast提示资源增加/减少

---

## 3. 活动模板库使用场景

### 3.1 当前状态
- `src/data/templates/events/index.ts` 已有20个活动模板
- **缺失**: 在运营系统中使用这些模板

### 3.2 功能设计

**活动创建流程**：
1. 选择活动类型（节日/生日/联动）
2. 从模板库选择具体活动
3. 自定义活动参数（持续时间、预算）
4. 确认创建

**活动效果模拟**：
- 根据预算和活动类型计算预期收益
- 模拟玩家参与度
- 计算资源回报

### 3.3 实现步骤

#### Step 1: 扩展operationStore活动管理
- **文件**: `src/stores/operationStore.ts`
- **新增**:
  - 从模板创建活动方法
  - 活动效果计算
  - 活动历史记录

#### Step 2: 创建活动模板选择器组件
- **文件**: `src/components/operation/EventTemplateSelector.vue`
- **功能**:
  - 按类型筛选模板
  - 模板卡片展示
  - 预览活动详情
  - 一键创建活动

#### Step 3: 修改OperationView
- **文件**: `src/views/OperationView.vue`
- **修改**: 添加"从模板创建活动"入口

---

## 4. 事件模板完善

### 4.1 当前状态
- `src/data/templates/incidents/index.ts` 已有15个事件模板
- **缺失**: 5个其他类型事件、使用场景

### 4.2 功能设计

**新增5个其他事件**：
1. 服务器故障 - 技术问题导致服务中断
2. 数据丢失 - 玩家数据异常
3. 负面新闻 - 媒体负面报道
4. 竞品冲击 - 竞品上线分流玩家
5. 版权问题 - 版权纠纷

**事件触发逻辑**：
- 随机触发（每日概率）
- 条件触发（特定运营行为后）
- 连锁触发（处理不当引发二次事件）

### 4.3 实现步骤

#### Step 1: 补充事件模板
- **文件**: `src/data/templates/incidents/index.ts`
- **新增**: 5个other类型事件模板

#### Step 2: 扩展operationStore事件管理
- **文件**: `src/stores/operationStore.ts`
- **新增**:
  - 随机事件触发逻辑
  - 事件处理记录
  - 事件影响计算

#### Step 3: 创建事件处理组件
- **文件**: `src/components/operation/IncidentHandler.vue`
- **功能**:
  - 事件展示
  - 处理方案选择
  - 处理结果反馈
  - 事件历史

#### Step 4: 在OperationView集成事件系统
- **文件**: `src/views/OperationView.vue`
- **修改**: 添加待处理事件提醒，事件处理入口

---

## 5. 文件变更清单

### 新建文件
```
src/
├── types/
│   └── onboarding.ts                 # 新手引导类型
├── stores/
│   └── onboardingStore.ts            # 引导状态管理
├── components/
│   ├── OnboardingGuide.vue           # 引导组件
│   ├── game/
│   │   └── ResourceManager.vue       # 资源管理组件
│   └── operation/
│       ├── EventTemplateSelector.vue # 活动模板选择器
│       └── IncidentHandler.vue       # 事件处理组件
```

### 修改文件
```
src/
├── stores/
│   ├── gameStore.ts                  # 扩展资源管理方法
│   └── operationStore.ts             # 扩展活动/事件管理
├── views/
│   ├── game/
│   │   └── GameDetailView.vue        # 集成资源管理
│   ├── OperationView.vue             # 集成活动/事件系统
│   ├── HomeView.vue                  # 添加引导标记
│   ├── creator/
│   │   ├── CharacterCreator.vue      # 添加引导标记
│   │   └── PlotDesigner.vue          # 添加引导标记
│   ├── PublishView.vue               # 添加引导标记
│   └── CommentsView.vue              # 添加引导标记
├── App.vue                           # 集成引导组件
└── data/templates/
    └── incidents/
        └── index.ts                  # 补充5个事件模板
```

---

## 6. 实施顺序

### Phase 1: 新手引导系统
1. 创建类型定义
2. 创建onboardingStore
3. 创建OnboardingGuide组件
4. 集成到App.vue
5. 各页面添加引导标记

### Phase 2: 资源管理系统
1. 扩展gameStore资源方法
2. 创建ResourceManager组件
3. 集成到GameDetailView

### Phase 3: 活动模板使用
1. 扩展operationStore活动管理
2. 创建EventTemplateSelector组件
3. 集成到OperationView

### Phase 4: 事件系统完善
1. 补充5个事件模板
2. 扩展operationStore事件管理
3. 创建IncidentHandler组件
4. 集成到OperationView

---

## 7. 验收标准

### 新手引导
- [ ] 首次访问自动显示引导
- [ ] 6个步骤完整展示
- [ ] 可以跳过引导
- [ ] 标记已完成的步骤
- [ ] 引导状态持久化

### 资源管理
- [ ] 资源获取记录完整
- [ ] 资源消耗记录完整
- [ ] 三种分配策略可选
- [ ] 一键分配功能正常
- [ ] 资源变动有提示

### 活动模板
- [ ] 20个活动模板可用
- [ ] 按类型筛选正常
- [ ] 从模板创建活动正常
- [ ] 活动效果计算正确

### 事件系统
- [ ] 20个事件模板完整
- [ ] 随机触发逻辑正常
- [ ] 事件处理流程完整
- [ ] 处理结果反馈正确
