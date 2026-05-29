/**
 * ConvertSafely - 全局常量定义
 * 包含订阅限制、文件格式、错误消息等常量
 */

// ==================== 订阅计划限制 ====================
export const SUBSCRIPTION_LIMITS = {
  free: {
    dailyConversions: 3,
    maxFileSize: 2 * 1024 * 1024, // 2MB in bytes
    maxFileSizeMB: 2,
    batchSize: 1,
    hasAds: true,
  },
  pro: {
    dailyConversions: 20,
    maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
    maxFileSizeMB: 10,
    batchSize: 10,
    hasAds: false,
  },
  enterprise: {
    dailyConversions: -1, // Unlimited
    maxFileSize: 500 * 1024 * 1024, // 500MB in bytes
    maxFileSizeMB: 500,
    batchSize: 100,
    hasAds: false,
  },
} as const;

// ==================== 支持的文件格式 ====================
export const SUPPORTED_FORMATS: {
  image: { input: string[]; output: string[]; extensions: Record<string, string> };
  pdf: { input: string[]; output: string[]; extensions: Record<string, string> };
  video: { input: string[]; output: string[]; extensions: Record<string, string> };
  audio: { input: string[]; output: string[]; extensions: Record<string, string> };
  document: { input: string[]; output: string[]; extensions: Record<string, string> };
} = {
  image: {
    input: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml'],
    output: ['jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'],
    extensions: {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
      'image/svg+xml': 'svg',
    },
  },
  pdf: {
    input: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain'],
    output: ['pdf', 'jpg', 'png', 'txt'],
    extensions: {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'text/plain': 'txt',
    },
  },
  video: {
    input: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'],
    output: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'gif'],
    extensions: {
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/ogg': 'ogv',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi',
      'video/x-matroska': 'mkv',
    },
  },
  audio: {
    input: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/m4a', 'audio/webm'],
    output: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'webm'],
    extensions: {
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
      'audio/aac': 'aac',
      'audio/flac': 'flac',
      'audio/m4a': 'm4a',
      'audio/webm': 'weba',
    },
  },
  document: {
    input: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/plain',
      'text/markdown',
      'application/rtf',
    ],
    output: ['docx', 'xlsx', 'txt', 'md', 'rtf', 'pdf'],
    extensions: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-excel': 'xls',
      'text/plain': 'txt',
      'text/markdown': 'md',
      'application/rtf': 'rtf',
    },
  },
};

// ==================== 转换质量选项 ====================
export const QUALITY_OPTIONS = {
  image: {
    min: 0.1,
    max: 1.0,
    step: 0.1,
    default: 0.8,
    labels: {
      low: '低质量 (小文件)',
      medium: '中等质量',
      high: '高质量',
      maximum: '最高质量 (大文件)',
    },
  },
  video: {
    min: 1,
    max: 51,
    step: 1,
    default: 23, // CRF value for ffmpeg (lower is better quality)
    labels: {
      low: '低质量 (小文件)',
      medium: '中等质量',
      high: '高质量',
      maximum: '无损质量 (大文件)',
    },
  },
  audio: {
    min: 64,
    max: 320,
    step: 32,
    default: 192, // kbps
    labels: {
      low: '64 kbps',
      medium: '128 kbps',
      high: '192 kbps',
      maximum: '320 kbps',
    },
  },
} as const;

// ==================== 错误消息 ====================
export const ERROR_MESSAGES = {
  // 文件相关错误
  FILE_TOO_LARGE: (maxSizeMB: number) => `文件大小超过限制。最大允许 ${maxSizeMB}MB`,
  FILE_TYPE_NOT_SUPPORTED: '不支持的文件类型',
  FILE_READ_ERROR: '文件读取失败，请重试',
  FILE_CORRUPTED: '文件可能已损坏',
  
  // 订阅限制错误
  DAILY_LIMIT_REACHED: '今日转换次数已达上限，请升级订阅计划',
  UPGRADE_REQUIRED: '此功能需要升级订阅',
  
  // 转换错误
  CONVERSION_FAILED: '转换失败，请重试',
  CONVERSION_TIMEOUT: '转换超时，请尝试较小的文件',
  UNSUPPORTED_CONVERSION: '不支持的格式转换',
  
  // 网络/服务器错误
  NETWORK_ERROR: '网络错误，请检查连接',
  SERVER_ERROR: '服务器错误，请稍后重试',
  
  // 通用错误
  UNKNOWN_ERROR: '发生未知错误，请重试',
  INVALID_INPUT: '输入无效，请检查',
} as const;

// ==================== 成功消息 ====================
export const SUCCESS_MESSAGES = {
  CONVERSION_COMPLETE: '转换完成！',
  FILE_UPLOADED: '文件上传成功',
  FILE_REMOVED: '文件已移除',
  DOWNLOAD_STARTED: '下载已开始',
  SETTINGS_SAVED: '设置已保存',
} as const;

// ==================== 本地存储键名 ====================
export const STORAGE_KEYS = {
  SUBSCRIPTION: 'convertsafely-subscription',
  USER_PREFERENCES: 'convertsafely-preferences',
  CONVERSION_HISTORY: 'convertsafely-history',
  THEME: 'convertsafely-theme',
} as const;

// ==================== 动画配置 ====================
export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
  },
  ease: {
    default: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    smooth: [0.25, 0.1, 0.25, 1],
  },
} as const;

// ==================== 转换超时设置 (毫秒) ====================
export const CONVERSION_TIMEOUTS = {
  image: 30000, // 30 seconds
  pdf: 60000, // 60 seconds
  video: 300000, // 5 minutes
  audio: 120000, // 2 minutes
  document: 30000, // 30 seconds
} as const;

// ==================== MIME 类型映射 ====================
export const MIME_TYPE_MAP: Record<string, string> = {
  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
  tiff: 'image/tiff',
  svg: 'image/svg+xml',
  // Videos
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogg: 'video/ogg',
  ogv: 'video/ogg',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
  // Audio
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  aac: 'audio/aac',
  flac: 'audio/flac',
  m4a: 'audio/m4a',
  weba: 'audio/webm',
  // Documents
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  txt: 'text/plain',
  md: 'text/markdown',
  rtf: 'application/rtf',
};

// ==================== 文件大小格式化 ====================
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// ==================== 格式化工具函数 ====================
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分${Math.round(seconds % 60)}秒`;
  return `${Math.floor(seconds / 3600)}时${Math.floor((seconds % 3600) / 60)}分`;
};
