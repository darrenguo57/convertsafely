import { lazy } from 'react';

export const routes = [
  { path: '/', name: 'Home', component: lazy(() => import('@/pages/Home')) },
  { path: '/about', name: 'About', component: lazy(() => import('@/pages/about/About')) },
  { path: '/privacy', name: 'Privacy Policy', component: lazy(() => import('@/pages/legal/Privacy')) },
  { path: '/terms', name: 'Terms of Service', component: lazy(() => import('@/pages/legal/Terms')) },
  { path: '/converter/image', name: 'Image Converter', component: lazy(() => import('@/pages/converter/ImageConverter')) },
  { path: '/converter/pdf', name: 'PDF Converter', component: lazy(() => import('@/pages/converter/PDFConverter')) },
  { path: '/converter/video', name: 'Video Converter', component: lazy(() => import('@/pages/converter/VideoConverter')) },
  { path: '/converter/audio', name: 'Audio Converter', component: lazy(() => import('@/pages/converter/AudioConverter')) },
  { path: '/pricing', name: 'Pricing', component: lazy(() => import('@/pages/pricing/Pricing')) },
  { path: '/login', name: 'Login', component: lazy(() => import('@/pages/auth/Login')) },
  { path: '/signup', name: 'Signup', component: lazy(() => import('@/pages/auth/Signup')) },
  { path: '/dashboard', name: 'Dashboard', component: lazy(() => import('@/pages/dashboard/Dashboard')) },
];
