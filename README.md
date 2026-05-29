# ConvertSafely - 安全文件格式转换平台

一个纯前端文件格式转换网站，所有文件处理都在浏览器本地完成，保护用户隐私。支持图片、PDF、视频、音频等多种格式转换，并集成广告和订阅系统。

## 功能特性

### 支持的转换类型

- **图片转换**: JPEG, PNG, WebP, GIF, BMP, TIFF 格式互转
- **PDF工具**: PDF合并、拆分、图片转PDF
- **视频转换**: MP4, WebM, OGG, MOV, AVI, MKV 格式互转
- **音频转换**: MP3, WAV, OGG, AAC, FLAC, M4A 格式互转

### 订阅计划

| 功能 | Free | Pro ($4.99/月) | Enterprise ($9.99/月) |
|------|------|----------------|----------------------|
| 每日转换次数 | 3次 | 20次 | 无限制 |
| 最大文件大小 | 2MB | 10MB | 500MB |
| 批量转换 | 1个文件 | 10个文件 | 100个文件 |
| 广告 | 有 | 无 | 无 |
| 客服支持 | 基础 | 优先 | 专属 |
| API访问 | 否 | 否 | 是 |

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **文件转换**:
  - 图片: browser-image-compression
  - PDF: pdf-lib
  - 视频/音频: FFmpeg.wasm
- **认证**: Firebase Auth
- **数据库**: Firestore
- **支付**: Stripe
- **广告**: Google AdSense

## 项目结构

```
convertsafely/
├── src/
│   ├── components/          # UI组件
│   │   ├── ads/            # 广告组件
│   │   ├── converter/      # 转换器组件
│   │   ├── layout/         # 布局组件
│   │   ├── subscription/   # 订阅组件
│   │   └── ui/             # 基础UI组件
│   ├── converters/         # 转换逻辑
│   │   ├── image/          # 图片转换
│   │   ├── pdf/            # PDF工具
│   │   └── video/          # 视频/音频转换
│   ├── hooks/              # React Hooks
│   ├── pages/              # 页面组件
│   ├── services/           # 服务层
│   ├── store/              # 状态管理
│   ├── types/              # TypeScript类型
│   └── utils/              # 工具函数
├── firebase/               # Firebase Functions
├── public/                 # 静态资源
└── dist/                   # 构建输出
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 环境变量配置

创建 `.env` 文件并配置以下变量:

```bash
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRO_PRICE_ID=price_...
VITE_STRIPE_ENTERPRISE_PRICE_ID=price_...

# Google AdSense
VITE_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxx
```

## 部署

### Firebase Hosting

```bash
# 安装 Firebase CLI
npm install -g firebase-tools

# 登录
firebase login

# 初始化
firebase init

# 部署
firebase deploy
```

## 隐私与安全

- 所有文件转换在浏览器本地完成，不会上传到服务器
- 使用 WebAssembly 技术 (FFmpeg.wasm) 实现高性能本地处理
- 支持 PWA，可离线使用

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

MIT License
