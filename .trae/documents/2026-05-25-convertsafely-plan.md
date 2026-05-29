# ConvertSafely - 安全文件格式转换网站实现计划

> 创建日期: 2026-05-25  
> 项目目标: 纯前端文件格式转换平台，浏览器本地处理，保护用户隐私

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术选型](#2-技术选型)
3. [项目架构](#3-项目架构)
4. [文件结构](#4-文件结构)
5. [核心功能模块](#5-核心功能模块)
6. [实现步骤](#6-实现步骤)
7. [UI/UX设计规范](#7-uiux设计规范)
8. [广告与订阅系统](#8-广告与订阅系统)
9. [Firebase部署](#9-firebase部署)
10. [安全与隐私](#10-安全与隐私)
11. [测试计划](#11-测试计划)

---

## 1. 项目概述

### 1.1 核心价值主张
- **隐私优先**: 所有文件处理在浏览器本地完成，不上传到服务器
- **免费使用**: 基础功能免费，高级功能订阅解锁
- **无干扰体验**: 简洁界面，快速转换，专业设计

### 1.2 支持的转换格式

| 类别 | 输入格式 | 输出格式 |
|------|----------|----------|
| 图片 | JPG, PNG, WebP, GIF, BMP, TIFF, ICO, SVG | JPG, PNG, WebP, GIF, BMP |
| 文档 | DOCX, PDF, TXT, HTML | DOCX, PDF, TXT, HTML |
| 表格 | XLSX, CSV | XLSX, CSV |
| 演示文稿 | PPTX | PPTX |
| PDF | PDF | PDF (压缩/合并/拆分) |
| 音频 | MP3, WAV, OGG, FLAC, AAC | MP3, WAV, OGG |
| 视频 | MP4, AVI, MOV, WebM, MKV | MP4, WebM |

### 1.3 目标用户
- 北美/欧洲用户
- 注重隐私的个人用户
- 小型企业办公需求
- 内容创作者和设计师

---

## 2. 技术选型

### 2.1 前端框架

| 选型 | 技术 | 理由 |
|------|------|------|
| 核心框架 | **React 18** + TypeScript | 生态成熟，组件化开发，性能优秀 |
| 构建工具 | **Vite** | 快速启动，热更新，开发体验好 |
| UI框架 | **Tailwind CSS** | 原子化CSS，高度定制，符合现代化设计趋势 |
| 状态管理 | **Zustand** | 轻量级，TypeScript友好，API简洁 |

### 2.2 核心转换库

| 功能 | 库 | 说明 |
|------|-----|------|
| 图片压缩/转换 | rowser-image-compression | 轻量级图片压缩 |
| 图片处理 | sharp (WASM) | 高质量图片转换，支持WebP等现代格式 |
| Canvas API | 原生 | 图片格式转换基础 |
| PDF创建 | jspdf | 纯JS生成PDF |
| PDF读取 | pdf-lib | PDF编辑和处理 |
| Word文档 | docx | 创建DOCX文档 |
| Excel表格 | xlsx | 读写XLSX文件 |
| 音频处理 | lucide + Web Audio API | 音频格式转换 |
| 视频处理 | @ffmpeg/ffmpeg | WebAssembly版FFmpeg |

### 2.3 辅助库

| 库 | 用途 |
|----|------|
| eact-dropzone | 拖拽文件上传 |
| ile-saver | 文件下载 |
| eact-hot-toast | 通知提示 |
| ramer-motion | 动画效果 |
| eact-icons | 图标库 |
| clsx | 条件类名合并 |

### 2.4 服务端组件 (订阅系统)

| 服务 | 技术 | 说明 |
|------|------|------|
| 认证 | Firebase Auth | Google/Email登录 |
| 数据库 | Firestore | 存储订阅信息 |
| 订阅管理 | Stripe | 支付和订阅管理 |
| 云函数 | Firebase Functions | 处理订阅逻辑 |

---

## 3. 项目架构

### 3.1 架构概览

`
┌─────────────────────────────────────────────────────────────┐
│                        前端应用                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   页面组件   │  │  业务逻辑层  │  │   工具层    │          │
│  │  (Pages)   │  │  (Hooks)    │  │ (Converters)│          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          ▼                                  │
│              ┌───────────────────────┐                      │
│              │    状态管理 (Zustand) │                      │
│              └───────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Firebase 后端                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Auth   │  │Firestore │  │ Functions│  │  Hosting │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
`

### 3.2 数据流

`
用户上传文件 → 浏览器读取 → WebAssembly处理 → 预览 → 用户下载
                                    │
                                    ▼
                           Firebase Auth (验证订阅状态)
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
              免费用户                        订阅用户
            (显示广告)                      (无广告)
`

---

## 4. 文件结构

`
convertsafely/
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   └── icons/                    # PWA图标
│
├── src/
│   ├── main.tsx                  # 入口文件
│   ├── App.tsx                   # 根组件
│   ├── index.css                 # 全局样式
│   │
│   ├── components/               # 通用组件
│   │   ├── ui/                    # UI基础组件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Progress.tsx
│   │   │   └── Spinner.tsx
│   │   │
│   │   ├── layout/                # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   │
│   │   ├── converter/             # 转换器组件
│   │   │   ├── FileUploader.tsx
│   │   │   ├── FilePreview.tsx
│   │   │   ├── FormatSelector.tsx
│   │   │   ├── QualitySlider.tsx
│   │   │   ├── ConversionProgress.tsx
│   │   │   └── DownloadButton.tsx
│   │   │
│   │   ├── ads/                   # 广告组件
│   │   │   ├── AdSense.tsx
│   │   │   ├── BannerAd.tsx
│   │   │   └── SidebarAd.tsx
│   │   │
│   │   ├── subscription/          # 订阅组件
│   │   │   ├── PricingCard.tsx
│   │   │   ├── UpgradeModal.tsx
│   │   │   └── SubscriptionBadge.tsx
│   │   │
│   │   └── common/                # 通用组件
│   │       ├── SEO.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── pages/                     # 页面组件
│   │   ├── Home.tsx               # 首页
│   │   ├── converter/             # 转换器页面
│   │   │   ├── ImageConverter.tsx
│   │   │   ├── DocumentConverter.tsx
│   │   │   ├── PDFConverter.tsx
│   │   │   ├── VideoConverter.tsx
│   │   │   └── AudioConverter.tsx
│   │   │
│   │   ├── pricing/               # 定价页面
│   │   │   └── Pricing.tsx
│   │   │
│   │   ├── auth/                  # 认证页面
│   │   │   ├── Login.tsx
│   │   │   └── Signup.tsx
│   │   │
│   │   ├── dashboard/             # 用户仪表盘
│   │   │   └── Dashboard.tsx
│   │   │
│   │   └── about/                 # 关于页面
│   │       └── About.tsx
│   │
│   ├── hooks/                     # 自定义Hooks
│   │   ├── useConversion.ts       # 转换逻辑
│   │   ├── useFileUpload.ts       # 文件上传
│   │   ├── useSubscription.ts     # 订阅状态
│   │   ├── useAuth.ts             # 认证状态
│   │   └── useLocalStorage.ts     # 本地存储
│   │
│   ├── converters/                # 转换器实现
│   │   ├── image/
│   │   │   ├── imageConverter.ts
│   │   │   ├── imageCompressor.ts
│   │   │   └── imageUtils.ts
│   │   │
│   │   ├── document/
│   │   │   ├── docxConverter.ts
│   │   │   ├── textConverter.ts
│   │   │   └── htmlConverter.ts
│   │   │
│   │   ├── pdf/
│   │   │   ├── pdfGenerator.ts
│   │   │   ├── pdfSplitter.ts
│   │   │   └── pdfMerger.ts
│   │   │
│   │   ├── spreadsheet/
│   │   │   ├── xlsxConverter.ts
│   │   │   └── csvConverter.ts
│   │   │
│   │   ├── video/
│   │   │   ├── videoConverter.ts
│   │   │   └── ffmpegWrapper.ts
│   │   │
│   │   └── audio/
│   │       ├── audioConverter.ts
│   │       └── audioUtils.ts
│   │
│   ├── store/                     # 状态管理
│   │   ├── conversionStore.ts     # 转换状态
│   │   ├── subscriptionStore.ts   # 订阅状态
│   │   └── uiStore.ts             # UI状态
│   │
│   ├── services/                  # 服务层
│   │   ├── firebase.ts            # Firebase配置
│   │   ├── stripe.ts              # Stripe集成
│   │   └── analytics.ts           # 分析服务
│   │
│   ├── utils/                     # 工具函数
│   │   ├── fileUtils.ts
│   │   ├── formatUtils.ts
│   │   ├── validationUtils.ts
│   │   └── constants.ts
│   │
│   ├── types/                     # TypeScript类型
│   │   ├── conversion.ts
│   │   ├── subscription.ts
│   │   ├── file.ts
│   │   └── index.ts
│   │
│   └── config/                    # 配置文件
│       ├── routes.tsx             # 路由配置
│       ├── supportedFormats.ts    # 支持的格式
│       └── conversionOptions.ts   # 转换选项
│
├── firebase/                      # Firebase配置
│   ├── firestore.rules
│   ├── firestore.indexes.json
│   ├── storage.rules
│   └── functions/
│       ├── package.json
│       └── src/
│           ├── index.ts
│           └── stripeWebhook.ts
│
├── tests/                         # 测试文件
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example                   # 环境变量示例
├── .firebaserc                   # Firebase配置
├── firebase.json                  # Firebase项目配置
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
`

---

## 5. 核心功能模块

### 5.1 文件上传模块

`	ypescript
interface FileUploaderProps {
  accept: string;           // 接受的 MIME 类型
  maxSize: number;          // 最大文件大小 (bytes)
  multiple: boolean;        // 是否允许多文件
  onUpload: (files: File[]) => void;
}
`

**功能特性:**
- 拖拽上传
- 点击选择
- 文件大小验证
- 格式验证
- 进度显示
- 预览缩略图

### 5.2 图片转换模块

**支持的转换:**
- JPG ↔ PNG ↔ WebP ↔ GIF ↔ BMP
- 图片压缩 (质量控制)
- 尺寸调整
- 旋转/翻转
- EXIF信息保留

**技术实现:**
`	ypescript
// 使用 Canvas API + browser-image-compression
import imageCompression from 'browser-image-compression';

async function convertImage(file: File, targetFormat: string, quality: number) {
  const options = {
    maxSizeMB: 10,
    maxWidthOrHeight: 4096,
    useWebWorker: true,
    fileType: image/
  };
  
  return await imageCompression(file, options);
}
`

### 5.3 文档转换模块

**支持的转换:**
- TXT ↔ DOCX
- HTML → PDF
- TXT → PDF
- Word模板填充

**技术实现:**
`	ypescript
// 使用 docx 和 jspdf
import { Document, Packer, Paragraph } from 'docx';
import { jsPDF } from 'jspdf';
`

### 5.4 PDF处理模块

**功能:**
- PDF合并
- PDF拆分
- PDF压缩
- PDF转图片
- 图片转PDF

**技术实现:**
`	ypescript
// 使用 pdf-lib
import { PDFDocument } from 'pdf-lib';

async function mergePdfs(files: File[]) {
  const mergedPdf = await PDFDocument.create();
  
  for (const file of files) {
    const pdfBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }
  
  return await mergedPdf.save();
}
`

### 5.5 音视频转换模块

**技术实现:**
`	ypescript
// 使用 FFmpeg.wasm
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

async function convertVideo(input: File, outputFormat: string) {
  const ffmpeg = new FFmpeg();
  await ffmpeg.load();
  
  await ffmpeg.writeFile('input.mp4', await fetchFile(input));
  await ffmpeg.exec(['-i', 'input.mp4', output.]);
  
  const data = await ffmpeg.readFile(output.);
  return new Blob([data], { type: ideo/ });
}
`

### 5.6 订阅系统模块

**订阅层级:**
| 特性 | 免费版 | Pro (.99/月) | Enterprise (.99/月) |
|------|--------|---------------|----------------------|
| 广告 | 有 | 无 | 无 |
| 文件大小限制 | 10MB | 100MB | 500MB |
| 每日转换次数 | 10次 | 100次 | 无限 |
| 图片转换 | ✓ | ✓ | ✓ |
| 文档转换 | - | ✓ | ✓ |
| PDF处理 | - | ✓ | ✓ |
| 音视频转换 | - | - | ✓ |
| 批量转换 | - | ✓ (10个) | ✓ (100个) |
| 优先处理 | - | - | ✓ |

---

## 6. 实现步骤

### 阶段一：基础框架搭建 (第1周)

#### 1.1 项目初始化
- [ ] 初始化 Vite + React + TypeScript 项目
- [ ] 配置 Tailwind CSS
- [ ] 配置 ESLint + Prettier
- [ ] 设置文件夹结构
- [ ] 配置路径别名 (@/)

#### 1.2 UI组件库建设
- [ ] 创建基础UI组件 (Button, Card, Input等)
- [ ] 实现响应式布局组件
- [ ] 创建导航组件 (Header, Footer)
- [ ] 实现主题系统 (支持亮/暗模式)

#### 1.3 路由系统
- [ ] 配置 React Router
- [ ] 创建页面路由
- [ ] 实现路由守卫
- [ ] 添加加载状态

### 阶段二：核心转换功能 (第2-3周)

#### 2.1 图片转换器
- [ ] 实现文件上传组件
- [ ] 实现图片预览组件
- [ ] 实现格式选择器
- [ ] 实现质量滑块
- [ ] 实现图片压缩逻辑
- [ ] 实现格式转换逻辑
- [ ] 实现下载功能

#### 2.2 PDF转换器
- [ ] 实现PDF合并功能
- [ ] 实现PDF拆分功能
- [ ] 实现PDF压缩功能
- [ ] 实现图片转PDF
- [ ] 实现PDF转图片

#### 2.3 文档转换器
- [ ] 实现文本文件处理
- [ ] 实现DOCX创建/转换
- [ ] 实现HTML处理
- [ ] 实现PDF生成

#### 2.4 音视频转换器
- [ ] 集成FFmpeg.wasm
- [ ] 实现视频格式转换
- [ ] 实现音频格式转换
- [ ] 实现进度显示

### 阶段三：订阅与广告系统 (第4周)

#### 3.1 Firebase集成
- [ ] 配置Firebase项目
- [ ] 实现Firebase Auth
- [ ] 配置Firestore数据库
- [ ] 创建订阅状态存储

#### 3.2 广告系统
- [ ] 注册Google AdSense
- [ ] 实现广告组件
- [ ] 配置广告位
- [ ] 实现广告显示逻辑

#### 3.3 订阅系统
- [ ] 创建订阅页面
- [ ] 集成Stripe Checkout
- [ ] 实现订阅状态检查
- [ ] 实现订阅管理界面

### 阶段四：优化与部署 (第5周)

#### 4.1 性能优化
- [ ] 优化WebAssembly加载
- [ ] 实现文件处理进度优化
- [ ] 添加内存管理
- [ ] 实现错误处理

#### 4.2 PWA支持
- [ ] 配置PWA manifest
- [ ] 实现Service Worker
- [ ] 添加离线支持
- [ ] 配置缓存策略

#### 4.3 SEO与可访问性
- [ ] 优化Meta标签
- [ ] 添加结构化数据
- [ ] 确保可访问性
- [ ] 添加多语言支持

#### 4.4 Firebase部署
- [ ] 配置Firebase Hosting
- [ ] 设置部署流程
- [ ] 配置自定义域名
- [ ] 设置CDN

### 阶段五：测试与发布 (第6周)

#### 5.1 测试
- [ ] 单元测试 (Vitest)
- [ ] 集成测试
- [ ] E2E测试 (Playwright)
- [ ] 跨浏览器测试

#### 5.2 文档与发布
- [ ] 编写README
- [ ] 创建使用指南
- [ ] 准备发布材料
- [ ] 正式发布

---

## 7. UI/UX设计规范

### 7.1 设计原则

1. **简洁至上**: 最小化干扰，聚焦核心功能
2. **直观操作**: 所见即所得，无需学习成本
3. **快速响应**: 即时反馈，流畅动画
4. **隐私可见**: 明确告知用户文件本地处理
5. **专业可信**: 现代化设计，建立信任感

### 7.2 颜色系统

`css
/* 亮色主题 */
:root {
  /* 主色调 */
  --color-primary: #3B82F6;        /* 蓝色 - 主按钮、链接 */
  --color-primary-dark: #2563EB;   /* 深蓝 - 悬停状态 */
  --color-primary-light: #60A5FA;  /* 浅蓝 - 背景 */
  
  /* 成功/错误/警告 */
  --color-success: #10B981;        /* 绿色 */
  --color-warning: #F59E0B;        /* 橙色 */
  --color-error: #EF4444;          /* 红色 */
  
  /* 中性色 */
  --color-background: #FFFFFF;     /* 背景 */
  --color-surface: #F9FAFB;        /* 卡片背景 */
  --color-border: #E5E7EB;         /* 边框 */
  --color-text: #111827;           /* 主文本 */
  --color-text-secondary: #6B7280; /* 次要文本 */
  
  /* 暗色主题 */
  --color-dark-background: #0F172A;
  --color-dark-surface: #1E293B;
  --color-dark-text: #F9FAFB;
}
`

### 7.3 字体系统

`css
/* 字体族 */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* 字号 */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */

/* 字重 */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
`

### 7.4 间距系统

`css
/* 使用 4px 基准网格 */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
`

### 7.5 组件设计

#### 按钮
- 圆角: 8px
- 高度: 40px (默认), 32px (小), 48px (大)
- 阴影: 轻微阴影在悬停时
- 动画: 150ms ease过渡

#### 卡片
- 圆角: 12px
- 阴影:   1px 3px rgba(0,0,0,0.1)
- 内边距: 24px
- 背景: 白色/表面色

#### 输入框
- 圆角: 8px
- 边框: 1px solid #E5E7EB
- 高度: 40px
- 焦点状态: 2px蓝色边框

### 7.6 响应式断点

`css
/* 移动优先 */
--screen-sm: 640px;   /* 平板竖屏 */
--screen-md: 768px;   /* 平板横屏 */
--screen-lg: 1024px;  /* 小屏笔记本 */
--screen-xl: 1280px;  /* 大屏显示器 */
--screen-2xl: 1536px; /* 超大屏 */
`

---

## 8. 广告与订阅系统

### 8.1 Google AdSense集成

#### 广告位设置
`	sx
// src/components/ads/AdSense.tsx
export function AdSense({ slot }: { slot: string }) {
  useEffect(() => {
    // 动态加载AdSense脚本
    const script = document.createElement('script');
    script.src = https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, []);
  
  return (
    <ins
      className=\"adsbygoogle\"
      style={{ display: 'block' }}
      data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format=\"auto\"
      data-full-width-responsive=\"true\"
    />
  );
}
`

#### 广告位置
1. **页面顶部** - 横幅广告 (728x90)
2. **转换器下方** - 展示广告
3. **页面底部** - 横幅广告
4. **侧边栏** - 在大屏幕上显示

### 8.2 订阅系统架构

`	ypescript
// Firestore数据结构
interface Subscription {
  userId: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due';
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodEnd: Timestamp;
  features: {
    maxFileSize: number;      // bytes
    dailyConversions: number;
    noAds: boolean;
    batchSize: number;
  };
}
`

### 8.3 Stripe集成

#### Webhook处理
`	ypescript
// firebase/functions/src/stripeWebhook.ts
export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  
  switch (event.type) {
    case 'checkout.session.completed':
      // 创建订阅记录
      break;
    case 'customer.subscription.updated':
      // 更新订阅状态
      break;
    case 'customer.subscription.deleted':
      // 取消订阅
      break;
  }
});
`

---

## 9. Firebase部署

### 9.1 firebase.json 配置

`json
{
  \"hosting\": {
    \"public\": \"dist\",
    \"ignore\": [\"firebase.json\", \"**/.*\", \"**/node_modules/**\"],
    \"rewrites\": [
      {
        \"source\": \"**\",
        \"destination\": \"/index.html\"
      }
    ],
    \"headers\": [
      {
        \"source\": \"/@(js|css|woff2|wasm|bin)\",
        \"headers\": [
          { \"key\": \"Cache-Control\", \"value\": \"public, max-age=31536000\" }
        ]
      },
      {
        \"source\": \"/@ffmpeg/**\",
        \"headers\": [
          { \"key\": \"Cross-Origin-Opener-Policy\", \"value\": \"same-origin\" },
          { \"key\": \"Cross-Origin-Embedder-Policy\", \"value\": \"require-corp\" }
        ]
      }
    ]
  }
}
`

### 9.2 部署命令

`ash
# 开发环境构建
npm run build

# 部署到Firebase
firebase deploy --only hosting

# 部署全部 (包含函数)
firebase deploy
`

### 9.3 环境变量

`ash
# .env.production
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx

VITE_STRIPE_PUBLISHABLE_KEY=xxx

VITE_ADSENSE_CLIENT=ca-pub-xxx
`

---

## 10. 安全与隐私

### 10.1 隐私保证

- **零服务器上传**: 所有文件处理在浏览器本地完成
- **无数据存储**: 不存储用户任何文件
- **无追踪**: 不追踪用户文件内容
- **开源可验证**: 转换逻辑可被审计

### 10.2 技术安全措施

`	ypescript
// 文件处理后清理内存
function cleanupFile(file: File) {
  // 释放ArrayBuffer
  file.arrayBuffer().then(buffer => {
    // 明确清空缓冲区
  });
  
  // 清理URL对象
  URL.revokeObjectURL(fileUrl);
}

// Web Worker隔离处理敏感操作
const worker = new Worker('converter-worker.js', { type: 'module' });
`

### 10.3 CORS与安全头

`json
{
  \"hosting\": {
    \"headers\": [
      {
        \"source\": \"**/*.@(js|css)\",
        \"headers\": [
          { \"key\": \"X-Content-Type-Options\", \"value\": \"nosniff\" },
          { \"key\": \"X-Frame-Options\", \"value\": \"DENY\" },
          { \"key\": \"X-XSS-Protection\", \"value\": \"1; mode=block\" }
        ]
      }
    ]
  }
}
`

---

## 11. 测试计划

### 11.1 单元测试 (Vitest)

`	ypescript
// tests/unit/converters/imageConverter.test.ts
import { describe, it, expect } from 'vitest';
import { convertImage } from '@/converters/image/imageConverter';

describe('Image Converter', () => {
  it('should convert JPG to PNG', async () => {
    const file = new File([jpgData], 'test.jpg', { type: 'image/jpeg' });
    const result = await convertImage(file, 'png', 0.9);
    expect(result.type).toBe('image/png');
  });
  
  it('should handle invalid format', async () => {
    // 测试错误处理
  });
});
`

### 11.2 E2E测试 (Playwright)

`	ypescript
// tests/e2e/conversion.spec.ts
import { test, expect } from '@playwright/test';

test('complete image conversion flow', async ({ page }) => {
  await page.goto('/converter/image');
  
  // 上传文件
  await page.getByTestId('file-upload').setInputFiles('test-image.jpg');
  
  // 选择格式
  await page.getByTestId('format-selector').selectOption('png');
  
  // 转换
  await page.getByTestId('convert-btn').click();
  
  // 等待完成并下载
  await expect(page.getByTestId('download-btn')).toBeVisible();
});
`

### 11.3 浏览器兼容性测试

| 浏览器 | 最低版本 | 支持度 |
|--------|----------|--------|
| Chrome | 90+ | 完整支持 |
| Firefox | 90+ | 完整支持 |
| Safari | 15+ | 完整支持 |
| Edge | 90+ | 完整支持 |
| Chrome Android | 90+ | 部分支持 |
| Safari iOS | 15+ | 部分支持 |

---

## 附录：关键资源链接

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)
- [pdf-lib](https://pdf-lib.js.org/)
- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression)
- [Stripe](https://stripe.com/)
- [Google AdSense](https://www.google.com/adsense)

---

*文档版本: 1.0.0*  
*最后更新: 2026-05-25*
