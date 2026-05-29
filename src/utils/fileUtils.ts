/**
 * ConvertSafely - 文件工具函数
 * 提供文件读取、验证、处理等通用功能
 */

import { SUPPORTED_FORMATS, MIME_TYPE_MAP, formatFileSize } from './constants';
import type { ConversionFile } from '@/types';

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 读取文件为 Data URL (用于图片预览)
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
};

/**
 * 读取文件为 ArrayBuffer (用于转换处理)
 */
export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * 读取文件为 Text (用于文本文件)
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
};

/**
 * 获取文件扩展名
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

/**
 * 获取文件名（不含扩展名）
 */
export const getFileNameWithoutExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex > 0 ? filename.slice(0, lastDotIndex) : filename;
};

/**
 * 检测文件类别 (image/pdf/video/audio/document)
 */
export const detectFileCategory = (mimeType: string): string | null => {
  if (mimeType === 'application/pdf') return 'pdf';
  if (SUPPORTED_FORMATS.image.input.includes(mimeType)) return 'image';
  if (SUPPORTED_FORMATS.video.input.includes(mimeType)) return 'video';
  if (SUPPORTED_FORMATS.audio.input.includes(mimeType)) return 'audio';
  if (SUPPORTED_FORMATS.document.input.includes(mimeType)) return 'document';
  return null;
};

/**
 * 验证文件类型是否支持
 */
export const isFileTypeSupported = (file: File, category?: string): boolean => {
  if (category) {
    const formats = SUPPORTED_FORMATS[category as keyof typeof SUPPORTED_FORMATS];
    if (formats) {
      return formats.input.includes(file.type);
    }
  }
  // 检查所有类别
  return Object.values(SUPPORTED_FORMATS).some(
    (format) => format.input.includes(file.type) || file.type === 'application/pdf'
  );
};

/**
 * 验证文件大小
 */
export const isFileSizeValid = (file: File, maxSizeBytes: number): boolean => {
  return file.size <= maxSizeBytes;
};

/**
 * 获取支持的输出格式
 */
export const getSupportedOutputFormats = (category: string): readonly string[] => {
  const formats = SUPPORTED_FORMATS[category as keyof typeof SUPPORTED_FORMATS];
  return formats?.output || [];
};

/**
 * 获取文件 MIME 类型
 */
export const getMimeType = (extension: string): string => {
  return MIME_TYPE_MAP[extension.toLowerCase()] || 'application/octet-stream';
};

/**
 * 创建下载链接
 */
export const createDownloadLink = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

/**
 * 触发文件下载
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = createDownloadLink(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 将 ConversionFile 转换为 File 对象
 */
export const conversionFileToFile = (conversionFile: ConversionFile): File => {
  return conversionFile.file;
};

/**
 * 批量验证文件
 * 返回有效的文件列表和错误信息
 */
export interface FileValidationResult {
  valid: ConversionFile[];
  errors: { file: File; reason: string }[];
}

export const validateFiles = async (
  files: File[],
  options: {
    maxSizeBytes: number;
    category?: string;
    maxFiles?: number;
  }
): Promise<FileValidationResult> => {
  const result: FileValidationResult = { valid: [], errors: [] };

  for (const file of files) {
    // 检查文件数量限制
    if (options.maxFiles && result.valid.length >= options.maxFiles) {
      result.errors.push({ file, reason: `最多只能上传 ${options.maxFiles} 个文件` });
      continue;
    }

    // 检查文件大小
    if (!isFileSizeValid(file, options.maxSizeBytes)) {
      result.errors.push({
        file,
        reason: `文件大小超过限制 (${formatFileSize(options.maxSizeBytes)})`,
      });
      continue;
    }

    // 检查文件类型
    if (!isFileTypeSupported(file, options.category)) {
      result.errors.push({ file, reason: '不支持的文件类型' });
      continue;
    }

    // 创建 ConversionFile 对象
    const conversionFile: ConversionFile = {
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    };

    // 如果是图片，生成预览
    if (file.type.startsWith('image/')) {
      try {
        conversionFile.preview = await readFileAsDataURL(file);
      } catch {
        // 预览生成失败不影响文件有效性
      }
    }

    result.valid.push(conversionFile);
  }

  return result;
};

/**
 * 压缩图片文件
 */
export const compressImage = async (
  file: File,
  options: {
    maxWidthOrHeight?: number;
    quality?: number;
    maxSizeMB?: number;
  } = {}
): Promise<File> => {
  // 动态导入 browser-image-compression
  const imageCompression = await import('browser-image-compression');
  
  const defaultOptions = {
    maxWidthOrHeight: 1920,
    quality: 0.8,
    maxSizeMB: 5,
    useWebWorker: true,
    ...options,
  };

  return imageCompression.default(file, defaultOptions);
};

/**
 * 获取图片尺寸
 */
export const getImageDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('无法读取图片尺寸'));
    };
    
    img.src = url;
  });
};

/**
 * 检查文件是否为图片
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * 检查文件是否为视频
 */
export const isVideoFile = (file: File): boolean => {
  return file.type.startsWith('video/');
};

/**
 * 检查文件是否为音频
 */
export const isAudioFile = (file: File): boolean => {
  return file.type.startsWith('audio/');
};

/**
 * 检查文件是否为 PDF
 */
export const isPDFFile = (file: File): boolean => {
  return file.type === 'application/pdf';
};

/**
 * 清理对象 URL (用于释放内存)
 */
export const revokeObjectURL = (url: string | undefined): void => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
