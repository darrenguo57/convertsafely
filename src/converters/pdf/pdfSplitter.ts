/**
 * ConvertSafely - PDF Splitter
 * PDF 拆分功能 - 使用 pdf-lib 拆分 PDF 文件
 */

import { PDFDocument } from 'pdf-lib';
import type { ConversionFile, ConversionResult } from '@/types';
import { CONVERSION_TIMEOUTS, ERROR_MESSAGES } from '@/utils/constants';
import {
  loadPDF,
  savePDFToBlob,
  validatePDFFile,
  parsePageRanges,
  formatPageRanges,
  extractPages,
} from './pdfUtils';

/**
 * 拆分模式
 */
export type SplitMode = 'range' | 'single' | 'extract';

/**
 * 拆分选项
 */
export interface SplitOptions {
  mode: SplitMode;
  /** 页面范围字符串，如 "1-3,5,7-10" */
  pageRanges?: string;
  /** 每几页拆分为一个文件 */
  pagesPerFile?: number;
  /** 提取特定页面 */
  specificPages?: number[];
  /** 输出文件名前缀 */
  outputPrefix?: string;
}

/**
 * 拆分结果
 */
export interface SplitResult {
  blobs: Blob[];
  fileNames: string[];
  pageCounts: number[];
  totalPages: number;
}

/**
 * 验证拆分选项
 */
export function validateSplitOptions(
  options: SplitOptions,
  totalPages: number
): { valid: boolean; error?: string } {
  if (totalPages < 2) {
    return { valid: false, error: 'PDF 文件至少需要 2 页才能拆分' };
  }
  
  switch (options.mode) {
    case 'range':
      if (!options.pageRanges || options.pageRanges.trim() === '') {
        return { valid: false, error: '请输入页面范围' };
      }
      try {
        const pages = parsePageRanges(options.pageRanges, totalPages);
        if (pages.length === 0) {
          return { valid: false, error: '无效的页面范围' };
        }
        if (pages.length >= totalPages) {
          return { valid: false, error: '拆分后至少保留一页' };
        }
      } catch {
        return { valid: false, error: '页面范围格式错误' };
      }
      break;
      
    case 'single':
      if (!options.pagesPerFile || options.pagesPerFile < 1) {
        return { valid: false, error: '每文件页数必须大于 0' };
      }
      if (options.pagesPerFile >= totalPages) {
        return { valid: false, error: '每文件页数必须小于总页数' };
      }
      break;
      
    case 'extract':
      if (!options.specificPages || options.specificPages.length === 0) {
        return { valid: false, error: '请选择要提取的页面' };
      }
      const invalidPages = options.specificPages.filter(p => p < 1 || p > totalPages);
      if (invalidPages.length > 0) {
        return { valid: false, error: `页面 ${invalidPages.join(', ')} 超出范围` };
      }
      break;
  }
  
  return { valid: true };
}

/**
 * 按范围拆分 PDF
 */
async function splitByRanges(
  pdf: PDFDocument,
  pageRanges: string,
  totalPages: number,
  outputPrefix: string
): Promise<SplitResult> {
  const pages = parsePageRanges(pageRanges, totalPages);
  const remainingPages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => !pages.includes(p));
  
  const blobs: Blob[] = [];
  const fileNames: string[] = [];
  const pageCounts: number[] = [];
  
  // 提取选中的页面
  if (pages.length > 0) {
    const extractedPDF = await extractPages(pdf, pages);
    const blob = await savePDFToBlob(extractedPDF);
    blobs.push(blob);
    fileNames.push(`${outputPrefix}_extracted_${formatPageRanges(pages)}.pdf`);
    pageCounts.push(pages.length);
  }
  
  // 剩余的页面
  if (remainingPages.length > 0) {
    const remainingPDF = await extractPages(pdf, remainingPages);
    const blob = await savePDFToBlob(remainingPDF);
    blobs.push(blob);
    fileNames.push(`${outputPrefix}_remaining_${formatPageRanges(remainingPages)}.pdf`);
    pageCounts.push(remainingPages.length);
  }
  
  return {
    blobs,
    fileNames,
    pageCounts,
    totalPages,
  };
}

/**
 * 按每 N 页拆分 PDF
 */
