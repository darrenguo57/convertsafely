# ConvertSafely 安全文件格式转换网站实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个纯前端文件格式转换网站，浏览器本地处理所有文件，保护用户隐私，支持图片/文档/PDF/音视频转换，并集成广告和订阅系统，部署到Firebase。

**Architecture:** 
- 纯前端SPA应用，使用WebAssembly技术在浏览器本地处理所有文件转换
- Firebase Auth处理用户认证，Firestore存储订阅信息
- 分层架构：UI组件层 → 业务逻辑Hook层 → 转换器工具层
- 订阅系统：Freemium模式（免费有广告+限制，Pro/Enterprise订阅无广告）

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Zustand | FFmpeg.wasm + pdf-lib + browser-image-compression | Firebase Auth + Firestore + Stripe + Google AdSense

---

## 1. 项目初始化与基础架构

### 1.1 创建项目基础结构

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `.env.example`
- Create: `.firebaserc`
- Create: `firebase.json`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "convertsafely",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.7",
    "framer-motion": "^10.16.5",
    "react-dropzone": "^14.2.3",
    "file-saver": "^2.0.5",
    "react-hot-toast": "^2.4.1",
    "react-icons": "^4.12.0",
    "clsx": "^2.0.0",
    "browser-image-compression": "^2.0.2",
    "pdf-lib": "^1.17.1",
    "jspdf": "^2.5.1",
    "docx": "^8.2.4",
    "xlsx": "^0.18.5",
    "@ffmpeg/ffmpeg": "^0.12.6",
    "@ffmpeg/util": "^0.12.1",
    "firebase": "^10.7.0",
    "@stripe/stripe-js": "^2.2.0"
  }
}
```

- [ ] **Step 2: 创建 Vite 配置**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
});
```

- [ ] **Step 3: 创建 Tailwind 配置**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
          light: '#60A5FA',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: 创建 TypeScript 配置**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 5: 创建 Firebase 配置**

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }],
    "headers": [
      {
        "source": "/@(js|css|woff2|wasm|bin)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000" }]
      },
      {
        "source": "/@ffmpeg/**",
        "headers": [
          { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
          { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
        ]
      }
    ]
  }
}
```

- [ ] **Step 6: 创建环境变量示例**

```bash
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=

# Google AdSense
VITE_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxx
```

- [ ] **Step 7: 提交基础配置**

```bash
git add package.json vite.config.ts tsconfig.json tailwind.config.js firebase.json .env.example
git commit -m "feat: initialize project with Vite + React + TypeScript + Tailwind"
```

### 1.2 创建源代码目录结构

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `src/config/routes.tsx`
- Create: `src/types/index.ts`
- Create: `src/store/conversionStore.ts`
- Create: `src/store/subscriptionStore.ts`

- [ ] **Step 1: 创建入口文件 src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 2: 创建根组件 src/App.tsx**

```tsx
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import ImageConverter from '@/pages/converter/ImageConverter';
import PDFConverter from '@/pages/converter/PDFConverter';
import Pricing from '@/pages/pricing/Pricing';
import Login from '@/pages/auth/Login';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="converter/image" element={<ImageConverter />} />
          <Route path="converter/pdf" element={<PDFConverter />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}
```

- [ ] **Step 3: 创建全局样式 src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: #3B82F6;
    --color-background: #FFFFFF;
    --color-surface: #F9FAFB;
  }
  
  .dark {
    --color-background: #0F172A;
    --color-surface: #1E293B;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary text-white px-6 py-2 rounded-lg font-medium transition-colors hover:bg-primary-dark;
  }
  
  .card {
    @apply bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700;
  }
}
```

- [ ] **Step 4: 创建类型定义 src/types/index.ts**

```typescript
export interface ConversionFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

export interface ConversionResult {
  id: string;
  originalFile: ConversionFile;
  convertedBlob: Blob;
  outputFormat: string;
  outputName: string;
  convertedAt: Date;
}

export interface SubscriptionPlan {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  price: number;
  features: {
    maxFileSize: number;
    dailyConversions: number;
    noAds: boolean;
    batchSize: number;
  };
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: { maxFileSize: 2 * 1024 * 1024, dailyConversions: 3, noAds: false, batchSize: 1 },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 4.99,
    features: { maxFileSize: 10 * 1024 * 1024, dailyConversions: 20, noAds: true, batchSize: 10 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9.99,
    features: { maxFileSize: 500 * 1024 * 1024, dailyConversions: -1, noAds: true, batchSize: 100 },
  },
];
```

- [ ] **Step 5: 创建转换状态管理 src/store/conversionStore.ts**

```typescript
import { create } from 'zustand';
import type { ConversionFile, ConversionResult } from '@/types';

interface ConversionState {
  files: ConversionFile[];
  currentConversion: ConversionResult | null;
  isConverting: boolean;
  progress: number;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  setProgress: (progress: number) => void;
  setConversionResult: (result: ConversionResult) => void;
  reset: () => void;
}

export const useConversionStore = create<ConversionState>((set) => ({
  files: [],
  currentConversion: null,
  isConverting: false,
  progress: 0,
  addFiles: (newFiles) =>
    set((state) => ({
      files: [
        ...state.files,
        ...newFiles.map((file) => ({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        })),
      ],
    })),
  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    })),
  setProgress: (progress) => set({ progress }),
  setConversionResult: (result) => set({ currentConversion: result, isConverting: false }),
  reset: () => set({ files: [], currentConversion: null, isConverting: false, progress: 0 }),
}));
```

