# 模拟数据与现有静态数据整合计划

## 一、当前数据架构分析

### 1. 现有静态数据系统

| 模块 | Store | 数据特点 | 持久化 |
|-----|-------|---------|--------|
| **告白墙** | confessionStore | 用户发布的告白内容，含角色关联、点赞、热度 | localStorage |
| **同人广场** | fanCreationStore | 用户创作的同人作品（文/图/表情包） | localStorage |
| **运营系统** | operationStore | 卡池、活动、运营事件、统计数据 | localStorage |
| **评论系统** | commentStore | 5大平台评论、舆情数据 | localStorage |
| **玩家系统** | playerStore | 游戏内真实玩家数据 | localStorage |

### 2. 模拟系统数据 (simulationStore)

| 数据类型 | 来源 | 特点 |
|---------|------|------|
| **虚拟玩家池** | VirtualPlayerPool | 10,000个AI玩家，含标签、状态、行为 |
| **告白数据** | ConfessionSimulator | 基于角色标签生成的模拟告白 |
| **同人数据** | FanworkSimulator | 基于质量分布生成的模拟作品 |
| **运营事件** | EventSimulator | 基于满意度触发的模拟事件 |
| **评论数据** | CommentSimulator | 5大平台的模拟评论 |
| **世界变化** | WorldSimulator | 竞争对手、市场趋势、行业事件 |

### 3. 数据结构对比

#### 告白墙数据对比

**现有 Confession:**
```typescript
interface Confession {
  id: string;
  characterId: string;      // 角色ID
  characterName: string;    // 角色名称
  content: string;          // 内容
  authorId: string;         // 作者ID
  authorName: string;       // 作者名称
  likes: number;           // 点赞数
  heat: number;            // 热度
  createdAt: string;       // 创建时间
  isHot: boolean;          // 是否热门
}
```

**模拟系统 Confession:**
```typescript
interface Confession {
  id: string;
  type: '角色告白' | '官方表白' | 'CP向' | '退坑宣言' | '回归感慨';
  content: string;
  authorId: string;
  authorName: string;
  relatedTags: string[];    // 关联标签
  likes: number;
  timestamp: number;
}
```

**差异分析:**
- 现有：强关联具体角色（characterId/characterName）
- 模拟：基于类型和标签，不绑定具体角色
- 共同点：都有内容、点赞、作者

#### 同人广场数据对比

**现有 FanCreation:**
```typescript
interface FanCreation {
  id: string;
  type: 'fanfic' | 'fanart' | 'emoji';  // 类型
  characterId: string;      // 角色ID
  characterName: string;    // 角色名称
  content: string;          // 内容/图片URL
  authorId: string;
  authorName: string;
  likes: number;
  collections: number;      // 收藏数
  createdAt: string;
}
```

**模拟系统 Fanwork:**
```typescript
interface Fanwork {
  id: string;
  type: '绘画' | '文稿' | '表情包' | '视频' | '音乐';
  content: string;
  authorId: string;
  authorName: string;
  quality: '优质' | '普通' | '粗糙';
  likes: number;
  relatedCharacters: string[];  // 关联角色
  tags: string[];
  timestamp: number;
}
```

**差异分析:**
- 现有：强绑定角色，有收藏数
- 模拟：有质量分级，多角色关联
- 共同点：类型、内容、点赞

---

## 二、整合策略选择

### 方案A：完全独立双系统（当前实现）

**实现方式:**
- SimulationPanel 展示模拟数据
- ConfessionWall/FanCreationSquare 展示真实数据
- 两者完全隔离，用户可切换查看

**优点:**
- ✅ 实现简单，不破坏现有功能
- ✅ 数据隔离，互不干扰
- ✅ 用户可选择查看"预测"或"实际"

**缺点:**
- ❌ 数据割裂，体验不统一
- ❌ 模拟数据无法影响真实游戏
- ❌ 用户需要理解两套数据

### 方案B：模拟数据驱动真实系统（推荐）

**实现方式:**
- 将 confessionStore/fanCreationStore 的数据源改为 simulationStore
- 模拟系统生成数据后，同步到真实 Store
- 真实 Store 作为"展示层"，模拟 Store 作为"数据层"

