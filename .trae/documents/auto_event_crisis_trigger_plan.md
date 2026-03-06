# 运营事件和危机自动触发系统实施计划

## 目标

为游戏添加基于模拟数据的运营事件和危机自动触发机制，使事件和危机的生成与游戏实际状态（项目质量、玩家满意度、舆情热度等）深度关联。

## 现状分析

### 已有基础
1. **运营事件系统**：`operationStore.ts` 中有 `triggerRandomIncident()` 方法，但需手动调用
2. **危机系统**：`crisis.ts` 中定义了完整的危机类型和等级，但无触发逻辑
3. **每日模拟**：`simulationStore.ts` 的 `tick()` 方法每日执行，但缺少事件/危机检测

### 需要添加
1. 基于模拟数据的事件触发判断逻辑
2. 基于模拟数据的危机触发判断逻辑
3. 将触发逻辑集成到每日模拟流程中

## 实施步骤

### 步骤 1: 创建事件触发引擎

**文件**: `src/engine/eventTriggerEngine.ts`

**功能**:
- 定义事件触发条件接口
- 实现基于模拟数据的事件概率计算
- 提供事件触发判断函数

**触发条件设计**:
```typescript
// 运营事件触发条件
interface IncidentTriggerCondition {
  // 项目质量低于阈值时可能触发质量相关事件
  projectQualityThreshold: number;
  // 玩家满意度低于阈值时可能触发满意度相关事件
  satisfactionThreshold: number;
  // 负面评论比例超过阈值时可能触发舆情事件
  negativeCommentRatioThreshold: number;
  // 卡池爆率相关
  gachaRateDeviation: number;
  // 基础触发概率
  baseProbability: number;
}
```

**触发算法**:
```typescript
function calculateIncidentTriggerProbability(
  projectQuality: number,
  satisfaction: number,
  negativeCommentRatio: number,
  daySinceLaunch: number
): number {
  // 基础概率随时间递减（上线初期问题多）
  const timeFactor = Math.max(0.3, 1 - daySinceLaunch / 100);
  
  // 质量越低，触发概率越高
  const qualityFactor = (1 - projectQuality) * 0.4;
  
  // 满意度越低，触发概率越高
  const satisfactionFactor = (1 - satisfaction / 100) * 0.3;
  
  // 负面评论比例越高，触发概率越高
  const commentFactor = negativeCommentRatio * 0.3;
  
  return Math.min(0.5, (qualityFactor + satisfactionFactor + commentFactor) * timeFactor);
}
```

### 步骤 2: 创建危机触发引擎

**文件**: `src/engine/crisisTriggerEngine.ts`

**功能**:
- 定义危机触发条件接口
- 实现基于模拟数据的危机概率计算
- 提供危机触发判断函数
- 危机等级评估

**触发条件设计**:
```typescript
// 危机触发条件
interface CrisisTriggerCondition {
  // 舆情热度阈值
  heatThreshold: number;
  // 声誉值低于阈值
  reputationThreshold: number;
  // 连续负面事件数量
  consecutiveNegativeEvents: number;
  // 玩家流失率
  churnRateThreshold: number;
}
```

**触发算法**:
```typescript
function calculateCrisisTriggerProbability(
  heat: number,
  reputation: number,
  recentNegativeEvents: number,
  satisfaction: number
): { probability: number; level: CrisisLevel } {
  // 热度因子 (0-1)
  const heatFactor = Math.min(1, heat / 100);
  
  // 声誉因子 (0-1)，声誉越低因子越高
  const reputationFactor = Math.max(0, (50 - reputation) / 50);
  
  // 近期负面事件因子
  const eventFactor = Math.min(1, recentNegativeEvents * 0.2);
  
  // 满意度因子
  const satisfactionFactor = Math.max(0, (40 - satisfaction) / 40);
  
  const probability = Math.min(0.8, 
    heatFactor * 0.3 + 
    reputationFactor * 0.3 + 
    eventFactor * 0.2 + 
    satisfactionFactor * 0.2
  );
  
  // 根据概率和热度确定危机等级
  const level = determineCrisisLevel(probability, heat);
  
  return { probability, level };
}
```

### 步骤 3: 修改 simulationStore.ts

**在 `tick()` 方法中添加事件/危机检测逻辑**:

