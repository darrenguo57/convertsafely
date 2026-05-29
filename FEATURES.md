# ConvertSafely - 功能清单

## 核心功能模块

### 1. 图片转换器 (Image Converter)

**支持的格式:**
- 输入: JPEG, PNG, WebP, GIF, BMP, TIFF, SVG
- 输出: JPEG, PNG, WebP, GIF, BMP, TIFF

**功能特性:**
- 格式互转
- 质量调整 (0.1 - 1.0)
- 尺寸调整 (最大宽度/高度)
- 批量转换
- 压缩优化
- 元数据保留选项

**文件位置:**
- `src/converters/image/imageConverter.ts` - 主转换逻辑
- `src/converters/image/imageUtils.ts` - 工具函数
- `src/converters/image/imageCompressor.ts` - 压缩功能
- `src/pages/converter/ImageConverter.tsx` - 页面组件

---

### 2. PDF工具 (PDF Tools)

**2.1 PDF合并 (PDF Merger)**
- 合并多个PDF文件
- 保持原有页面顺序
- 显示总页数统计

**2.2 PDF拆分 (PDF Splitter)**
- 按页码范围拆分
- 每N页拆分一个文件
- 提取指定页面

**2.3 图片转PDF (Images to PDF)**
- 多张图片合并为PDF
- 页面尺寸适配选项
- 图片位置调整

**支持的格式:**
- 输入: PDF, JPEG, PNG, WebP, TXT
- 输出: PDF, JPEG, PNG, TXT

**文件位置:**
- `src/converters/pdf/pdfMerger.ts` - 合并功能
- `src/converters/pdf/pdfSplitter.ts` - 拆分功能
- `src/converters/pdf/pdfGenerator.ts` - 图片转PDF
- `src/converters/pdf/pdfUtils.ts` - 工具函数
- `src/pages/converter/PDFConverter.tsx` - 页面组件

---

### 3. 视频转换器 (Video Converter)

**支持的格式:**
- 输入: MP4, WebM, OGG, MOV, AVI, MKV
- 输出: MP4, WebM, OGG, MOV, AVI, MKV, GIF

**功能特性:**
- 格式互转
- 质量预设 (低/中/高)
- 分辨率调整
- 视频压缩
- 提取视频帧
- 视频转GIF
- 获取视频缩略图

**技术实现:**
- 使用 FFmpeg.wasm (WebAssembly)
- 本地处理，无需上传

**文件位置:**
- `src/converters/video/videoConverter.ts` - 主转换逻辑
- `src/converters/video/ffmpegWrapper.ts` - FFmpeg包装器
- `src/pages/converter/VideoConverter.tsx` - 页面组件

---

### 4. 音频转换器 (Audio Converter)

**支持的格式:**
- 输入: MP3, WAV, OGG, AAC, FLAC, M4A, WebM
- 输出: MP3, WAV, OGG, AAC, FLAC, M4A, WebM

**功能特性:**
- 格式互转
- 比特率调整 (64-320 kbps)
- 音量标准化
- 淡入淡出效果
- 去除静音
- 音频压缩
- 音频合并
- 音频修剪
- 从视频提取音频

**技术实现:**
- 使用 FFmpeg.wasm (WebAssembly)
- 本地处理，无需上传

**文件位置:**
- `src/converters/video/audioConverter.ts` - 主转换逻辑
- `src/converters/video/ffmpegWrapper.ts` - FFmpeg包装器
- `src/pages/converter/AudioConverter.tsx` - 页面组件

---

## 订阅系统

### 订阅计划配置

**Free 计划:**
- 价格: $0/月
- 每日转换: 3次
- 最大文件: 2MB
- 批量大小: 1个文件
- 广告: 有

**Pro 计划:**
- 价格: $4.99/月
- 每日转换: 20次
- 最大文件: 10MB
- 批量大小: 10个文件
- 广告: 无

**Enterprise 计划:**
- 价格: $9.99/月
- 每日转换: 无限制
- 最大文件: 500MB
- 批量大小: 100个文件
- 广告: 无
- API访问: 有