**优点:**
- ✅ 数据统一，体验一致
- ✅ 模拟结果直接影响游戏世界
- ✅ 符合"模拟经营"游戏逻辑

**缺点:**
- ⚠️ 需要修改现有 Store 逻辑
- ⚠️ 需要处理数据持久化冲突

### 方案C：混合模式（标签复用）

**实现方式:**
- 保留现有 Store 的静态数据生成功能
- 从 simulationStore 获取"热度趋势"和"标签偏好"
- 用模拟数据指导静态数据的生成

**优点:**
- ✅ 保留现有数据生成功能
- ✅ 模拟数据提供"趋势指导"
- ✅ 渐进式整合，风险低

**缺点:**
- ⚠️ 实现复杂度较高
- ⚠️ 两套逻辑并存，维护成本大

---

## 三、推荐方案：方案B - 模拟数据驱动

### 核心思想

**"模拟系统是唯一数据源，现有 Store 是展示层"**

```
┌─────────────────────────────────────────────────────────────┐
│                    simulationStore                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Confession   │  │ Fanwork      │  │ Event        │      │
│  │ Simulator    │  │ Simulator    │  │ Simulator    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │              │
│         ▼                 ▼                 ▼              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              数据转换/同步层                         │  │
│  │  (将模拟数据格式转换为现有 Store 格式)               │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ 数据输出
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │ confession  │  │ fanCreation │  │ operation   │
   │ Store       │  │ Store       │  │ Store       │
   │ (展示层)    │  │ (展示层)    │  │ (展示层)    │
   └─────────────┘  └─────────────┘  └─────────────┘
```

### 具体实施步骤

#### Step 1: 创建数据同步服务

新建 `services/simulationSyncService.ts`:

```typescript
// 将模拟系统的告白数据同步到 confessionStore
export function syncConfessionsToStore(
  simulationConfessions: SimulationConfession[],
  confessionStore: ConfessionStore
): void {
  // 转换数据格式
  const converted = simulationConfessions.map(sim => ({
    id: sim.id,
    characterId: inferCharacterId(sim.relatedTags), // 从标签推断角色
    characterName: inferCharacterName(sim.relatedTags),
    content: sim.content,
    authorId: sim.authorId,
    authorName: sim.authorName,
    likes: sim.likes,
    heat: sim.likes * 2, // 热度 = 点赞 * 2
    createdAt: new Date(sim.timestamp).toISOString(),
    isHot: sim.likes > 50
  }));
  
  // 合并到 Store（去重）
  confessionStore.mergeConfessions(converted);
}
```

#### Step 2: 修改 confessionStore

添加模拟数据支持:

```typescript
export const useConfessionStore = defineStore('confession', () => {
  // ... 现有代码 ...
  
  // 新增：数据来源标记
  const dataSource = ref<'real' | 'simulation' | 'mixed'>('real');
  
  // 新增：合并模拟数据
  function mergeConfessions(newConfessions: Confession[]): void {
    // 去重逻辑
    const existingIds = new Set(confessions.value.map(c => c.id));
    const uniqueNew = newConfessions.filter(c => !existingIds.has(c.id));
    
    confessions.value.push(...uniqueNew);
    
    // 按时间排序
    confessions.value.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    saveToLocal();
  }
  
  // 新增：切换到模拟数据模式
  function switchToSimulationMode(): void {
    dataSource.value = 'simulation';
    // 清空现有数据，从 simulationStore 加载
    const simStore = useSimulationStore();
    confessions.value = convertSimulationConfessions(simStore.recentConfessions);
  }
  
  // 新增：混合模式
  function switchToMixedMode(): void {
    dataSource.value = 'mixed';
    // 保留真实数据，追加模拟数据
    const simStore = useSimulationStore();
    mergeConfessions(convertSimulationConfessions(simStore.recentConfessions));
  }
  
  return {
    // ... 现有返回 ...
    dataSource,
    mergeConfessions,
    switchToSimulationMode,
    switchToMixedMode
  };
});
```

#### Step 3: 修改 simulationStore.tick()

