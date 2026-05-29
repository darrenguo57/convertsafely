/**
 * ConvertSafely - Firebase Service
 * Firebase configuration and initialization with Auth, Firestore, and Analytics
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  type Firestore,
  type DocumentData,
} from 'firebase/firestore';
import { getAnalytics, type Analytics, logEvent } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate configuration
const isConfigValid = Object.values(firebaseConfig).every((value) => value && value !== '');

// Firebase instances
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;
let googleProvider: GoogleAuthProvider | null = null;

/**
 * Initialize Firebase services
 */
export function initializeFirebase(): boolean {
  if (!isConfigValid) {
    console.warn('Firebase configuration incomplete. Using mock mode.');
    return false;
  }

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();

    // Initialize analytics only in production and browser environment
    if (typeof window !== 'undefined' && import.meta.env.PROD) {
      analytics = getAnalytics(app);
    }

    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return false;
  }
}

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized(): boolean {
  return app !== null;
}

// ==================== Auth Services ====================

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User | null> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase not initialized');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserDocument(result.user);
    logAnalyticsEvent('login', { method: 'google' });
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  if (!auth) {
    throw new Error('Firebase not initialized');
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    logAnalyticsEvent('login', { method: 'email' });
    return result.user;
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw error;
  }
}

/**
 * Register with email and password
 */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<User | null> {
  if (!auth) {
    throw new Error('Firebase not initialized');
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(result.user, { displayName });
    }

    await createUserDocument(result.user, { displayName });
    logAnalyticsEvent('sign_up', { method: 'email' });
    return result.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  if (!auth) {
    throw new Error('Firebase not initialized');
  }

  try {
    await signOut(auth);
    logAnalyticsEvent('logout');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase not initialized');
  }

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    console.warn('Firebase not initialized, returning no-op');
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth?.currentUser || null;
}

// ==================== Firestore Services ====================

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  subscriptionPlan?: 'free' | 'pro' | 'enterprise';
  dailyUsage?: number;
  lastUsageDate?: string;
  createdAt?: ReturnType<typeof serverTimestamp>;
  updatedAt?: ReturnType<typeof serverTimestamp>;
}

/**
 * Create or update user document in Firestore
 */
async function createUserDocument(user: User, additionalData?: Partial<UserData>): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData?.displayName || null,
      photoURL: user.photoURL,
      subscriptionPlan: 'free',
      dailyUsage: 0,
      lastUsageDate: new Date().toDateString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...additionalData,
    };

    await setDoc(userRef, userData);
  } else {
    await updateDoc(userRef, {
      updatedAt: serverTimestamp(),
      ...additionalData,
    });
  }
}

/**
 * Get user data from Firestore
 */
export async function getUserData(uid: string): Promise<UserData | null> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Get user data error:', error);
    throw error;
  }
}

/**
 * Update user subscription plan
 */
export async function updateUserSubscription(
  uid: string,
  plan: 'free' | 'pro' | 'enterprise'
): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      subscriptionPlan: plan,
      updatedAt: serverTimestamp(),
    });
    logAnalyticsEvent('subscription_change', { plan });
  } catch (error) {
    console.error('Update subscription error:', error);
    throw error;
  }
}

/**
 * Update user daily usage
 */
export async function updateUserUsage(uid: string, usage: number, date: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      dailyUsage: usage,
      lastUsageDate: date,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update usage error:', error);
    throw error;
  }
}

// ==================== Analytics Services ====================

/**
 * Log analytics event
 */
export function logAnalyticsEvent(eventName: string, eventParams?: Record<string, unknown>): void {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
}

/**
 * Log conversion event
 */
export function logConversionEvent(
  fileType: string,
  inputFormat: string,
  outputFormat: string,
  fileSize: number
): void {
  logAnalyticsEvent('file_conversion', {
    file_type: fileType,
    input_format: inputFormat,
    output_format: outputFormat,
    file_size: fileSize,
  });
}

// ==================== Exports ====================

export { app, auth, db, analytics, googleProvider };
export type { User, UserData };
