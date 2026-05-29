/**
 * Subscription Management Functions
 * Cloud functions for managing user subscriptions
 */

import * as functions from 'firebase-functions';
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
 * Get user subscription details
 * Callable function to get current subscription status
 */
export const getUserSubscription = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    // Get user document
    const userDoc = await admin.firestore().collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const subscriptionId = userData?.stripeSubscriptionId;

    // If no subscription, return free plan
    if (!subscriptionId) {
      return {
        plan: 'free',
        status: 'active',
        features: {
          maxFileSize: 50 * 1024 * 1024, // 50MB
          dailyConversions: 10,
          adsEnabled: true,
          prioritySupport: false,
        },
      };
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Determine plan features
    const plan = userData?.subscriptionPlan || 'pro';
    const isEnterprise = plan === 'enterprise';

    return {
      plan,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      features: {
        maxFileSize: isEnterprise ? 500 * 1024 * 1024 : 200 * 1024 * 1024, // 500MB / 200MB
        dailyConversions: isEnterprise ? -1 : 100, // -1 = unlimited
        adsEnabled: false,
        prioritySupport: true,
        advancedFormats: true,
        batchProcessing: isEnterprise,
      },
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get subscription details');
  }
});

/**
 * Upgrade subscription
 * Callable function to upgrade user subscription
 */
export const upgradeSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { plan } = data;

  if (!plan || !['pro', 'enterprise'].includes(plan)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid plan specified');
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.stripeCustomerId) {
      throw new functions.https.HttpsError('failed-precondition', 'No Stripe customer found');
    }

    const currentSubscriptionId = userData?.stripeSubscriptionId;

    if (currentSubscriptionId) {
      // Update existing subscription
      const subscription = await stripe.subscriptions.retrieve(currentSubscriptionId);
      const currentItemId = subscription.items.data[0].id;

      await stripe.subscriptions.update(currentSubscriptionId, {
        items: [
          {
            id: currentItemId,
            price: PRICE_IDS[plan as keyof typeof PRICE_IDS],
          },
        ],
        proration_behavior: 'create_prorations',
      });
    }

    // Update user document
    await admin.firestore().collection('users').doc(userId).update({
      subscriptionPlan: plan,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, plan };
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    throw new functions.https.HttpsError('internal', 'Failed to upgrade subscription');
  }
});

/**
 * Cancel subscription
 * Callable function to cancel user subscription at period end
 */
export const cancelUserSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    const subscriptionId = userData?.stripeSubscriptionId;

    if (!subscriptionId) {
      throw new functions.https.HttpsError('failed-precondition', 'No active subscription found');
    }

    // Cancel at period end
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update user document
    await admin.firestore().collection('users').doc(userId).update({
      cancelAtPeriodEnd: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: 'Subscription will cancel at period end' };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new functions.https.HttpsError('internal', 'Failed to cancel subscription');
  }
});

/**
 * Reactivate subscription
 * Callable function to reactivate a subscription scheduled for cancellation
 */
export const reactivateUserSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    const subscriptionId = userData?.stripeSubscriptionId;

    if (!subscriptionId) {
      throw new functions.https.HttpsError('failed-precondition', 'No subscription found');
    }

    // Remove cancellation
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    // Update user document
    await admin.firestore().collection('users').doc(userId).update({
      cancelAtPeriodEnd: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: 'Subscription reactivated' };
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw new functions.https.HttpsError('internal', 'Failed to reactivate subscription');
  }
});

/**
 * Check and reset daily usage
 * Scheduled function to reset daily usage counters
 */
export const checkAndResetUsage = functions.pubsub
  .schedule('0 0 * * *') // Run at midnight UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    const batch = admin.firestore().batch();
    const today = new Date().toISOString().split('T')[0];

    // Get all users who need usage reset
    const usersSnapshot = await admin
      .firestore()
      .collection('users')
      .where('lastUsageDate', '!=', today)
      .get();

    let count = 0;
    usersSnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        dailyUsage: 0,
        lastUsageDate: today,
      });
      count++;
    });

    if (count > 0) {
      await batch.commit();
      console.log(`Reset daily usage for ${count} users`);
    }

    return null;
  });

/**
 * Increment user usage
 * Callable function to track user conversions
 */
export const incrementUsage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { fileSize } = data;

  try {
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    const today = new Date().toISOString().split('T')[0];
    const lastUsageDate = userData?.lastUsageDate;

    // Reset daily usage if it's a new day
    const shouldReset = lastUsageDate !== today;

    await userRef.update({
      dailyUsage: shouldReset ? 1 : admin.firestore.FieldValue.increment(1),
      totalConversions: admin.firestore.FieldValue.increment(1),
      lastUsageDate: today,
      totalBytesProcessed: admin.firestore.FieldValue.increment(fileSize || 0),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error incrementing usage:', error);
    throw new functions.https.HttpsError('internal', 'Failed to track usage');
  }
});

/**
 * Get usage statistics
 * Callable function to get user's usage statistics
 */
export const getUsageStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const plan = userData.subscriptionPlan || 'free';
    const isPro = plan === 'pro' || plan === 'enterprise';
    const isEnterprise = plan === 'enterprise';

    const dailyLimit = isEnterprise ? -1 : isPro ? 100 : 10;
    const dailyUsage = userData.dailyUsage || 0;

    return {
      dailyUsage,
      dailyLimit,
      remainingToday: dailyLimit === -1 ? -1 : Math.max(0, dailyLimit - dailyUsage),
      totalConversions: userData.totalConversions || 0,
      totalBytesProcessed: userData.totalBytesProcessed || 0,
      plan,
      isUnlimited: dailyLimit === -1,
    };
  } catch (error) {
    console.error('Error getting usage stats:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get usage statistics');
  }
});
