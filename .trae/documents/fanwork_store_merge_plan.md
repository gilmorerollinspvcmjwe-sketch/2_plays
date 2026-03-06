# fanCreationStore / fanworkStore 合并实施计划

## 目标

将 `fanCreationStore.ts` 和 `fanworkStore.ts` 合并为统一的 `fanworkStore.ts`，消除重复代码，统一数据模型，保留两者的最佳特性。

---

## 现状分析

### 两个 Store 对比

| 特性 | fanCreationStore | fanworkStore |
|------|-----------------|-------------|
| **文件位置** | `src/stores/fanCreationStore.ts` | `src/stores/fanworkStore.ts` |
| **作品类型** | fanfic / fanart / emoji | 绘画 / 文稿 / 视频 / COS |
| **数据来源** | 用户创作 + simulationStore 同步 | contentGenerationEngine 生成 + simulationStore 同步 |
| **点赞** | ✅ | ✅ |
| **收藏** | ✅ | ❌ |
| **热度计算** | ❌ | ✅ (时间衰减) |
| **质量分级** | ❌ | ✅ (优质/普通/粗糙) |
| **项目关联** | ❌ | ✅ (projectId, characterId, cpPair) |
| **积分消耗** | ✅ (创作要花积分) | ❌ |
| **持久化** | localStorage | localStorage |
| **引用方** | FanCreationSquare.vue, FanCreationModal.vue | FanCreationSquare.vue (部分) |

### 主要问题

1. **数据重复**：两个 Store 都存储同人作品，但数据结构不一致
2. **功能分散**：点赞、收藏等功能分散在两个 Store
3. **引用混乱**：FanCreationSquare.vue 同时引用两个 Store
4. **模板重复**：`src/data/commentTemplates.ts` 和 `src/data/templates/commentTemplates.ts` 重复

---

## 实施方案

### Phase 1: 数据模型统一（预计 2 小时）

#### Step 1.1: 定义统一的 Fanwork 接口

**文件**: `src/stores/fanworkStore.ts`

在现有 `fanworkStore.ts` 顶部添加统一的接口定义：

```typescript
// 统一作品类型
export type FanworkType = 'fanart' | 'fanfic' | 'video' | 'cos' | 'emoji';

// 统一作品来源
export type FanworkSource = 'user' | 'simulated' | 'generated';

// 统一质量等级
export type FanworkQuality = 'premium' | 'normal' | 'rough';

/** 统一的同人作品接口 */
export interface Fanwork {
  id: string;
  type: FanworkType;
  quality: FanworkQuality;
  source: FanworkSource;
  
  // 内容
  title: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  
  // 作者
  authorId: string;
  authorName: string;
  
  // 互动数据
  likes: number;
  views: number;
  collections: number;
  heat: number; // 计算字段
  
  // 用户交互状态
  isLiked: boolean;
  isCollected: boolean;
  
  // 关联信息
  projectId?: string;
  projectName?: string;
  characterId?: string;
  characterName?: string;
  cpPair?: string[];
  cpPairNames?: string[];
  plotId?: string;
  plotTitle?: string;
  
  // 时间
  createdAt: string;
}
```

#### Step 1.2: 添加 collections 字段到现有数据结构

修改 `fanworkStore.ts` 中的接口定义，添加 `collections` 字段。

---

### Phase 2: 功能合并（预计 4 小时）

#### Step 2.1: 迁移 createFanCreation 逻辑

**从** `fanCreationStore.ts` 的 `createFanCreation()`  
**到** `fanworkStore.ts` 的 `createFanwork()`

**关键点**：
- 保留积分消耗逻辑（`pointsStore.deductPoints()`）
- 保留角色人气更新逻辑
- 保留成就解锁逻辑（`unlockAchievement('first_creation')` 等）