**文件位置:**
- `src/utils/constants.ts` - 限制常量定义
- `src/types/index.ts` - 订阅类型定义
- `src/hooks/useSubscription.ts` - 订阅状态管理
- `src/store/subscriptionStore.ts` - 订阅存储
- `src/pages/pricing/Pricing.tsx` - 定价页面
- `src/components/subscription/PricingCard.tsx` - 定价卡片

---

## 广告系统

### Google AdSense 集成

**组件:**
- `AdSense` - 基础广告组件
- `AdBanner` - 横幅广告
- `AdSidebar` - 侧边栏广告
- `AdInFeed` - 信息流广告

**特性:**
- 测试模式支持
- 响应式广告
- 错误处理
- 占位符显示

**文件位置:**
- `src/components/ads/AdSense.tsx`
- `src/components/ads/AdBanner.tsx`
- `src/components/ads/AdSidebar.tsx`
- `src/components/ads/AdInFeed.tsx`
- `src/components/ads/index.ts`

---

## 用户认证

### Firebase Auth 集成

**认证方式:**
- 邮箱/密码登录
- Google登录
- 用户注册
- 密码重置

**文件位置:**
- `src/services/firebase.ts` - Firebase配置和服务
- `src/hooks/useAuth.ts` - 认证Hook
- `src/pages/auth/Login.tsx` - 登录页面
- `src/pages/auth/Signup.tsx` - 注册页面

---

## 支付系统

### Stripe 集成

**功能:**
- 创建结账会话
- 处理支付成功
- 订阅管理
- 账单门户

**文件位置:**
- `src/services/stripe.ts` - Stripe服务
- `src/components/subscription/UpgradeModal.tsx` - 升级弹窗

---

## 页面结构

| 页面 | 路径 | 描述 |
|------|------|------|
| 首页 | `/` | 功能导航和介绍 |
| 图片转换 | `/converter/image` | 图片格式转换 |
| PDF工具 | `/converter/pdf` | PDF合并/拆分/转换 |
| 视频转换 | `/converter/video` | 视频格式转换 |
| 音频转换 | `/converter/audio` | 音频格式转换 |
| 定价 | `/pricing` | 订阅计划对比 |
| 登录 | `/login` | 用户登录 |
| 注册 | `/signup` | 用户注册 |
| 仪表盘 | `/dashboard` | 用户管理面板 |
| 关于 | `/about` | 关于页面 |
| 隐私政策 | `/privacy` | 隐私政策 |
| 服务条款 | `/terms` | 服务条款 |

---

## 技术特性

### 性能优化
- 代码分割 (Code Splitting)
- 懒加载 (Lazy Loading)
- Web Worker 支持
- 缓存控制

### PWA 支持
- Service Worker
- 离线页面
- Manifest 配置

### 安全性
- COOP/COEP 头部配置
- XSS 防护
- CSRF 防护
- 内容安全策略

---

## 文件结构总览

```
src/
├── components/
│   ├── ads/              # 广告组件 (4个文件)
│   ├── converter/        # 转换器组件 (6个文件)
│   ├── layout/           # 布局组件 (4个文件)
│   ├── subscription/     # 订阅组件 (4个文件)
│   └── ui/               # 基础UI组件 (6个文件)
├── converters/
│   ├── image/            # 图片转换 (3个文件)
│   ├── pdf/              # PDF工具 (4个文件)
│   └── video/            # 视频/音频转换 (3个文件)
├── hooks/                # React Hooks (5个文件)
├── pages/                # 页面组件 (12个文件)
├── services/             # 服务层 (4个文件)
├── store/                # 状态管理 (2个文件)
├── types/                # TypeScript类型 (1个文件)
└── utils/                # 工具函数 (5个文件)
```

**总计:**
- 源代码文件: 60+
- 组件: 30+
- 页面: 12
- Hooks: 5
- 服务: 4

---

## 部署配置

### Firebase 配置

**文件:**
- `firebase.json` - Firebase配置
- `firestore.rules` - Firestore安全规则
- `firestore.indexes.json` - Firestore索引
- `storage.rules` - Storage安全规则
- `.firebaserc` - Firebase项目配置

### 环境变量

**必需:**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

**可选:**
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_STRIPE_PRO_PRICE_ID`
- `VITE_STRIPE_ENTERPRISE_PRICE_ID`
- `VITE_ADSENSE_CLIENT`
