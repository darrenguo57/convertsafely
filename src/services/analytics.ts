/**
 * ConvertSafely - Analytics Service
 * Analytics tracking for user behavior and conversion metrics
 */

import { logAnalyticsEvent } from './firebase';

// ==================== Event Types ====================

export type AnalyticsEvent =
  // Auth events
  | 'login'
  | 'sign_up'
  | 'logout'
  | 'password_reset'
  // Conversion events
  | 'file_upload'
  | 'file_conversion_start'
  | 'file_conversion_complete'
  | 'file_conversion_error'
  | 'file_download'
  // Subscription events
  | 'subscription_view_plans'
  | 'subscription_select_plan'
  | 'subscription_checkout_start'
  | 'subscription_checkout_complete'
  | 'subscription_checkout_cancel'
  | 'subscription_change'
  | 'subscription_cancel'
  // UI events
  | 'feature_click'
  | 'help_open'
  | 'settings_change';

// ==================== Event Parameters ====================

interface EventParams {
  // Auth
  method?: 'google' | 'email';
  // Conversion
  file_type?: 'image' | 'video' | 'audio' | 'pdf' | 'document';
  input_format?: string;
  output_format?: string;
  file_size?: number;
  conversion_duration?: number;
  error_code?: string;
  // Subscription
  plan?: 'free' | 'pro' | 'enterprise';
  previous_plan?: 'free' | 'pro' | 'enterprise';
  price?: number;
  // UI
  feature_name?: string;
  settings_key?: string;
}

// ==================== Analytics Service ====================

class AnalyticsService {
  private isEnabled: boolean = false;
  private userId: string | null = null;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substring(2, 15);
  }

  private initialize(): void {
    // Check if analytics should be enabled
    this.isEnabled =
      typeof window !== 'undefined' &&
      import.meta.env.PROD &&
      !window.location.hostname.includes('localhost');

    if (this.isEnabled) {
      this.trackSessionStart();
    }
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  /**
   * Track event
   */
  track(event: AnalyticsEvent, params?: EventParams): void {
    const eventData = {
      ...params,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      ...(this.userId && { user_id: this.userId }),
    };

    // Log to Firebase Analytics
    logAnalyticsEvent(event, eventData);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event, eventData);
    }

    // Send to custom analytics endpoint if configured
    this.sendToAnalyticsEndpoint(event, eventData);
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, pageParams?: Record<string, string>): void {
    this.track('page_view' as AnalyticsEvent, {
      feature_name: pageName,
      ...pageParams,
    });
  }

  /**
   * Track conversion funnel
   */
  trackConversionFunnel(
    step: 'upload' | 'configure' | 'convert' | 'download',
    fileType: string,
    params?: Partial<EventParams>
  ): void {
    const eventMap: Record<string, AnalyticsEvent> = {
      upload: 'file_upload',
      configure: 'file_conversion_start',
      convert: 'file_conversion_complete',
      download: 'file_download',
    };

    this.track(eventMap[step], {
      file_type: fileType as EventParams['file_type'],
      ...params,
    });
  }

  /**
   * Track subscription funnel
   */
  trackSubscriptionFunnel(
    step: 'view' | 'select' | 'checkout_start' | 'checkout_complete' | 'checkout_cancel',
    plan?: 'free' | 'pro' | 'enterprise',
    params?: Partial<EventParams>
  ): void {
    const eventMap: Record<string, AnalyticsEvent> = {
      view: 'subscription_view_plans',
      select: 'subscription_select_plan',
      checkout_start: 'subscription_checkout_start',
      checkout_complete: 'subscription_checkout_complete',
      checkout_cancel: 'subscription_checkout_cancel',
    };

    this.track(eventMap[step], {
      plan,
      ...params,
    });
  }

  /**
   * Track error
   */
  trackError(
    errorType: 'conversion' | 'upload' | 'auth' | 'payment',
    errorCode: string,
    errorMessage?: string
  ): void {
    this.track('file_conversion_error', {
      error_code: `${errorType}_${errorCode}`,
      feature_name: errorMessage,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(
    metricName: 'conversion_time' | 'upload_time' | 'download_time',
    durationMs: number,
    fileType?: string
  ): void {
    this.track('file_conversion_complete', {
      conversion_duration: Math.round(durationMs),
      file_type: fileType as EventParams['file_type'],
      feature_name: metricName,
    });
  }

  /**
   * Track session start
   */
  private trackSessionStart(): void {
    this.track('login' as AnalyticsEvent, {
      method: 'google',
    });
  }

  /**
   * Send to custom analytics endpoint
   */
  private async sendToAnalyticsEndpoint(
    event: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;

    if (!endpoint) return;

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          data,
        }),
        // Use keepalive for page unload scenarios
        keepalive: true,
      });
    } catch (error) {
      // Silently fail - analytics should not break the app
      console.debug('Analytics endpoint error:', error);
    }
  }
}