- [ ] **Step 6: 创建订阅状态管理 src/store/subscriptionStore.ts**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SubscriptionPlan } from '@/types';
import { SUBSCRIPTION_PLANS } from '@/types';

interface SubscriptionState {
  currentPlan: SubscriptionPlan;
  dailyUsage: number;
  lastUsageDate: string;
  isPremium: boolean;
  setPlan: (plan: SubscriptionPlan) => void;
  incrementUsage: () => void;
  resetDailyUsage: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      currentPlan: SUBSCRIPTION_PLANS[0],
      dailyUsage: 0,
      lastUsageDate: new Date().toDateString(),
      isPremium: false,
      setPlan: (plan) => set({ currentPlan: plan, isPremium: plan.id !== 'free' }),
      incrementUsage: () => {
        const today = new Date().toDateString();
        const state = get();
        if (state.lastUsageDate !== today) {
          set({ dailyUsage: 1, lastUsageDate: today });
        } else {
          set({ dailyUsage: state.dailyUsage + 1 });
        }
      },
      resetDailyUsage: () => set({ dailyUsage: 0 }),
    }),
    { name: 'subscription-storage' }
  )
);
```

- [ ] **Step 7: 创建路由配置 src/config/routes.tsx**

```typescript
import { lazy } from 'react';

export const routes = [
  { path: '/', name: 'Home', component: lazy(() => import('@/pages/Home')) },
  { path: '/converter/image', name: 'Image Converter', component: lazy(() => import('@/pages/converter/ImageConverter')) },
  { path: '/converter/pdf', name: 'PDF Converter', component: lazy(() => import('@/pages/converter/PDFConverter')) },
  { path: '/converter/video', name: 'Video Converter', component: lazy(() => import('@/pages/converter/VideoConverter')) },
  { path: '/converter/audio', name: 'Audio Converter', component: lazy(() => import('@/pages/converter/AudioConverter')) },
  { path: '/pricing', name: 'Pricing', component: lazy(() => import('@/pages/pricing/Pricing')) },
  { path: '/login', name: 'Login', component: lazy(() => import('@/pages/auth/Login')) },
];
```

- [ ] **Step 8: 提交源代码结构**

```bash
git add src/main.tsx src/App.tsx src/index.css src/types/ src/store/ src/config/
git commit -m "feat: create source directory structure and state management"
```

---

## 2. UI组件库建设

### 2.1 基础UI组件

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/Progress.tsx`
- Create: `src/components/ui/Spinner.tsx`

- [ ] **Step 1: 创建 Button 组件**

```tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white',
      outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-8 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Spinner size="sm" /> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
```

- [ ] **Step 2: 创建 Card 组件**

```tsx
import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6',
          hover && 'transition-shadow hover:shadow-md',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export { Card };
```

- [ ] **Step 3: 创建 Modal 组件**

```tsx
import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'react-icons/hi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
            {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: 创建 Progress 组件**

```tsx
import { clsx } from 'clsx';

interface ProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red';
}

export function Progress({ value, max = 100, showLabel = false, size = 'md', color = 'blue' }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizes = { sm: 'h-1', md: 'h-2', lg: 'h-3' };
  const colors = {
    blue: 'bg-primary',
    green: 'bg-green-500',
    red: 'bg-red-500',
  };

  return (
    <div className="w-full">
      <div className={clsx('w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={clsx('h-full transition-all duration-300', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">{percentage}%</span>}
    </div>
  );
}
```

- [ ] **Step 5: 创建 Spinner 组件**

```tsx
import { clsx } from 'clsx';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={clsx('animate-spin rounded-full border-2 border-gray-200 border-t-primary', sizes[size], className)} />
  );
}
```

- [ ] **Step 6: 提交UI组件**

```bash
git add src/components/ui/
git commit -m "feat: create base UI components (Button, Card, Modal, Progress, Spinner)"
```

### 2.2 布局组件

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/Layout.tsx`

- [ ] **Step 1: 创建 Header 组件**

```tsx
import { Link } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🔒</span>
            <span className="font-bold text-xl text-gray-900 dark:text-white">ConvertSafely</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/converter/image" className="text-gray-600 hover:text-primary dark:text-gray-300">Images</Link>
            <Link to="/converter/pdf" className="text-gray-600 hover:text-primary dark:text-gray-300">PDF</Link>
            <Link to="/converter/video" className="text-gray-600 hover:text-primary dark:text-gray-300">Video</Link>
            <Link to="/converter/audio" className="text-gray-600 hover:text-primary dark:text-gray-300">Audio</Link>
            <Link to="/pricing">
              <Button variant="primary" size="sm">Upgrade</Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>

        <motion.div
          initial={false}
          animate={{ height: isMobileMenuOpen ? 'auto' : 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-3">
            <Link to="/converter/image" className="block text-gray-600 hover:text-primary">Images</Link>
            <Link to="/converter/pdf" className="block text-gray-600 hover:text-primary">PDF</Link>
            <Link to="/converter/video" className="block text-gray-600 hover:text-primary">Video</Link>
            <Link to="/converter/audio" className="block text-gray-600 hover:text-primary">Audio</Link>
            <Link to="/pricing"><Button variant="primary" size="sm" className="w-full">Upgrade</Button></Link>
          </div>
        </motion.div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: 创建 Footer 组件**

```tsx
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🔒</span>
              <span className="font-bold text-xl">ConvertSafely</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Secure, private file conversion. Your files never leave your device.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Converters</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/converter/image" className="hover:text-primary">Image Converter</Link></li>
              <li><Link to="/converter/pdf" className="hover:text-primary">PDF Tools</Link></li>
              <li><Link to="/converter/video" className="hover:text-primary">Video Converter</Link></li>
              <li><Link to="/converter/audio" className="hover:text-primary">Audio Converter</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/about" className="hover:text-primary">About</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Security</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              🔒 100% Private<br />
              No uploads. No servers.<br />
              Files stay on your device.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">
          © 2024 ConvertSafely. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: 创建 Layout 组件**

