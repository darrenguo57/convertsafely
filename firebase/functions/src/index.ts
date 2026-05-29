/**
 * ConvertSafely - Firebase Cloud Functions
 * Server-side functions for Stripe integration and webhook handling
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize CORS
const corsHandler = cors({ origin: true });

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Price IDs from environment
const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
};

// ==================== Helper Functions ====================

/**
 * Get or create Stripe customer for user
 */
async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  const userRef = admin.firestore().collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (userDoc.exists && userDoc.data()?.stripeCustomerId) {
    return userDoc.data()!.stripeCustomerId;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      firebaseUID: userId,
    },
  });

  await userRef.update({
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

// ==================== Cloud Functions ====================

/**
 * Create Stripe Checkout Session
 * POST /createCheckoutSession
 */
export const createCheckoutSession = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { priceId, customerEmail, successUrl, cancelUrl, userId } = req.body;

      if (!priceId || !successUrl || !cancelUrl) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      let customerId: string | undefined;

      if (userId) {
        customerId = await getOrCreateCustomer(userId, customerEmail);
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : customerEmail,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId || '',
        },
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });
});

/**
 * Create Stripe Billing Portal Session
 * POST /createBillingPortalSession
 */
export const createBillingPortalSession = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { customerId, returnUrl } = req.body;

      if (!customerId || !returnUrl) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      res.status(500).json({ error: 'Failed to create billing portal session' });
    }
  });
});

/**
 * Get Subscription Status
 * GET /subscriptionStatus
 */
export const getSubscriptionStatus = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'GET') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const subscriptionId = req.query.subscriptionId as string;

      if (!subscriptionId) {
        res.status(400).json({ error: 'Missing subscription ID' });
        return;
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      res.json({
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    } catch (error) {
      console.error('Error getting subscription status:', error);
      res.status(500).json({ error: 'Failed to get subscription status' });
    }
  });
});

/**
 * Cancel Subscription
 * POST /cancelSubscription
 */
export const cancelSubscription = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { subscriptionId } = req.body;

      if (!subscriptionId) {
        res.status(400).json({ error: 'Missing subscription ID' });
        return;
      }

      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      res.json({
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  });
});

/**
 * Reactivate Subscription
 * POST /reactivateSubscription
 */
export const reactivateSubscription = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { subscriptionId } = req.body;

      if (!subscriptionId) {
        res.status(400).json({ error: 'Missing subscription ID' });
        return;
      }

      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      res.json({
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      res.status(500).json({ error: 'Failed to reactivate subscription' });
    }
  });
});

/**
 * Get Checkout Session
 * GET /checkoutSession
 */
export const getCheckoutSession = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'GET') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const sessionId = req.query.sessionId as string;

      if (!sessionId) {
        res.status(400).json({ error: 'Missing session ID' });
        return;
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      res.json({
        id: session.id,
        customer: session.customer,
        subscription: session.subscription,
        metadata: session.metadata,
      });
    } catch (error) {
      console.error('Error getting checkout session:', error);
      res.status(500).json({ error: 'Failed to get checkout session' });
    }
  });
});

// ==================== Firestore Triggers ====================

/**
 * Update user subscription on successful payment
 * Triggered by Stripe webhook
 */
export const handleStripeWebhook = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      res.status(400).send(`Webhook Error: ${(err as Error).message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0].price.id;

          let plan: 'pro' | 'enterprise' = 'pro';
          if (priceId === PRICE_IDS.enterprise) {
            plan = 'enterprise';
          }

          await admin.firestore().collection('users').doc(userId).update({
            subscriptionPlan: plan,
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID and downgrade to free
        const usersSnapshot = await admin
          .firestore()
          .collection('users')
          .where('stripeCustomerId', '==', customerId)
          .get();

        usersSnapshot.forEach(async (doc) => {
          await doc.ref.update({
            subscriptionPlan: 'free',
            stripeSubscriptionId: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  });
});

/**
 * Reset daily usage at midnight
 * Scheduled function
 */
export const resetDailyUsage = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    const usersSnapshot = await admin.firestore().collection('users').get();

    const batch = admin.firestore().batch();
    const today = new Date().toDateString();

    usersSnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        dailyUsage: 0,
        lastUsageDate: today,
      });
    });

    await batch.commit();
    console.log('Daily usage reset completed');
  });
