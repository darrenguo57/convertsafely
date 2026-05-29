/**
 * ConvertSafely - PDF Utilities
 * PDF 工具函数 - pdf-lib 封装和通用操作
 */

import { PDFDocument, PDFPage, PDFImage } from 'pdf-lib';

/**
 * PDF 操作类型
 */
export type PDFOperation = 'merge' | 'split' | 'compress' | 'convert' | 'rotate';

/**
 * PDF 页面范围
 */
export interface PageRange {
  start: number;
  end: number;
}

/**
 * PDF 处理选项
 */
export interface PDFProcessingOptions {
  operation: PDFOperation;
  pageRanges?: PageRange[];
  rotation?: 0 | 90 | 180 | 270;
  quality?: 'low' | 'medium' | 'high';
}

/**
 * PDF 信息
 */
export interface PDFInfo {
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  creationDate?: Date;
  modificationDate?: Date;
  fileSize: number;
}

/**
 * 读取文件为 ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 加载 PDF 文档
 */
export async function loadPDF(file: File | ArrayBuffer): Promise<PDFDocument> {
  const arrayBuffer = file instanceof File ? await readFileAsArrayBuffer(file) : file;
  return PDFDocument.load(arrayBuffer);
}

/**
 * 获取 PDF 信息
 */
export async function getPDFInfo(file: File): Promise<PDFInfo> {
  const pdf = await loadPDF(file);
  
  return {
    pageCount: pdf.getPageCount(),
    title: pdf.getTitle() || undefined,
    author: pdf.getAuthor() || undefined,
    subject: pdf.getSubject() || undefined,
    creator: pdf.getCreator() || undefined,
    creationDate: pdf.getCreationDate() || undefined,
    modificationDate: pdf.getModificationDate() || undefined,
    fileSize: file.size,
  };
}

/**
 * 保存 PDF 为 Blob
 */
export async function savePDFToBlob(pdf: PDFDocument): Promise<Blob> {
  const bytes = await pdf.save();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Blob([(bytes as any).buffer], { type: 'application/pdf' });
}

/**
 * 验证 PDF 文件
 */
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  if (file.type !== 'application/pdf') {
    // 尝试通过扩展名判断
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return { valid: false, error: '文件不是有效的 PDF 格式' };
    }
  }
  
  return { valid: true };
}

/**
 * 验证图片文件（用于图片转 PDF）
 */
export function validateImageForPDF(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: '不支持的图片格式，请使用 JPG、PNG、WebP、GIF 或 BMP' };
  }
  
  return { valid: true };
}

/**
 * 将图片嵌入 PDF
 */
export async function embedImageInPDF(
  pdf: PDFDocument,
  imageBytes: ArrayBuffer,
  imageType: 'png' | 'jpg' | 'jpeg'
): Promise<PDFImage> {
  if (imageType === 'png') {
    return await pdf.embedPng(imageBytes);
  }
  return await pdf.embedJpg(imageBytes);
}

/**
 * 创建包含单张图片的 PDF 页面
 */
export async function createImagePDFPage(
  pdf: PDFDocument,
  imageBytes: ArrayBuffer,
  imageType: 'png' | 'jpg' | 'jpeg'
): Promise<PDFPage> {
  const image = await embedImageInPDF(pdf, imageBytes, imageType);
  
  const page = pdf.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });
  
  return page;
}

/**
 * 复制页面到另一个 PDF
 */
export async function copyPages(
  sourcePDF: PDFDocument,
  targetPDF: PDFDocument,
  pageIndices: number[]
): Promise<void> {
  const copiedPages = await targetPDF.copyPages(sourcePDF, pageIndices);
  copiedPages.forEach(page => targetPDF.addPage(page));
}

/**
 * 解析页面范围字符串
 * 支持格式: "1-3,5,7-10"
 */
export function parsePageRanges(rangeString: string, maxPage: number): number[] {
  const pages: number[] = [];
  const parts = rangeString.split(',');
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(s => parseInt(s.trim(), 10));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(end, maxPage); i++) {
          if (!pages.includes(i)) pages.push(i);
        }
      }
    } else {
      const page = parseInt(trimmed, 10);
      if (!isNaN(page) && page >= 1 && page <= maxPage && !pages.includes(page)) {
        pages.push(page);
      }
    }
  }
  
  return pages.sort((a, b) => a - b);
}

/**
 * 格式化页面范围为字符串
 */
export function formatPageRanges(pages: number[]): string {
  if (pages.length === 0) return '';
  
  const ranges: string[] = [];
  let start = pages[0];
  let end = pages[0];
  
  for (let i = 1; i <= pages.length; i++) {
    if (i < pages.length && pages[i] === end + 1) {
      end = pages[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      if (i < pages.length) {
        start = end = pages[i];
      }
    }
  }
  
  return ranges.join(', ');
}

/**
 * 计算 PDF 压缩质量
 */
export function getCompressionQuality(quality: 'low' | 'medium' | 'high'): number {
  switch (quality) {
    case 'low':
      return 0.5;
    case 'medium':
      return 0.75;
    case 'high':
      return 0.95;
    default:
      return 0.75;
  }
}

/**
 * 旋转页面
 */
export async function rotatePDFPages(
  pdf: PDFDocument,
  rotation: 0 | 90 | 180 | 270,
  pageIndices?: number[]
): Promise<void> {
  const indices = pageIndices || Array.from({ length: pdf.getPageCount() }, (_, i) => i);
  
  indices.forEach(index => {
    if (index < pdf.getPageCount()) {
      const page = pdf.getPage(index);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      page.setRotation({ type: 'degrees', angle: rotation } as any);
    }
  });
}

/**
 * 提取页面为单独的 PDF
 */
export async function extractPages(
  sourcePDF: PDFDocument,
  pageIndices: number[]
): Promise<PDFDocument> {
  const newPDF = await PDFDocument.create();
  const copiedPages = await newPDF.copyPages(sourcePDF, pageIndices.map(i => i - 1));
  copiedPages.forEach(page => newPDF.addPage(page));
  return newPDF;
}

/**
 * 估算 PDF 文件大小
 */
export function estimatePDFSize(pageCount: number, hasImages = true): number {
  // 粗略估算：每页基础大小 + 图片额外大小
  const baseSizePerPage = 5 * 1024; // 5KB per page
  const imageOverhead = hasImages ? 50 * 1024 : 0; // 50KB if has images
  
  return pageCount * baseSizePerPage + imageOverhead;
}
