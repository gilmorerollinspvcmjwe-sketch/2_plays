# 微信小程序打包计划

## 项目概述
- **项目名称**: 乙女游戏模拟器 (Vue3 Vite App)
- **技术栈**: Vue 3 + TypeScript + Vite + Vant UI + Pinia + Vue Router
- **目标平台**: 微信小程序

---

## 方案选型分析

由于微信小程序有自己的框架和语法规范，Vue 3 项目无法直接运行，需要选择以下方案之一：

| 方案 | 技术 | 优点 | 缺点 | 推荐度 |
|------|------|------|------|--------|
| **方案一** | uni-app | 多端统一、生态成熟、文档完善 | 需要改写部分代码 | ⭐⭐⭐⭐⭐ |
| **方案二** | Taro | 京东出品、React/Vue 都支持 | 学习成本略高 | ⭐⭐⭐⭐ |
| **方案三** | mpvue | 美团出品、Vue 语法 | 维护较少、生态弱 | ⭐⭐ |
| **方案四** | 原生重写 | 性能最好 | 工作量大 | ⭐⭐ |

**推荐方案：uni-app** (DCloud 出品，支持 Vue 3，可以最大程度复用现有代码，一套代码多端运行)

---

## 方案一：uni-app 迁移方案（推荐）

### 第一阶段：环境准备与项目初始化

#### 1.1 安装 uni-app 开发环境
```bash
# 全局安装 HBuilderX（推荐）或 Vue CLI 插件

# 方式一：使用 Vue CLI
npm install -g @vue/cli
npm install -g @dcloudio/uni-app-cli

# 方式二：使用 HBuilderX（推荐，可视化开发）
# 下载地址：https://www.dcloud.io/hbuilderx.html
```

#### 1.2 创建 uni-app 项目
```bash
# 使用 CLI 创建项目
npx degit dcloudio/uni-preset-vue#vite-ts my-uni-app
cd my-uni-app
npm install
```

#### 1.3 项目结构对比

**原 Vue 3 项目结构：**
```
src/
├── components/     # 组件
├── views/          # 页面
├── stores/         # Pinia Store
├── router/         # Vue Router
├── styles/         # 样式
├── App.vue         # 根组件
└── main.ts         # 入口
```

**uni-app 项目结构：**
```
src/
├── components/     # 组件（复用）
├── pages/          # 页面（原 views）
├── static/         # 静态资源
├── stores/         # Pinia Store（需适配）
├── App.vue         # 根组件（需修改）
├── main.ts         # 入口（需修改）
├── manifest.json   # 应用配置
├── pages.json      # 页面路由配置
└── uni.scss        # 全局样式
```

---

### 第二阶段：代码迁移与适配

#### 2.1 路由系统迁移

**原 Vue Router 配置 → uni-app pages.json**

原 `src/router/index.ts`：
```typescript
// 原 Vue Router 配置
{
  path: '/creator',
  name: 'creator',
  component: () => import('@/views/creator/CreatorEntryView.vue'),
  meta: { title: '游戏开发' }
}
```

新 `src/pages.json`：
```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    },
    {
      "path": "pages/creator/index",
      "style": {
        "navigationBarTitleText": "游戏开发"
      }
    },
    {
      "path": "pages/creator/character",
      "style": {
        "navigationBarTitleText": "角色创建"
      }
    }
    // ... 其他页面
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "乙女游戏模拟器",
    "navigationBarBackgroundColor": "#ffffff",
    "backgroundColor": "#f8f8f8"
  },
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "static/tabbar/home.png",
        "selectedIconPath": "static/tabbar/home-active.png"
      },
      {
        "pagePath": "pages/creator/index",
        "text": "开发",
        "iconPath": "static/tabbar/creator.png",
        "selectedIconPath": "static/tabbar/creator-active.png"
      },
      {
        "pagePath": "pages/profile/index",
        "text": "我的",
        "iconPath": "static/tabbar/profile.png",
        "selectedIconPath": "static/tabbar/profile-active.png"
      }
    ]
  }
}
```

#### 2.2 页面跳转适配

**原 Vue Router 跳转：**
```typescript
// 原代码
import { useRouter } from 'vue-router'
const router = useRouter()
router.push('/creator/character')
```

**uni-app 跳转：**
```typescript
// 新代码
uni.navigateTo({
  url: '/pages/creator/character'
})

// 或者使用 uni-app 的 Vue Router 兼容模式
import { useRouter } from '@dcloudio/uni-app'
const router = useRouter()
router.push('/pages/creator/character')
```

#### 2.3 Store 适配

Pinia 可以直接使用，但需要注意：

