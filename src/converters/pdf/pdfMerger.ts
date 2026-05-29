/**
 * ConvertSafely - PDF Merger
 * PDF 合并功能 - 使用 pdf-lib 合并多个 PDF 文件
 */

import { PDFDocument } from 'pdf-lib';
import type { ConversionFile, ConversionResult } from '@/types';
import { CONVERSION_TIMEOUTS, ERROR_MESSAGES } from '@/utils/constants';
import {
  loadPDF,
  savePDFToBlob,
  validatePDFFile,
  getPDFInfo,
  type PDFInfo,
} from './pdfUtils';

/**
 * 合并选项
 */
export interface MergeOptions {
  /** 输出文件名 */
  outputName?: string;
  /** 是否添加书签 */
  addBookmarks?: boolean;
  /** 是否压缩 */
  compress?: boolean;
}

/**
 * 合并结果
 */
export interface MergeResult {
  blob: Blob;
  totalPages: number;
  sourceFiles: number;
  fileName: string;
}

/**
 * 带信息的 PDF 文件
 */
export interface PDFFileWithInfo extends ConversionFile {
  info: PDFInfo;
}

/**
 * 验证 PDF 文件列表
 */
export function validatePDFFiles(files: ConversionFile[]): { valid: boolean; error?: string } {
  if (files.length === 0) {
    return { valid: false, error: '请选择至少一个 PDF 文件' };
  }
  
  if (files.length === 1) {
    return { valid: false, error: '请至少选择两个 PDF 文件进行合并' };
  }
  
  for (const file of files) {
    const validation = validatePDFFile(file.file);
    if (!validation.valid) {
      return { valid: false, error: `${file.name}: ${validation.error}` };
    }
  }
  
  return { valid: true };
}

/**
 * 获取 PDF 文件信息
 */
export async function getPDFFilesInfo(files: ConversionFile[]): Promise<PDFFileWithInfo[]> {
  const filesWithInfo: PDFFileWithInfo[] = [];
  
  for (const file of files) {
    try {
      const info = await getPDFInfo(file.file);
      filesWithInfo.push({ ...file, info });
    } catch (error) {
      console.error(`Failed to get info for ${file.name}:`, error);
      filesWithInfo.push({
        ...file,
        info: {
          pageCount: 0,
          fileSize: file.size,
        },
      });
    }
  }
  
  return filesWithInfo;
}

/**
 * 合并多个 PDF 文件
 */
export async function mergePDFs(
  files: ConversionFile[],
  options: MergeOptions = {},
  signal?: AbortSignal,
  onProgress?: (progress: number) => void
): Promise<MergeResult> {
  // 验证
  const validation = validatePDFFiles(files);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  if (signal?.aborted) {
    throw new Error('Merge aborted');
  }
  
  onProgress?.(5);
  
  // 创建新的 PDF 文档
  const mergedPDF = await PDFDocument.create();
  let totalPages = 0;
  
  onProgress?.(10);
  
  // 逐个合并 PDF
  const progressPerFile = 80 / files.length;
  
  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) {
      throw new Error('Merge aborted');
    }
    
    const file = files[i];
    
    try {
      // 加载 PDF
      const pdf = await loadPDF(file.file);
      const pageCount = pdf.getPageCount();
      
      // 复制所有页面
      const pageIndices = Array.from({ length: pageCount }, (_, idx) => idx);
      const copiedPages = await mergedPDF.copyPages(pdf, pageIndices);
      
      // 添加页面到合并后的文档
      copiedPages.forEach(page => {
        mergedPDF.addPage(page);
        totalPages++;
      });
      
      onProgress?.(10 + Math.round((i + 1) * progressPerFile));
    } catch (error) {
      console.error(`Failed to merge ${file.name}:`, error);
      throw new Error(`无法合并文件 "${file.name}"，请确保它是有效的 PDF 文件`);
    }
  }
  
  if (signal?.aborted) {
    throw new Error('Merge aborted');
  }
  
  onProgress?.(95);
  
  // 保存合并后的 PDF
  const blob = await savePDFToBlob(mergedPDF);
  
  onProgress?.(100);
  
  return {
    blob,
    totalPages,
    sourceFiles: files.length,
    fileName: options.outputName || `merged_${files.length}_pdfs.pdf`,
  };
}

/**
 * 转换合并结果为 ConversionResult
 */
export function mergeResultToConversionResult(
  result: MergeResult,
  sourceFiles: ConversionFile[]
): ConversionResult {
  // 使用第一个文件作为原始文件的代表
  const primaryFile = sourceFiles[0];
  
  return {
    id: primaryFile.id,
    originalFile: primaryFile,
    convertedBlob: result.blob,
    outputFormat: 'pdf',
    outputName: result.fileName,
    convertedAt: new Date(),
  };
}

/**
 * 带超时的 PDF 合并
 */
export async function mergePDFsWithTimeout(
  files: ConversionFile[],
  options: MergeOptions = {},
  timeoutMs = CONVERSION_TIMEOUTS.pdf
): Promise<MergeResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const result = await mergePDFs(files, options, controller.signal);
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
 * 估算合并后的文件大小
 */
export function estimateMergedSize(files: ConversionFile[]): number {
  // 粗略估算：所有文件大小之和的 90%（考虑到一些优化）
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  return Math.round(totalSize * 0.9);
}

/**
 * 计算合并后的总页数
 */
export async function calculateTotalPages(files: ConversionFile[]): Promise<number> {
  const filesWithInfo = await getPDFFilesInfo(files);
  return filesWithInfo.reduce((sum, file) => sum + file.info.pageCount, 0);
}
