/**
 * ConvertSafely - Image Utilities
 * 图片工具函数 - Canvas API 操作和格式转换
 */

import { MIME_TYPE_MAP } from '@/utils/constants';

/**
 * 图片格式类型
 */
export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'gif' | 'bmp' | 'tiff';

/**
 * 图片处理选项
 */
export interface ImageProcessingOptions {
  /** 输出格式 */
  format: ImageFormat;
  /** 质量 (0-1) */
  quality?: number;
  /** 最大宽度 */
  maxWidth?: number;
  /** 最大高度 */
  maxHeight?: number;
  /** 是否保持宽高比 */
  maintainAspectRatio?: boolean;
  /** 背景颜色 (用于透明格式转非透明) */
  backgroundColor?: string;
}

/**
 * 图片信息
 */
export interface ImageInfo {
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
}

/**
 * 读取文件为 Image 对象
 */
export function readFileAsImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * 获取图片信息
 */
export async function getImageInfo(file: File): Promise<ImageInfo> {
  const img = await readFileAsImage(file);
  
  // 检测是否有透明通道
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, 1, 1);
  
  let hasAlpha = false;
  try {
    const imageData = ctx.getImageData(0, 0, 1, 1);
    hasAlpha = imageData.data[3] < 255;
  } catch {
    hasAlpha = false;
  }
  
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    format: file.type.split('/')[1] || 'unknown',
    size: file.size,
    hasAlpha,
  };
}

/**
 * 创建 Canvas 并绘制图片
 */
export function createCanvas(
  width: number,
  height: number,
  backgroundColor?: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  if (backgroundColor) {
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas;
}

/**
 * 计算调整后的尺寸
 */
export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth?: number,
  maxHeight?: number,
  maintainAspectRatio = true
): { width: number; height: number } {
  if (!maxWidth && !maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }
  
  let width = originalWidth;
  let height = originalHeight;
  
  if (maintainAspectRatio) {
    const aspectRatio = originalWidth / originalHeight;
    
    if (maxWidth && width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (maxHeight && height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
  } else {
    width = maxWidth || originalWidth;
    height = maxHeight || originalHeight;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * 将图片绘制到 Canvas
 */
export function drawImageToCanvas(
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  options: ImageProcessingOptions
): void {
  const ctx = canvas.getContext('2d')!;
  
  const { width, height } = calculateDimensions(
    img.naturalWidth,
    img.naturalHeight,
    options.maxWidth,
    options.maxHeight,
    options.maintainAspectRatio ?? true
  );
  
  canvas.width = width;
  canvas.height = height;
  
  // 如果需要背景色（透明转非透明格式）
  if (options.backgroundColor) {
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }
  
  ctx.drawImage(img, 0, 0, width, height);
}

/**
 * Canvas 转 Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = MIME_TYPE_MAP[format] || 'image/jpeg';
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob conversion failed'));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * 转换图片格式
 */
export async function convertImageFormat(
  file: File,
  options: ImageProcessingOptions
): Promise<Blob> {
  const img = await readFileAsImage(file);
  
  // 检查是否需要白色背景（透明格式转非透明）
  const needsBackground = 
    (file.type.includes('png') || file.type.includes('webp') || file.type.includes('gif')) &&
    (options.format === 'jpeg' || options.format === 'bmp') &&
    !options.backgroundColor;
  
  const canvas = createCanvas(
    img.naturalWidth,
    img.naturalHeight,
    needsBackground ? '#FFFFFF' : options.backgroundColor
  );
  
  drawImageToCanvas(img, canvas, {
    ...options,
    backgroundColor: needsBackground ? '#FFFFFF' : options.backgroundColor,
  });
  
  const blob = await canvasToBlob(
    canvas,
    options.format,
    options.quality
  );
  
  return blob;
}

/**
 * 调整图片大小
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.8
): Promise<Blob> {
  const img = await readFileAsImage(file);
  const originalFormat = file.type.split('/')[1] as ImageFormat || 'jpeg';
  
  const canvas = createCanvas(img.naturalWidth, img.naturalHeight);
  
  drawImageToCanvas(img, canvas, {
    format: originalFormat,
    maxWidth,
    maxHeight,
    maintainAspectRatio: true,
  });
  
  return canvasToBlob(canvas, originalFormat, quality);
}

/**
 * 创建图片缩略图
 */
export async function createThumbnail(
  file: File,
  maxSize = 200
): Promise<string> {
  const img = await readFileAsImage(file);
  const canvas = createCanvas(maxSize, maxSize);
  
  const { width, height } = calculateDimensions(
    img.naturalWidth,
    img.naturalHeight,
    maxSize,
    maxSize,
    true
  );
  
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.7);
}

/**
 * 检查格式是否支持透明
 */
export function supportsAlpha(format: ImageFormat): boolean {
  return ['png', 'webp', 'gif', 'tiff'].includes(format);
}

/**
 * 获取推荐的输出格式
 */
export function getRecommendedFormat(
  inputFormat: string,
  hasAlpha: boolean
): ImageFormat {
  if (hasAlpha) {
    return 'png';
  }
  
  // 根据输入格式推荐最佳输出格式
  if (inputFormat.includes('jpeg') || inputFormat.includes('jpg')) {
    return 'jpeg';
  }
  
  if (inputFormat.includes('png')) {
    return 'png';
  }
  
  if (inputFormat.includes('webp')) {
    return 'webp';
  }
  
  return 'jpeg';
}

/**
 * 验证图片文件
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/svg+xml',
  ];
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: '不支持的图片格式' };
  }
  
  return { valid: true };
}