```typescript
// stores/gameStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
  // 状态
  const games = ref([])
  
  // 计算属性
  const gameCount = computed(() => games.value.length)
  
  // 方法
  const addGame = (game) => {
    games.value.push(game)
    // 使用 uni-app 的存储 API
    uni.setStorageSync('games', games.value)
  }
  
  // 初始化时读取存储
  const init = () => {
    const saved = uni.getStorageSync('games')
    if (saved) {
      games.value = saved
    }
  }
  
  return {
    games,
    gameCount,
    addGame,
    init
  }
})
```

#### 2.4 组件适配

**模板语法差异：**

| 特性 | Vue 3 Web | uni-app 小程序 |
|------|-----------|----------------|
| 事件绑定 | `@click` | `@click` 或 `@tap` |
| 条件渲染 | `v-if/v-show` | `v-if/v-show` |
| 列表渲染 | `v-for` | `v-for` |
| 组件引用 | `ref` | `ref` |
| 自定义事件 | `$emit` | `$emit` |
| 插槽 | `<slot>` | `<slot>` |

**需要修改的地方：**

1. **移除 Vant 组件**：小程序需要使用 uni-ui 或原生组件
```vue
<!-- 原 Vant 组件 -->
<van-button type="primary">按钮</van-button>
<van-cell-group>
  <van-cell title="单元格" value="内容" />
</van-cell-group>

<!-- uni-app 组件 -->
<button type="primary">按钮</button>
<uni-list>
  <uni-list-item title="单元格" rightText="内容" />
</uni-list>
```

2. **图片路径处理**
```vue
<!-- 原代码 -->
<img src="/assets/logo.png" />

<!-- uni-app -->
<image src="/static/logo.png" mode="aspectFit" />
```

3. **样式单位适配**
```scss
/* 原代码 - 使用 px 或 rem */
.container {
  padding: 16px;
  font-size: 14px;
}

/* uni-app - 推荐使用 rpx（响应式像素） */
.container {
  padding: 32rpx;  /* 16px = 32rpx */
  font-size: 28rpx; /* 14px = 28rpx */
}
```

#### 2.5 API 适配

**网络请求：**
```typescript
// 原代码 - fetch/axios
const response = await fetch('/api/games')
const data = await response.json()

// uni-app - uni.request
uni.request({
  url: 'https://your-api.com/api/games',
  method: 'GET',
  success: (res) => {
    console.log(res.data)
  },
  fail: (err) => {
    console.error(err)
  }
})
```

**本地存储：**
```typescript
// 原代码 - localStorage
localStorage.setItem('key', value)
localStorage.getItem('key')

// uni-app - uni.storage
uni.setStorageSync('key', value)
uni.getStorageSync('key')
```

---

### 第三阶段：UI 组件库替换

#### 3.1 安装 uni-ui
```bash
npm install @dcloudio/uni-ui
```

#### 3.2 组件映射表

| Vant 组件 | uni-ui 替代 | 说明 |
|-----------|-------------|------|
| van-button | button | 原生按钮 |
| van-cell | uni-list-item | 列表项 |
| van-cell-group | uni-list | 列表组 |
| van-icon | uni-icons | 图标 |
| van-popup | uni-popup | 弹出层 |
| van-toast | uni.showToast | 提示 |
| van-dialog | uni.showModal | 对话框 |
| van-loading | uni.showLoading | 加载中 |
| van-tabs | uni-segmented-control | 标签页 |
| van-nav-bar | uni-nav-bar | 导航栏 |
| van-card | uni-card | 卡片 |
| van-tag | uni-tag | 标签 |
| van-badge | uni-badge | 徽标 |
| van-grid | uni-grid | 宫格 |
| van-progress | uni-progress | 进度条 |
| van-slider | uni-slider | 滑块 |
| van-stepper | uni-number-box | 步进器 |
| van-switch | switch | 开关 |
| van-checkbox | checkbox | 复选框 |
| van-radio | radio | 单选框 |
| van-field | input/textarea | 输入框 |
| van-picker | uni-data-picker | 选择器 |
| van-datetime-picker | uni-datetime-picker | 日期选择 |
| van-uploader | uni-file-picker | 文件上传 |
| van-swipe-cell | uni-swipe-action | 滑动操作 |
| van-collapse | uni-collapse | 折叠面板 |
| van-notice-bar | uni-notice-bar | 通告栏 |
| van-divider | view + css | 分割线 |
| van-empty | uni-icons + text | 空状态 |
| van-skeleton | 自定义 | 骨架屏 |
| van-pull-refresh | onPullDownRefresh | 下拉刷新 |
| van-list | onReachBottom | 列表加载 |
| van-sticky | css sticky | 粘性布局 |
| van-index-bar | uni-indexed-list | 索引列表 |

