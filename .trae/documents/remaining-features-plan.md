# 剩余功能实现计划

## 说明
- 数据存储：使用 localStorage（不接入 Supabase）
- AI 功能：预留接口，使用模拟数据
- 优先级：按功能依赖关系排序

---

## 高优先级功能

### 2. 角色创建后的保存功能
**文件**: `src/views/creator/CharacterCreator.vue`

**修改内容**:
1. 创建 `src/stores/gameStore.ts` - 游戏数据管理
2. 修改 `createCharacter()` 方法，将角色保存到当前游戏
3. 添加角色列表展示

**数据结构**:
```typescript
interface Game {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  characters: Character[];
  plots: Plot[];
  createdAt: string;
  updatedAt: string;
}

interface Character {
  id: string;
  name: string;
  appearance: string;
  clothing: string;
  personality: string[];
  background: string;
  avatar?: string;
}
```

**实现步骤**:
1. 创建 gameStore.ts
2. 修改 CharacterCreator.vue 的 createCharacter 方法
3. 在 CreatorView 中添加角色列表展示

---

### 3. 剧情设计的保存功能
**文件**: `src/views/creator/PlotDesigner.vue`

**修改内容**:
1. 修改 `savePlot()` 方法，将剧情保存到当前游戏
2. 关联到已创建的角色
3. 添加剧情列表展示

**实现步骤**:
1. 修改 savePlot 方法，调用 gameStore
2. 添加角色选择器（选择剧情关联的角色）
3. 在 CreatorView 中添加剧情列表展示

---

### 4. 前端调用后端 AI 接口（预留）
**文件**: 新建 `src/services/aiService.ts`

**说明**: 由于 AI Key 未配置，先创建服务层，使用模拟数据

**接口设计**:
```typescript
interface AIService {
  // 角色润色
  polishCharacter(character: Character): Promise<string>;
  
  // 剧情补全
  fillPlot(plot: Plot): Promise<string>;
  
  // 生成评论
  generateComments(params: GenerateParams): Promise<Comment[]>;
  
  // 生成图片（预留）
  generateImage(prompt: string): Promise<string>;
}
```

**实现步骤**:
1. 创建 aiService.ts，封装后端 API 调用
2. 当前使用模拟数据返回
3. 添加加载状态和错误处理

---

### 6. 游戏发布流程
**文件**: 新建 `src/views/PublishView.vue`

**功能**:
1. 游戏完整性检查（是否有角色、剧情）
2. 发布确认
3. 发布后状态变更

**实现步骤**:
1. 创建 PublishView.vue
2. 添加发布检查逻辑
3. 修改 gameStore 添加 publishGame 方法
4. 在路由中添加发布页面

---

## 中优先级功能

### 7. 互动配置组件
**文件**: 新建 `src/components/creator/InteractionConfig.vue`

**功能**:
1. 触摸反应选择（摸头、拥抱、牵手、告白）
2. 语音触发词配置
3. 约会场景选择
4. 好感度系统开关

**数据结构**:
```typescript
interface InteractionConfig {
  touchReactions: {
    head: string;      // 摸头反应
    hug: string;       // 拥抱反应
    hand: string;      // 牵手反应
    confess: string;   // 告白反应
  };
  voiceTriggers: string[];  // 语音触发词
  dateScenes: string[];     // 约会场景
  affectionEnabled: boolean; // 好感度开关
}
```

**实现步骤**:
1. 创建 InteractionConfig.vue 组件
2. 添加到 CharacterCreator 步骤中（第5步）
3. 保存到角色数据

---

### 8. 即梦 2.0 图片生成（预留）
**文件**: 修改 `src/views/creator/CharacterCreator.vue`

**功能**:
1. 添加"生成立绘"按钮
2. 预留图片生成接口
3. 图片预览和选择

**实现步骤**:
1. 在角色创建流程中添加图片生成步骤
2. 创建图片生成弹窗组件
3. 预留 AI 图片生成接口（当前使用占位图）

---

### 9. 评论与游戏关联
**文件**: 修改 `src/stores/commentStore.ts`

**功能**:
1. 评论关联到具体游戏
2. 游戏详情页显示相关评论

**实现步骤**:
1. 修改 Comment 接口，添加 gameId 字段
2. 修改评论生成逻辑，传入当前游戏
3. 添加游戏评论筛选功能

---

### 10/11. 运营数据与游戏关联
**文件**: 修改 `src/stores/operationStore.ts`

**功能**:
1. 卡池、活动、事件关联到具体游戏
2. 游戏运营数据独立统计

**实现步骤**:
1. 修改 GachaPool、GameEvent、OperationIncident 接口，添加 gameId
2. 修改创建方法，关联当前游戏
3. 运营页面显示当前游戏的运营数据

---

### 12. 公司设立流程
**文件**: 新建 `src/views/CompanySetupView.vue`

**功能**:
1. 公司命名输入
2. Logo 选择（emoji + 文字组合）
3. 团队组建（虚拟角色）

