/**
 * ConvertSafely - PDF Generator
 * PDF 生成功能 - 将图片转换为 PDF
 */

import { PDFDocument } from 'pdf-lib';
import type { ConversionFile, ConversionResult } from '@/types';
import { generateOutputFileName } from '@/utils/formatUtils';
import { CONVERSION_TIMEOUTS, ERROR_MESSAGES } from '@/utils/constants';
import {
  savePDFToBlob,
  validateImageForPDF,
  readFileAsArrayBuffer,
  embedImageInPDF,
} from './pdfUtils';

/**
 * 页面尺寸
 */
export type PageSize = 'original' | 'a4' | 'letter' | 'fit';

/**
 * 页面方向
 */
export type PageOrientation = 'portrait' | 'landscape';

/**
 * 图片位置
 */
export type ImagePosition = 'center' | 'top-left' | 'stretch';

/**
 * PDF 生成选项
 */
export interface PDFGenerationOptions {
  /** 页面尺寸 */
  pageSize: PageSize;
  /** 页面方向 */
  orientation?: PageOrientation;
  /** 图片位置 */
  imagePosition?: ImagePosition;
  /** 页边距 */
  margin?: number;
  /** 输出文件名 */
  outputName?: string;
  /** 是否每张图片一页 */
  oneImagePerPage?: boolean;
  /** 图片质量 */
  imageQuality?: 'low' | 'medium' | 'high';
}

/**
 * 页面尺寸定义 (点，1/72 英寸)
 */
const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

/**
 * 验证图片文件列表
 */
export function validateImageFiles(files: ConversionFile[]): { valid: boolean; error?: string } {
  if (files.length === 0) {
    return { valid: false, error: '请至少选择一张图片' };
  }
  
  for (const file of files) {
    const validation = validateImageForPDF(file.file);
    if (!validation.valid) {
      return { valid: false, error: `${file.name}: ${validation.error}` };
    }
  }
  
  return { valid: true };
}

/**
 * 获取图片类型
 */
function getImageType(file: File): 'png' | 'jpg' | 'jpeg' | null {
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') return 'jpg';
  if (file.type === 'image/webp') return 'jpg'; // WebP 会转换为 JPEG
  if (file.type === 'image/gif') return 'png'; // GIF 会转换为 PNG
  if (file.type === 'image/bmp') return 'png'; // BMP 会转换为 PNG
  return null;
}

/**
 * 将 WebP/GIF/BMP 转换为 JPEG/PNG ArrayBuffer
 */
async function convertImageToCompatibleFormat(
  file: File,
  targetFormat: 'jpeg' | 'png' = 'jpeg'
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to create canvas context'));
        return;
      }
      
      // 填充白色背景（对于 JPEG）
      if (targetFormat === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);
      
      const mimeType = targetFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
      const quality = targetFormat === 'jpeg' ? 0.9 : undefined;
      
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            blob.arrayBuffer().then(resolve).catch(reject);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        },
        mimeType,
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * 获取图片尺寸
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * 计算页面尺寸
 */
function calculatePageSize(
  imageWidth: number,
  imageHeight: number,
  pageSize: PageSize,
  orientation: PageOrientation,
  margin: number
): { width: number; height: number } {
  if (pageSize === 'original') {
    // 使用图片原始尺寸（转换为点）
    const dpi = 72;
    return {
      width: (imageWidth / dpi) * 72 + margin * 2,
      height: (imageHeight / dpi) * 72 + margin * 2,
    };
  }
  
  if (pageSize === 'fit') {
    // 根据图片方向自动调整
    const isLandscape = imageWidth > imageHeight;
    const size = isLandscape ? 
      { width: PAGE_SIZES.a4.height, height: PAGE_SIZES.a4.width } :
      PAGE_SIZES.a4;
    return orientation === 'landscape' ? 
      { width: size.height, height: size.width } : size;
  }
  
  const size = PAGE_SIZES[pageSize];
  if (orientation === 'landscape') {
    return { width: size.height, height: size.width };
  }
  return size;
}

/**
 * 计算图片在页面上的位置和大小
 */
function calculateImagePlacement(
  imageWidth: number,
  imageHeight: number,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  position: ImagePosition
): { x: number; y: number; width: number; height: number } {
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;
  
  if (position === 'stretch') {
    return {
      x: margin,
      y: margin,
      width: availableWidth,
      height: availableHeight,
    };
  }
  
  // 计算缩放比例以保持宽高比
  const scaleX = availableWidth / imageWidth;
  const scaleY = availableHeight / imageHeight;
  const scale = Math.min(scaleX, scaleY, 1); // 不放大图片
  
  const scaledWidth = imageWidth * scale;
  const scaledHeight = imageHeight * scale;
  
  let x = margin;
  let y = margin;
  
  if (position === 'center') {
    x = margin + (availableWidth - scaledWidth) / 2;
    y = margin + (availableHeight - scaledHeight) / 2;
  }
  
  return { x, y, width: scaledWidth, height: scaledHeight };
}

