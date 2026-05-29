/**
 * ConvertSafely - Stripe Service
 * Stripe payment integration for subscription management
 */

import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Price IDs (should be configured in Stripe Dashboard)
const PRICE_IDS = {
  pro: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
  enterprise: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
};

// Stripe instance
let stripe: Stripe | null = null;

/**
 * Initialize Stripe
 */
export async function initializeStripe(): Promise<Stripe | null> {
  if (stripe) return stripe;

  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn('Stripe publishable key not configured');
    return null;
  }

  try {
    stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
    return stripe;
  } catch (error) {
    console.error('Stripe initialization error:', error);
    return null;
  }
}

/**
 * Get Stripe instance
 */
export function getStripe(): Stripe | null {
  return stripe;
}

/**
 * Subscription plan details for checkout
 */
export interface CheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

/**
 * Create checkout session
 * In production, this should call your backend API
 */
export async function createCheckoutSession(
  plan: 'pro' | 'enterprise',
  customerEmail?: string
): Promise<{ sessionId: string; url: string } | null> {
  const priceId = PRICE_IDS[plan];

  // Mock implementation for development
  // In production, this should make an API call to your backend
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.log('Mock checkout session for plan:', plan);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      sessionId: 'mock_session_' + Date.now(),
      url: `${window.location.origin}/pricing?success=true&plan=${plan}`,
    };
  }

  try {
    // This would be replaced with actual API call to your backend
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerEmail,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    return await response.json();
  } catch (error) {
    console.error('Create checkout session error:', error);
    throw error;
  }
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripeInstance = await initializeStripe();

  if (!stripeInstance) {
    throw new Error('Stripe not initialized');
  }

  const { error } = await stripeInstance.redirectToCheckout({ sessionId });

  if (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
}

/**
 * Create billing portal session for managing subscription
 */
export async function createBillingPortalSession(
  customerId: string
): Promise<{ url: string } | null> {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.log('Mock billing portal for customer:', customerId);
    return { url: `${window.location.origin}/dashboard` };
  }

  try {
    const response = await fetch('/api/create-billing-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/dashboard`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create billing portal session');
    }

    return await response.json();
  } catch (error) {
    console.error('Create billing portal session error:', error);
    throw error;
  }
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(
  subscriptionId: string
): Promise<{
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
} | null> {
  if (!STRIPE_PUBLISHABLE_KEY) {
    return {
      status: 'active',
      currentPeriodEnd: Date.now() / 1000 + 30 * 24 * 60 * 60,
      cancelAtPeriodEnd: false,
    };
  }

  try {
    const response = await fetch(`/api/subscription-status?subscriptionId=${subscriptionId}`);

    if (!response.ok) {
      throw new Error('Failed to get subscription status');
    }

    return await response.json();
  } catch (error) {
    console.error('Get subscription status error:', error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.log('Mock cancel subscription:', subscriptionId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return;
  }

  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }
  } catch (error) {
    console.error('Cancel subscription error:', error);
    throw error;
  }
}

/**
 * Reactivate subscription
 */
export async function reactivateSubscription(subscriptionId: string): Promise<void> {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.log('Mock reactivate subscription:', subscriptionId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return;
  }

  try {
    const response = await fetch('/api/reactivate-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to reactivate subscription');
    }
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    throw error;
  }
}

/**
 * Handle successful payment
 * Call this when user returns from successful checkout
 */
export async function handlePaymentSuccess(
  sessionId: string
): Promise<{ plan: 'pro' | 'enterprise'; customerId: string; subscriptionId: string } | null> {
  if (!STRIPE_PUBLISHABLE_KEY) {
    // Extract plan from URL params in mock mode
    const urlParams = new URLSearchParams(window.location.search);
    const plan = (urlParams.get('plan') as 'pro' | 'enterprise') || 'pro';
    return {
      plan,
      customerId: 'mock_customer_' + Date.now(),
      subscriptionId: 'mock_subscription_' + Date.now(),
    };
  }

  try {
    const response = await fetch(`/api/checkout-session?sessionId=${sessionId}`);

    if (!response.ok) {
      throw new Error('Failed to retrieve checkout session');
    }

    const session = await response.json();

    return {
      plan: session.metadata.plan as 'pro' | 'enterprise',
      customerId: session.customer,
      subscriptionId: session.subscription,
    };
  } catch (error) {
    console.error('Handle payment success error:', error);
    throw error;
  }
}

// ==================== Webhook Handling (Server-side) ====================

/**
 * Webhook event types
 */
export type StripeWebhookEvent =
  | 'checkout.session.completed'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted';

/**
 * Webhook payload structure
 */
export interface WebhookPayload {
  id: string;
  object: 'event';
  api_version: string;
  created: number;
  type: StripeWebhookEvent;
  data: {
    object: Record<string, unknown>;
  };
}

/**
 * Verify webhook signature (server-side only)
 * This function should be used in your backend
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // This is a placeholder - actual implementation requires Stripe Node.js library
  // import Stripe from 'stripe';
  // const stripe = new Stripe(secret);
  // try {
  //   stripe.webhooks.constructEvent(payload, signature, secret);
  //   return true;
  // } catch {
  //   return false;
  // }
  console.log('Webhook verification would happen here');
  return true;
}

// ==================== Exports ====================

export { PRICE_IDS };