```typescript
// fanworkStore.ts 新增
async function createFanwork(params: {
  type: FanworkType;
  title: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  projectId?: string;
  characterId?: string;
  cost: number;
}): Promise<{ success: boolean; message?: string; fanwork?: Fanwork }> {
  // 1. 检查积分
  const pointsResult = pointsStore.deductPoints(params.cost);
  if (!pointsResult.success) {
    return { success: false, message: '积分不足' };
  }
  
  // 2. 创建作品
  const fanwork: Fanwork = {
    id: `fanwork_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type: params.type,
    quality: 'normal', // 用户创作的默认为普通质量
    source: 'user',
    title: params.title,
    content: params.content,
    imageUrl: params.imageUrl,
    tags: params.tags,
    authorId: 'player',
    authorName: '玩家',
    likes: 0,
    views: 0,
    collections: 0,
    heat: 0,
    isLiked: false,
    isCollected: false,
    projectId: params.projectId,
    characterId: params.characterId,
    createdAt: new Date().toISOString()
  };
  
  // 3. 添加到列表
  fanworks.value.push(fanwork);
  
  // 4. 更新角色人气
  if (params.characterId) {
    // 调用 characterStore 更新人气
  }
  
  // 5. 解锁成就
  if (fanworks.value.filter(f => f.source === 'user').length === 1) {
    pointsStore.unlockAchievement('first_creation');
  }
  
  // 6. 持久化
  saveToLocal();
  
  return { success: true, fanwork };
}
```

#### Step 2.2: 迁移 collectCreation 逻辑

**从** `fanCreationStore.ts` 的 `collectCreation()`  
**到** `fanworkStore.ts` 的 `toggleCollect()`

```typescript
function toggleCollect(fanworkId: string): { success: boolean; message?: string } {
  const fanwork = fanworks.value.find(f => f.id === fanworkId);
  if (!fanwork) {
    return { success: false, message: '作品不存在' };
  }
  
  // 切换收藏状态
  fanwork.isCollected = !fanwork.isCollected;
  fanwork.collections += fanwork.isCollected ? 1 : -1;
  
  // 解锁成就
  const totalCollections = fanworks.value
    .filter(f => f.source === 'user')
    .reduce((sum, f) => sum + f.collections, 0);
  
  if (totalCollections >= 10) {
    pointsStore.unlockAchievement('collection_master');
  }
  
  saveToLocal();
  return { success: true };
}
```

#### Step 2.3: 合并 generateMockCreations / generateFanworks

**策略**：保留 `fanworkStore.ts` 的 `generateFanworks()`，但增加对 `source: 'user'` 作品的过滤。

#### Step 2.4: 合并 syncFromSimulation 逻辑

**问题**：两个 Store 都有 `syncFromSimulation()` 方法。

**解决方案**：
- 保留 `fanworkStore.ts` 的版本
- 增加对两种来源作品的同步逻辑
- 删除 `fanCreationStore.ts` 的版本

---

### Phase 3: 更新引用（预计 3 小时）

#### Step 3.1: 更新 FanCreationSquare.vue

**当前**：
```typescript
import { useFanCreationStore } from '@/stores/fanCreationStore';
import { useFanworkStore } from '@/stores/fanworkStore';

const fanCreationStore = useFanCreationStore();
const fanworkStore = useFanworkStore();
```

**修改为**：
```typescript
import { useFanworkStore } from '@/stores/fanworkStore';