async function splitByPageCount(
  pdf: PDFDocument,
  pagesPerFile: number,
  totalPages: number,
  outputPrefix: string
): Promise<SplitResult> {
  const blobs: Blob[] = [];
  const fileNames: string[] = [];
  const pageCounts: number[] = [];
  
  let currentPage = 1;
  let fileIndex = 1;
  
  while (currentPage <= totalPages) {
    const endPage = Math.min(currentPage + pagesPerFile - 1, totalPages);
    const pages = Array.from({ length: endPage - currentPage + 1 }, (_, i) => currentPage + i);
    
    const splitPDF = await extractPages(pdf, pages);
    const blob = await savePDFToBlob(splitPDF);
    
    blobs.push(blob);
    fileNames.push(`${outputPrefix}_part${fileIndex}_${currentPage}-${endPage}.pdf`);
    pageCounts.push(pages.length);
    
    currentPage = endPage + 1;
    fileIndex++;
  }
  
  return {
    blobs,
    fileNames,
    pageCounts,
    totalPages,
  };
}

/**
 * 提取特定页面
 */
async function extractSpecificPages(
  pdf: PDFDocument,
  specificPages: number[],
  totalPages: number,
  outputPrefix: string
): Promise<SplitResult> {
  const blobs: Blob[] = [];
  const fileNames: string[] = [];
  const pageCounts: number[] = [];
  
  // 为每个页面创建单独的文件
  for (let i = 0; i < specificPages.length; i++) {
    const pageNum = specificPages[i];
    const singlePagePDF = await extractPages(pdf, [pageNum]);
    const blob = await savePDFToBlob(singlePagePDF);
    
    blobs.push(blob);
    fileNames.push(`${outputPrefix}_page${pageNum}.pdf`);
    pageCounts.push(1);
  }
  
  return {
    blobs,
    fileNames,
    pageCounts,
    totalPages,
  };
}

/**
 * 拆分 PDF 文件
 */
export async function splitPDF(
  file: ConversionFile,
  options: SplitOptions,
  signal?: AbortSignal,
  onProgress?: (progress: number) => void
): Promise<SplitResult> {
  // 验证文件
  const validation = validatePDFFile(file.file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  if (signal?.aborted) {
    throw new Error('Split aborted');
  }
  
  onProgress?.(10);
  
  // 加载 PDF
  const pdf = await loadPDF(file.file);
  const totalPages = pdf.getPageCount();
  
  if (signal?.aborted) {
    throw new Error('Split aborted');
  }
  
  onProgress?.(20);
  
  // 验证选项
  const optionsValidation = validateSplitOptions(options, totalPages);
  if (!optionsValidation.valid) {
    throw new Error(optionsValidation.error);
  }
  
  const outputPrefix = options.outputPrefix || 'split';
  
  onProgress?.(30);
  
  // 根据模式执行拆分
  let result: SplitResult;
  
  switch (options.mode) {
    case 'range':
      if (!options.pageRanges) throw new Error('Page ranges required');
      result = await splitByRanges(pdf, options.pageRanges, totalPages, outputPrefix);
      break;
      
    case 'single':
      if (!options.pagesPerFile) throw new Error('Pages per file required');
      result = await splitByPageCount(pdf, options.pagesPerFile, totalPages, outputPrefix);
      break;
      
    case 'extract':
      if (!options.specificPages) throw new Error('Specific pages required');
      result = await extractSpecificPages(pdf, options.specificPages, totalPages, outputPrefix);
      break;
      
    default:
      throw new Error('Invalid split mode');
  }
  
  if (signal?.aborted) {
    throw new Error('Split aborted');
  }
  
  onProgress?.(100);
  
  return result;
}

/**
 * 转换拆分结果为 ConversionResult 数组
 */
export function splitResultToConversionResults(
  result: SplitResult,
  sourceFile: ConversionFile
): ConversionResult[] {
  return result.blobs.map((blob, index) => ({
    id: `${sourceFile.id}_${index}`,
    originalFile: sourceFile,
    convertedBlob: blob,
    outputFormat: 'pdf',
    outputName: result.fileNames[index],
    convertedAt: new Date(),
  }));
}

/**
 * 带超时的 PDF 拆分
 */
export async function splitPDFWithTimeout(
  file: ConversionFile,
  options: SplitOptions,
  timeoutMs = CONVERSION_TIMEOUTS.pdf
): Promise<SplitResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const result = await splitPDF(file, options, controller.signal);
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
 * 获取页面预览（返回前几个页面的缩略图）
 */
export async function getPageThumbnails(
  file: ConversionFile,
  maxPages = 5
): Promise<{ pageNum: number; dataUrl: string }[]> {
  // 注意：pdf-lib 不直接支持渲染页面为图片
  // 这里返回一个占位符，实际实现需要使用 pdf.js 等库
  const pdf = await loadPDF(file.file);
  const totalPages = Math.min(pdf.getPageCount(), maxPages);
  
  return Array.from({ length: totalPages }, (_, i) => ({
    pageNum: i + 1,
    dataUrl: '', // 需要 pdf.js 来实现真正的缩略图
  }));
}
