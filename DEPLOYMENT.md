# 部署说明文档

本文档介绍如何将前端项目部署到 Vercel 平台。

## 前置条件

- Node.js 18+ 已安装
- Git 已安装并配置
- Vercel 账号（可在 https://vercel.com 免费注册）
- 项目已推送到 Git 仓库（GitHub、GitLab 或 Bitbucket）

## 部署步骤

### 方法一：通过 Vercel CLI 部署（推荐）

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

按提示选择登录方式（GitHub、GitLab、Bitbucket 或邮箱）。

#### 3. 部署项目

在项目根目录执行：

```bash
vercel
```

首次部署时，按提示进行以下配置：

- **Set up and deploy?** → Yes
- **Which scope do you want to link to?** → 选择你的账号
- **Link to existing project?** → No
- **What's your project's name?** → 输入项目名称（或使用默认名称）
- **In which directory is your code located?** → ./
- **Want to override the settings?** → No（使用 vercel.json 配置）

#### 4. 配置环境变量

```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_SUPABASE_ANON_KEY preview
```

按提示输入对应的环境变量值。

#### 5. 生产环境部署

```bash
vercel --prod
```

### 方法二：通过 Vercel 控制台部署

#### 1. 连接 Git 仓库

1. 访问 https://vercel.com/new
2. 点击 **Continue with GitHub**（或其他 Git 服务商）
3. 授权 Vercel 访问你的 Git 仓库
4. 选择要部署的项目仓库

#### 2. 配置项目

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 3. 配置环境变量

在 **Settings** → **Environment Variables** 中添加：

| Variable Name | Value | Environments |
|---------------|-------|--------------|
| `VITE_SUPABASE_URL` | 你的 Supabase 项目 URL | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | 你的 Supabase 匿名密钥 | Production, Preview |

#### 4. 部署

点击 **Deploy** 按钮，Vercel 将自动构建并部署项目。

## 自动部署配置

### Git 推送自动部署

Vercel 默认会在以下情况自动部署：

- **Push to main branch** → 自动部署到 **Production** 环境
- **Push to other branches** → 自动部署到 **Preview** 环境（生成预览链接）
- **Pull Requests** → 自动创建预览部署，并在 PR 中添加评论

无需额外配置，连接仓库后自动启用。

### 自定义自动部署设置

在 Vercel 控制台的 **Settings** → **Git** 中可以配置：

- **Ignored Git Subpaths**: 忽略某些目录的变更
- **Automatic Assignees**: 自动分配预览部署的审查人
- **Skip Auto Deploy Comments**: 跳过 PR 评论

## 自定义域名配置

### 1. 在 Vercel 中添加域名

1. 进入项目 **Settings** → **Domains**
2. 点击 **Add** 按钮
3. 输入你的域名（例如：`example.com` 或 `www.example.com`）
4. 点击 **Add** 确认

### 2. 配置 DNS 记录

根据你的域名提供商，配置以下 DNS 记录之一：

**方案 A：使用 A 记录（推荐）**

```
类型：A
名称：@
值：76.76.21.21
TTL：自动
```

**方案 B：使用 CNAME 记录**

```
类型：CNAME
名称：www
值：cname.vercel-dns.com
TTL：自动
```

### 3. 等待 DNS 生效

DNS 记录通常在几分钟内生效，最长可能需要 48 小时。

### 4. 配置 HTTPS

Vercel 会自动为自定义域名配置 HTTPS 证书，无需手动操作。证书由 Let's Encrypt 提供，自动续期。

## 环境变量说明

### 本地开发环境变量

创建 `.env.local` 文件（不会被 Git 跟踪）：

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Vercel 环境变量

在 Vercel 控制台或通过 CLI 配置的环境变量会在构建时自动注入。

**注意**：Vite 要求环境变量必须以 `VITE_` 开头才能在客户端代码中访问。

## 测试 HTTPS 访问

### 1. 检查部署状态

```bash
vercel ls
```

### 2. 访问部署的 URL

- **Production**: `https://your-project.vercel.app`
- **Preview**: `https://your-project-git-branch-username.vercel.app`

### 3. 验证 HTTPS

在浏览器中访问上述 URL，确认：

- URL 以 `https://` 开头
- 浏览器地址栏显示安全锁图标
- 没有证书错误警告

### 4. 测试 API 请求

确保所有 API 请求都使用 HTTPS，检查浏览器控制台是否有混合内容（Mixed Content）警告。

## 常用 Vercel CLI 命令

```bash
# 查看帮助
vercel --help

# 登录
vercel login

# 部署（预览环境）
vercel

# 部署到生产环境
vercel --prod

# 列出所有部署
vercel ls

# 查看部署详情
vercel inspect

# 添加环境变量
vercel env add <NAME> <ENVIRONMENT>

# 列出环境变量
vercel env ls

# 拉取环境变量到本地
vercel env pull

# 删除部署
vercel rm <deployment-url>

# 查看日志
vercel logs <deployment-url>
```

## 故障排查

### 构建失败

1. 检查 `package.json` 中的 `build` 脚本是否正确
2. 查看构建日志：`vercel logs <deployment-url>`
3. 本地运行 `npm run build` 确认能否成功构建

### 环境变量未生效

1. 确认环境变量名以 `VITE_` 开头
2. 在 Vercel 控制台检查环境变量是否已添加
3. 重新部署项目以应用新的环境变量

### 路由 404 错误

确保 `vercel.json` 中配置了 `rewrites` 规则，将未知路由重定向到 `index.html`。

### 静态资源加载失败

检查 `vite.config.ts` 中的 `base` 配置，如果使用自定义域名，建议设置：

```typescript
export default defineConfig({
  base: '/',
  // ...其他配置
})
```

## 性能优化建议

1. **启用 Gzip/Brotli 压缩**: Vercel 默认启用
2. **配置缓存头**: 已在 `vercel.json` 中配置静态资源缓存
3. **使用 Edge Functions**: 对于需要动态内容的场景
4. **优化图片**: 使用 Vercel Image Optimization
5. **代码分割**: Vite 默认启用代码分割

## 参考资料

- [Vercel 官方文档](https://vercel.com/docs)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [Vercel CLI 文档](https://vercel.com/docs/cli)
