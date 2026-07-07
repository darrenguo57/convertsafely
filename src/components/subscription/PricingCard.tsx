/**
 * ConvertSafely - PricingCard Component
 * Subscription pricing card with feature comparison
 */

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { SUBSCRIPTION_PLANS, getYearlyPrice } from '@/types';
import type { SubscriptionPlan } from '@/types';
import { FiCheck, FiX, FiZap, FiStar, FiBriefcase } from 'react-icons/fi';

export interface PricingCardProps {
  /** Subscription plan data */
  plan: SubscriptionPlan;
  /** Whether this is the current active plan */
  isCurrentPlan?: boolean;
  /** Click handler for CTA button */
  onSelect?: (plan: SubscriptionPlan) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Highlight as recommended plan */
  isRecommended?: boolean;
  /** Billing interval */
  billingInterval?: 'monthly' | 'yearly';
}

/**
 * Pricing Card Component
 * Displays subscription plan details with features and pricing
 */
export function PricingCard({
  plan,
  isCurrentPlan = false,
  onSelect,
  isLoading = false,
  isRecommended = false,
  billingInterval = 'monthly',
}: PricingCardProps) {
  const { t } = useTranslation();
  const isFree = plan.price === 0;
  const isYearly = billingInterval === 'yearly';

  // Get icon based on plan
  const PlanIcon = {
    free: FiStar,
    pro: FiZap,
    enterprise: FiBriefcase,
  }[plan.id];

  // Feature list with availability
  const features = [
    {
      label: t('pricing.dailyConversions'),
      value: plan.features.dailyConversions === -1 ? t('pricing.unlimited') : `${plan.features.dailyConversions} ${t('pricing.times')}`,
      available: true,
    },
    {
      label: t('pricing.maxFileSize'),
      value: `${plan.features.maxFileSize / (1024 * 1024)}MB`,
      available: true,
    },
    {
      label: t('pricing.batchConversion'),
      value: `${plan.features.batchSize} ${t('converter.files')}`,
      available: plan.features.batchSize > 1,
    },
    {
      label: t('pricing.noAds'),
      available: plan.features.noAds,
    },
    {
      label: t('pricing.prioritySupport'),
      available: plan.id !== 'free',
    },
    {
      label: t('pricing.apiAccess'),
      available: plan.id === 'enterprise',
    },
  ];

  return (
    <motion.div
      whileHover={{ y: isRecommended ? -8 : -4 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'relative rounded-2xl overflow-hidden',
        isRecommended && 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900'
      )}
    >
      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-semibold px-4 py-1 rounded-bl-lg">
          {t('pricing.recommended')}
        </div>
      )}

      <Card
        hoverable={!isCurrentPlan}
        padding="lg"
        shadow={isRecommended ? 'lg' : 'md'}
        className={clsx(
          'h-full flex flex-col',
          isCurrentPlan && 'border-primary/50 dark:border-primary/30 bg-primary/5 dark:bg-primary/10'
        )}
      >
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div
              className={clsx(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                isRecommended
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              )}
            >
              <PlanIcon className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>
                {isFree ? t('pricing.freeDesc') : t('pricing.proDesc')}
              </CardDescription>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              ${isYearly ? getYearlyPrice(plan.price) : plan.price}
            </span>
            {!isFree && (
              <span className="text-gray-500 dark:text-gray-400">
                {isYearly ? t('pricing.perYear') : t('pricing.perMonth')}
              </span>
            )}
          </div>
          {isYearly && !isFree && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              约 ${(getYearlyPrice(plan.price) / 12).toFixed(2)}{t('pricing.perMonth')}，{t('pricing.save', { percent: 17 })}
            </p>
          )}
        </CardHeader>

        <CardContent className="flex-grow">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                {feature.available ? (
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <FiX className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                )}
                <span
                  className={clsx(
                    'text-sm',
                    feature.available
                      ? 'text-gray-700 dark:text-gray-300'
                      : 'text-gray-400 dark:text-gray-500 line-through'
                  )}
                >
                  {feature.label}
                  {feature.value && (
                    <span className="font-medium text-gray-900 dark:text-white ml-1">
                      {feature.value}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="pt-6">
          {isCurrentPlan ? (
            <Button
              variant="secondary"
              fullWidth
              disabled
              leftIcon={<FiCheck />}
            >
              {t('pricing.currentPlan')}
            </Button>
          ) : (
            <Button
              variant={isRecommended ? 'primary' : 'outline'}
              fullWidth
              onClick={() => onSelect?.(plan)}
              loading={isLoading}
              leftIcon={isFree ? <FiStar /> : <FiZap />}
            >
              {isFree ? t('pricing.startFree') : t('pricing.upgradeNow')}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default PricingCard;