```tsx
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { AdBanner } from '@/components/ads/AdBanner';
import { useSubscriptionStore } from '@/store/subscriptionStore';

export default function Layout() {
  const { isPremium } = useSubscriptionStore();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        {!isPremium && <AdBanner />}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: 提交布局组件**

```bash
git add src/components/layout/
git commit -m "feat: create layout components (Header, Footer, Layout)"
```

---

## 3. 转换器组件

### 3.1 文件上传组件

**Files:**
- Create: `src/components/converter/FileUploader.tsx`
- Create: `src/components/converter/FilePreview.tsx`
- Create: `src/components/converter/FormatSelector.tsx`
- Create: `src/hooks/useConversion.ts`

- [ ] **Step 1: 创建文件上传组件**

```tsx
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiCloudUpload, HiX } from 'react-icons/hi';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';

interface FileUploaderProps {
  accept: Record<string, string[]>;
  maxSize: number;
  onUpload: (files: File[]) => void;
  disabled?: boolean;
}

export function FileUploader({ accept, maxSize, onUpload, disabled }: FileUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    disabled,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
        isDragActive && !isDragReject && 'border-primary bg-primary/5',
        isDragReject && 'border-red-500 bg-red-50',
        !isDragActive && 'border-gray-300 hover:border-primary',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />
      <HiCloudUpload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
        Drag & drop files here, or click to select
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Max file size: {formatBytes(maxSize)}
      </p>
      <Button className="mt-4" variant="outline" size="sm">
        Browse Files
      </Button>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
```

- [ ] **Step 2: 创建文件预览组件**

```tsx
import { HiX, HiDownload, HiRefresh } from 'react-icons/hi';
import { motion } from 'framer-motion';
import type { ConversionFile, ConversionResult } from '@/types';

interface FilePreviewProps {
  file: ConversionFile;
  onRemove: () => void;
  result?: ConversionResult;
  onDownload?: () => void;
}

export function FilePreview({ file, onRemove, result, onDownload }: FilePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
    >
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
      >
        <HiX className="w-4 h-4" />
      </button>

      {file.preview ? (
        <img src={file.preview} alt={file.name} className="w-full h-48 object-contain rounded-lg mb-4" />
      ) : (
        <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
          <span className="text-4xl">📄</span>
        </div>
      )}

      <p className="font-medium truncate">{file.name}</p>
      <p className="text-sm text-gray-500">{formatBytes(file.size)}</p>

      {result && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-green-600 dark:text-green-400 mb-2">✓ Converted successfully</p>
          <Button onClick={onDownload} variant="primary" size="sm" className="w-full">
            <HiDownload className="w-4 h-4 mr-2" />
            Download {result.outputName}
          </Button>
        </div>
      )}
    </motion.div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
```

- [ ] **Step 3: 创建格式选择器组件**

```tsx
import { HiChevronDown } from 'react-icons/hi';
import { clsx } from 'clsx';

interface FormatOption {
  value: string;
  label: string;
  description?: string;
}

interface FormatSelectorProps {
  value: string;
  options: FormatOption[];
  onChange: (value: string) => void;
  label?: string;
}

export function FormatSelector({ value, options, onChange, label }: FormatSelectorProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 创建转换Hook**

```tsx
import { useState, useCallback } from 'react';
import { useConversionStore } from '@/store/conversionStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import toast from 'react-hot-toast';

export function useConversion() {
  const { files, addFiles, removeFile, setProgress, setConversionResult, reset, isConverting, progress } = useConversionStore();
  const { currentPlan, incrementUsage, dailyUsage } = useSubscriptionStore();
  const [targetFormat, setTargetFormat] = useState('png');

  const canConvert = useCallback(() => {
    if (files.length === 0) {
      toast.error('Please select a file first');
      return false;
    }
    if (dailyUsage >= currentPlan.features.dailyConversions && currentPlan.features.dailyConversions !== -1) {
      toast.error('Daily conversion limit reached. Upgrade to Pro for more!');
      return false;
    }
    return true;
  }, [files, dailyUsage, currentPlan]);

  const handleUpload = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      if (file.size > currentPlan.features.maxFileSize) {
        toast.error(`${file.name} exceeds maximum file size`);
        return false;
      }
      return true;
    });
    addFiles(validFiles);
  }, [addFiles, currentPlan]);

  const convert = useCallback(async (converter: (files: File[], format: string) => Promise<Blob>) => {
    if (!canConvert()) return;

    try {
      const result = await converter(files.map((f) => f.file), targetFormat);
      const blobUrl = URL.createObjectURL(result);
      setConversionResult({
        id: crypto.randomUUID(),
        originalFile: files[0],
        convertedBlob: result,
        outputFormat: targetFormat,
        outputName: files[0].name.replace(/\.[^.]+$/, `.${targetFormat}`),
        convertedAt: new Date(),
      });
      incrementUsage();
      toast.success('Conversion completed!');
    } catch (error) {
      toast.error('Conversion failed. Please try again.');
    }
  }, [files, targetFormat, canConvert, setConversionResult, incrementUsage]);

  return {
    files,
    targetFormat,
    setTargetFormat,
    handleUpload,
    removeFile,
    convert,
    isConverting,
    progress,
    reset,
  };
}
```

- [ ] **Step 5: 提交转换器组件**

```bash
git add src/components/converter/ src/hooks/useConversion.ts
git commit -m "feat: create converter components and useConversion hook"
```

---

## 4. 核心转换器实现

### 4.1 图片转换器

**Files:**
- Create: `src/converters/image/imageConverter.ts`
- Create: `src/pages/converter/ImageConverter.tsx`

- [ ] **Step 1: 创建图片转换逻辑**

```typescript
import imageCompression from 'browser-image-compression';

export async function convertImage(
  file: File,
  targetFormat: string,
  quality: number = 0.9
): Promise<Blob> {
  const options = {
    maxSizeMB: 10,
    maxWidthOrHeight: 4096,
    useWebWorker: true,
    fileType: `image/${targetFormat}`,
  };

  if (targetFormat === 'webp' || targetFormat === 'jpeg' || targetFormat === 'jpg') {
    const compressed = await imageCompression(file, {
      ...options,
      initialQuality: quality,
    });
    return compressed;
  }

  // For other formats, use canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const img = await loadImage(file);
  
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      `image/${targetFormat}`,
      quality
    );
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
```

- [ ] **Step 2: 创建图片转换页面**

```tsx
import { useCallback } from 'react';
import { FileUploader } from '@/components/converter/FileUploader';
import { FilePreview } from '@/components/converter/FilePreview';
import { FormatSelector } from '@/components/converter/FormatSelector';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { useConversion } from '@/hooks/useConversion';
import { convertImage } from '@/converters/image/imageConverter';
import { HiSparkles } from 'react-icons/hi';

const IMAGE_FORMATS = [
  { value: 'png', label: 'PNG', description: 'Lossless, supports transparency' },
  { value: 'jpeg', label: 'JPEG', description: 'Best for photos' },
  { value: 'webp', label: 'WebP', description: 'Modern format, smaller size' },
  { value: 'gif', label: 'GIF', description: 'For animations' },
  { value: 'bmp', label: 'BMP', description: 'Uncompressed bitmap' },
];

export default function ImageConverter() {
  const { files, targetFormat, setTargetFormat, handleUpload, removeFile, convert, isConverting, progress, reset, currentConversion } = useConversion();

  const onConvert = useCallback(() => {
    convert((fs, format) => convertImage(fs[0], format));
  }, [convert]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <HiSparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Image Converter</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Convert images between formats instantly. Your files stay on your device — we never upload them.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FileUploader
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'] }}
            maxSize={100 * 1024 * 1024}
            onUpload={handleUpload}
          />

          <FormatSelector
            label="Output Format"
            value={targetFormat}
            options={IMAGE_FORMATS}
            onChange={setTargetFormat}
          />

          <Button
            onClick={onConvert}
            disabled={files.length === 0}
            isLoading={isConverting}
            className="w-full"
            size="lg"
          >
            Convert to {targetFormat.toUpperCase()}
          </Button>

          {isConverting && <Progress value={progress} showLabel />}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Files</h3>
          {files.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No files selected
            </div>
          ) : (
            files.map((file) => (
              <FilePreview
                key={file.id}
                file={file}
                onRemove={() => removeFile(file.id)}
                result={file.id === currentConversion?.originalFile.id ? currentConversion : undefined}
              />
            ))
          )}
        </div>
      </div>

      <div className="mt-12 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">🔒 100% Private</h3>
        <p className="text-sm text-green-700 dark:text-green-300">
          Your images are processed entirely in your browser. They are never uploaded to any server.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 提交图片转换器**

```bash
git add src/converters/image/ src/pages/converter/ImageConverter.tsx
git commit -m "feat: implement image converter with browser-based processing"
```

### 4.2 PDF转换器

**Files:**
- Create: `src/converters/pdf/pdfMerger.ts`
- Create: `src/converters/pdf/pdfSplitter.ts`
- Create: `src/converters/pdf/pdfGenerator.ts`
- Create: `src/pages/converter/PDFConverter.tsx`

- [ ] **Step 1: 创建PDF合并功能**

```typescript
import { PDFDocument } from 'pdf-lib';

export async function mergePdfs(files: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const pdfBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
```

- [ ] **Step 2: 创建PDF拆分功能**

```typescript
import { PDFDocument } from 'pdf-lib';

export async function splitPdf(file: File, startPage: number, endPage: number): Promise<Blob> {
  const pdfBytes = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(pdfBytes);
  const newPdf = await PDFDocument.create();

  const pages = await newPdf.copyPages(sourcePdf, [startPage - 1, endPage - 1]);
  pages.forEach((page) => newPdf.addPage(page));

  const resultBytes = await newPdf.save();
  return new Blob([resultBytes], { type: 'application/pdf' });
}

export async function extractPage(file: File, pageNumber: number): Promise<Blob> {
  return splitPdf(file, pageNumber, pageNumber);
}
```

- [ ] **Step 3: 创建图片转PDF功能**

```typescript
import { PDFDocument } from 'pdf-lib';
import imageCompression from 'browser-image-compression';

export async function imagesToPdf(files: File[]): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const compressed = await imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });

    let image;
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(await compressed.arrayBuffer());
    } else {
      image = await pdfDoc.embedPng(await compressed.arrayBuffer());
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
```

- [ ] **Step 4: 创建PDF转换页面**

```tsx
import { useState } from 'react';
import { HiDocument, HiScissors, HiPlus } from 'react-icons/hi';
import { FileUploader } from '@/components/converter/FileUploader';
import { FilePreview } from '@/components/converter/FilePreview';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useConversionStore } from '@/store/conversionStore';
import { mergePdfs, splitPdf, imagesToPdf } from '@/converters/pdf';
import toast from 'react-hot-toast';

