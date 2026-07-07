/**
 * ConvertSafely - useSubscription Hook
 * 提供订阅状态管理和限制验证
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SUBSCRIPTION_LIMITS } from '@/utils/constants';
import type { SubscriptionPlan } from '@/types';
import { SUBSCRIPTION_PLANS } from '@/types';

/**
 * 订阅状态接口
 */
interface SubscriptionState {
  plan: SubscriptionPlan;
  dailyUsage: number;
  lastUsageDate: string;
  isLoading: boolean;
}

/**
 * 订阅限制信息
 */
interface SubscriptionLimits {
  maxFileSize: number;
  maxFileSizeMB: number;
  dailyConversions: number;
  batchSize: number;
  hasAds: boolean;
  remainingConversions: number;
  canConvert: boolean;
}

/**
 * 使用订阅的 Hook
 * 管理用户的订阅状态、每日使用量和限制验证
 */
export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    plan: SUBSCRIPTION_PLANS[0], // 默认 Free 计划
    dailyUsage: 0,
    lastUsageDate: new Date().toDateString(),
    isLoading: true,
  });

  // 从本地存储加载订阅状态
  useEffect(() => {
    const loadSubscription = () => {
      try {
        const stored = localStorage.getItem('convertsafely-subscription');
        if (stored) {
          const data = JSON.parse(stored);
          const today = new Date().toDateString();
          
          // 检查是否需要重置每日使用量
          if (data.lastUsageDate !== today) {
            data.dailyUsage = 0;
            data.lastUsageDate = today;
          }
          
          setState({
            ...data,
            isLoading: false,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to load subscription:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadSubscription();
  }, []);

  // 保存订阅状态到本地存储
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem('convertsafely-subscription', JSON.stringify({
        plan: state.plan,
        dailyUsage: state.dailyUsage,
        lastUsageDate: state.lastUsageDate,
      }));
    }
  }, [state.plan, state.dailyUsage, state.lastUsageDate, state.isLoading]);

  /**
   * 计算订阅限制信息
   */
  const limits: SubscriptionLimits = useMemo(() => {
    const planLimits = SUBSCRIPTION_LIMITS[state.plan.id];
    const remainingConversions = planLimits.dailyConversions === -1
      ? Infinity
      : Math.max(0, planLimits.dailyConversions - state.dailyUsage);
    
    return {
      ...planLimits,
      remainingConversions,
      canConvert: remainingConversions > 0,
    };
  }, [state.plan, state.dailyUsage]);

  /**
   * 增加每日使用量
   */
  const incrementUsage = useCallback(() => {
    setState((prev) => {
      const today = new Date().toDateString();
      
      // 如果是新的一天，重置计数
      if (prev.lastUsageDate !== today) {
        return {
          ...prev,
          dailyUsage: 1,
          lastUsageDate: today,
        };
      }
      
      return {
        ...prev,
        dailyUsage: prev.dailyUsage + 1,
      };
    });
  }, []);

  /**
   * 设置订阅计划
   */
  const setPlan = useCallback((plan: SubscriptionPlan) => {
    setState((prev) => ({
      ...prev,
      plan,
    }));
  }, []);

  /**
   * 升级到指定计划
   */
  const upgradePlan = useCallback(async (planId: 'pro' | 'enterprise') => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan) throw new Error('Invalid plan');
    
    // 这里应该调用 Stripe 支付 API
    // 模拟支付流程
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setPlan(plan);
  }, [setPlan]);

  /**
   * 检查是否可以执行转换
   */
  const canPerformConversion = useCallback((fileCount: number = 1): boolean => {
    // 检查每日限制
    if (!limits.canConvert) return false;
    
    // 检查批量限制
    if (fileCount > limits.batchSize) return false;
    
    return true;
  }, [limits]);

  /**
   * 验证文件大小
   */
  const validateFileSize = useCallback((fileSize: number): boolean => {
    return fileSize <= limits.maxFileSize;
  }, [limits.maxFileSize]);

  /**
   * 获取验证错误信息
   */
  const getValidationError = useCallback((fileCount: number = 1, fileSize?: number): string | null => {
    if (!limits.canConvert) {
      return 'Daily conversion limit reached. Please upgrade your subscription plan';
    }
    
    if (fileCount > limits.batchSize) {
      return `Batch conversion supports up to ${limits.batchSize} files`;
    }
    
    if (fileSize && fileSize > limits.maxFileSize) {
      return `File size exceeds limit (${limits.maxFileSizeMB}MB)`;
    }
    
    return null;
  }, [limits]);

  /**
   * 重置每日使用量（用于测试）
   */
  const resetDailyUsage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      dailyUsage: 0,
      lastUsageDate: new Date().toDateString(),
    }));
  }, []);

  /**
   * 检查是否为高级用户
   */
  const isPremium = useMemo(() => {
    return state.plan.id !== 'free';
  }, [state.plan]);

  /**
   * 检查是否为企业用户
   */
  const isEnterprise = useMemo(() => {
    return state.plan.id === 'enterprise';
  }, [state.plan]);

  return {
    // 状态
    plan: state.plan,
    dailyUsage: state.dailyUsage,
    isLoading: state.isLoading,
    
    // 限制信息
    limits,
    
    // 计算属性
    isPremium,
    isEnterprise,
    
    // 操作方法
    incrementUsage,
    setPlan,
    upgradePlan,
    resetDailyUsage,
    
    // 验证方法
    canPerformConversion,
    validateFileSize,
    getValidationError,
  };
}

export default useSubscription;
