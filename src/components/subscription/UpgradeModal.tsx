/**
 * ConvertSafely - UpgradeModal Component
 * Modal dialog for subscription upgrade prompts
 */

import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SUBSCRIPTION_PLANS } from '@/types';
import type { SubscriptionPlan } from '@/types';
import { FiZap, FiLock, FiTrendingUp, FiX } from 'react-icons/fi';

export interface UpgradeModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Upgrade handler */
  onUpgrade?: (plan: SubscriptionPlan) => void;
  /** Current plan ID */
  currentPlan?: 'free' | 'pro' | 'enterprise';
  /** Reason for upgrade prompt */
  reason?: 'limit_reached' | 'file_size' | 'batch_size' | 'no_ads' | 'feature';
  /** Custom message */
  message?: string;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Upgrade Modal Component
 * Displays upgrade prompt with plan comparison
 */
export function UpgradeModal({
  isOpen,
  onClose,
  onUpgrade,
  currentPlan = 'free',
  reason = 'limit_reached',
  message,
  isLoading = false,
}: UpgradeModalProps) {
  const { t } = useTranslation();

  // Get upgrade options (plans better than current)
  const upgradePlans = SUBSCRIPTION_PLANS.filter((plan) => {
    if (currentPlan === 'free') return plan.id !== 'free';
    if (currentPlan === 'pro') return plan.id === 'enterprise';
    return false;
  });

  const reasonContent = {
    limit_reached: {
      icon: FiTrendingUp,
      title: '达到每日限制',
      description: '您已达到今日免费转换次数上限。升级到 Pro 获得更多转换次数。',
    },
    file_size: {
      icon: FiLock,
      title: '文件大小限制',
      description: '当前计划不支持此文件大小。升级到 Pro 可处理更大的文件。',
    },
    batch_size: {
      icon: FiZap,
      title: '批量转换限制',
      description: '当前计划不支持批量转换。升级到 Pro 可一次转换多个文件。',
    },
    no_ads: {
      icon: FiZap,
      title: '移除广告',
      description: '升级到 Pro 享受无广告体验，专注于您的工作。',
    },
    feature: {
      icon: FiLock,
      title: '高级功能',
      description: '此功能需要升级订阅计划才能使用。',
    },
  };

  const { icon: ReasonIcon, title, description } = reasonContent[reason];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ReasonIcon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {message || description}
          </p>
        </div>

        {/* Upgrade Options */}
        {upgradePlans.length > 0 ? (
          <div className="grid gap-4 mb-6">
            {upgradePlans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                  'relative p-5 rounded-xl border-2 cursor-pointer transition-colors',
                  'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary',
                  'bg-white dark:bg-gray-800'
                )}
                onClick={() => onUpgrade?.(plan)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={clsx(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        plan.id === 'pro'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      )}
                    >
                      {plan.id === 'pro' ? <FiZap className="w-6 h-6" /> : <FiLock className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {plan.features.dailyConversions === -1
                          ? '无限制转换'
                          : `${plan.features.dailyConversions} 次/日`}
                        {' · '}
                        {plan.features.maxFileSize / (1024 * 1024)}MB 文件
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">/月</div>
                  </div>
                </div>

                {/* Features preview */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {plan.features.noAds && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                        {t('pricing.noAds')}
                      </span>
                    )}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                      批量 {plan.features.batchSize} 个
                    </span>
                    {plan.id === 'enterprise' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                        {t('pricing.apiAccess')}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            您已使用最高级别计划
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" onClick={onClose} className="sm:flex-1">
            稍后再说
          </Button>
          {upgradePlans.length > 0 && (
            <Button
              variant="primary"
              onClick={() => onUpgrade?.(upgradePlans[0])}
              loading={isLoading}
              className="sm:flex-1"
            >
              升级到 {upgradePlans[0].name}
            </Button>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              {t('pricing.securePayment')}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {t('pricing.cancelAnytime')}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              7天退款保证
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default UpgradeModal;