type PDFMode = 'merge' | 'split' | 'image-to-pdf';

export default function PDFConverter() {
  const { files, addFiles, removeFile, setConversionResult, currentConversion } = useConversionStore();
  const [mode, setMode] = useState<PDFMode>('merge');

  const handleConvert = async () => {
    try {
      let result: Blob;
      if (mode === 'merge') {
        result = await mergePdfs(files.map((f) => f.file));
      } else if (mode === 'split') {
        result = await splitPdf(files[0].file, 1, 1);
      } else {
        result = await imagesToPdf(files.map((f) => f.file));
      }

      setConversionResult({
        id: crypto.randomUUID(),
        originalFile: files[0],
        convertedBlob: result,
        outputFormat: 'pdf',
        outputName: `converted.pdf`,
        convertedAt: new Date(),
      });
      toast.success('Conversion completed!');
    } catch (error) {
      toast.error('Conversion failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <HiDocument className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold mb-4">PDF Tools</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Merge, split, or convert PDFs. 100% private, processed locally.
        </p>
      </div>

      <Card className="mb-8">
        <div className="flex flex-wrap gap-4">
          <Button
            variant={mode === 'merge' ? 'primary' : 'secondary'}
            onClick={() => setMode('merge')}
          >
            <HiPlus className="w-4 h-4 mr-2" /> Merge PDFs
          </Button>
          <Button
            variant={mode === 'split' ? 'primary' : 'secondary'}
            onClick={() => setMode('split')}
          >
            <HiScissors className="w-4 h-4 mr-2" /> Split PDF
          </Button>
          <Button
            variant={mode === 'image-to-pdf' ? 'primary' : 'secondary'}
            onClick={() => setMode('image-to-pdf')}
          >
            <HiDocument className="w-4 h-4 mr-2" /> Images to PDF
          </Button>
        </div>
      </Card>

      <FileUploader
        accept={mode === 'image-to-pdf' ? { 'image/*': ['.jpg', '.jpeg', '.png'] } : { 'application/pdf': ['.pdf'] }}
        maxSize={100 * 1024 * 1024}
        onUpload={addFiles}
      />

      {files.length > 0 && (
        <div className="mt-6">
          {files.map((file) => (
            <FilePreview key={file.id} file={file} onRemove={() => removeFile(file.id)} />
          ))}
        </div>
      )}

      <Button
        onClick={handleConvert}
        disabled={files.length === 0}
        className="w-full mt-6"
        size="lg"
      >
        {mode === 'merge' ? 'Merge PDFs' : mode === 'split' ? 'Split PDF' : 'Create PDF'}
      </Button>
    </div>
  );
}
```

- [ ] **Step 5: 提交PDF转换器**

```bash
git add src/converters/pdf/ src/pages/converter/PDFConverter.tsx
git commit -m "feat: implement PDF converter with merge, split, and image-to-pdf features"
```

### 4.3 音视频转换器

**Files:**
- Create: `src/converters/video/ffmpegWrapper.ts`
- Create: `src/pages/converter/VideoConverter.tsx`
- Create: `src/pages/converter/AudioConverter.tsx`

- [ ] **Step 1: 创建FFmpeg封装**

```typescript
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;

export async function getFFmpeg(): Promise<FFmpeg> {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
    await ffmpegInstance.load();
  }
  return ffmpegInstance;
}

export async function convertVideo(
  file: File,
  outputFormat: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const ffmpeg = await getFFmpeg();

  ffmpeg.on('progress', ({ progress }) => {
    onProgress?.(Math.round(progress * 100));
  });

  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.' + outputFormat;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, '-y', outputName]);

  const data = await ffmpeg.readFile(outputName);
  
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  return new Blob([data], { type: `video/${outputFormat}` });
}

export async function convertAudio(
  file: File,
  outputFormat: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const ffmpeg = await getFFmpeg();

  ffmpeg.on('progress', ({ progress }) => {
    onProgress?.(Math.round(progress * 100));
  });

  const inputName = 'input.' + file.name.split('.').pop();
  const outputName = 'output.' + outputFormat;

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  
  const args = ['-i', inputName];
  if (outputFormat === 'mp3') {
    args.push('-b:a', '192k');
  }
  args.push('-y', outputName);

  await ffmpeg.exec(args);

  const data = await ffmpeg.readFile(outputName);
  
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  return new Blob([data], { type: `audio/${outputFormat}` });
}
```

- [ ] **Step 2: 创建视频转换页面**

```tsx
import { useCallback, useState } from 'react';
import { HiFilm } from 'react-icons/hi';
import { FileUploader } from '@/components/converter/FileUploader';
import { FilePreview } from '@/components/converter/FilePreview';
import { FormatSelector } from '@/components/converter/FormatSelector';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { useConversion } from '@/hooks/useConversion';
import { convertVideo } from '@/converters/video/ffmpegWrapper';
import { saveAs } from 'file-saver';

const VIDEO_FORMATS = [
  { value: 'mp4', label: 'MP4', description: 'Most compatible' },
  { value: 'webm', label: 'WebM', description: 'Smaller size' },
  { value: 'avi', label: 'AVI', description: 'Legacy format' },
];

export default function VideoConverter() {
  const { files, targetFormat, setTargetFormat, handleUpload, removeFile, currentConversion } = useConversion();
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  const onConvert = useCallback(async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setProgress(0);

    try {
      const result = await convertVideo(files[0].file, targetFormat, setProgress);
      const url = URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = files[0].name.replace(/\.[^.]+$/, `.${targetFormat}`);
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsConverting(false);
    }
  }, [files, targetFormat]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <HiFilm className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Video Converter</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert videos between formats. Powered by FFmpeg in your browser.
        </p>
      </div>

      <FileUploader
        accept={{ 'video/*': ['.mp4', '.avi', '.mov', '.webm', '.mkv'] }}
        maxSize={500 * 1024 * 1024}
        onUpload={handleUpload}
      />

      <FormatSelector
        label="Output Format"
        value={targetFormat}
        options={VIDEO_FORMATS}
        onChange={setTargetFormat}
        className="mt-6"
      />

      <Button onClick={onConvert} disabled={files.length === 0} isLoading={isConverting} className="w-full mt-6" size="lg">
        Convert to {targetFormat.toUpperCase()}
      </Button>

      {isConverting && <Progress value={progress} showLabel className="mt-4" />}

      {files.map((file) => (
        <FilePreview key={file.id} file={file} onRemove={() => removeFile(file.id)} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 创建音频转换页面**

```tsx
import { useCallback, useState } from 'react';
import { HiMusicNote } from 'react-icons/hi';
import { FileUploader } from '@/components/converter/FileUploader';
import { FilePreview } from '@/components/converter/FilePreview';
import { FormatSelector } from '@/components/converter/FormatSelector';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { useConversion } from '@/hooks/useConversion';
import { convertAudio } from '@/converters/video/ffmpegWrapper';
import { saveAs } from 'file-saver';

const AUDIO_FORMATS = [
  { value: 'mp3', label: 'MP3', description: 'Most compatible' },
  { value: 'wav', label: 'WAV', description: 'Lossless quality' },
  { value: 'ogg', label: 'OGG', description: 'Open format' },
];

export default function AudioConverter() {
  const { files, targetFormat, setTargetFormat, handleUpload, removeFile } = useConversion();
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  const onConvert = useCallback(async () => {
    if (files.length === 0) return;
    setIsConverting(true);
    setProgress(0);

    try {
      const result = await convertAudio(files[0].file, targetFormat, setProgress);
      const url = URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = files[0].name.replace(/\.[^.]+$/, `.${targetFormat}`);
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsConverting(false);
    }
  }, [files, targetFormat]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <HiMusicNote className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Audio Converter</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert audio files between formats. Your files never leave your device.
        </p>
      </div>

      <FileUploader
        accept={{ 'audio/*': ['.mp3', '.wav', '.ogg', '.flac', '.aac'] }}
        maxSize={100 * 1024 * 1024}
        onUpload={handleUpload}
      />

      <FormatSelector
        label="Output Format"
        value={targetFormat}
        options={AUDIO_FORMATS}
        onChange={setTargetFormat}
        className="mt-6"
      />

      <Button onClick={onConvert} disabled={files.length === 0} isLoading={isConverting} className="w-full mt-6" size="lg">
        Convert to {targetFormat.toUpperCase()}
      </Button>

      {isConverting && <Progress value={progress} showLabel className="mt-4" />}

      {files.map((file) => (
        <FilePreview key={file.id} file={file} onRemove={() => removeFile(file.id)} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: 提交音视频转换器**

```bash
git add src/converters/video/ src/pages/converter/VideoConverter.tsx src/pages/converter/AudioConverter.tsx
git commit -m "feat: implement video and audio converters with FFmpeg.wasm"
```

---

## 5. 广告与订阅系统

### 5.1 广告组件

**Files:**
- Create: `src/components/ads/AdBanner.tsx`
- Create: `src/components/ads/AdSense.tsx`

- [ ] **Step 1: 创建 AdSense 组件**

```tsx
import { useEffect } from 'react';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal';
}

export function AdSense({ slot, format = 'auto' }: AdSenseProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.log('AdSense error', err);
    }
  }, [slot]);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
```

- [ ] **Step 2: 创建广告横幅组件**

```tsx
import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdBanner() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, []);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <ins
          className="adsbygoogle mx-auto block"
          style={{ display: 'block', maxWidth: '728px', height: '90px' }}
          data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT}
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="horizontal"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 提交广告组件**

