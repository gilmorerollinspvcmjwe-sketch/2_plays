# 市场情报页面数据动态化计划

## 目标

将市场情报页面的硬编码静态数据改为动态数据，连接 simulationStore 和 WorldSimulator 的真实数据。

---

## 现状分析

### 当前问题

1. **竞品数据** - 硬编码4个竞品公司，应该从 simulationStore.competitors 获取
2. **市场趋势** - 硬编码4个趋势，应该从 WorldSimulator.getGenreTrends() 获取
3. **节日数据** - 硬编码3个节日，应该基于当前日期动态生成

### 现有系统

- `simulationStore.competitors` - 6个AI竞品公司（已实现）
- `WorldSimulator.getGenreTrends()` - 市场趋势系统（已实现）
- `WorldSimulator.getSeasonalHots()` - 季节热点（已实现）

---

## 实施步骤

### Step 1: 导出 simulationStore 中缺失的数据

**文件**: `src/stores/simulationStore.ts`

确认导出:
- `competitors` - 竞品公司列表 ✅ 已导出
- `worldSimulator` - 世界模拟器（用于获取趋势）

```typescript
// 添加导出
worldSimulator,
```

### Step 2: 修改 MarketDashboard.vue

#### 2.1 竞品数据 - 改为从 simulationStore 获取

**修改前**:
```typescript
const competitors = ref<Competitor[]>([
  { id: '1', name: '恋与制作人', rating: 4.8, ... },
  ...
]);
```

**修改后**:
```typescript
const { competitors } = storeToRefs(simulationStore);

// 转换为 UI 格式
const competitorList = computed(() => 
  (competitors.value || []).map(c => ({
    id: c.id,
    name: c.name,
    rating: c.games[0]?.rating || 7,
    downloads: c.games[0]?.dau || 0,
    revenue: c.games[0]?.revenue || 0,
    tags: c.games[0]?.genre ? [c.games[0].genre] : [],
    strengths: [getPersonalityStrength(c.personality)],
    weaknesses: [getPersonalityWeakness(c.personality)],
    threatLevel: c.decisionWeights.revenue > 0.5 ? 4 : 3,
    rank: 0, // 动态计算
  }))
);
```

#### 2.2 市场趋势 - 改为从 WorldSimulator 获取

**修改前**:
```typescript
const marketTrends = ref<MarketTrend[]>([...4个静态趋势...]);
```

**修改后**:
```typescript
const worldSimulator = computed(() => simulationStore.worldSimulator);

const marketTrends = computed(() => {
  if (!worldSimulator.value) return [];
  
  const trends = worldSimulator.value.getGenreTrends();
  return Array.from(trends.values()).map(t => ({
    id: t.genreId,
    name: t.genreName,
    category: 'genre',
    strength: t.currentHeat,
    growthRate: t.growthRate,
    duration: t.peakDuration,
    description: t.description,
    affectedTags: [t.genreName],
    suggestions: generateSuggestions(t),
  }));
});
```

#### 2.3 节日数据 - 改为动态生成

**修改前**:
```typescript
const festivals = ref<Festival[]>([...3个静态节日...]);
```

**修改后**:
```typescript
// 动态生成节日
const festivals = computed<Festival[]>(() => {
  const now = new Date();
  const year = now.getFullYear();
  const result: Festival[] = [];
  
  // 情人节（2月14日）
  const valentine = new Date(year, 1, 14);
  if (valentine > now) {
    result.push({
      id: 'valentine',
      name: '情人节活动',
      startDate: valentine,
      endDate: new Date(valentine.getTime() + 7 * 24 * 60 * 60 * 1000),
      description: '浪漫情人节，限定剧情与服装上线',
      bonusMultiplier: 2.5,
      specialEvents: ['情人节限定卡池', '约会剧情', '情侣服装'],
      impact: 'high'
    });
  }
  
  // 白色情人节（3月14日）
  const whiteDay = new Date(year, 2, 14);
  if (whiteDay > now) {
    result.push({
      id: 'white_day',
      name: '白色情人节',
      startDate: whiteDay,
      endDate: new Date(whiteDay.getTime() + 7 * 24 * 60 * 60 * 1000),
      description: '回礼之日，特别剧情与道具',
      bonusMultiplier: 2.0,
      specialEvents: ['回礼剧情', '限定道具', '双倍掉落'],
      impact: 'medium'
    });
  }
  
  // 周年庆（假设为游戏上线日期）
  const anniversary = new Date(year, 5, 1); // 假设1月1日上线
  if (anniversary > now) {
    result.push({
      id: 'anniversary',
      name: '周年庆典',
      startDate: anniversary,
      endDate: new Date(anniversary.getTime() + 10 * 24 * 60 * 60 * 1000),
      description: '游戏周年庆，海量福利与活动',
      bonusMultiplier: 3.0,
      specialEvents: ['周年限定角色', '登录奖励', '特别剧情'],
      impact: 'high'
    });
  }
  
  return result;
});
```

#### 2.4 季节热点 - 从 WorldSimulator 获取

```typescript
const seasonalHots = computed(() => {
  if (!worldSimulator.value) return [];
  return worldSimulator.value.getSeasonalHots();
});
```

---

## 测试计划

### 功能测试
- [ ] 竞品数据从 simulationStore 正确获取
- [ ] 市场趋势从 WorldSimulator 正确获取
- [ ] 节日数据基于当前日期动态生成
- [ ] 季节热点正确显示

### 数据验证
- [ ] competitors 数据格式正确
- [ ] marketTrends 数据格式正确
- [ ] festivals 数据格式正确

---

## 验收标准

- [ ] MarketDashboard.vue 导入 simulationStore
- [ ] 竞品数据改为动态获取
- [ ] 市场趋势改为动态获取
- [ ] 节日数据改为动态生成
- [ ] 编译通过
- [ ] 功能测试通过

---

## 时间估算

| 步骤 | 内容 | 预估时间 |
|------|------|---------|
| Step 1 | 确认导出 worldSimulator | 0.5 小时 |
| Step 2 | 修改竞品数据获取 | 1 小时 |
| Step 3 | 修改市场趋势获取 | 1 小时 |
| Step 4 | 修改节日数据生成 | 0.5 小时 |
| Step 5 | 测试验证 | 0.5 小时 |
| **总计** | | **3.5 小时** |