---

### 第四阶段：构建与发布

#### 4.1 开发环境运行
```bash
# 运行到微信小程序模拟器
npm run dev:mp-weixin
```

#### 4.2 生产构建
```bash
# 构建微信小程序
npm run build:mp-weixin
```

输出目录：`dist/build/mp-weixin/`

#### 4.3 发布流程

1. **打开微信开发者工具**
2. **导入项目**：选择 `dist/build/mp-weixin` 文件夹
3. **配置 AppID**：在 `manifest.json` 中配置小程序 AppID
4. **上传代码**：点击"上传"按钮
5. **提交审核**：在微信公众平台提交审核
6. **发布上线**：审核通过后发布

---

## 方案二：Taro 迁移方案（备选）

如果团队更熟悉 React 或需要更好的跨端一致性，可以考虑 Taro：

```bash
# 安装 Taro CLI
npm install -g @tarojs/cli

# 创建项目
taro init my-taro-app
# 选择：Vue3 + TypeScript + 微信小程序

# 运行
cd my-taro-app
npm run dev:weapp
```

Taro 与 uni-app 的主要区别：
- Taro 更接近 React 生态
- uni-app 更接近 Vue 生态
- 两者都可以编译到微信小程序

---

## 迁移工作量评估

| 模块 | 工作量 | 说明 |
|------|--------|------|
| 路由系统 | 中等 | pages.json 配置 + 跳转方法替换 |
| Store | 低 | Pinia 可直接使用，只需适配存储 API |
| 组件 | 高 | Vant → uni-ui，需要替换所有组件 |
| 样式 | 中等 | px → rpx 转换 |
| API 调用 | 中等 | 替换为 uni API |
| 页面逻辑 | 低 | 大部分可复用 |

**预估总工作量：2-3 周（1-2 名前端开发）**

---

## 详细迁移步骤

### 步骤 1：创建 uni-app 项目并初始化
```bash
# 1. 创建项目
npx degit dcloudio/uni-preset-vue#vite-ts otome-uniapp
cd otome-uniapp

# 2. 安装依赖
npm install

# 3. 安装 uni-ui
npm install @dcloudio/uni-ui

# 4. 安装 Pinia
npm install pinia
```

### 步骤 2：迁移 Store
```bash
# 复制 stores 文件夹
mkdir -p src/stores
cp -r ../2_plays_game/src/stores/* src/stores/

# 修改存储逻辑（localStorage → uni.storage）
```

### 步骤 3：迁移页面
```bash
# 创建 pages 目录结构
mkdir -p src/pages/creator
mkdir -p src/pages/game
mkdir -p src/pages/operation
# ...

# 复制并修改页面文件
cp ../2_plays_game/src/views/HomeView.vue src/pages/index/index.vue
cp ../2_plays_game/src/views/creator/CreatorEntryView.vue src/pages/creator/index.vue
# ...
```

### 步骤 4：迁移组件
```bash
# 复制组件
mkdir -p src/components
cp -r ../2_plays_game/src/components/* src/components/

# 批量替换 Vant 组件为 uni-ui 组件
```

### 步骤 5：配置路由
```bash
# 创建 pages.json，根据原 router/index.ts 配置页面路由
```

### 步骤 6：适配 API
```bash
# 搜索并替换所有 API 调用
# fetch/axios → uni.request
# localStorage → uni.storage
```

### 步骤 7：样式适配
```bash
# 将 px 转换为 rpx
# 可以使用 postcss 插件自动转换
npm install postcss-rpx-transform
```

### 步骤 8：测试与优化
```bash
# 运行到微信小程序
npm run dev:mp-weixin

# 在微信开发者工具中测试所有功能
```

---

## 注意事项

1. **包大小限制**：微信小程序总包大小限制 2MB（可分包扩展到 20MB）
   - 需要优化图片资源
   - 使用分包加载

2. **API 限制**：
   - 网络请求必须使用 HTTPS
   - 需要配置服务器域名白名单
   - 部分浏览器 API 不可用

3. **存储限制**：
   - 本地存储限制 10MB
   - 需要做好数据清理策略

4. **性能优化**：
   - 避免大量数据绑定
   - 使用虚拟列表处理长列表
   - 图片懒加载

5. **审核规范**：
   - 遵守微信小程序运营规范
   - 游戏类小程序需要版号
   - 虚拟支付需要接入微信支付

---

## 推荐迁移顺序

1. **第一周**：
   - 环境搭建
   - Store 迁移
   - 基础页面框架

2. **第二周**：
   - 页面组件迁移
   - UI 组件替换
   - 路由配置

3. **第三周**：
   - API 适配
   - 功能测试
   - 性能优化
   - 发布准备
