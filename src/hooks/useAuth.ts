/**
 * ConvertSafely - useAuth Hook
 * 提供认证状态管理和用户操作
 */

import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';

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

/**
 * 使用认证的 Hook
 * 封装 Firebase Auth 操作，提供简洁的 API
 */
export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // 模拟 Firebase Auth 状态监听
  // 在实际集成 Firebase 时，这里会使用 onAuthStateChanged
  useEffect(() => {
    // 检查本地存储的认证状态（用于演示）
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem('convertsafely-user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setState({
            user: userData,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: error instanceof Error ? error : new Error('Auth check failed'),
        });
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * 邮箱密码登录
   */
  const login = useCallback(async (email: string, _password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // 模拟用户数据
      const mockUser = {
        uid: 'user-' + Date.now(),
        email,
        displayName: email.split('@')[0],
        photoURL: null,
      } as User;
      
      localStorage.setItem('convertsafely-user', JSON.stringify(mockUser));
      
      setState({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
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
      // 模拟 Google 登录
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const mockUser = {
        uid: 'google-' + Date.now(),
        email: 'user@gmail.com',
        displayName: 'Google User',
        photoURL: 'https://via.placeholder.com/100',
      } as User;
      
      localStorage.setItem('convertsafely-user', JSON.stringify(mockUser));
      
      setState({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
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
  const register = useCallback(async (email: string, _password: string, displayName?: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // 模拟注册 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const mockUser = {
        uid: 'user-' + Date.now(),
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: null,
      } as User;
      
      localStorage.setItem('convertsafely-user', JSON.stringify(mockUser));
      
      setState({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
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
      // 模拟登出 API 调用
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      localStorage.removeItem('convertsafely-user');
      
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
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
  const resetPassword = useCallback(async (_email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // 模拟密码重置 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
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

  return {
    ...state,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    clearError,
  };
}

export default useAuth;
