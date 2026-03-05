# 安卓APP打包计划

## 项目概述
- **项目名称**: 乙女游戏模拟器 (Vue3 Vite App)
- **技术栈**: Vue 3 + TypeScript + Vite + Vant UI + Pinia
- **目标平台**: Android APK/AAB

---

## 方案选型

经过分析，本项目有以下几种打包成安卓APP的方案：

| 方案 | 技术 | 优点 | 缺点 | 推荐度 |
|------|------|------|------|--------|
| **方案一** | Capacitor | 官方推荐、配置简单、性能好 | 需要额外配置 | ⭐⭐⭐⭐⭐ |
| **方案二** | Cordova | 成熟稳定、插件丰富 | 性能略差、配置复杂 | ⭐⭐⭐ |
| **方案三** | PWA + TWA | 无需打包、自动更新 | 需要Play Store支持 | ⭐⭐⭐⭐ |

**推荐方案：Capacitor** (由 Ionic 团队开发，是 Cordova 的现代替代品，与 Vue 生态集成更好)

---

## 实施步骤

### 第一阶段：环境准备

#### 1.1 安装必要依赖
```bash
# 安装 Capacitor 核心库和 CLI
npm install @capacitor/core @capacitor/cli

# 安装 Android 平台支持
npm install @capacitor/android

# 安装常用插件（可选但推荐）
npm install @capacitor/app          # 应用状态管理
npm install @capacitor/splash-screen # 启动屏
npm install @capacitor/status-bar    # 状态栏控制
npm install @capacitor/preferences   # 本地存储
npm install @capacitor/network       # 网络状态
npm install @capacitor/screen-orientation # 屏幕方向
```

#### 1.2 初始化 Capacitor
```bash
# 初始化 Capacitor 配置
npx cap init
```
配置信息：
- App ID: `com.otomegames.simulator` (或自定义)
- App Name: `乙女游戏模拟器`

---

### 第二阶段：项目适配

#### 2.1 修改 vite.config.ts
添加基础路径配置（用于移动端打包）：
```typescript
export default defineConfig({
  base: './',  // 添加这一行，使用相对路径
  // ... 其他配置
})
```

#### 2.2 创建/更新 capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.otomegames.simulator',
  appName: '乙女游戏模拟器',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP'
    }
  }
};

export default config;
```

#### 2.3 添加安卓平台
```bash
# 添加 Android 平台
npx cap add android

# 同步项目（每次构建后执行）
npx cap sync android
```

---

### 第三阶段：Android 项目配置

#### 3.1 配置应用图标和启动图

需要准备以下尺寸的应用图标：
- mdpi: 48x48
- hdpi: 72x72
- xhdpi: 96x96
- xxhdpi: 144x144
- xxxhdpi: 192x192

放置路径：`android/app/src/main/res/` 下对应文件夹

#### 3.2 配置应用签名（发布时需要）

创建签名密钥：
```bash
keytool -genkey -v -keystore otome-simulator.keystore -alias otome -keyalg RSA -keysize 2048 -validity 10000
```

#### 3.3 修改 Android 项目配置

编辑 `android/app/build.gradle`：
```gradle
android {
    defaultConfig {
        applicationId "com.otomegames.simulator"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    signingConfigs {
        release {
            storeFile file("otome-simulator.keystore")
            storePassword "your-password"
            keyAlias "otome"
            keyPassword "your-password"
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

### 第四阶段：移动端适配优化

#### 4.1 适配移动端安全区域
在 `index.html` 中添加：
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

#### 4.2 处理移动端返回键
在 Vue 项目中添加返回键处理逻辑：
```typescript
// 在 App.vue 或 main.ts 中添加
import { App } from '@capacitor/app';

App.addListener('backButton', ({ canGoBack }) => {
  if (canGoGoBack) {
    window.history.back();
  } else {
    App.exitApp();
  }
});
```

#### 4.3 状态栏适配
```typescript
import { StatusBar, Style } from '@capacitor/status-bar';

// 设置状态栏样式
StatusBar.setStyle({ style: Style.Light });
StatusBar.setBackgroundColor({ color: '#ffffff' });
```

#### 4.4 屏幕方向锁定（可选）
```typescript
import { ScreenOrientation } from '@capacitor/screen-orientation';

// 锁定为竖屏
ScreenOrientation.lock({ orientation: 'portrait' });
```

---

### 第五阶段：构建与打包

#### 5.1 构建生产版本
```bash
# 构建 Vue 项目
npm run build

# 同步到 Android 项目
npx cap sync android
```

#### 5.2 生成 APK/AAB

**方式一：使用 Android Studio（推荐）**
1. 打开 Android Studio
2. 选择 `android` 文件夹
3. Build → Generate Signed Bundle/APK
4. 选择 APK 或 AAB 格式
5. 选择签名密钥
6. 生成发布版本

**方式二：使用命令行**
```bash
cd android
./gradlew assembleRelease  # 生成 APK
./gradlew bundleRelease    # 生成 AAB (Google Play 推荐)
```

输出文件位置：
- APK: `android/app/build/outputs/apk/release/`
- AAB: `android/app/build/outputs/bundle/release/`

---

### 第六阶段：测试与发布

#### 6.1 本地测试
```bash
# 在模拟器或真机上运行
npx cap run android

# 或使用 Android Studio 运行
npx cap open android
```

#### 6.2 发布前检查清单
- [ ] 应用图标正确显示
- [ ] 启动图正常
- [ ] 所有功能正常运行
- [ ] 网络请求正常
- [ ] 返回键行为正确
- [ ] 横竖屏切换正常（如允许）
- [ ] 不同分辨率适配良好

#### 6.3 发布渠道
1. **Google Play Store**: 需要 AAB 格式
2. **国内应用市场**: 需要 APK 格式
3. **直接分发**: APK 格式

---

## 项目文件结构变化

添加 Capacitor 后，项目结构如下：
```
2_plays_game/
├── android/                    # 生成的 Android 项目
│   ├── app/
│   ├── gradle/
│   └── ...
├── src/                        # Vue 源码
├── dist/                       # 构建输出
├── capacitor.config.ts         # Capacitor 配置
├── package.json
└── ...
```

---

## 注意事项

1. **网络请求**: 确保所有 API 使用 HTTPS，或在 Android 配置中允许明文传输（开发环境）
2. **本地存储**: 使用 `@capacitor/preferences` 替代 localStorage 以获得更好性能
3. **文件访问**: 如需访问设备文件，需要申请相应权限
4. **推送通知**: 如需推送功能，需额外配置 FCM
5. **版本管理**: 每次发布时更新 `versionCode` 和 `versionName`

---

## 后续优化建议

1. **热更新**: 集成 Capacitor 的 Live Updates 功能
2. **性能优化**: 启用代码分割、懒加载
3. **离线支持**: 配置 Service Worker 和缓存策略
4. **分析统计**: 集成 Firebase Analytics
5. **错误监控**: 集成 Sentry 等错误追踪工具
