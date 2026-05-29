/**
 * Stripe Webhook Handler
 * Handles Stripe webhook events for subscription management
 */

import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Price IDs from environment
const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
};

/**
 * Handle checkout.session.completed
 * Creates or updates user subscription after successful payment
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.metadata?.userId;

  if (!userId || !session.subscription) {
    console.log('No userId or subscription in session');
    return;
  }

  try {
    // Retrieve subscription details
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    const priceId = subscription.items.data[0]?.price.id;

    // Determine plan type
    let plan: 'pro' | 'enterprise' = 'pro';
    if (priceId === PRICE_IDS.enterprise) {
      plan = 'enterprise';
    }

    // Update user document
    const userRef = admin.firestore().collection('users').doc(userId);
    await userRef.update({
      subscriptionPlan: plan,
      stripeSubscriptionId: session.subscription,
      stripeCustomerId: session.customer,
      subscriptionStatus: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log successful subscription
    console.log(`Subscription created for user ${userId}: ${plan}`);

    // Create subscription record
    await admin.firestore().collection('subscriptions').add({
      userId,
      stripeSubscriptionId: session.subscription,
      stripeCustomerId: session.customer,
      plan,
      status: subscription.status,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.updated
 * Updates subscription status when changed
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId = subscription.customer as string;

  try {
    // Find user by customer ID
    const usersSnapshot = await admin
      .firestore()
      .collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.log(`No user found for customer ${customerId}`);
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const priceId = subscription.items.data[0]?.price.id;

    // Determine plan type
    let plan: 'pro' | 'enterprise' | 'free' = 'pro';
    if (priceId === PRICE_IDS.enterprise) {
      plan = 'enterprise';
    }

    // Update user document
    await userDoc.ref.update({
      subscriptionPlan: plan,
      subscriptionStatus: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Subscription updated for user ${userDoc.id}: ${subscription.status}`);
  } catch (error) {
    console.error('Error handling subscription.updated:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted
 * Downgrades user to free plan when subscription ends
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId = subscription.customer as string;

  try {
    // Find user by customer ID
    const usersSnapshot = await admin
      .firestore()
      .collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.log(`No user found for customer ${customerId}`);
      return;
    }

    const userDoc = usersSnapshot.docs[0];

    // Downgrade to free
    await userDoc.ref.update({
      subscriptionPlan: 'free',
      stripeSubscriptionId: null,
      subscriptionStatus: 'canceled',
      cancelAtPeriodEnd: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Subscription canceled for user ${userDoc.id}`);
  } catch (error) {
    console.error('Error handling subscription.deleted:', error);
    throw error;
  }
}

/**
 * Handle invoice.payment_succeeded
 * Records successful payments
 */
export async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice
): Promise<void> {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  try {
    // Find user by customer ID
    const usersSnapshot = await admin
      .firestore()
      .collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.log(`No user found for customer ${customerId}`);
      return;
    }

    const userDoc = usersSnapshot.docs[0];

    // Record payment
    await admin.firestore().collection('payments').add({
      userId: userDoc.id,
      stripeInvoiceId: invoice.id,
      stripeSubscriptionId: subscriptionId,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Payment recorded for user ${userDoc.id}: ${invoice.amount_paid}`);
  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error);
    throw error;
  }
}

/**
 * Handle invoice.payment_failed
 * Notifies user of failed payment
 */
export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  const customerId = invoice.customer as string;

  try {
    // Find user by customer ID
    const usersSnapshot = await admin
      .firestore()
      .collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.log(`No user found for customer ${customerId}`);
      return;
    }

    const userDoc = usersSnapshot.docs[0];

    // Update user with payment failure notice
    await userDoc.ref.update({
      paymentFailedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // TODO: Send email notification to user
    console.log(`Payment failed for user ${userDoc.id}`);
  } catch (error) {
    console.error('Error handling invoice.payment_failed:', error);
    throw error;
  }
}
