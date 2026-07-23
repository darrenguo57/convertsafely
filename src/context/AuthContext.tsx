/**
 * ConvertSafely - Auth Context
 * 全局认证状态管理，使用 React Context 共享认证状态
 * 支持 Firebase Auth 真实登录和 localStorage mock 回退
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { User } from 'firebase/auth';
import {
  initializeFirebase,
  isFirebaseInitialized,
  onAuthChange,
  signInWithGoogle as firebaseSignInWithGoogle,
  signInWithEmail,
  registerWithEmail,
  signOutUser,
  resetPassword as firebaseResetPassword,
} from '@/services/firebase';

/**
 * 认证状态接口
 */
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

/**
 * 认证操作接口
 */
interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'convertsafely-user';

/**
 * Auth Provider 组件
 * 在应用根节点包裹此 Provider，所有子组件共享同一份认证状态
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const firebaseReady = useRef(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initAuth = () => {
      // 尝试初始化 Firebase
      const initialized = initializeFirebase();

      if (initialized && isFirebaseInitialized()) {
        // Firebase 可用：使用 onAuthStateChanged 作为唯一认证状态来源
        firebaseReady.current = true;
        unsubscribe = onAuthChange((user) => {
          if (user) {
            // 同步到 localStorage 供非 Firebase 路径使用
            const userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
          setState({
            user,
            isLoading: false,
            isAuthenticated: !!user,
            error: null,
          });
        });
      } else {
        // Firebase 不可用：回退到 localStorage mock 模式
        firebaseReady.current = false;
        try {
          const storedUser = localStorage.getItem(STORAGE_KEY);
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setState({
              user: userData as User,
              isLoading: false,
              isAuthenticated: true,
              error: null,
            });
          } else {
            setState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
              error: null,
            });
          }
        } catch {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
        }
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  /**
   * 邮箱密码登录
   */
  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (firebaseReady.current) {
        await signInWithEmail(email, password);
        // onAuthStateChanged 会自动更新状态，无需手动 setState
      } else {
        // Mock 模式
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockUser = {
          uid: 'user-' + Date.now(),
          email,
          displayName: email.split('@')[0],
          photoURL: null,
        } as User;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        setState({
          user: mockUser,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Login failed'),
      }));
      throw error;
    }
  }, []);

  /**
   * Google 登录
   */
  const loginWithGoogle = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (firebaseReady.current) {
        await firebaseSignInWithGoogle();
        // onAuthStateChanged 会自动更新状态
      } else {
        // Mock 模式
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockUser = {
          uid: 'google-' + Date.now(),
          email: 'user@gmail.com',
          displayName: 'Google User',
          photoURL: null,
        } as User;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        setState({
          user: mockUser,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Google login failed'),
      }));
      throw error;
    }
  }, []);

  /**
   * 用户注册
   */
  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (firebaseReady.current) {
        await registerWithEmail(email, password, displayName);
        // onAuthStateChanged 会自动更新状态
      } else {
        // Mock 模式
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockUser = {
          uid: 'user-' + Date.now(),
          email,
          displayName: displayName || email.split('@')[0],
          photoURL: null,
        } as User;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        setState({
          user: mockUser,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Registration failed'),
      }));
      throw error;
    }
  }, []);

  /**
   * 用户登出
   */
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      if (firebaseReady.current) {
        await signOutUser();
        // onAuthStateChanged 会自动更新状态
      } else {
        // Mock 模式
        localStorage.removeItem(STORAGE_KEY);
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Logout failed'),
      }));
    }
  }, []);

  /**
   * 重置密码
   */
  const resetPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (firebaseReady.current) {
        await firebaseResetPassword(email);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Password reset failed'),
      }));
      throw error;
    }
  }, []);

  /**
   * 清除错误状态
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * 使用认证的 Hook
 * 必须在 AuthProvider 内部使用
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
