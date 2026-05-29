/**
 * ConvertSafely - 验证工具函数
 * 提供各种验证功能，包括订阅限制验证、文件验证等
 */

import { SUBSCRIPTION_LIMITS, ERROR_MESSAGES } from './constants';
import type { SubscriptionPlan } from '@/types';

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
}

/**
 * 检查用户是否达到每日转换限制
 */
export const checkDailyLimit = (
  plan: SubscriptionPlan,
  dailyUsage: number
): ValidationResult => {
  const limit = SUBSCRIPTION_LIMITS[plan.id].dailyConversions;
  
  // -1 表示无限制
  if (limit === -1) {
    return { valid: true };
  }
  
  if (dailyUsage >= limit) {
    return {
      valid: false,
      error: ERROR_MESSAGES.DAILY_LIMIT_REACHED,
      code: 'DAILY_LIMIT_EXCEEDED',
    };
  }
  
  return { valid: true };
};

/**
 * 检查文件大小是否符合订阅限制
 */
export const checkFileSizeLimit = (
  fileSize: number,
  plan: SubscriptionPlan
): ValidationResult => {
  const maxSize = SUBSCRIPTION_LIMITS[plan.id].maxFileSize;
  const maxSizeMB = SUBSCRIPTION_LIMITS[plan.id].maxFileSizeMB;
  
  if (fileSize > maxSize) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE(maxSizeMB),
      code: 'FILE_TOO_LARGE',
    };
  }
  
  return { valid: true };
};

/**
 * 检查批量上传文件数量限制
 */
export const checkBatchSizeLimit = (
  fileCount: number,
  plan: SubscriptionPlan
): ValidationResult => {
  const maxBatchSize = SUBSCRIPTION_LIMITS[plan.id].batchSize;
  
  if (fileCount > maxBatchSize) {
    return {
      valid: false,
      error: `批量转换最多支持 ${maxBatchSize} 个文件，请升级订阅计划`,
      code: 'BATCH_SIZE_EXCEEDED',
    };
  }
  
  return { valid: true };
};

/**
 * 检查用户是否需要看广告
 */
export const shouldShowAds = (plan: SubscriptionPlan): boolean => {
  return SUBSCRIPTION_LIMITS[plan.id].hasAds;
};

/**
 * 获取剩余转换次数
 */
export const getRemainingConversions = (
  plan: SubscriptionPlan,
  dailyUsage: number
): number => {
  const limit = SUBSCRIPTION_LIMITS[plan.id].dailyConversions;
  
  if (limit === -1) {
    return Infinity;
  }
  
  return Math.max(0, limit - dailyUsage);
};

/**
 * 检查是否为高级功能
 */
export const isPremiumFeature = (feature: string): boolean => {
  const premiumFeatures = [
    'batch-conversion',
    'high-quality',
    'large-files',
    'no-ads',
  ];
  return premiumFeatures.includes(feature);
};

/**
 * 验证邮箱格式
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证密码强度
 * 返回密码强度评分 (0-4) 和反馈信息
 */
export const validatePasswordStrength = (
  password: string
): { score: number; feedback: string[] } => {
  const feedback: string[] = [];
  let score = 0;
  
  // 长度检查
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('密码至少需要8个字符');
  }
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('密码需要包含大写字母');
  }
  
  // 包含小写字母
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('密码需要包含小写字母');
  }
  
  // 包含数字或特殊字符
  if (/[0-9!@#$%^&*]/.test(password)) {
    score++;
  } else {
    feedback.push('密码需要包含数字或特殊字符');
  }
  
  return { score, feedback };
};

/**
 * 验证文件类型
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): ValidationResult => {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TYPE_NOT_SUPPORTED,
      code: 'UNSUPPORTED_FILE_TYPE',
    };
  }
  
  return { valid: true };
};

/**
 * 验证转换参数
 */
export const validateConversionParams = (params: {
  inputFormat: string;
  outputFormat: string;
  quality?: number;
}): ValidationResult => {
  // 检查输入和输出格式是否相同
  if (params.inputFormat === params.outputFormat) {
    return {
      valid: false,
      error: '输入和输出格式不能相同',
      code: 'SAME_FORMAT',
    };
  }
  
  // 检查质量参数范围
  if (params.quality !== undefined) {
    if (params.quality < 0 || params.quality > 100) {
      return {
        valid: false,
        error: '质量参数必须在 0-100 之间',
        code: 'INVALID_QUALITY',
      };
    }
  }
  
  return { valid: true };
};

/**
 * 综合验证 - 在转换前执行所有验证
 */
export interface ConversionValidationContext {
  files: File[];
  plan: SubscriptionPlan;
  dailyUsage: number;
  outputFormat: string;
}

export const validateConversion = (
  context: ConversionValidationContext
): ValidationResult => {
  const { files, plan, dailyUsage, outputFormat } = context;
  
  // 1. 检查每日限制
  const dailyCheck = checkDailyLimit(plan, dailyUsage);
  if (!dailyCheck.valid) return dailyCheck;
  
  // 2. 检查批量限制
  const batchCheck = checkBatchSizeLimit(files.length, plan);
  if (!batchCheck.valid) return batchCheck;
  
  // 3. 检查每个文件的大小
  for (const file of files) {
    const sizeCheck = checkFileSizeLimit(file.size, plan);
    if (!sizeCheck.valid) return sizeCheck;
  }
  
  // 4. 检查输出格式
  if (!outputFormat) {
    return {
      valid: false,
      error: '请选择输出格式',
      code: 'NO_OUTPUT_FORMAT',
    };
  }
  
  return { valid: true };
};

/**
 * 格式化验证错误信息
 */
export const formatValidationError = (result: ValidationResult): string => {
  if (result.valid) return '';
  return result.error || '验证失败';
};

/**
 * 获取升级提示信息
 */
export const getUpgradeMessage = (plan: SubscriptionPlan): string => {
  if (plan.id === 'free') {
    return '升级到 Pro 以获得更多转换次数和更大文件支持';
  }
  if (plan.id === 'pro') {
    return '升级到 Enterprise 以获得无限制转换';
  }
  return '';
};

/**
 * 检查是否需要重置每日使用计数
 */
export const shouldResetDailyUsage = (lastUsageDate: string): boolean => {
  const today = new Date().toDateString();
  return lastUsageDate !== today;
};