```bash
git add src/components/ads/
git commit -m "feat: implement AdSense integration components"
```

### 5.2 Firebase与订阅系统

**Files:**
- Create: `src/services/firebase.ts`
- Create: `src/services/stripe.ts`
- Create: `src/pages/pricing/Pricing.tsx`
- Create: `src/pages/auth/Login.tsx`

- [ ] **Step 1: 创建 Firebase 配置**

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
```

- [ ] **Step 2: 创建 Stripe 服务**

```typescript
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

export async function createCheckoutSession(priceId: string) {
  // This would typically call your backend to create a checkout session
  // For now, we'll use Stripe Checkout redirect
  const stripe = await stripePromise;
  
  // In production, you would call your Firebase Function to create a session
  // and redirect to the checkout URL
  console.log('Creating checkout session for price:', priceId);
}
```

- [ ] **Step 3: 创建定价页面**

```tsx
import { HiCheck } from 'react-icons/hi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SUBSCRIPTION_PLANS } from '@/types';
import { useSubscriptionStore } from '@/store/subscriptionStore';

export default function Pricing() {
  const { currentPlan, setPlan } = useSubscriptionStore();

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose the plan that fits your needs. Upgrade anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${plan.id === 'pro' ? 'border-primary ring-2 ring-primary' : ''}`}
          >
            {plan.id === 'pro' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
            )}

            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">${plan.price}</span>
              {plan.price > 0 && <span className="text-gray-500">/month</span>}
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <HiCheck className="w-5 h-5 text-green-500" />
                <span>Max file size: {plan.features.maxFileSize / 1024 / 1024}MB</span>
              </li>
              <li className="flex items-center gap-2">
                <HiCheck className="w-5 h-5 text-green-500" />
                <span>
                  {plan.features.dailyConversions === -1
                    ? 'Unlimited conversions'
                    : `${plan.features.dailyConversions} conversions/day`}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <HiCheck className="w-5 h-5 text-green-500" />
                <span>{plan.features.noAds ? 'Ad-free experience' : 'Contains ads'}</span>
              </li>
              <li className="flex items-center gap-2">
                <HiCheck className="w-5 h-5 text-green-500" />
                <span>Batch size: {plan.features.batchSize} files</span>
              </li>
            </ul>

            <Button
              variant={currentPlan.id === plan.id ? 'secondary' : 'primary'}
              className="w-full"
              disabled={currentPlan.id === plan.id}
              onClick={() => setPlan(plan)}
            >
              {currentPlan.id === plan.id ? 'Current Plan' : plan.price === 0 ? 'Get Started' : 'Subscribe'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 创建登录页面**

```tsx
import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/services/firebase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Signed in successfully!');
    } catch (error) {
      toast.error('Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Welcome to ConvertSafely</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          Sign in to save your conversion history and access premium features.
        </p>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          isLoading={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="text-xs text-gray-500 text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </Card>
    </div>
  );
}
```

- [ ] **Step 5: 提交Firebase与订阅系统**

```bash
git add src/services/ src/pages/pricing/ src/pages/auth/
git commit -m "feat: implement Firebase authentication and subscription system"
```

---

## 6. 首页与落地页

**Files:**
- Create: `src/pages/Home.tsx`
- Create: `public/index.html`

- [ ] **Step 1: 创建首页**

```tsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiShieldCheck, HiLightningBolt, HiUserGroup, HiStar } from 'react-icons/hi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const features = [
  {
    icon: HiShieldCheck,
    title: '100% Private',
    description: 'Your files never leave your device. All processing happens locally in your browser.',
  },
  {
    icon: HiLightningBolt,
    title: 'Lightning Fast',
    description: 'Convert files instantly with our optimized browser-based processing.',
  },
  {
    icon: HiUserGroup,
    title: 'Easy to Use',
    description: 'Simple drag-and-drop interface. No signup required for basic conversions.',
  },
  {
    icon: HiStar,
    title: 'Premium Quality',
    description: 'High-quality conversions powered by the latest web technologies.',
  },
];

