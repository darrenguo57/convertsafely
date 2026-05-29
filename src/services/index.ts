/**
 * ConvertSafely - Services
 * Core services for Firebase, Stripe, and Analytics integration
 */

// Firebase services
export {
  initializeFirebase,
  isFirebaseInitialized,
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
  signOutUser,
  resetPassword,
  onAuthChange,
  getCurrentUser,
  getUserData,
  updateUserSubscription,
  updateUserUsage,
  logAnalyticsEvent,
  logConversionEvent,
  type User,
  type UserData,
} from './firebase';

// Stripe services
export {
  initializeStripe,
  getStripe,
  createCheckoutSession,
  redirectToCheckout,
  createBillingPortalSession,
  getSubscriptionStatus,
  cancelSubscription,
  reactivateSubscription,
  handlePaymentSuccess,
  verifyWebhookSignature,
  PRICE_IDS,
  type CheckoutSessionRequest,
  type WebhookPayload,
  type StripeWebhookEvent,
} from './stripe';

// Analytics services
export {
  analytics,
  trackEvent,
  trackPageView,
  trackConversionFunnel,
  trackSubscriptionFunnel,
  trackError,
  setAnalyticsUser,
  useAnalytics,
  type EventParams,
  type AnalyticsEvent,
} from './analytics';
