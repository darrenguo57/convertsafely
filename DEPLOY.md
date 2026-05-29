# ConvertSafely 部署指南

本文档详细介绍了如何将 ConvertSafely 应用部署到 Firebase。

## 目录

- [前置要求](#前置要求)
- [环境配置](#环境配置)
- [部署步骤](#部署步骤)
- [Firebase 配置](#firebase-配置)
- [故障排除](#故障排除)

## 前置要求

### 必需工具

1. **Node.js** (v18 或更高版本)
   ```bash
   node --version
   ```

2. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase --version
   ```

3. **Git** (用于版本控制)

### Firebase 项目设置

1. 创建 Firebase 项目:
   - 访问 [Firebase Console](https://console.firebase.google.com/)
   - 点击 "Add project"
   - 输入项目 ID: `convertsafely-app`
   - 启用 Google Analytics (可选)

2. 启用所需服务:
   - **Authentication**: 启用 Email/Password 和 Google 登录
   - **Firestore Database**: 创建数据库 (选择生产模式)
   - **Storage**: 启用存储
   - **Hosting**: 启用托管

3. 注册应用:
   - 在 Project Overview 中点击 "</>" 添加 Web 应用
   - 复制配置信息到 `.env.production`

## 环境配置

### 1. 环境变量

复制环境变量模板并填写实际值:

```bash
cp .env.production .env.production.local
```

编辑 `.env.production.local` 文件:

```bash
# Firebase 配置 (从 Firebase Console 获取)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=convertsafely-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=convertsafely-app
VITE_FIREBASE_STORAGE_BUCKET=convertsafely-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Stripe 配置
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_PRO_PRICE_ID=price_your_pro_price
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price

# Google AdSense
VITE_ADSENSE_CLIENT=ca-pub-your_client_id
```

### 2. Firebase 项目配置

确保 `.firebaserc` 文件配置正确:

```json
{
  "projects": {
    "default": "convertsafely-app"
  }
}
```

### 3. 登录 Firebase

```bash
firebase login
```

## 部署步骤

### 快速部署 (推荐)

使用提供的部署脚本:

```bash
# 部署所有服务到生产环境
./deploy.sh

# 或指定环境和组件
./deploy.sh all production
./deploy.sh hosting
./deploy.sh functions
```

### 手动部署

#### 1. 安装依赖

```bash
# 主项目依赖
npm install

# Functions 依赖
cd firebase/functions
npm install
cd ../..
```

#### 2. 构建项目

```bash
# 构建前端
npm run build

# 构建 Functions
cd firebase/functions
npm run build
cd ../..
```

#### 3. 部署到 Firebase

```bash
# 部署所有服务
firebase deploy

# 或单独部署
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore
firebase deploy --only storage
```

## Firebase 配置

### Hosting 配置 (firebase.json)

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/@(js|css|woff2|wasm|bin)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "/@ffmpeg/**",
        "headers": [
          {
            "key": "Cross-Origin-Opener-Policy",
            "value": "same-origin"
          },
          {
            "key": "Cross-Origin-Embedder-Policy",
            "value": "require-corp"
          }
        ]
      }
    ]
  }
}
```

### Firestore 规则

Firestore 安全规则位于 `firestore.rules`:

- 用户只能访问自己的数据
- 订阅信息受保护
- 管理员有额外权限

部署规则:
```bash
firebase deploy --only firestore:rules
```

### Storage 规则

Storage 安全规则位于 `storage.rules`:

- 用户只能访问自己的文件
- 临时文件 24 小时自动过期
- 最大文件大小限制

### Cloud Functions

Functions 位于 `firebase/functions/`:

- `createCheckoutSession` - 创建 Stripe 结账会话
- `handleStripeWebhook` - 处理 Stripe Webhook
- `resetDailyUsage` - 定时重置每日使用量

## Stripe 配置

### 1. 创建 Webhook Endpoint

在 Stripe Dashboard 中:

1. 进入 Developers > Webhooks
2. 添加 Endpoint: `https://your-region-your-project.cloudfunctions.net/handleStripeWebhook`
3. 选择事件:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. 复制 Signing secret 到环境变量

### 2. 创建产品价格

在 Stripe Dashboard:

1. 进入 Products
2. 创建两个产品:
   - **Pro Plan** - 月付订阅
   - **Enterprise Plan** - 月付订阅
3. 复制 Price IDs 到环境变量

## 故障排除

### 构建失败

**问题**: `npm run build` 失败

**解决**:
```bash
# 清除缓存
rm -rf node_modules package-lock.json
npm install

# 检查 TypeScript 错误
npx tsc --noEmit
```

### Firebase 部署失败

**问题**: `firebase deploy` 权限错误

**解决**:
```bash
# 重新登录
firebase logout
firebase login

# 检查项目权限
firebase projects:list
```

### Functions 部署失败

**问题**: Cloud Functions 构建失败

**解决**:
```bash
# 本地测试 Functions
cd firebase/functions
npm run build
npm run serve

# 检查依赖
npm ls
```

### FFmpeg.wasm 加载失败

**问题**: 视频转换功能无法工作

**解决**:
- 确保 `firebase.json` 中 COOP/COEP 头配置正确
- 检查 `.wasm` 文件是否正确包含在构建输出中
- 验证浏览器支持 SharedArrayBuffer

### Stripe Webhook 错误

**问题**: Webhook 验证失败

**解决**:
1. 检查 `STRIPE_WEBHOOK_SECRET` 是否正确
2. 确保 Webhook URL 可公开访问
3. 查看 Functions 日志: `firebase functions:log`

## 监控和维护

### 查看日志

```bash
# Functions 日志
firebase functions:log

# 实时日志
firebase functions:log --tail
```

### 本地开发

```bash
# 启动本地模拟器
firebase emulators:start

# 只启动特定服务
firebase emulators:start --only functions,firestore
```

### 备份数据

```bash
# 导出 Firestore 数据
firebase firestore:export ./backups/$(date +%Y%m%d)
```

## 安全最佳实践

1. **环境变量**: 永远不要提交 `.env.production.local` 到 Git
2. **Firestore 规则**: 定期审查安全规则
3. **Stripe**: 使用 Webhook 签名验证
4. **CORS**: 正确配置跨域头
5. **HTTPS**: 强制使用 HTTPS (Firebase Hosting 默认启用)

## 支持

遇到问题? 请查看:
- [Firebase 文档](https://firebase.google.com/docs)
- [Stripe 文档](https://stripe.com/docs)
- [项目 Issues](https://github.com/your-repo/issues)
