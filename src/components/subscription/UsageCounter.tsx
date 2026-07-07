/**
 * ConvertSafely - UsageCounter Component
 * Daily usage counter with visual progress indicator
 */

import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

export interface UsageCounterProps {
  /** Current daily usage count */
  currentUsage: number;
  /** Maximum allowed daily conversions (-1 for unlimited) */
  maxUsage: number;
  /** Plan name */
  planName?: string;
  /** Click handler for upgrade button */
  onUpgrade?: () => void;
  /** Custom className */
  className?: string;
  /** Compact mode for header placement */
  compact?: boolean;
}

/**
 * Usage Counter Component
 * Displays daily conversion usage with progress bar and upgrade CTA
 */
export function UsageCounter({
  currentUsage,
  maxUsage,
  planName = 'Free',
  onUpgrade,
  className,
  compact = false,
}: UsageCounterProps) {
  const { t } = useTranslation();
  const isUnlimited = maxUsage === -1;
  const usagePercentage = isUnlimited ? 0 : Math.min((currentUsage / maxUsage) * 100, 100);
  const remaining = isUnlimited ? Infinity : Math.max(0, maxUsage - currentUsage);
  const isNearLimit = !isUnlimited && remaining <= 2;
  const isAtLimit = !isUnlimited && remaining === 0;

  // Progress bar color based on usage
  const getProgressColor = () => {
    if (isUnlimited) return 'bg-green-500';
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-amber-500';
    if (usagePercentage > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (compact) {
    return (
      <div
        className={clsx(
          'flex items-center gap-3 px-3 py-2 rounded-lg',
          'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700',
          className
        )}
      >
        <div className="flex items-center gap-2">
          {isUnlimited ? (
            <FiRefreshCw className="w-4 h-4 text-green-500" />
          ) : (
            <div className="w-8 h-8 relative">
              <svg className="w-8 h-8 transform -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-gray-200 dark:text-gray-700"
                />
                <motion.circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 14}`}
                  initial={{ strokeDashoffset: `${2 * Math.PI * 14}` }}
                  animate={{
                    strokeDashoffset: `${2 * Math.PI * 14 * (1 - usagePercentage / 100)}`,
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={clsx(getProgressColor())}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                {remaining}
              </span>
            </div>
          )}
          <div className="text-xs">
            <span className="text-gray-600 dark:text-gray-400">{t('subscription.remaining')}</span>
            <span className={clsx('font-medium ml-1', isNearLimit && 'text-amber-600 dark:text-amber-400')}>
              {isUnlimited ? '∞' : remaining}
            </span>
          </div>
        </div>

        {!isUnlimited && onUpgrade && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onUpgrade}
            className="text-xs px-2 py-1"
            leftIcon={<FiTrendingUp className="w-3 h-3" />}
          >
            {t('subscription.upgrade')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'p-4 rounded-xl border',
        isAtLimit
          ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
          : isNearLimit
          ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 dark:text-white">{t('subscription.todayUsage')}</h3>
          {isAtLimit && (
            <FiAlertCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{planName} {t('subscription.plan')}</span>
      </div>

      {/* Usage display */}
      <div className="mb-3">
        <div className="flex items-baseline gap-1 mb-2">
          <span
            className={clsx(
              'text-3xl font-bold',
              isAtLimit
                ? 'text-red-600 dark:text-red-400'
                : isNearLimit
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-gray-900 dark:text-white'
            )}
          >
            {isUnlimited ? '∞' : currentUsage}
          </span>
          {!isUnlimited && (
            <span className="text-gray-500 dark:text-gray-400">
              / {maxUsage} {t('subscription.times')}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {!isUnlimited && (
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={clsx('h-full rounded-full transition-colors', getProgressColor())}
            />
          </div>
        )}
      </div>

      {/* Status message */}
      <p
        className={clsx(
          'text-sm mb-3',
          isAtLimit
            ? 'text-red-600 dark:text-red-400'
            : isNearLimit
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-gray-600 dark:text-gray-400'
        )}
      >
        {isUnlimited
          ? t('subscription.unlimitedConversions')
          : isAtLimit
          ? t('subscription.dailyLimitReached')
          : isNearLimit
          ? t('subscription.nearLimit', { count: remaining })
          : t('subscription.remainingConversions', { count: remaining })}
      </p>

      {/* Upgrade CTA */}
      {!isUnlimited && onUpgrade && (
        <Button
          variant={isAtLimit || isNearLimit ? 'primary' : 'outline'}
          size="sm"
          fullWidth
          onClick={onUpgrade}
          leftIcon={<FiTrendingUp className="w-4 h-4" />}
        >
          {isAtLimit ? t('pricing.upgradeNow') : t('subscription.upgradePlan')}
        </Button>
      )}
    </div>
  );
}

export default UsageCounter;