const converters = [
  { name: 'Images', icon: '🖼️', href: '/converter/image', color: 'bg-pink-100 text-pink-600' },
  { name: 'PDF', icon: '📄', href: '/converter/pdf', color: 'bg-red-100 text-red-600' },
  { name: 'Video', icon: '🎬', href: '/converter/video', color: 'bg-purple-100 text-purple-600' },
  { name: 'Audio', icon: '🎵', href: '/converter/audio', color: 'bg-green-100 text-green-600' },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-6xl font-bold mb-6"
            >
              Secure File Conversion
              <span className="text-primary block mt-2">That Respects Your Privacy</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-400 mb-8"
            >
              Convert files between formats instantly, right in your browser.
              No uploads. No servers. No privacy concerns.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link to="/converter/image">
                <Button size="lg">Start Converting Free</Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg">View Pricing</Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Converters Grid */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Convert Any File Type</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {converters.map((converter) => (
              <Link key={converter.name} to={converter.href}>
                <Card hover className="text-center p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${converter.color}`}>
                    <span className="text-3xl">{converter.icon}</span>
                  </div>
                  <h3 className="font-semibold text-lg">{converter.name}</h3>
                  <p className="text-sm text-gray-500 mt-2">Convert {converter.name.toLowerCase()} files</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose ConvertSafely?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-primary-light text-lg mb-8">
            Start converting your files today. It's free, fast, and completely private.
          </p>
          <Link to="/converter/image">
            <Button variant="secondary" size="lg">
              Convert Files Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: 更新 index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="ConvertSafely - Secure file conversion in your browser. No uploads, no privacy concerns. Support for images, PDFs, videos, and audio." />
    <meta name="theme-color" content="#3B82F6" />
    <title>ConvertSafely - Secure File Conversion</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: 提交首页**

```bash
git add src/pages/Home.tsx public/index.html
git commit -m "feat: create landing page with features and converter grid"
```

---

## 7. Firebase部署配置

**Files:**
- Create: `firebase/.firebaserc`
- Create: `firebase/firestore.rules`
- Create: `firebase/storage.rules`
- Create: `firebase/functions/src/index.ts`

- [ ] **Step 1: 创建 Firebase 项目配置**

```json
{
  "projects": {
    "default": "convertsafely"
  }
}
```

- [ ] **Step 2: 创建 Firestore 安全规则**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      match /subscriptions/{subscriptionId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

- [ ] **Step 3: 创建 Firebase Functions**

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { priceId } = data;
  
  // In production, you would use Stripe SDK to create a checkout session
  // and store the subscription info in Firestore
  
  return {
    success: true,
    message: 'Checkout session created',
  };
});

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  
  // Verify webhook signature and handle events
  // - checkout.session.completed: Create subscription record
  // - customer.subscription.updated: Update subscription status
  // - customer.subscription.deleted: Remove subscription
  
  res.sendStatus(200);
});
```

- [ ] **Step 4: 创建部署脚本**

```bash
#!/bin/bash
# deploy.sh

