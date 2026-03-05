# Phase 3: 运营操作与数据关联详细设计方案

## 状态: ✅ 已完成

**完成日期**: 2026-03-05  
**实施人员**: AI Assistant  
**验证状态**: 构建通过 ✓

---

## 一、现状分析

### Phase 1-2 已完成
- ✅ Phase 1: 项目质量评分系统
- ✅ Phase 2: simulationStore.tick() 重构

### 当前问题
1. **运营操作孤立**：卡池/活动/福利的创建与真实数据无关联
2. **缺乏效果预测**：玩家无法预知运营决策的影响
3. **无效果追踪**：无法对比预测与实际效果
4. **操作与反馈断层**：创建卡池后不知道会带来多少收入

---

## 二、设计目标

### 核心目标
建立**运营决策-效果预测-实际反馈**的完整闭环：

```
玩家创建运营操作 → 实时效果预测 → 执行后对比实际 → 优化下次决策
```

---

## 三、实施结果

### 3.1 已创建文件

| 文件 | 说明 |
|------|------|
| `src/types/operationPrediction.ts` | 预测相关类型定义 |
| `src/engine/operationPrediction.ts` | 预测引擎（卡池/活动/福利效果预测） |
| `src/components/operation/EffectPredictionModal.vue` | 效果预测弹窗组件 |
| `src/components/operation/EffectTrackingPanel.vue` | 效果追踪面板组件 |

### 3.2 已修改文件

| 文件 | 变更内容 |
|------|---------|
| `src/stores/operationStore.ts` | 添加预测和追踪功能、新方法、新状态 |
| `src/stores/simulationStore.ts` | 集成效果追踪到 tick() 方法 |

### 3.3 核心实现

#### 预测引擎函数
1. **predictGachaPoolImpact** - 预测卡池效果
   - 角色人气影响付费率
   - 爆率合理性影响满意度
   - 收入预测基于人气和爆率

2. **predictEventImpact** - 预测活动效果
   - 登录活动提升留存
   - 抽卡活动提升付费
   - 剧情活动提升满意度
   - 限定活动大幅提升收入

3. **predictWelfareImpact** - 预测福利效果
   - 满意度提升
   - 留存率提升
   - 成本计算

#### operationStore 新增功能
1. **createGachaPoolWithPrediction** - 创建卡池并生成预测
2. **createEventWithPrediction** - 创建活动并生成预测
3. **giveWelfareWithPrediction** - 发放福利并生成预测
4. **launchOperation** - 启动运营操作
5. **updateOperationEffectTracking** - 更新效果追踪
6. **checkIfEffectEnded** - 检查效果是否结束

#### 新增 State
- `newOperationPredictions: Map<string, OperationPrediction>` - 预测存储
- `activeOperationEffects: Map<string, ActiveOperationEffect>` - 进行中效果追踪
- `completedOperationEffects: PredictionVsActual[]` - 已完成效果对比
- `recentWelfareValue: number` - 最近福利值
- `welfareHistory: WelfareHistory[]` - 福利历史

#### UI 组件
1. **EffectPredictionModal** - 效果预测弹窗
   - 显示预测指标（收入/满意度/留存/付费率/活跃玩家）
   - 显示预测依据
   - 显示风险提示
   - 显示置信度

2. **EffectTrackingPanel** - 效果追踪面板
   - 显示进行中的操作
   - 显示已完成的效果对比
   - 显示准确度评分
   - 显示分析总结

---

## 四、验证结果

### 构建验证
```
✓ built in 11.07s
✓ 664 modules transformed
✓ 无错误，仅警告（Sass 弃用警告）
```

### 功能验证
- [x] 创建卡池时显示效果预测
- [x] 创建活动时显示效果预测
- [x] 发放福利时显示效果预测
- [x] 预测包含收入/满意度/留存/付费率变化
- [x] 预测包含计算依据
- [x] 预测包含风险提示
- [x] tick() 后更新效果追踪
- [x] 可以查看预测与实际对比

---

## 五、关键代码片段

### 卡池效果预测
```typescript
// 角色人气影响付费率
const charPopularity = character.popularity?.base || 50;
const popularityBonus = (charPopularity / 100) * 0.15;
prediction.predicted.payRateChange = popularityBonus;

// 爆率合理性影响满意度
if (ssrRate >= 0.015 && ssrRate <= 0.03) {
  prediction.predicted.satisfactionChange = 0.05;
} else if (ssrRate < 0.01) {
  prediction.predicted.satisfactionChange = -0.15;
  prediction.risks.push('爆率过低可能导致玩家不满');
}
```

### 效果追踪更新
```typescript
// 计算实际变化
const actual = {
  revenueChange: currentData.dailyRevenue - effect.startData.dailyRevenue,
  satisfactionChange: currentData.satisfaction - effect.startData.satisfaction,
  retentionChange: currentData.retentionRate - effect.startData.retentionRate,
  // ...
};

// 计算准确度
const accuracy = {
  revenue: calculateAccuracy(predicted.revenueChange, actual.revenueChange),
  satisfaction: calculateAccuracy(predicted.satisfactionChange, actual.satisfactionChange),
  retention: calculateAccuracy(predicted.retentionChange, actual.retentionChange),
  overall: (accuracy.revenue + accuracy.satisfaction + accuracy.retention) / 3
};
```

---

## 六、后续工作

### Phase 4: 数据验证与优化
- 实现数据验证工具
- 添加性能优化
- 创建调试工具
- 编写单元测试

---

## 七、总结

Phase 3 已成功完成，运营系统现在：
1. **创建运营操作时显示效果预测**
2. **预测基于真实角色人气和项目数据**
3. **可以追踪预测与实际效果对比**
4. **提供准确度评分和分析总结**
5. **支持卡池/活动/福利三种操作类型**

**下一步**: 实施 Phase 4，进行数据验证和性能优化。
