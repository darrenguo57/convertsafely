/**
 * ConvertSafely - AdBanner Component
 * Top banner advertisement component
 */

import { AdSense } from './AdSense';
import { clsx } from 'clsx';

export interface AdBannerProps {
  /** Enable sticky positioning */
  sticky?: boolean;
  /** Custom className */
  className?: string;
  /** Ad slot ID */
  slot?: string;
}

/**
 * Top Banner Ad Component
 * Displays a leaderboard-style banner ad at the top of the page
 */
export function AdBanner({
  sticky = false,
  className,
  slot = 'banner-top',
}: AdBannerProps) {
  return (
    <div
      className={clsx(
        'w-full bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800',
        sticky && 'sticky top-0 z-40',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-center">
          <AdSense
            slot={slot}
            format="horizontal"
            minWidth={728}
            minHeight={90}
            className="max-w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default AdBanner;
