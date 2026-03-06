# 竞品AI系统前端集成计划

## 目标

将竞品AI系统生成的动态消息集成到**现有的市场仪表盘**中，复用现有结构，不新增页面。

***

## 现有展示分析

### 市场仪表盘 (MarketDashboard.vue)

* ✅ 竞品公司列表 (`competitors-section`)

* ✅ 竞品详细信息卡片 (`competitor-card`)

* ✅ 市场动态列表 (`events-section`)

### 运营页面 (OperationView\.vue)

* ✅ CrisisAlert 危机弹窗

* ✅ 事件处理 (IncidentHandler)

***

## 集成方案

### 方案：将竞品动态融入现有"市场动态"区域

在 MarketDashboard.vue 的"市场动态"区域添加竞品动态消息，与现有市场事件一起展示。

***

## 实施步骤

### Step 1: 修改 MarketDashboard.vue

1. 导入 simulationStore 获取竞品动态

```typescript
import { useSimulationStore } from '@/stores/simulationStore';
const simStore = useSimulationStore();
```

1. 合并竞品动态到市场动态列表

```typescript
// 将 competitorNews 转换为市场动态格式
const marketEvents = computed(() => {
  const events = [...(simStore.marketEvents || [])];
  
  // 添加竞品动态
  const competitorNews = simStore.competitorNews || [];
  for (const news of competitorNews) {
    events.unshift({
      id: news.id,
      type: 'competitor',
      title: news.title,
      content: news.content,
      day: news.day,
      impact: news.impact,
      company: news.companyName,
    });
  }
  
  return events.slice(0, 20);
});
```

1. 在模板中使用（现有 events-section 已支持 competitor 类型）

***

## 测试计划

### 功能测试

* [ ] MarketDashboard 显示竞品动态

* [ ] 与现有市场事件一起展示

* [ ] 竞品动态可点击查看详情

### 数据验证

* [ ] competitorNews 数据正确获取

* [ ] 格式转换正确

***

## 验收标准

* [ ] MarketDashboard.vue 正确导入 simulationStore

* [ ] 竞品动态与市场动态合并展示

* [ ] 编译通过

* [ ] 功能测试通过

***

## 时间估算

| 步骤     | 内容                 | 预估时间       |
| ------ | ------------------ | ---------- |
| 修改     | MarketDashboard 集成 | 1 小时       |
| 测试     | 功能验证               | 0.5 小时     |
| **总计** | <br />             | **1.5 小时** |

