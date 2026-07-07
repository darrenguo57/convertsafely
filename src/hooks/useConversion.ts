/**
 * ConvertSafely - useConversion Hook
 * 提供文件转换逻辑和状态管理
 */

import { useState, useCallback, useRef } from 'react';
import type { ConversionFile, ConversionResult } from '@/types';
import { generateOutputFileName, getFormatMimeType } from '@/utils/formatUtils';
import { readFileAsArrayBuffer, downloadFile } from '@/utils/fileUtils';
import { CONVERSION_TIMEOUTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/utils/constants';
import toast from 'react-hot-toast';

/**
 * 转换状态
 */
export type ConversionStatus = 
  | 'idle' 
  | 'preparing' 
  | 'converting' 
  | 'completed' 
  | 'error';

/**
 * 转换选项
 */
export interface ConversionOptions {
  outputFormat: string;
  quality?: number;
  category: 'image' | 'video' | 'audio' | 'pdf' | 'document';
  preserveMetadata?: boolean;
}

/**
 * 转换进度信息
 */
export interface ConversionProgress {
  currentFile: number;
  totalFiles: number;
  fileProgress: number; // 0-100
  overallProgress: number; // 0-100
  currentFileName: string;
}

/**
 * 转换 Hook 选项
 */
interface UseConversionOptions {
  onSuccess?: (results: ConversionResult[]) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: ConversionProgress) => void;
}

/**
 * 使用文件转换的 Hook
 */
