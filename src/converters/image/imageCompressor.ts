/**
 * ConvertSafely - Image Compressor
 * 图片压缩逻辑 - 使用 browser-image-compression 和 Canvas API
 */

import imageCompression from 'browser-image-compression';
import type { ImageFormat } from './imageUtils';
import { convertImageFormat, resizeImage, getImageInfo } from './imageUtils';

/**
 * 压缩选项
 */
export interface CompressionOptions {
  /** 最大文件大小 (字节) */
  maxSizeMB?: number;
  /** 最大宽度或高度 */
  maxWidthOrHeight?: number;
  /** 输出格式 */
  outputFormat?: ImageFormat;
  /** 初始质量 (0-1) */
  initialQuality?: number;
  /** 是否使用 Web Worker */
  useWebWorker?: boolean;
  /** 是否保留 EXIF 数据 */
  preserveExif?: boolean;
  /** 是否始终压缩（即使文件已经很小） */
  alwaysCompress?: boolean;
}

/**
 * 压缩结果
 */
export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
  width: number;
  height: number;
}

/**
 * 默认压缩选项
 */
const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxSizeMB: Number.POSITIVE_INFINITY,
  maxWidthOrHeight: undefined as unknown as number,
  outputFormat: 'jpeg' as ImageFormat,
  initialQuality: 0.8,
  useWebWorker: true,
  preserveExif: false,
  alwaysCompress: false,
};

/**
 * 使用 browser-image-compression 压缩图片
 */
export async function compressWithLibrary(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const imageInfo = await getImageInfo(file);
  
  // 如果文件已经很小且不需要强制压缩，直接返回
  if (!opts.alwaysCompress && file.size <= opts.maxSizeMB * 1024 * 1024) {
    const blob = opts.outputFormat && opts.outputFormat !== file.type.split('/')[1]
      ? await convertImageFormat(file, { format: opts.outputFormat, quality: opts.initialQuality })
      : file;
    
    return {
      blob: blob instanceof Blob ? blob : new Blob([blob], { type: file.type }),
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1,
      format: file.type,
      width: imageInfo.width,
      height: imageInfo.height,
    };
  }
  
  const compressionOptions = {
    maxSizeMB: opts.maxSizeMB,
    maxWidthOrHeight: opts.maxWidthOrHeight,
    initialQuality: opts.initialQuality,
    useWebWorker: opts.useWebWorker,
    preserveExif: opts.preserveExif,
    fileType: opts.outputFormat ? `image/${opts.outputFormat}` : file.type,
  };
  
  const compressedFile = await imageCompression(file, compressionOptions);
  
  // 如果需要转换格式但 library 没有处理
  let finalBlob: Blob = compressedFile;
  if (opts.outputFormat && !compressedFile.type.includes(opts.outputFormat)) {
    finalBlob = await convertImageFormat(compressedFile, {
      format: opts.outputFormat,
      quality: opts.initialQuality,
    });
  }
  
  const finalInfo = await getImageInfo(new File([finalBlob], file.name, { type: finalBlob.type }));
  
  return {
    blob: finalBlob,
    originalSize: file.size,
    compressedSize: finalBlob.size,
    compressionRatio: file.size / finalBlob.size,
    format: finalBlob.type,
    width: finalInfo.width,
    height: finalInfo.height,
  };
}

/**
 * 使用 Canvas API 压缩图片（备用方案）
 */
export async function compressWithCanvas(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const imageInfo = await getImageInfo(file);
  
  // 确定目标格式
  const outputFormat = opts.outputFormat || (file.type.split('/')[1] as ImageFormat) || 'jpeg';
  
  // 如果需要调整大小
  let blob: Blob;
  if (opts.maxWidthOrHeight && 
      (imageInfo.width > opts.maxWidthOrHeight || imageInfo.height > opts.maxWidthOrHeight)) {
    blob = await resizeImage(file, opts.maxWidthOrHeight, opts.maxWidthOrHeight, opts.initialQuality);
  } else {
    // 仅调整质量
    blob = await convertImageFormat(file, {
      format: outputFormat,
      quality: opts.initialQuality,
    });
  }
  
  // 如果结果仍然太大，递归降低质量
  if (opts.maxSizeMB && opts.maxSizeMB !== Number.POSITIVE_INFINITY) {
    let quality = opts.initialQuality;
    while (blob.size > opts.maxSizeMB * 1024 * 1024 && quality > 0.1) {
      quality -= 0.1;
      blob = await convertImageFormat(file, {
        format: outputFormat,
        quality,
        maxWidth: opts.maxWidthOrHeight,
        maxHeight: opts.maxWidthOrHeight,
      });
    }
  }
  
  return {
    blob,
    originalSize: file.size,
    compressedSize: blob.size,
    compressionRatio: file.size / blob.size,
    format: `image/${outputFormat}`,
    width: imageInfo.width,
    height: imageInfo.height,
  };
}

/**
 * 智能压缩图片
 * 根据文件大小和类型选择最佳压缩策略
 */
export async function smartCompress(
  file: File,
  targetSizeMB?: number
): Promise<CompressionResult> {
  // 根据文件大小确定压缩策略
  let options: CompressionOptions = {
    useWebWorker: true,
    preserveExif: false,
  };
  
  if (targetSizeMB) {
    options.maxSizeMB = targetSizeMB;
  }
  
  // 大图片需要调整尺寸
  const imageInfo = await getImageInfo(file);
  if (imageInfo.width > 4096 || imageInfo.height > 4096) {
    options.maxWidthOrHeight = 4096;
  }
  
  // 尝试使用 library 压缩
  try {
    return await compressWithLibrary(file, options);
  } catch (error) {
    console.warn('Library compression failed, falling back to canvas:', error);
    return compressWithCanvas(file, options);
  }
}

/**
 * 批量压缩图片
 */
export async function batchCompress(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (completed: number, total: number) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      const result = await compressWithLibrary(files[i], options);
      results.push(result);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      console.error(`Failed to compress ${files[i].name}:`, error);
      // 失败时返回原始文件
      results.push({
        blob: files[i],
        originalSize: files[i].size,
        compressedSize: files[i].size,
        compressionRatio: 1,
        format: files[i].type,
        width: 0,
        height: 0,
      });
    }
  }
  
  return results;
}

/**
 * 估算压缩后的文件大小
 */
export function estimateCompressedSize(
  originalSize: number,
  quality: number,
  hasResize = false
): number {
  // 粗略估算：质量越低，文件越小；调整大小会进一步减小
  const qualityFactor = quality * 0.8 + 0.2; // 最小保留 20%
  const resizeFactor = hasResize ? 0.5 : 1;
  
  return Math.round(originalSize * qualityFactor * resizeFactor);
}

/**
 * 获取推荐的压缩设置
 */
export function getRecommendedCompression(file: File): CompressionOptions {
  const sizeMB = file.size / (1024 * 1024);
  
  if (sizeMB > 10) {
    return {
      maxSizeMB: 5,
      maxWidthOrHeight: 2048,
      initialQuality: 0.7,
    };
  }
  
  if (sizeMB > 5) {
    return {
      maxSizeMB: 3,
      maxWidthOrHeight: 2048,
      initialQuality: 0.8,
    };
  }
  
  if (sizeMB > 1) {
    return {
      maxSizeMB: 1,
      initialQuality: 0.85,
    };
  }
  
  return {
    initialQuality: 0.9,
  };
}