// ==================== Singleton Instance ====================

const analytics = new AnalyticsService();

// ==================== Helper Functions ====================

/**
 * Track event helper
 */
export function trackEvent(event: AnalyticsEvent, params?: EventParams): void {
  analytics.track(event, params);
}

/**
 * Track page view helper
 */
export function trackPageView(pageName: string, params?: Record<string, string>): void {
  analytics.trackPageView(pageName, params);
}

/**
 * Track conversion funnel helper
 */
export function trackConversionFunnel(
  step: 'upload' | 'configure' | 'convert' | 'download',
  fileType: string,
  params?: Partial<EventParams>
): void {
  analytics.trackConversionFunnel(step, fileType, params);
}

/**
 * Track subscription funnel helper
 */
export function trackSubscriptionFunnel(
  step: 'view' | 'select' | 'checkout_start' | 'checkout_complete' | 'checkout_cancel',
  plan?: 'free' | 'pro' | 'enterprise',
  params?: Partial<EventParams>
): void {
  analytics.trackSubscriptionFunnel(step, plan, params);
}

/**
 * Track error helper
 */
export function trackError(
  errorType: 'conversion' | 'upload' | 'auth' | 'payment',
  errorCode: string,
  errorMessage?: string
): void {
  analytics.trackError(errorType, errorCode, errorMessage);
}

/**
 * Set user ID helper
 */
export function setAnalyticsUser(userId: string | null): void {
  analytics.setUserId(userId);
}

// ==================== React Hook ====================

import { useCallback } from 'react';

/**
 * React hook for analytics
 */
export function useAnalytics() {
  const track = useCallback((event: AnalyticsEvent, params?: EventParams) => {
    analytics.track(event, params);
  }, []);

  const trackConversion = useCallback(
    (
      step: 'upload' | 'configure' | 'convert' | 'download',
      fileType: string,
      params?: Partial<EventParams>
    ) => {
      analytics.trackConversionFunnel(step, fileType, params);
    },
    []
  );

  const trackSubscription = useCallback(
    (
      step: 'view' | 'select' | 'checkout_start' | 'checkout_complete' | 'checkout_cancel',
      plan?: 'free' | 'pro' | 'enterprise',
      params?: Partial<EventParams>
    ) => {
      analytics.trackSubscriptionFunnel(step, plan, params);
    },
    []
  );

  return {
    track,
    trackConversion,
    trackSubscription,
    trackPageView: useCallback(
      (pageName: string, params?: Record<string, string>) => {
        analytics.trackPageView(pageName, params);
      },
      []
    ),
    trackError: useCallback(
      (errorType: 'conversion' | 'upload' | 'auth' | 'payment', errorCode: string, errorMessage?: string) => {
        analytics.trackError(errorType, errorCode, errorMessage);
      },
      []
    ),
  };
}

// ==================== Exports ====================

export { analytics };
export type { EventParams };
