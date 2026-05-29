/**
 * ConvertSafely - Dashboard Page
 * User dashboard for managing subscription and viewing usage
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FiUser,
  FiZap,
  FiStar,
  FiBriefcase,
  FiSettings,
  FiLogOut,
  FiCreditCard,
  FiTrendingUp,
  FiFileText,
  FiCalendar,
  FiCheck,
  FiX,
  FiExternalLink,
  FiRefreshCw,
} from 'react-icons/fi';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import { UsageCounter } from '@/components/subscription/UsageCounter';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { AdSidebar } from '@/components/ads/AdSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '@/types';
import { createBillingPortalSession, cancelSubscription, reactivateSubscription } from '@/services/stripe';
import { trackEvent } from '@/services/analytics';
import type { SubscriptionPlan } from '@/types';

/**
 * Dashboard Page Component
 * User account management and subscription overview
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { plan, dailyUsage, limits, isPremium, isEnterprise, setPlan, resetDailyUsage } = useSubscription();

  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'subscription' | 'settings'>('overview');

  // Handle payment success from URL
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      toast.success('订阅升级成功！', { duration: 5000 });
      // Clean URL
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('已退出登录');
      navigate('/');
    } catch (error) {
      toast.error('退出登录失败');
    }
  };

  const handleManageBilling = async () => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const session = await createBillingPortalSession('mock_customer_id');
      if (session?.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      toast.error('无法打开账单管理页面');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('确定要取消订阅吗？您仍可使用服务直到当前计费周期结束。')) {
      return;
    }

    setIsLoading(true);
    try {
      await cancelSubscription('mock_subscription_id');
      toast.success('订阅已取消');
      trackEvent('subscription_cancel');
    } catch (error) {
      toast.error('取消订阅失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (selectedPlan: SubscriptionPlan) => {
    setShowUpgradeModal(false);
    if (selectedPlan.id !== 'free') {
      navigate(`/pricing?plan=${selectedPlan.id}`);
    }
  };

  // Mock conversion history
  const conversionHistory = [
    { id: '1', fileName: 'document.pdf', from: 'PDF', to: 'DOCX', date: '2024-01-15', status: 'success' },
    { id: '2', fileName: 'image.png', from: 'PNG', to: 'JPG', date: '2024-01-14', status: 'success' },
    { id: '3', fileName: 'video.mp4', from: 'MP4', to: 'WEBM', date: '2024-01-13', status: 'failed' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* User Info Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      {user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <FiUser className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {user?.displayName || '用户'}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                      <div className="mt-2">
                        <SubscriptionBadge plan={plan} size="sm" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                    activeTab === 'overview'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <FiUser className="w-5 h-5" />
                  概览
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                    activeTab === 'subscription'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <FiCreditCard className="w-5 h-5" />
                  订阅管理
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                    activeTab === 'settings'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <FiSettings className="w-5 h-5" />
                  账户设置
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                  退出登录
                </button>
              </nav>

              {/* Ad for free users */}
              {!limits.hasAds && (
                <div className="hidden lg:block">
                  <AdSidebar slot="dashboard-sidebar" />
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">账户概览</h1>

                {/* Usage Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <UsageCounter
                    currentUsage={dailyUsage}
                    maxUsage={limits.dailyConversions}
                    planName={plan.name}
                    onUpgrade={() => setShowUpgradeModal(true)}
                  />

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <FiFileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">文件大小限制</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {limits.maxFileSizeMB}MB
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <FiRefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">批量转换</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {limits.batchSize} 个文件
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Conversions */}
                <Card>
                  <CardHeader>
                    <CardTitle>最近转换</CardTitle>
                    <CardDescription>您最近的文件转换记录</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                              文件名
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                              转换
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                              日期
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                              状态
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {conversionHistory.map((item) => (
                            <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-3 px-4 text-gray-900 dark:text-white">{item.fileName}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {item.from} → {item.to}
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.date}</td>
                              <td className="py-3 px-4">
                                {item.status === 'success' ? (
                                  <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <FiCheck className="w-4 h-4" />
                                    成功
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                                    <FiX className="w-4 h-4" />
                                    失败
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {conversionHistory.length === 0 && (
                      <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                        暂无转换记录
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" onClick={() => navigate('/converter/image')}>
                    转换图片
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/converter/pdf')}>
                    转换 PDF
                  </Button>
                  <Button variant="outline" onClick={() => resetDailyUsage()}>
                    重置使用计数（测试）
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">订阅管理</h1>

                {/* Current Plan */}
                <Card className={clsx('border-2', isPremium ? 'border-purple-200 dark:border-purple-800' : 'border-gray-200 dark:border-gray-700')}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          {plan.id === 'free' && <FiStar className="w-6 h-6 text-gray-400" />}
                          {plan.id === 'pro' && <FiZap className="w-6 h-6 text-purple-500" />}
                          {plan.id === 'enterprise' && <FiBriefcase className="w-6 h-6 text-amber-500" />}
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {plan.name} 计划
                          </h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {plan.id === 'free'
                            ? '免费使用基础功能'
                            : plan.id === 'pro'
                            ? '解锁更多转换次数和更大文件'
                            : '无限制的企业级功能'}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <FiTrendingUp className="w-4 h-4" />
                            {limits.dailyConversions === -1 ? '无限制' : `${limits.dailyConversions} 次/日`}
                          </span>
                          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <FiFileText className="w-4 h-4" />
                            {limits.maxFileSizeMB}MB 文件
                          </span>
                          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <FiRefreshCw className="w-4 h-4" />
                            {limits.batchSize} 个批量
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          ${plan.price}
                        </p>
                        {plan.price > 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">/月</p>
                        )}
                      </div>
                    </div>

                    {isPremium && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant="outline"
                            onClick={handleManageBilling}
                            loading={isLoading}
                            leftIcon={<FiCreditCard className="w-4 h-4" />}
                          >
                            管理账单
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={handleCancelSubscription}
                            loading={isLoading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            取消订阅
                          </Button>
                        </div>
                      </div>
                    )}

                    {!isPremium && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          variant="primary"
                          onClick={() => setShowUpgradeModal(true)}
                          leftIcon={<FiTrendingUp className="w-4 h-4" />}
                        >
                          升级计划
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Plan Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>计划对比</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4">功能</th>
                            {SUBSCRIPTION_PLANS.map((p) => (
                              <th
                                key={p.id}
                                className={clsx(
                                  'text-center py-3 px-4',
                                  plan.id === p.id && 'text-primary'
                                )}
                              >
                                {p.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { label: '每日转换', key: 'dailyConversions', format: (v: number) => v === -1 ? '∞' : v },
                            { label: '文件大小', key: 'maxFileSize', format: (v: number) => `${v / (1024 * 1024)}MB` },
                            { label: '批量转换', key: 'batchSize', format: (v: number) => v },
                            { label: '无广告', key: 'noAds', format: (v: boolean) => v ? '✓' : '—' },
                          ].map((feature) => (
                            <tr key={feature.key} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{feature.label}</td>
                              {SUBSCRIPTION_PLANS.map((p) => (
                                <td
                                  key={p.id}
                                  className={clsx(
                                    'text-center py-3 px-4',
                                    plan.id === p.id && 'bg-primary/5 dark:bg-primary/10'
                                  )}
                                >
                                  {feature.format(p.features[feature.key as keyof typeof p.features] as number & boolean)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">账户设置</h1>

                <Card>
                  <CardHeader>
                    <CardTitle>个人信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        显示名称
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.displayName || ''}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        邮箱地址
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        disabled
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <Button variant="primary">保存更改</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>偏好设置</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">邮件通知</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">接收转换完成和账户更新通知</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">暗黑模式</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">使用深色主题</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600">
                        <span className="translate-x-1 dark:translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="text-red-600">危险区域</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      删除账户将永久删除您的所有数据和转换记录。
                    </p>
                    <Button variant="danger">删除账户</Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        currentPlan={plan.id}
        reason="feature"
      />
    </div>
  );
}

// Helper for clsx
function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
