# 评论系统重构计划

## 需求分析

根据用户截图和需求描述，需要完成以下修改：

1. **移除 PlatformComments 组件中的渠道切换栏**（抖音、小红书、微博、B站、贴吧的 Tab 切换）
2. **将多渠道功能合并到 CommentList 组件中**
3. **CommentList 组件需要支持多渠道筛选/展示**
4. **评论内容应根据模拟结果生成**（而不是随机生成）

## 当前架构

### CommentsView.vue
- 包含 SentimentOverview、CommentGenerator、CommentList、PlatformComments
- PlatformComments 是独立的渠道评论展示组件

### PlatformComments.vue
- 有独立的渠道 Tab 切换（抖音、小红书、微博、B站、贴吧）
- 每个渠道显示不同风格的评论
- 有排序功能

### CommentList.vue
- 显示"玩家评论"列表
- 没有渠道区分
- 显示玩家类型（氪金大佬、剧情党等）

### CommentGenerator.vue
- AI 评论生成器
- 可选择玩家类型和评论类型
- 生成评论添加到 Store

### commentStore.ts
- 管理所有评论数据
- 支持平台类型（platform字段）
- 与 simulationStore 联动

## 重构方案

### 步骤 1: 修改 CommentList 组件
- 添加渠道 Tab 切换功能（从 PlatformComments 迁移）
- 支持按渠道筛选评论
- 保持原有的评论卡片样式
- 添加平台标识显示

### 步骤 2: 修改 CommentsView 组件
- 移除 PlatformComments 组件引用
- 调整布局，让 CommentList 占据主要区域

### 步骤 3: 修改 CommentGenerator 组件
- 添加渠道选择功能
- 生成的评论应基于 simulationStore 的模拟数据
- 根据模拟结果决定评论的情感倾向和内容

### 步骤 4: 更新 commentStore
- 确保 generateDailyComments 使用模拟数据
- 评论生成逻辑与 simulationStore 联动

## 具体修改点

### 1. CommentList.vue 修改
```
新增：
- 渠道 Tab 切换栏（抖音、小红书、微博、B站、贴吧）
- 按渠道筛选评论的逻辑
- 平台标识显示在评论卡片上

修改：
- 评论列表过滤逻辑，支持按平台筛选
- 样式调整以适应新布局
```

### 2. CommentsView.vue 修改
```
移除：
- PlatformComments 组件引用
- platform-section 样式区域

修改：
- 布局调整
```

### 3. CommentGenerator.vue 修改
```
新增：
- 渠道选择选项
- 从 simulationStore 获取模拟数据
- 基于模拟结果生成对应情感倾向的评论

修改：
- 生成逻辑，使用模拟数据而非随机生成
```

### 4. commentStore.ts 修改（如有需要）
```
修改：
- generateDailyComments 方法，使用 simulationStore 数据
```

## 文件变更清单

1. `src/components/comments/CommentList.vue` - 添加渠道切换功能
2. `src/views/CommentsView.vue` - 移除 PlatformComments
3. `src/components/comments/CommentGenerator.vue` - 基于模拟数据生成评论
4. `src/stores/commentStore.ts` - 如有需要，调整生成逻辑

## 预期效果

- 评论列表上方显示渠道 Tab（抖音、小红书、微博、B站、贴吧）
- 切换 Tab 显示对应渠道的评论
- 评论内容基于游戏模拟结果生成（正面/负面比例与模拟数据一致）
- 移除原有的 PlatformComments 区域
