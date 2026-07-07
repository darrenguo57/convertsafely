/**
 * ConvertSafely - Pricing Page
 * Subscription plans and pricing comparison
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiCheck, FiShield, FiZap, FiStar, FiBriefcase } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { PricingCard } from '@/components/subscription/PricingCard';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { AdInFeed } from '@/components/ads/AdInFeed';
import { SUBSCRIPTION_PLANS } from '@/types';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { createCheckoutSession, handlePaymentSuccess } from '@/services/stripe';
import { trackSubscriptionFunnel } from '@/services/analytics';
import type { SubscriptionPlan } from '@/types';

/**
 * Pricing Page Component
 * Displays subscription plans with comparison and checkout flow
 */
export default function Pricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { plan: currentPlan, setPlan } = useSubscription();
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  // Handle payment success/cancel from URL params
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const plan = searchParams.get('plan') as 'pro' | 'enterprise' | null;

    if (success === 'true' && plan) {
      handleSuccessfulPayment(plan);
    } else if (canceled === 'true') {
      toast.error(t('pricing.paymentCanceled'), { duration: 3000 });
      trackSubscriptionFunnel('checkout_cancel');
    }
  }, [searchParams, t]);

  const handleSuccessfulPayment = async (planId: 'pro' | 'enterprise') => {
    try {
      setIsLoading(true);
      const result = await handlePaymentSuccess('session_' + Date.now());

      if (result) {
        // Update local subscription state
        const newPlan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
        if (newPlan) {
          setPlan(newPlan);
          toast.success(t('pricing.upgradeSuccess', { plan: newPlan.name }), { duration: 5000 });
          trackSubscriptionFunnel('checkout_complete', planId);
        }
      }
    } catch (error) {
      toast.error(t('pricing.paymentError'));
      console.error('Payment success handling error:', error);
    } finally {
      setIsLoading(false);
      // Clean URL params
      navigate('/pricing', { replace: true });
    }
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    trackSubscriptionFunnel('select', plan.id);

    // Free plan - just update
    if (plan.price === 0) {
      setPlan(plan);
      toast.success(t('pricing.switchSuccess'));
      return;
    }

    // Require authentication for paid plans
    if (!isAuthenticated) {
      setSelectedPlan(plan);
      setShowUpgradeModal(true);
      return;
    }

    // Start checkout
    await startCheckout(plan);
  };

  const startCheckout = async (plan: SubscriptionPlan) => {
    if (plan.price === 0) return;

    setIsLoading(true);
    try {
      trackSubscriptionFunnel('checkout_start', plan.id as 'pro' | 'enterprise');

      const session = await createCheckoutSession(
        plan.id as 'pro' | 'enterprise',
        user?.email || undefined
      );

      if (session) {
        // In mock mode, redirect to success URL directly
        if (session.url.includes('?success=true')) {
          window.location.href = session.url;
        } else {
          // Real Stripe redirect
          window.location.href = session.url;
        }
      }
    } catch (error) {
      toast.error(t('pricing.checkoutFailed'));
      console.error('Checkout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeFromModal = () => {
    setShowUpgradeModal(false);
    navigate('/login?redirect=/pricing');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm font-medium mb-6">
              <FiZap className="w-4 h-4" />
              {t('pricing.badge')}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t('pricing.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </motion.div>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <span
              className={clsx(
                'text-sm font-medium',
                billingInterval === 'monthly'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {t('pricing.monthly')}
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
              className={clsx(
                'relative w-14 h-8 rounded-full transition-colors duration-200',
                billingInterval === 'yearly' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <span
                className={clsx(
                  'absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-200',
                  billingInterval === 'yearly' && 'translate-x-6'
                )}
              />
            </button>
            <span
              className={clsx(
                'text-sm font-medium',
                billingInterval === 'yearly'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              {t('pricing.yearly')}
              <span className="ml-1 text-xs text-green-600 dark:text-green-400">{t('pricing.save', { percent: 17 })}</span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-3 gap-8"
          >
            {SUBSCRIPTION_PLANS.map((plan, index) => (
              <motion.div key={plan.id} variants={itemVariants}>
                <PricingCard
                  plan={plan}
                  isCurrentPlan={currentPlan.id === plan.id}
                  isRecommended={plan.id === 'pro'}
                  onSelect={handleSelectPlan}
                  isLoading={isLoading}
                  billingInterval={billingInterval}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* In-feed Ad */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <AdInFeed index={0} variant="featured" />
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('pricing.featureComparison')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('pricing.compareDesc')}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 font-medium text-gray-900 dark:text-white">
                    {t('pricing.feature')}
                  </th>
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <th
                      key={plan.id}
                      className={clsx(
                        'text-center py-4 px-4 font-semibold',
                        currentPlan.id === plan.id
                          ? 'text-primary'
                          : 'text-gray-900 dark:text-white'
                      )}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {plan.id === 'free' && <FiStar className="w-5 h-5" />}
                        {plan.id === 'pro' && <FiZap className="w-5 h-5" />}
                        {plan.id === 'enterprise' && <FiBriefcase className="w-5 h-5" />}
                        {plan.name}
                        {currentPlan.id === plan.id && (
                          <span className="text-xs font-normal text-primary">{t('pricing.current')}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: t('pricing.dailyConversions'), key: 'dailyConversions', format: (v: number) => v === -1 ? t('pricing.unlimited') : `${v} ${t('pricing.times')}` },
                  { label: t('pricing.maxFileSize'), key: 'maxFileSize', format: (v: number) => `${v / (1024 * 1024)}MB` },
                  { label: t('pricing.batchConversion'), key: 'batchSize', format: (v: number) => `${v} ${t('converter.files')}` },
                  { label: t('pricing.noAds'), key: 'noAds', format: (v: boolean) => v ? '✓' : '—' },
                  { label: t('pricing.prioritySupport'), key: 'support', format: (_v: unknown, plan: typeof SUBSCRIPTION_PLANS[0]) => plan.id !== 'free' ? '✓' : '—' },
                  { label: t('pricing.apiAccess'), key: 'api', format: (_v: unknown, plan: typeof SUBSCRIPTION_PLANS[0]) => plan.id === 'enterprise' ? '✓' : '—' },
                ].map((feature, index) => (
                  <tr
                    key={feature.key}
                    className={clsx(
                      'border-b border-gray-100 dark:border-gray-700',
                      index % 2 === 0 && 'bg-gray-50/50 dark:bg-gray-700/30'
                    )}
                  >
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                      {feature.label}
                    </td>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <td
                        key={plan.id}
                        className={clsx(
                          'text-center py-4 px-4',
                          currentPlan.id === plan.id && 'bg-primary/5 dark:bg-primary/10'
                        )}
                      >
                        <span
                          className={clsx(
                            'font-medium',
                            feature.key === 'noAds' && plan.features.noAds
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-900 dark:text-white'
                          )}
                        >
                          {feature.format(
                            plan.features[feature.key as keyof typeof plan.features] as number & boolean,
                            plan
                          )}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t('pricing.securePayment')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('pricing.securePaymentDesc')}
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t('pricing.cancelAnytime')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('pricing.cancelAnytimeDesc')}
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiZap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t('pricing.instantAccess')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('pricing.instantAccessDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            {t('pricing.faq')}
          </h2>
          <div className="space-y-4">
            {[
              {
                q: t('pricing.faq1q'),
                a: t('pricing.faq1a'),
              },
              {
                q: t('pricing.faq2q'),
                a: t('pricing.faq2a'),
              },
              {
                q: t('pricing.faq3q'),
                a: t('pricing.faq3a'),
              },
              {
                q: t('pricing.faq4q'),
                a: t('pricing.faq4a'),
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {faq.q}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upgrade Modal for non-authenticated users */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgradeFromModal}
        currentPlan="free"
        reason="feature"
        message={t('pricing.loginToUpgrade')}
      />
    </div>
  );
}

// Helper for clsx
function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