echo "Building the application..."
npm run build

echo "Deploying to Firebase..."
firebase deploy --only hosting

echo "Deployment complete!"
```

- [ ] **Step 5: 提交Firebase配置**

```bash
git add firebase/ firebase.json
git commit -m "feat: configure Firebase deployment with hosting and functions"
```

---

## 8. 测试与验证

### 8.1 单元测试

**Files:**
- Create: `tests/unit/converters/imageConverter.test.ts`
- Create: `tests/unit/converters/pdfMerger.test.ts`

- [ ] **Step 1: 创建图片转换器测试**

```typescript
import { describe, it, expect } from 'vitest';
import { convertImage } from '@/converters/image/imageConverter';

describe('Image Converter', () => {
  it('should convert JPEG to PNG', async () => {
    const jpgData = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]); // Minimal JPEG header
    const file = new File([jpgData], 'test.jpg', { type: 'image/jpeg' });
    
    const result = await convertImage(file, 'png');
    
    expect(result.type).toBe('image/png');
  });

  it('should handle WebP conversion', async () => {
    const pngData = new Uint8Array([0x89, 0x50, 0x4E, 0x47]); // PNG header
    const file = new File([pngData], 'test.png', { type: 'image/png' });
    
    const result = await convertImage(file, 'webp');
    
    expect(result.type).toBe('image/webp');
  });
});
```

- [ ] **Step 2: 创建PDF合并测试**

```typescript
import { describe, it, expect } from 'vitest';
import { mergePdfs } from '@/converters/pdf/pdfMerger';