**数据结构**:
```typescript
interface Company {
  name: string;
  logo: {
    emoji: string;
    text: string;
  };
  team: TeamMember[];
}

interface TeamMember {
  id: string;
  name: string;
  role: '策划' | '美术' | '程序' | '运营';
  avatar: string;
}
```

**实现步骤**:
1. 创建 CompanySetupView.vue
2. 添加公司设置表单
3. 创建 companyStore.ts 存储公司信息
4. 添加到首页或作为新手引导第一步

---

### 13. 新手引导
**文件**: 新建 `src/components/OnboardingGuide.vue`

**功能**:
1. 分步引导遮罩
2. 高亮提示区域
3. 手势操作提示
4. 跳过选项

**引导步骤**:
1. 欢迎来到乙游创作者模拟器
2. 创建你的第一个角色
3. 设计剧情
4. 查看玩家评论
5. 运营你的游戏

**实现步骤**:
1. 创建 OnboardingGuide.vue 组件
2. 使用 driver.js 或自定义实现
3. 在 App.vue 中引入
4. 添加引导状态存储

---

## 低优先级功能

### 16. 活动模板库
**文件**: 新建 `src/data/templates/events/index.ts`

**内容**:
- 节日活动模板（10个）：情人节、七夕、圣诞、新年等
- 角色生日模板（5个）
- 联动活动模板（5个）

**实现步骤**:
1. 创建活动模板数据结构
2. 添加 20 个活动模板
3. 在 EventCenter 中使用模板

---

### 17. 成就展示页面
**文件**: 新建 `src/views/AchievementsView.vue`

**功能**:
1. 成就列表展示
2. 已解锁/未解锁状态
3. 成就详情和奖励

**实现步骤**:
1. 创建成就数据配置
2. 创建 AchievementsView.vue
3. 在 ProfileView 添加入口
4. 修改 pointsStore 添加成就状态管理

---

### 18. 资源管理系统
**文件**: 修改 `src/stores/gameStore.ts`

**功能**:
1. 金币、钻石、人气值、开发点数管理
2. 资源获取和消耗
3. 资源分配策略（稳健、激进、保守）

**数据结构**:
```typescript
interface GameResources {
  gold: number;        // 金币
  diamond: number;     // 钻石
  popularity: number;  // 人气值
  devPoints: number;   // 开发点数
}
```

**实现步骤**:
1. 在 gameStore 中添加资源管理
2. 创建资源展示组件
3. 添加资源获取途径（运营、活动）
4. 添加资源分配功能

---

## 实施时间表

### 第1周：高优先级
- Day 1-2: 实现功能 2（角色保存）+ 功能 3（剧情保存）
- Day 3: 实现功能 6（游戏发布）
- Day 4-5: 实现功能 4（AI 服务预留接口）

### 第2周：中优先级
- Day 1: 实现功能 7（互动配置）
- Day 2: 实现功能 8（图片生成预留）
- Day 3: 实现功能 9+10（评论/运营与游戏关联）
- Day 4: 实现功能 12（公司设立）
- Day 5: 实现功能 13（新手引导）

### 第3周：低优先级 + 优化
- Day 1-2: 实现功能 16（活动模板库）
- Day 3: 实现功能 17（成就展示）
- Day 4-5: 实现功能 18（资源管理）

**总计：3周完成所有功能**

---

## 文件变更清单

### 新建文件
```
src/
├── stores/
│   ├── gameStore.ts              # 游戏数据管理
│   └── companyStore.ts           # 公司数据管理
├── services/
│   └── aiService.ts              # AI 服务（预留）
├── views/
│   ├── PublishView.vue           # 游戏发布
│   ├── CompanySetupView.vue      # 公司设立
│   └── AchievementsView.vue      # 成就展示
├── components/
│   ├── creator/
│   │   └── InteractionConfig.vue # 互动配置
│   └── OnboardingGuide.vue       # 新手引导
└── data/templates/
    └── events/
        └── index.ts              # 活动模板库
```

### 修改文件
```
src/
├── stores/
│   ├── commentStore.ts           # 添加游戏关联
│   ├── operationStore.ts         # 添加游戏关联
│   └── points.ts                 # 添加成就状态
├── views/
│   ├── creator/
│   │   ├── CharacterCreator.vue  # 添加保存逻辑
│   │   └── PlotDesigner.vue      # 添加保存逻辑
│   └── HomeView.vue              # 添加公司展示
├── components/
│   └── comments/
│       └── CommentGenerator.vue  # 添加游戏参数
└── router/
    └── index.ts                  # 添加新路由
```

---

## 验收标准

### 高优先级
- [ ] 角色创建后可以保存并在列表中查看
- [ ] 剧情设计后可以保存并在列表中查看
- [ ] AI 服务层已创建，预留接口
- [ ] 游戏可以发布，状态变更

### 中优先级
- [ ] 互动配置组件可用
- [ ] 图片生成功能预留
- [ ] 评论和运营数据与游戏关联
- [ ] 公司设立流程完整
- [ ] 新手引导可用

### 低优先级
- [ ] 活动模板库 20 个模板
- [ ] 成就展示页面
- [ ] 资源管理系统