/**
 * 将单张图片添加到 PDF
 */
async function addImageToPDF(
  pdf: PDFDocument,
  file: ConversionFile,
  options: PDFGenerationOptions,
  signal?: AbortSignal
): Promise<void> {
  if (signal?.aborted) {
    throw new Error('Generation aborted');
  }
  
  const imageType = getImageType(file.file);
  if (!imageType) {
    throw new Error(`不支持的图片格式: ${file.type}`);
  }
  
  // 读取图片数据
  let imageBytes: ArrayBuffer;
  if (file.file.type === 'image/webp' || file.file.type === 'image/gif' || file.file.type === 'image/bmp') {
    imageBytes = await convertImageToCompatibleFormat(file.file, imageType === 'png' ? 'png' : 'jpeg');
  } else {
    imageBytes = await readFileAsArrayBuffer(file.file);
  }
  
  if (signal?.aborted) {
    throw new Error('Generation aborted');
  }
  
  // 嵌入图片
  const image = await embedImageInPDF(pdf, imageBytes, imageType);
  
  // 计算页面尺寸
  const { width: imgWidth, height: imgHeight } = await getImageDimensions(file.file);
  const { width: pageWidth, height: pageHeight } = calculatePageSize(
    imgWidth,
    imgHeight,
    options.pageSize,
    options.orientation || 'portrait',
    options.margin || 0
  );
  
  // 创建页面
  const page = pdf.addPage([pageWidth, pageHeight]);
  
  // 计算图片位置
  const placement = calculateImagePlacement(
    image.width,
    image.height,
    pageWidth,
    pageHeight,
    options.margin || 0,
    options.imagePosition || 'center'
  );
  
  // 绘制图片
  page.drawImage(image, placement);
}

/**
 * 生成 PDF（从图片）
 */
export async function generatePDFFromImages(
  files: ConversionFile[],
  options: PDFGenerationOptions,
  signal?: AbortSignal,
  onProgress?: (progress: number) => void
): Promise<ConversionResult> {
  // 验证
  const validation = validateImageFiles(files);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  if (signal?.aborted) {
    throw new Error('Generation aborted');
  }
  
  onProgress?.(5);
  
  // 创建新的 PDF 文档
  const pdf = await PDFDocument.create();
  
  onProgress?.(10);
  
  // 逐个添加图片
  const progressPerImage = 80 / files.length;
  
  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) {
      throw new Error('Generation aborted');
    }
    
    await addImageToPDF(pdf, files[i], options, signal);
    onProgress?.(10 + Math.round((i + 1) * progressPerImage));
  }
  
  if (signal?.aborted) {
    throw new Error('Generation aborted');
  }
  
  onProgress?.(95);
  
  // 保存 PDF
  const blob = await savePDFToBlob(pdf);
  
  onProgress?.(100);
  
  return {
    id: files[0].id,
    originalFile: files[0],
    convertedBlob: blob,
    outputFormat: 'pdf',
    outputName: options.outputName || generateOutputFileName(files[0].name, 'pdf'),
    convertedAt: new Date(),
  };
}

/**
 * 带超时的 PDF 生成
 */
export async function generatePDFWithTimeout(
  files: ConversionFile[],
  options: PDFGenerationOptions,
  timeoutMs = CONVERSION_TIMEOUTS.pdf
): Promise<ConversionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const result = await generatePDFFromImages(files, options, controller.signal);
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
 * 批量生成 PDF（每张图片一个 PDF）
 */
export async function batchGeneratePDFs(
  files: ConversionFile[],
  options: PDFGenerationOptions,
  signal?: AbortSignal,
  onProgress?: (current: number, total: number) => void
): Promise<ConversionResult[]> {
  const results: ConversionResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) {
      throw new Error('Generation aborted');
    }
    
    const result = await generatePDFFromImages(
      [files[i]],
      { ...options, outputName: generateOutputFileName(files[i].name, 'pdf') },
      signal
    );
    
    results.push(result);
    onProgress?.(i + 1, files.length);
  }
  
  return results;
}

/**
 * 估算生成的 PDF 大小
 */
export function estimatePDFSizeFromImages(files: ConversionFile[]): number {
  // 粗略估算：图片总大小的 10% 作为 PDF 开销
  const totalImageSize = files.reduce((sum, file) => sum + file.size, 0);
  return Math.round(totalImageSize * 1.1);
}

// 导出子模块
export * from './pdfUtils';