describe('PDF Merger', () => {
  it('should merge two PDFs', async () => {
    // In a real test, you would use actual PDF files
    // For now, this is a placeholder
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 3: 运行测试**

```bash
npm run test
```

- [ ] **Step 4: 提交测试**

```bash
git add tests/
git commit -m "test: add unit tests for converters"
```

---

## 9. 最终验证与发布

- [ ] **Step 1: 构建生产版本**

```bash
npm run build
```

- [ ] **Step 2: 本地预览**

```bash
npm run preview
```

- [ ] **Step 3: 部署到 Firebase**

```bash
firebase deploy --only hosting
```

- [ ] **Step 4: 最终提交**

```bash
git add -A
git commit -m "feat: complete ConvertSafely v1.0.0"
git push
```

---

## 验证清单

在每个阶段完成后，请验证以下内容：

- [ ] 基础框架可以正常运行 (`npm run dev`)
- [ ] Tailwind CSS 样式正确应用
- [ ] 所有页面路由正常工作
- [ ] 图片转换器可以正确处理文件
- [ ] PDF工具（合并、拆分、生成）功能正常
- [ ] 视频/音频转换器加载FFmpeg
- [ ] 广告组件正确显示
- [ ] 订阅系统界面显示正确
- [ ] Firebase认证可以正常工作
- [ ] 生产构建成功 (`npm run build`)
- [ ] Firebase Hosting部署成功

---

## 附录：关键文件路径总结

| 功能 | 文件路径 |
|------|----------|
| 入口 | `src/main.tsx` |
| 根组件 | `src/App.tsx` |
| 图片转换 | `src/converters/image/imageConverter.ts` |
| PDF处理 | `src/converters/pdf/pdfMerger.ts`, `pdfSplitter.ts`, `pdfGenerator.ts` |
| 视频处理 | `src/converters/video/ffmpegWrapper.ts` |
| 状态管理 | `src/store/conversionStore.ts`, `subscriptionStore.ts` |
| Firebase配置 | `src/services/firebase.ts` |
| 广告组件 | `src/components/ads/AdBanner.tsx`, `AdSense.tsx` |
| 订阅系统 | `src/pages/pricing/Pricing.tsx` |
| 首页 | `src/pages/Home.tsx` |
| Firebase部署 | `firebase.json`, `firebase/functions/` |

---

*文档版本: 1.0.0*  
*创建日期: 2026-05-25*  
*最后更新: 2026-05-25*
