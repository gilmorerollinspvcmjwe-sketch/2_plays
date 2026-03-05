# UI页面跳转逻辑优化计划

## 现状分析

### 当前页面结构
- **总路由数**：15个
- **视图文件**：14个.vue文件
- **布局方式**：全部使用 MainLayout 底部Tab导航

### 发现的问题

#### 1. 孤立页面
- **AboutView.vue** - 存在于目录但未在路由中注册

#### 2. 缺失入口的页面
- **CompanySetupView** (`/company-setup`) - 公司创建页面无入口
- **MarketDashboard** (`/market`) - 市场情报页面无入口
- **PlotTreeEditor** (`/creator/plot/editor`) - 剧情树编辑器无入口

#### 3. 返回逻辑不一致
- 不同页面使用不同的返回方式
- 缺乏统一的面包屑导航

#### 4. 子路由Tab高亮问题
- 子页面（如 `/creator/plot`）时父级Tab可能无法正确高亮

---

## 优化计划

### 阶段一：修复孤立和缺失页面（优先级：高）

#### 1.1 注册About页面路由
**文件**：`src/router/index.ts`
**操作**：添加 `/about` 路由
```typescript
{
  path: '/about',
  name: 'about',
  component: () => import('@/views/AboutView.vue'),
  meta: { title: '关于我们' }
}
```

#### 1.2 添加公司创建入口
**文件**：`src/views/HomeView.vue` 或 `src/views/ProfileView.vue`
**操作**：在适当位置添加"创建新公司"按钮

#### 1.3 添加市场情报入口
**方案A**：在运营中心添加Tab
**文件**：`src/views/OperationView.vue`
**操作**：添加"市场情报"Tab，内容使用 MarketDashboard 组件

**方案B**：在底部Tab添加
**文件**：`src/layouts/MainLayout.vue`
**操作**：将市场添加到Tab导航（不推荐，Tab过多）

#### 1.4 添加剧情编辑器入口
**文件**：`src/views/creator/PlotDesigner.vue`
**操作**：添加"高级编辑模式"按钮，跳转到 `/creator/plot/editor`

---

### 阶段二：统一返回逻辑（优先级：中）

#### 2.1 创建统一返回组件
**文件**：`src/components/common/BackButton.vue`
**功能**：
- 统一的返回按钮样式
- 支持自定义返回路径
- 自动判断使用 `router.back()` 或指定路径

#### 2.2 更新MainLayout返回逻辑
**文件**：`src/layouts/MainLayout.vue`
**优化**：
- 统一处理返回按钮显示逻辑
- 支持页面通过 meta 配置隐藏返回按钮

#### 2.3 更新各页面返回逻辑
**需要更新的页面**：
- `CharacterDetailView.vue`
- `MarketDashboard.vue`
- `AboutView.vue`

---

### 阶段三：优化子路由Tab高亮（优先级：中）

#### 3.1 更新MainLayout Tab匹配逻辑
**文件**：`src/layouts/MainLayout.vue`
**优化**：
```typescript
// 当前逻辑（假设）
const activeTab = computed(() => route.path)

// 优化逻辑
const activeTab = computed(() => {
  const path = route.path
  if (path.startsWith('/creator')) return '/creator'
  if (path.startsWith('/game')) return '/'
  return path
})
```

---

### 阶段四：增强导航体验（优先级：低）

#### 4.1 添加面包屑导航
**适用页面**：
- 游戏详情页
- 角色详情页
- 剧情编辑器

**示例**：
```
首页 > 我的游戏 > 游戏名称 > 角色名称
```

#### 4.2 添加页面切换动画
**文件**：`src/App.vue` 或 `src/layouts/MainLayout.vue`
**效果**：页面切换时添加淡入淡出或滑动动画

#### 4.3 添加操作完成引导
**适用场景**：
- 角色创建完成
- 剧情设计完成
- 游戏发布完成

**方案**：
- 显示成功提示
- 提供"继续创建"和"返回首页"选项

---

## 详细实施步骤

### 步骤1：修复路由配置
**预计时间**：30分钟
**文件**：`src/router/index.ts`

1. 添加 `/about` 路由
2. 检查所有路由的 meta 配置是否完整
3. 确保所有视图文件都有对应路由

### 步骤2：添加缺失入口
**预计时间**：1小时
**文件**：
- `src/views/HomeView.vue`
- `src/views/ProfileView.vue`
- `src/views/OperationView.vue`
- `src/views/creator/PlotDesigner.vue`

1. 在首页添加"创建新公司"入口
2. 在个人中心添加"关于我们"入口
3. 在运营中心添加"市场情报"Tab
4. 在剧情设计页面添加"高级编辑"按钮

### 步骤3：统一返回逻辑
**预计时间**：1小时
**文件**：
- `src/components/common/BackButton.vue` (新建)
- `src/layouts/MainLayout.vue`
- `src/views/game/CharacterDetailView.vue`
- `src/components/market/MarketDashboard.vue`

1. 创建统一返回组件
2. 更新MainLayout使用新组件
3. 更新各页面返回逻辑

### 步骤4：优化Tab高亮
**预计时间**：30分钟
**文件**：`src/layouts/MainLayout.vue`

1. 更新Tab激活状态计算逻辑
2. 测试子路由高亮效果

### 步骤5：添加面包屑（可选）
**预计时间**：1小时
**文件**：
- `src/components/common/Breadcrumb.vue` (新建)
- `src/views/game/GameDetailView.vue`
- `src/views/game/CharacterDetailView.vue`

1. 创建面包屑组件
2. 在深层页面添加面包屑

---

## 验证清单

### 功能验证
- [ ] About页面可以通过正常导航访问
- [ ] 公司创建页面有明确入口
- [ ] 市场情报页面可以从运营中心进入
- [ ] 剧情编辑器可以从剧情设计页面进入
- [ ] 所有页面返回逻辑正常工作
- [ ] 子路由时父级Tab正确高亮

### 用户体验验证
- [ ] 页面跳转流畅，无卡顿
- [ ] 返回按钮在所有页面可见且可用
- [ ] 深层页面（角色详情）有明确的导航路径
- [ ] 操作完成后有明确的引导

---

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 路由修改导致404 | 高 | 修改前备份，修改后全面测试 |
| Tab高亮逻辑错误 | 中 | 充分测试各种路由组合 |
| 返回逻辑混乱 | 中 | 统一使用返回组件，避免自定义逻辑 |

---

## 优先级建议

### P0（必须修复）
1. 注册About页面路由
2. 添加公司创建入口
3. 修复Tab高亮问题

### P1（强烈建议）
1. 添加市场情报入口
2. 统一返回逻辑

### P2（可选优化）
1. 添加剧情编辑器入口
2. 添加面包屑导航
3. 添加页面动画