```typescript
async function tick(): Promise<SimulationTickResult | null> {
  // ... 原有逻辑 ...
  
  // 5. 运营事件和危机检测（新增）
  console.log('[Simulation] 执行运营事件和危机检测...');
  
  // 5.1 检测并触发运营事件
  const incidentResult = await checkAndTriggerIncidents(
    projectQuality,
    adjustedMetrics.satisfaction,
    sentiment.negativeRatio,
    currentDay.value
  );
  
  if (incidentResult.triggered) {
    console.log(`[Simulation] 触发运营事件: ${incidentResult.incident?.title}`);
    // 将事件添加到每日模拟结果
    dailyEvents.push({
      type: 'incident',
      title: incidentResult.incident?.title,
      description: incidentResult.incident?.description
    });
  }
  
  // 5.2 检测并触发危机
  const crisisResult = await checkAndTriggerCrisis(
    platformStatistics.heat,
    operationStore.stats.reputation,
    recentNegativeEvents,
    adjustedMetrics.satisfaction
  );
  
  if (crisisResult.triggered) {
    console.log(`[Simulation] 触发危机: ${crisisResult.crisis?.title} (等级: ${crisisResult.crisis?.level})`);
    // 将危机添加到每日模拟结果
    dailyEvents.push({
      type: 'crisis',
      title: crisisResult.crisis?.title,
      description: crisisResult.crisis?.description,
      level: crisisResult.crisis?.level
    });
  }
  
  // ... 后续逻辑 ...
}
```

### 步骤 4: 修改 operationStore.ts

**添加基于模拟数据的事件生成方法**:

```typescript
/**
 * 基于模拟数据触发运营事件
 */
function triggerIncidentBySimulation(
  projectQuality: number,
  satisfaction: number,
  negativeCommentRatio: number,
  daySinceLaunch: number
): { triggered: boolean; incident?: OperationIncident } {
  const probability = calculateIncidentTriggerProbability(
    projectQuality,
    satisfaction,
    negativeCommentRatio,
    daySinceLaunch
  );
  
  // 随机判断是否触发
  if (Math.random() > probability) {
    return { triggered: false };
  }
  
  // 根据条件选择合适的事件类型
  let incidentType: IncidentType = 'other';
  let severity: IncidentSeverity = '低';
  
  // 根据触发条件判断事件类型
  if (negativeCommentRatio > 0.5) {
    incidentType = 'dropRate';
    severity = '高';
  } else if (satisfaction < 50) {
    incidentType = 'welfare';
    severity = '中';
  } else if (projectQuality < 0.5) {
    incidentType = 'plotIssue';
    severity = '中';
  }
  
  // 生成事件
  const template = generateRandomIncident(incidentType, severity);
  const incident: OperationIncident = {
    ...template,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  incidents.value.unshift(incident);
  
  // 应用负面影响
  applyIncidentNegativeImpact(incident);
  
  saveToLocal();
  
  return { triggered: true, incident };
}
```

**添加危机管理功能**:

```typescript
// 添加危机状态
const activeCrises = ref<Crisis[]>([]);
const crisisHistory = ref<Crisis[]>([]);

/**
 * 基于模拟数据触发危机
 */
function triggerCrisisBySimulation(
  heat: number,
  reputation: number,
  recentNegativeEvents: number,
  satisfaction: number
): { triggered: boolean; crisis?: Crisis } {
  const { probability, level } = calculateCrisisTriggerProbability(
    heat, reputation, recentNegativeEvents, satisfaction
  );
  
  if (Math.random() > probability) {
    return { triggered: false };
  }
  
  // 选择危机类型
  const crisisType = selectCrisisTypeByCondition(
    heat, reputation, recentNegativeEvents
  );
  
  // 从模板创建危机
  const template = CRISIS_TEMPLATES.find(t => t.type === crisisType && t.level === level);
  if (!template) {
    return { triggered: false };
  }
  
  const crisis = initCrisis(template);
  activeCrises.value.unshift(crisis);
  
  // 应用危机影响
  applyCrisisImpact(crisis);
  
  saveToLocal();
  
  return { triggered: true, crisis };
}
```

### 步骤 5: 在 UI 中展示事件和危机

**修改 HomeView 或添加通知组件**:
- 在首页显示待处理的运营事件和危机提醒
- 添加事件/危机通知弹窗
- 在每日模拟结果中显示当日触发的事件和危机

### 步骤 6: 添加测试和验证

1. 测试事件触发概率计算是否正确
2. 测试危机触发概率计算是否正确
3. 测试事件和危机是否正确影响游戏状态
4. 测试 UI 是否正确显示事件和危机

## 文件变更清单

1. **新建** `src/engine/eventTriggerEngine.ts` - 事件触发引擎
2. **新建** `src/engine/crisisTriggerEngine.ts` - 危机触发引擎
3. **修改** `src/stores/simulationStore.ts` - 集成触发逻辑到每日模拟
4. **修改** `src/stores/operationStore.ts` - 添加基于模拟数据的事件/危机生成方法
5. **修改** `src/views/HomeView.vue` 或相关视图 - 添加事件/危机展示 UI

## 预期效果

- 每日模拟时自动检测并可能触发运营事件和危机
- 事件和危机的触发概率与项目质量、玩家满意度、舆情热度等实际游戏数据关联
- 玩家可以在首页或通知中看到待处理的事件和危机
- 事件和危机会对游戏状态产生实际影响（声誉、玩家数量等）
