# 数据初始化优化计划

## 问题概述

根据分析报告，项目中存在以下数据初始化问题：

| 问题类型 | 数量 | 严重程度 |
|----------|------|----------|
| 静态数据初始化 | 8 处 | 🔴 高 |
| 应该清空但未清空 | 3 处 | 🟡 中 |
| 重复初始化 | 2 处 | 🟡 中 |
| 未正确初始化 | 4 处 | 🟡 中 |

---

## Phase 1: 静态数据配置化（高优先级）

### Task 1.1: 成就/称号数据配置化
**文件**: `src/stores/points.ts`

**步骤**:
1. 创建 `src/config/achievements.json` 配置文件
2. 创建 `src/config/titles.json` 配置文件
3. 修改 `points.ts` 从配置文件加载数据
4. 添加配置缓存机制

**修改内容**:
```typescript
// 修改前
const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_game', name: '游戏发布者', ... },
  // 20+ 条硬编码
];

// 修改后
let achievements: Achievement[] = [];
const loadAchievements = async () => {
  const config = await import('@/config/achievements.json');
  achievements = config.default;
};
```

### Task 1.2: 运营指标初始值配置化
**文件**: `src/stores/simulationStore.ts`

**步骤**:
1. 创建 `src/config/initialMetrics.json` 配置文件
2. 修改 `operationMetrics` 初始化逻辑
3. 支持从项目配置读取初始值

### Task 1.3: 角色初始人气差异化
**文件**: `src/stores/gameStore.ts`

**步骤**:
1. 修改 `initCharacterPopularity` 函数
2. 根据角色稀有度计算初始人气
3. 添加配置参数支持

---

## Phase 2: 组件清理逻辑（中优先级）

### Task 2.1: ConfessionWall 组件清理
**文件**: `src/components/social/ConfessionWall.vue`

**步骤**:
1. 添加 `onUnmounted` 钩子
2. 重置组件本地状态
3. 停止 watch 监听器

**修改内容**:
```typescript
import { onUnmounted } from 'vue';

onUnmounted(() => {
  showDetail.value = false;
  selectedConfession.value = null;
  loading.value = false;
  finished.value = false;
  currentPage.value = 1;
});
```

### Task 2.2: 检查其他组件清理
**步骤**:
1. 扫描所有组件的 onUnmounted 使用情况
2. 补充缺失的清理逻辑
3. 确保定时器、事件监听器被正确清理

---

## Phase 3: 重复定义统一（中优先级）

### Task 3.1: 统一评论模板
**文件**: 
- `src/stores/commentStore.ts`
- `src/stores/simulationStore.ts`

**步骤**:
1. 删除 `simulationStore.ts` 中的重复模板定义
2. 统一使用 `@/data/templates/comments` 中的模板
3. 更新相关调用

### Task 3.2: 统一 CharacterPopularity 接口
**文件**:
- `src/stores/gameStore.ts`
- `src/stores/simulationStore.ts`

**步骤**:
1. 在 `src/types/character.ts` 中定义统一的接口
2. 更新两个 store 使用统一接口
3. 添加数据转换函数（如需要）

---

## Phase 4: 数据限制与安全（中优先级）

### Task 4.1: 积分历史长度限制
**文件**: `src/stores/points.ts`

**步骤**:
1. 添加 `MAX_HISTORY_LENGTH = 100` 常量
2. 修改 `addToHistory` 函数添加长度检查
3. 超出限制时裁剪旧记录

**修改内容**:
```typescript
const MAX_HISTORY_LENGTH = 100;

function addHistory(record: PointsHistory) {
  history.value.unshift(record);
  if (history.value.length > MAX_HISTORY_LENGTH) {
    history.value = history.value.slice(0, MAX_HISTORY_LENGTH);
  }
}
```

### Task 4.2: Map 序列化处理
**文件**: `src/stores/operationStore.ts`

**步骤**:
1. 创建 Map 序列化工具函数
2. 修改 `saveToLocal` 函数处理 Map 类型
3. 修改 `loadFromLocal` 函数恢复 Map 类型

**修改内容**:
```typescript
// 序列化
function serializeMap<K, V>(map: Map<K, V>): [K, V][] {
  return Array.from(map.entries());
}

// 反序列化
function deserializeMap<K, V>(data: [K, V][]): Map<K, V> {
  return new Map(data);
}
```

### Task 4.3: Null 安全检查
**文件**: `src/stores/simulationStore.ts`

**步骤**:
1. 添加 `isReady` computed 属性
2. 在访问 null 值前添加检查
3. 添加错误处理

---

## Phase 5: Store 重置机制（低优先级）

### Task 5.1: 添加统一重置函数
**涉及文件**: 所有 store

**步骤**:
1. 为每个 store 添加 `reset()` 函数
2. 使用工厂函数创建初始状态
3. 确保重置时清理 localStorage

### Task 5.2: 添加数据过期清理
**步骤**:
1. 为带时间戳的数据添加过期检查
2. 实现定期清理机制
3. 添加配置项控制清理周期

---

## 执行顺序

1. **Phase 1** (高优先级) - 静态数据配置化
2. **Phase 2** (中优先级) - 组件清理逻辑
3. **Phase 3** (中优先级) - 重复定义统一
4. **Phase 4** (中优先级) - 数据限制与安全
5. **Phase 5** (低优先级) - Store 重置机制

---

## 预期成果

1. 所有硬编码数据移至配置文件
2. 组件卸载时正确清理状态
3. 消除重复定义，统一数据结构
4. 防止数据无限增长
5. 提高代码可维护性