export function useConversion(options: UseConversionOptions = {}) {
  const { onSuccess, onError, onProgress } = options;

  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<ConversionProgress>({
    currentFile: 0,
    totalFiles: 0,
    fileProgress: 0,
    overallProgress: 0,
    currentFileName: '',
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 更新进度
   */
  const updateProgress = useCallback(
    (update: Partial<ConversionProgress>) => {
      setProgress((prev) => {
        const newProgress = { ...prev, ...update };
        onProgress?.(newProgress);
        return newProgress;
      });
    },
    [onProgress]
  );

  /**
   * 转换单个图片文件
   */
  const convertImage = useCallback(
    async (
      file: ConversionFile,
      options: ConversionOptions,
      signal?: AbortSignal
    ): Promise<ConversionResult> => {
      const { outputFormat, quality = 0.8 } = options;
      
      // 使用 browser-image-compression 进行转换
      const imageCompression = await import('browser-image-compression');
      
      const compressedFile = await imageCompression.default(file.file, {
        fileType: getFormatMimeType(outputFormat),
        initialQuality: quality,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        preserveExif: options.preserveMetadata,
      });

      if (signal?.aborted) {
        throw new Error('Conversion aborted');
      }

      return {
        id: file.id,
        originalFile: file,
        convertedBlob: compressedFile,
        outputFormat,
        outputName: generateOutputFileName(file.name, outputFormat),
        convertedAt: new Date(),
      };
    },
    []
  );

  /**
   * 转换单个文档文件
   */
  const convertDocument = useCallback(
    async (
      file: ConversionFile,
      options: ConversionOptions,
      signal?: AbortSignal
    ): Promise<ConversionResult> => {
      const { outputFormat } = options;
      
      // 读取文件内容
      const arrayBuffer = await readFileAsArrayBuffer(file.file);
      
      if (signal?.aborted) {
        throw new Error('Conversion aborted');
      }

      let blob: Blob;

      // PDF 转换逻辑
      if (outputFormat === 'pdf') {
        const { PDFDocument } = await import('pdf-lib');
        const pdfDoc = await PDFDocument.create();
        
        if (file.type.startsWith('image/')) {
          // 图片转 PDF
          const imageType = file.type.includes('png') ? 'png' : 'jpg';
          const embedMethod = imageType === 'png' 
            ? pdfDoc.embedPng.bind(pdfDoc) 
            : pdfDoc.embedJpg.bind(pdfDoc);
          
          const image = await embedMethod(arrayBuffer);
          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
        } else {
          // 文本转 PDF (简化版)
          pdfDoc.addPage();
          // 这里简化处理，实际应该使用更复杂的文本渲染
        }
        
        const pdfBytes = await pdfDoc.save();
        blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      } else {
        // 其他格式转换（简化实现）
        blob = new Blob([arrayBuffer], { type: getFormatMimeType(outputFormat) });
      }

      return {
        id: file.id,
        originalFile: file,
        convertedBlob: blob,
        outputFormat,
        outputName: generateOutputFileName(file.name, outputFormat),
        convertedAt: new Date(),
      };
    },
    []
  );

  /**
   * 转换单个文件
   */
  const convertSingleFile = useCallback(
    async (
      file: ConversionFile,
      options: ConversionOptions,
      signal?: AbortSignal
    ): Promise<ConversionResult> => {
      switch (options.category) {
        case 'image':
          return convertImage(file, options, signal);
        case 'pdf':
        case 'document':
          return convertDocument(file, options, signal);
        default:
          // 视频和音频转换需要 FFmpeg.wasm，这里简化处理
          throw new Error(`${options.category} conversion not implemented yet`);
      }
    },
    [convertImage, convertDocument]
  );

  /**
   * 执行转换
   */
  const convert = useCallback(
    async (files: ConversionFile[], options: ConversionOptions) => {
      if (files.length === 0) {
        setError(new Error('No files to convert'));
        return;
      }

      // 创建新的 AbortController
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      setStatus('preparing');
      setError(null);
      setResults([]);
      
      updateProgress({
        currentFile: 0,
        totalFiles: files.length,
        fileProgress: 0,
        overallProgress: 0,
        currentFileName: files[0]?.name || '',
      });

      const conversionResults: ConversionResult[] = [];
      const timeout = CONVERSION_TIMEOUTS[options.category] || 30000;

      try {
        setStatus('converting');

        for (let i = 0; i < files.length; i++) {
          if (signal.aborted) {
            throw new Error('Conversion aborted');
          }

          const file = files[i];
          updateProgress({
            currentFile: i + 1,
            currentFileName: file.name,
            fileProgress: 0,
          });

          // 设置单个文件转换超时
          const result = await Promise.race([
            convertSingleFile(file, options, signal),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error(ERROR_MESSAGES.CONVERSION_TIMEOUT)), timeout)
            ),
          ]);

          conversionResults.push(result);

          updateProgress({
            fileProgress: 100,
            overallProgress: Math.round(((i + 1) / files.length) * 100),
          });
        }

        setResults(conversionResults);
        setStatus('completed');
        toast.success(SUCCESS_MESSAGES.CONVERSION_COMPLETE);
        onSuccess?.(conversionResults);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(ERROR_MESSAGES.CONVERSION_FAILED);
        setError(error);
        setStatus('error');
        toast.error(error.message);
        onError?.(error);
      }
    },
    [convertSingleFile, updateProgress, onSuccess, onError]
  );

  /**
   * 取消转换
   */
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setStatus('idle');
    toast('Conversion cancelled', { icon: '⚠️' });
  }, []);

  /**
   * 下载转换结果
   */
  const downloadResult = useCallback((result: ConversionResult) => {
    downloadFile(result.convertedBlob, result.outputName);
    toast.success(SUCCESS_MESSAGES.DOWNLOAD_STARTED);
  }, []);

  /**
   * 下载所有结果
   */
  const downloadAll = useCallback(() => {
    results.forEach((result) => {
      downloadFile(result.convertedBlob, result.outputName);
    });
    toast.success(`Started downloading ${results.length} files`);
  }, [results]);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setResults([]);
    setError(null);
    setProgress({
      currentFile: 0,
      totalFiles: 0,
      fileProgress: 0,
      overallProgress: 0,
      currentFileName: '',
    });
    abortControllerRef.current = null;
  }, []);

  return {
    // 状态
    status,
    results,
    error,
    progress,
    
    // 计算属性
    isConverting: status === 'converting' || status === 'preparing',
    isCompleted: status === 'completed',
    hasError: status === 'error',
    canDownload: results.length > 0,
    
    // 操作方法
    convert,
    cancel,
    downloadResult,
    downloadAll,
    reset,
  };
}

export default useConversion;
