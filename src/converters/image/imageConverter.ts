/**
 * ConvertSafely - Image Converter
 * 图片转换器 - 主入口，整合所有图片转换功能
 */

import type { ConversionFile, ConversionResult } from '@/types';
import { generateOutputFileName } from '@/utils/formatUtils';
import { CONVERSION_TIMEOUTS, ERROR_MESSAGES } from '@/utils/constants';
import type { ImageFormat, ImageProcessingOptions } from './imageUtils';
import { convertImageFormat, validateImageFile } from './imageUtils';
import type { CompressionOptions } from './imageCompressor';
import { compressWithLibrary } from './imageCompressor';

/**
 * 图片转换选项
 */
export interface ImageConversionOptions {
  /** 输出格式 */
  outputFormat: ImageFormat;
  /** 质量 (0-1) */
  quality?: number;
  /** 最大宽度 */
  maxWidth?: number;
  /** 最大高度 */
  maxHeight?: number;
  /** 是否压缩 */
  compress?: boolean;
  /** 压缩选项 */
  compressionOptions?: CompressionOptions;
  /** 是否保留元数据 */
  preserveMetadata?: boolean;
}

/**
 * 默认转换选项
 */
const DEFAULT_OPTIONS: Partial<ImageConversionOptions> = {
  quality: 0.8,
  compress: true,
  preserveMetadata: false,
};

/**
 * 支持的图片格式
 */
export const SUPPORTED_IMAGE_FORMATS: { value: ImageFormat; label: string; mime: string }[] = [
  { value: 'jpeg', label: 'JPEG', mime: 'image/jpeg' },
  { value: 'png', label: 'PNG', mime: 'image/png' },
  { value: 'webp', label: 'WebP', mime: 'image/webp' },
  { value: 'gif', label: 'GIF', mime: 'image/gif' },
  { value: 'bmp', label: 'BMP', mime: 'image/bmp' },
  { value: 'tiff', label: 'TIFF', mime: 'image/tiff' },
];

/**
 * 获取格式的 MIME 类型
 */
export function getImageMimeType(format: ImageFormat): string {
  const formatInfo = SUPPORTED_IMAGE_FORMATS.find(f => f.value === format);
  return formatInfo?.mime || 'image/jpeg';
}

/**
 * 验证文件是否可以转换
 */
export function validateConversion(
  file: ConversionFile,
  targetFormat: ImageFormat
): { valid: boolean; error?: string } {
  // 验证文件类型
  const typeValidation = validateImageFile(file.file);
  if (!typeValidation.valid) {
    return typeValidation;
  }
  
  // 检查是否是相同格式
  const currentFormat = file.type.split('/')[1];
  if (currentFormat === targetFormat) {
    return { valid: false, error: '源文件和目标格式相同' };
  }
  
  return { valid: true };
}

/**
 * 转换单个图片文件
 */
export async function convertSingleImage(
  file: ConversionFile,
  options: ImageConversionOptions,
  signal?: AbortSignal,
  onProgress?: (progress: number) => void
): Promise<ConversionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // 验证
  const validation = validateConversion(file, opts.outputFormat);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  if (signal?.aborted) {
    throw new Error('Conversion aborted');
  }
  
  onProgress?.(10);
  
  if (signal?.aborted) {
    throw new Error('Conversion aborted');
  }
  
  onProgress?.(30);
  
  let blob: Blob;
  
  // 如果只需要压缩而不改变格式，使用 browser-image-compression
  if (opts.compress && !opts.outputFormat) {
    const compressionOpts: CompressionOptions = {
      maxSizeMB: opts.compressionOptions?.maxSizeMB || Number.POSITIVE_INFINITY,
      maxWidthOrHeight: opts.maxWidth || opts.maxHeight || opts.compressionOptions?.maxWidthOrHeight,
      initialQuality: opts.quality,
      useWebWorker: true,
      preserveExif: opts.preserveMetadata,
    };
    
    const result = await compressWithLibrary(file.file, compressionOpts);
    blob = result.blob;
  } else {
    // 格式转换
    const processingOpts: ImageProcessingOptions = {
      format: opts.outputFormat,
      quality: opts.quality,
      maxWidth: opts.maxWidth,
      maxHeight: opts.maxHeight,
      maintainAspectRatio: true,
    };
    
    // 如果需要压缩，先压缩再转换
    if (opts.compress) {
      const compressionOpts: CompressionOptions = {
        maxWidthOrHeight: opts.maxWidth || opts.maxHeight || 4096,
        initialQuality: opts.quality,
        useWebWorker: true,
        preserveExif: opts.preserveMetadata,
        outputFormat: opts.outputFormat,
      };
      
      try {
        const result = await compressWithLibrary(file.file, compressionOpts);
        blob = result.blob;
      } catch {
        // 如果压缩失败，直接转换
        blob = await convertImageFormat(file.file, processingOpts);
      }
    } else {
      blob = await convertImageFormat(file.file, processingOpts);
    }
  }
  
  if (signal?.aborted) {
    throw new Error('Conversion aborted');
  }
  
  onProgress?.(100);
  
  return {
    id: file.id,
    originalFile: file,
    convertedBlob: blob,
    outputFormat: opts.outputFormat,
    outputName: generateOutputFileName(file.name, opts.outputFormat),
    convertedAt: new Date(),
  };
}

/**
 * 批量转换图片
 */
export async function batchConvertImages(
  files: ConversionFile[],
  options: ImageConversionOptions,
  signal?: AbortSignal,
  onProgress?: (currentFile: number, totalFiles: number, fileProgress: number) => void
): Promise<ConversionResult[]> {
  const results: ConversionResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) {
      throw new Error('Conversion aborted');
    }
    
    const result = await convertSingleImage(
      files[i],
      options,
      signal,
      (progress) => onProgress?.(i + 1, files.length, progress)
    );
    
    results.push(result);
  }
  
  return results;
}

/**
 * 带超时的图片转换
 */
export async function convertImageWithTimeout(
  file: ConversionFile,
  options: ImageConversionOptions,
  timeoutMs = CONVERSION_TIMEOUTS.image
): Promise<ConversionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const result = await convertSingleImage(file, options, controller.signal);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(ERROR_MESSAGES.CONVERSION_TIMEOUT);
    }
    throw error;
  }
}

/**
 * 获取图片转换预览
 */
export async function getConversionPreview(
  file: ConversionFile,
  options: ImageConversionOptions
): Promise<{ url: string; estimatedSize: number }> {
  const result = await convertSingleImage(file, { ...options, quality: 0.5 });
  const url = URL.createObjectURL(result.convertedBlob);
  
  // 估算最终大小
  const qualityRatio = (options.quality || 0.8) / 0.5;
  const estimatedSize = result.convertedBlob.size * qualityRatio;
  
  return { url, estimatedSize };
}

/**
 * 检查格式是否支持动画
 */
export function supportsAnimation(format: ImageFormat): boolean {
  return format === 'gif' || format === 'webp';
}

/**
 * 检查是否需要警告质量损失
 */
export function shouldWarnQualityLoss(
  sourceFormat: string,
  targetFormat: ImageFormat
): boolean {
  // 无损格式转有损格式
  const losslessFormats = ['png', 'tiff', 'bmp'];
  const lossyFormats = ['jpeg', 'webp'];
  
  const sourceExt = sourceFormat.split('/')[1];
  
  if (losslessFormats.includes(sourceExt) && lossyFormats.includes(targetFormat)) {
    return true;
  }
  
  return false;
}

// 导出子模块
export * from './imageUtils';
export * from './imageCompressor';
