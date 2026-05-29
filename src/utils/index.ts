/**
 * ConvertSafely - Utils Index
 * 工具函数统一导出
 */

// 常量
export {
  SUBSCRIPTION_LIMITS,
  SUPPORTED_FORMATS,
  QUALITY_OPTIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  ANIMATION_CONFIG,
  CONVERSION_TIMEOUTS,
  MIME_TYPE_MAP,
  formatFileSize,
  formatDuration,
} from './constants';

// 文件工具
export {
  generateId,
  readFileAsDataURL,
  readFileAsArrayBuffer,
  readFileAsText,
  getFileExtension,
  getFileNameWithoutExtension,
  detectFileCategory,
  isFileTypeSupported,
  isFileSizeValid,
  getSupportedOutputFormats,
  getMimeType,
  createDownloadLink,
  downloadFile,
  conversionFileToFile,
  validateFiles,
  compressImage,
  getImageDimensions,
  isImageFile,
  isVideoFile,
  isAudioFile,
  isPDFFile,
  revokeObjectURL,
  type FileValidationResult,
} from './fileUtils';

// 格式工具
export {
  getCategoryDisplayName,
  getFormatDisplayName,
  getFormatIcon,
  getFormatMimeType,
  getCategoryInputFormats,
  getCategoryOutputFormats,
  getQualityConfig,
  getQualityLabel,
  buildFFmpegArgs,
  isConversionSupported,
  getRecommendedOutputFormat,
  generateOutputFileName,
  parseFormatFromMimeType,
  getFormatDescription,
  type FormatCategory,
} from './formatUtils';

// 验证工具
export {
  checkDailyLimit,
  checkFileSizeLimit,
  checkBatchSizeLimit,
  shouldShowAds,
  getRemainingConversions,
  isPremiumFeature,
  isValidEmail,
  validatePasswordStrength,
  validateFileType,
  validateConversionParams,
  validateConversion,
  formatValidationError,
  getUpgradeMessage,
  shouldResetDailyUsage,
  type ValidationResult,
  type ConversionValidationContext,
} from './validationUtils';
