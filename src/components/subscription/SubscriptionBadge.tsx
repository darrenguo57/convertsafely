/**
 * ConvertSafely - SubscriptionBadge Component
 * User subscription status badge with visual indicators
 */

import { clsx } from 'clsx';
import { FiStar, FiZap, FiBriefcase, FiCheck } from 'react-icons/fi';
import type { SubscriptionPlan } from '@/types';

export interface SubscriptionBadgeProps {
  /** Current subscription plan */
  plan: SubscriptionPlan;
  /** Badge size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show checkmark for active status */
  showCheckmark?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Custom className */
  className?: string;
}

/**
 * Subscription Badge Component
 * Displays user's current subscription tier with appropriate styling
 */
export function SubscriptionBadge({
  plan,
  size = 'md',
  showCheckmark = false,
  onClick,
  className,
}: SubscriptionBadgeProps) {
  const isFree = plan.id === 'free';
  const isPro = plan.id === 'pro';
  const isEnterprise = plan.id === 'enterprise';

  // Plan configuration
  const planConfig = {
    free: {
      icon: FiStar,
      label: 'Free',
      colors: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      borderColor: 'border-gray-200 dark:border-gray-700',
    },
    pro: {
      icon: FiZap,
      label: 'Pro',
      colors: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    enterprise: {
      icon: FiBriefcase,
      label: 'Enterprise',
      colors: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      borderColor: 'border-amber-200 dark:border-amber-800',
    },
  };

  const config = planConfig[plan.id];
  const Icon = config.icon;

  const sizeStyles = {
    sm: {
      container: 'px-2 py-0.5 text-xs gap-1',
      icon: 'w-3 h-3',
    },
    md: {
      container: 'px-2.5 py-1 text-sm gap-1.5',
      icon: 'w-4 h-4',
    },
    lg: {
      container: 'px-3 py-1.5 text-base gap-2',
      icon: 'w-5 h-5',
    },
  };

  const styles = sizeStyles[size];

  return (
    <span
      onClick={onClick}
      className={clsx(
        'inline-flex items-center font-medium rounded-full border transition-all duration-200',
        config.colors,
        config.borderColor,
        styles.container,
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
    >
      <Icon className={styles.icon} />
      <span>{config.label}</span>
      {showCheckmark && (
        <FiCheck className={clsx(styles.icon, 'ml-0.5')} />
      )}
    </span>
  );
}

export default SubscriptionBadge;