在每次模拟结束后，自动同步数据:

```typescript
async function tick(): Promise<void> {
  // ... 现有模拟逻辑 ...
  
  // 新增：同步到真实 Store
  const confessionStore = useConfessionStore();
  const fanCreationStore = useFanCreationStore();
  
  // 将模拟告白同步到告白墙
  if (recentConfessions.value.length > 0) {
    confessionStore.mergeConfessions(
      convertToConfessionFormat(recentConfessions.value)
    );
  }
  
  // 将模拟同人同步到同人广场
  if (recentFanworks.value.length > 0) {
    fanCreationStore.mergeCreations(
      convertToFanCreationFormat(recentFanworks.value)
    );
  }
  
  // ... 继续现有逻辑 ...
}
```

#### Step 4: 在 UI 层添加数据源切换

在 ConfessionWall.vue 和 FanCreationSquare.vue 添加切换按钮:

```vue
<template>
  <div class="data-source-switch">
    <van-radio-group v-model="confessionStore.dataSource" direction="horizontal">
      <van-radio name="real">真实数据</van-radio>
      <van-radio name="simulation">模拟数据</van-radio>
      <van-radio name="mixed">混合模式</van-radio>
    </van-radio-group>
  </div>
</template>
```

### 数据映射表

#### 告白数据映射

| simulationStore | confessionStore | 转换逻辑 |
|----------------|-----------------|---------|
| id | id | 直接复制 |
| type | - | 用于推断角色 |
| content | content | 直接复制 |
| authorId | authorId | 直接复制 |
| authorName | authorName | 直接复制 |
| relatedTags | characterId/characterName | 从标签推断 |
| likes | likes | 直接复制 |
| likes * 2 | heat | 计算得出 |
| timestamp | createdAt | 格式转换 |
| likes > 50 | isHot | 判断得出 |

#### 同人数据映射

| simulationStore | fanCreationStore | 转换逻辑 |
|----------------|------------------|---------|
| id | id | 直接复制 |
| type | type | 映射：绘画→fanart, 文稿→fanfic, 表情包→emoji |
| content | content | 直接复制 |
| authorId | authorId | 直接复制 |
| authorName | authorName | 直接复制 |
| relatedCharacters | characterId/characterName | 取第一个角色 |
| likes | likes | 直接复制 |
| - | collections | 模拟数据无此字段，设为0 |
| timestamp | createdAt | 格式转换 |

---

## 四、实施优先级

### Phase 1: 告白墙整合（高优先级）
1. 创建数据转换服务
2. 修改 confessionStore 支持多数据源
3. 在 simulationStore.tick() 中添加同步逻辑
4. 在 ConfessionWall 添加数据源切换 UI

### Phase 2: 同人广场整合（中优先级）
1. 同上步骤，针对 fanCreationStore

### Phase 3: 运营事件整合（低优先级）
1. 将 EventSimulator 的事件同步到 operationStore
2. 区分"模拟事件"和"真实事件"

### Phase 4: 评论系统整合（可选）
1. 将 CommentSimulator 的评论同步到 commentStore

---

## 五、风险与解决方案

| 风险 | 解决方案 |
|-----|---------|
| 数据冲突（ID重复） | 模拟数据ID加前缀 `sim_` |
| 数据量过大 | 限制同步数量（只同步最近50条） |
| 用户混淆 | UI明确标注数据来源（真实/模拟） |
| 持久化冲突 | 模拟数据不保存到 localStorage |
| 角色映射失败 | 建立标签→角色映射表 |

---

## 六、总结

**推荐方案：方案B（模拟数据驱动）**

理由：
1. 符合游戏设计逻辑 - 玩家通过模拟系统预测并影响真实游戏世界
2. 技术实现可行 - 通过数据转换层解决格式差异
3. 用户体验统一 - 一套数据展示，无需切换视角
4. 渐进式实施 - 可按模块逐步整合

**关键决策点：**
- 是否保留现有静态数据生成功能？→ 保留，作为初始数据
- 模拟数据是否持久化？→ 不持久化，每次重新生成
- 如何处理角色映射？→ 建立标签到角色的映射表
