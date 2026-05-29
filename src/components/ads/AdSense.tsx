/**
 * ConvertSafely - AdSense Component
 * Google AdSense integration with test mode support
 */

import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';

export interface AdSenseProps {
  /** Ad slot ID from Google AdSense */
  slot: string;
  /** Ad format: auto, rectangle, vertical, horizontal */
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  /** Custom ad layout key */
  layoutKey?: string;
  /** Ad container styles */
  className?: string;
  /** Enable test mode (shows placeholder) */
  testMode?: boolean;
  /** Minimum width for the ad */
  minWidth?: number;
  /** Minimum height for the ad */
  minHeight?: number;
}

/**
 * Google AdSense Ad Component
 * Renders Google AdSense ads with fallback to test mode placeholders
 */
export function AdSense({
  slot,
  format = 'auto',
  layoutKey,
  className,
  testMode = true, // Default to test mode for development
  minWidth = 300,
  minHeight = 250,
}: AdSenseProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const clientId = import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-test';

  useEffect(() => {
    // Skip if in test mode
    if (testMode) return;

    // Check if adsbygoogle is available
    const win = window as Window & { adsbygoogle?: unknown[] };
    if (typeof window === 'undefined' || !win.adsbygoogle) {
      setHasError(true);
      return;
    }

    try {
      const adsbygoogle = win.adsbygoogle;
      adsbygoogle.push({});
      setIsLoaded(true);
    } catch (error) {
      console.error('AdSense error:', error);
      setHasError(true);
    }
  }, [slot, testMode]);

  // Test mode placeholder
  if (testMode || hasError) {
    return (
      <div
        className={clsx(
          'bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600',
          'flex flex-col items-center justify-center text-center p-4',
          'transition-all duration-200',
          className
        )}
        style={{ minWidth, minHeight }}
      >
        <div className="text-gray-400 dark:text-gray-500">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
            />
          </svg>
          <p className="text-xs font-medium">Advertisement</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Slot: {slot}</p>
          {testMode && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded">
              Test Mode
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={adRef}
      className={clsx('ad-container', className)}
      style={{ minWidth, minHeight }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layoutKey && { 'data-ad-layout-key': layoutKey })}
      />
      {!isLoaded && (
        <div className="flex items-center justify-center" style={{ minWidth, minHeight }}>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-full h-full" />
        </div>
      )}
    </div>
  );
}

export default AdSense;