const fanworkStore = useFanworkStore();
```

**替换所有引用**：
- `fanCreationStore.userCreations` → `fanworkStore.userCreations`
- `fanCreationStore.toggleLike` → `fanworkStore.toggleLike`
- `fanCreationStore.collectCreation` → `fanworkStore.toggleCollect`
- `fanCreationStore.createFanCreation` → `fanworkStore.createFanwork`

#### Step 3.2: 更新 FanCreationModal.vue

同样的替换逻辑。

#### Step 3.3: 更新 simulationStore.ts

搜索 `fanCreationStore` 的引用并替换为 `fanworkStore`。

#### Step 3.4: 更新 OperationView.vue

检查并更新所有引用。

#### Step 3.5: 全局搜索验证

```bash
# 在项目根目录执行
grep -r "fanCreationStore" src/
```

确保没有遗留引用。

---

### Phase 4: 清理与迁移（预计 1 小时）

#### Step 4.1: localStorage 数据迁移

在 `fanworkStore.ts` 的 `loadFromLocal()` 中添加兼容逻辑：

```typescript
function loadFromLocal(): void {
  const raw = localStorage.getItem('fanworkStore');
  if (raw) {
    const data = JSON.parse(raw);
    fanworks.value = data.fanworks || [];
  }
  
  // 兼容旧 fanCreationStore 数据
  const oldRaw = localStorage.getItem('fanCreationStore');
  if (oldRaw) {
    const oldData = JSON.parse(oldRaw);
    const oldCreations = oldData.creations || [];
    
    // 转换为新格式并合并
    const converted = oldCreations.map((c: any) => ({
      ...c,
      source: 'user' as FanworkSource,
      quality: 'normal' as FanworkQuality,
      collections: c.collections || 0,
      heat: calculateHeat(c)
    }));
    
    fanworks.value.push(...converted);
    
    // 迁移后删除旧 key
    localStorage.removeItem('fanCreationStore');
  }
  
  saveToLocal();
}
```

#### Step 4.2: 删除 fanCreationStore.ts

```bash
rm src/stores/fanCreationStore.ts
```

#### Step 4.3: 更新 index.ts 导出

如果 `src/stores/index.ts` 中有导出 `fanCreationStore`，删除它。

---

### Phase 5: 同样处理重复的 commentTemplates（预计 30 分钟）

#### Step 5.1: 对比两个文件

```bash
diff src/data/commentTemplates.ts src/data/templates/commentTemplates.ts
```

#### Step 5.2: 合并内容

保留 `src/data/templates/commentTemplates.ts`，将 `src/data/commentTemplates.ts` 中独有的内容合并过去。

#### Step 5.3: 更新引用

在 `commentStore.ts` 中：

**原**：
```typescript
import { COMMENT_TEMPLATES } from '@/data/commentTemplates';
```

**改为**：
```typescript
import { COMMENT_TEMPLATES } from '@/data/templates/commentTemplates';
```

#### Step 5.4: 删除旧文件

```bash
rm src/data/commentTemplates.ts
```

---

## 测试计划

### Level 1: 编译检查

```bash
npm run build
```

- ✅ 无 TypeScript 类型错误
- ✅ 无导入路径错误

### Level 2: 功能测试

#### 用户创作流程

- [ ] 打开【同人广场】
- [ ] 点击【创作】按钮
- [ ] 填写表单并提交
- [ ] 验证：积分正确扣除
- [ ] 验证：作品出现在列表中
- [ ] 验证：角色人气更新
- [ ] 验证：解锁"首次创作"成就

#### 互动功能

- [ ] 点赞用户作品
- [ ] 收藏用户作品
- [ ] 验证：点赞数/收藏数正确更新
- [ ] 验证：再次点击取消点赞/收藏

#### 筛选和排序

- [ ] 按类型筛选（绘画/文稿/视频/COS/表情）
- [ ] 按热度排序
- [ ] 验证：筛选结果正确

#### 数据持久化

- [ ] 刷新页面
- [ ] 验证：所有作品数据保留
- [ ] 验证：点赞/收藏状态保留

### Level 3: 数据一致性验证

#### DevTools 检查

打开浏览器 DevTools，检查：

```javascript
// 检查 Store 状态
window.$store = fanworkStore;
console.log($store.fanworks.length);
console.log($store.userCreations.length);
console.log($store.simulatedCreations.length);
```

#### localStorage 检查

```javascript
// 检查存储数据
const data = JSON.parse(localStorage.getItem('fanworkStore'));
console.log(data.fanworks);
```

确保：
- 所有作品都有 `source` 字段
- `source === 'user'` 的是用户创作
- `source === 'simulated'` 或 `'generated'` 的是模拟生成
- 没有重复的作品 ID

---

## 风险与应对

### 风险 1: 数据丢失

**应对**：
- 在合并前备份 localStorage 数据
- 添加数据迁移逻辑，确保旧数据能正确转换
- 测试时先验证数据迁移是否成功

### 风险 2: 功能回归

**应对**：
- 保留原有的所有功能逻辑
- 逐项测试原有功能
- 发现 bug 立即修复

### 风险 3: 引用遗漏

**应对**：
- 使用 `grep` 全局搜索 `fanCreation`
- 检查所有搜索结果
- 运行 `npm run build` 确保无编译错误

---

## 验收标准

- [ ] `fanCreationStore.ts` 文件已删除
- [ ] `fanworkStore.ts` 包含所有合并后的功能
- [ ] 所有组件引用已更新为 `useFanworkStore()`
- [ ] 用户创作功能正常工作
- [ ] 点赞/收藏功能正常工作
- [ ] 数据持久化正常
- [ ] localStorage 迁移成功
- [ ] 无 TypeScript 编译错误
- [ ] 全局搜索 `fanCreationStore` 无结果
- [ ] 全局搜索 `fanCreation` 仅有注释中的历史引用

---

## 时间估算

| 阶段 | 预估时间 |
|------|---------|
| Phase 1: 数据模型统一 | 2 小时 |
| Phase 2: 功能合并 | 4 小时 |
| Phase 3: 更新引用 | 3 小时 |
| Phase 4: 清理与迁移 | 1 小时 |
| Phase 5: commentTemplates 合并 | 0.5 小时 |
| 测试与修复 | 2 小时 |
| **总计** | **12.5 小时** ≈ **1.5 工作日** |

---

## 下一步

合并完成后，继续执行重构设计文档的：
- **第 4 部分**: simulationStore 瘦身重构
- **第 5 部分**: 竞品 AI 模拟系统设计
