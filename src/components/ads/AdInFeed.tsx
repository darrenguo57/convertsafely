/**
 * ConvertSafely - AdInFeed Component
 * In-feed/native advertisement component for content streams
 */

import { AdSense } from './AdSense';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export interface AdInFeedProps {
  /** Position index in the feed */
  index?: number;
  /** Custom className */
  className?: string;
  /** Ad slot ID suffix */
  slotSuffix?: string;
  /** Label text */
  label?: string;
  /** Card style variant */
  variant?: 'default' | 'compact' | 'featured';
  /** Optional content to wrap around */
  children?: ReactNode;
}

/**
 * In-Feed Ad Component
 * Displays native-style ads within content feeds
 */
export function AdInFeed({
  index = 0,
  className,
  slotSuffix = 'infeed',
  label = 'Sponsored',
  variant = 'default',
  children,
}: AdInFeedProps) {
  const slot = `feed-${slotSuffix}-${index}`;

  const variantStyles = {
    default: 'p-4',
    compact: 'p-2',
    featured: 'p-6 bg-gradient-to-r from-primary/5 to-transparent',
  };

  return (
    <div
      className={clsx(
        'relative border border-gray-200 dark:border-gray-700 rounded-lg',
        'bg-white dark:bg-gray-800',
        variantStyles[variant],
        className
      )}
    >
      {/* Sponsored label */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {label}
        </span>
        <svg
          className="w-4 h-4 text-gray-300 dark:text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Ad content */}
      <AdSense
        slot={slot}
        format="rectangle"
        minWidth={300}
        minHeight={250}
      />

      {/* Optional wrapped content */}
      {children && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}

export default AdInFeed;
