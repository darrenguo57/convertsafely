/**
 * ConvertSafely - PDFConverter Page
 * PDF 工具页面 - 支持合并、拆分、图片转PDF等功能
 */

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUpload,
  FiFileText,
  FiDownload,
  FiX,
  FiSettings,
  FiCheck,
  FiAlertCircle,
  FiLoader,
  FiTrash2,
  FiLayers,
  FiScissors,
  FiImage,
} from 'react-icons/fi';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useSubscription } from '@/hooks/useSubscription';
import type { ConversionFile, ConversionResult } from '@/types';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { formatFileSize } from '@/utils/constants';

import {
  mergePDFs,
  type MergeOptions,
  mergeResultToConversionResult,
} from '@/converters/pdf/pdfMerger';

import {
  splitPDF,
  type SplitOptions,
  type SplitMode,
  splitResultToConversionResults,
} from '@/converters/pdf/pdfSplitter';

import {
  generatePDFFromImages,
  type PDFGenerationOptions,
  type PageSize,
} from '@/converters/pdf/pdfGenerator';

// 工具类型
type PDFTool = 'merge' | 'split' | 'images-to-pdf';

// 转换状态类型
type ConversionStatus = 'idle' | 'converting' | 'completed' | 'error';

export default function PDFConverter() {
  const { t } = useTranslation();

  // 订阅状态
  const { limits, canPerformConversion, validateFileSize, incrementUsage, getValidationError } = useSubscription();

  // 本地状态
  const [activeTool, setActiveTool] = useState<PDFTool>('merge');
  const [files, setFiles] = useState<ConversionFile[]>([]);
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 合并设置
  const [mergeOptions, setMergeOptions] = useState<MergeOptions>({
    outputName: 'merged.pdf',
  });

  // 拆分设置
  const [splitMode, setSplitMode] = useState<SplitMode>('range');
  const [pageRanges, setPageRanges] = useState<string>('');
  const [pagesPerFile, setPagesPerFile] = useState<number>(1);

  // 图片转PDF设置
  const [pdfOptions, setPdfOptions] = useState<PDFGenerationOptions>({
    pageSize: 'fit',
    orientation: 'portrait',
    imagePosition: 'center',
    margin: 0,
  });

  // 工具配置
  const tools: { id: PDFTool; label: string; icon: React.ElementType; description: string }[] = [
    { id: 'merge', label: t('pdf.merge'), icon: FiLayers, description: t('pdf.mergeDesc') },
    { id: 'split', label: t('pdf.split'), icon: FiScissors, description: t('pdf.splitDesc') },
    { id: 'images-to-pdf', label: t('pdf.imagesToPdf'), icon: FiImage, description: t('pdf.imagesToPdfDesc') },
  ];

  // 文件上传处理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validationError = getValidationError(files.length + acceptedFiles.length);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const validFiles: ConversionFile[] = [];
    for (const file of acceptedFiles) {
      if (!validateFileSize(file.size)) {
        toast.error(t('errors.fileTooLarge', { name: file.name, size: limits.maxFileSizeMB }));
        continue;
      }

      // 根据工具类型验证文件
      if (activeTool === 'images-to-pdf') {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name}: ${t('pdf.notImage')}`);
          continue;
        }
      } else {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          toast.error(`${file.name}: ${t('pdf.notPdf')}`);
          continue;
        }
      }

      validFiles.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      });
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setStatus('idle');
    setResults([]);
    setError(null);
  }, [files.length, activeTool, limits.maxFileSizeMB, validateFileSize, getValidationError, t]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: activeTool === 'images-to-pdf'
      ? { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'] }
      : { 'application/pdf': ['.pdf'] },
    maxFiles: limits.batchSize,
  });

  // 移除文件
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
    setStatus('idle');
  }, []);

  // 清空文件
  const clearFiles = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
    setResults([]);
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, [files]);

  // 执行转换
  const startConversion = useCallback(async () => {
    if (files.length === 0) {
      toast.error(t('errors.pleaseSelectFile'));
      return;
    }

    if (!canPerformConversion(files.length)) {
      toast.error(t('pdf.limitReached'));
      return;
    }

    setStatus('converting');
    setProgress(0);
    setError(null);

    try {
      let conversionResults: ConversionResult[] = [];

      switch (activeTool) {
        case 'merge': {
          if (files.length < 2) {
            throw new Error(t('pdf.atLeastTwo'));
          }
          const result = await mergePDFs(files, mergeOptions, undefined, setProgress);
          conversionResults = [mergeResultToConversionResult(result, files)];
          break;
        }

        case 'split': {
          if (files.length !== 1) {
            throw new Error(t('pdf.selectOnePdf'));
          }
          const options: SplitOptions = {
            mode: splitMode,
            pageRanges: splitMode === 'range' ? pageRanges : undefined,
            pagesPerFile: splitMode === 'single' ? pagesPerFile : undefined,
            specificPages: splitMode === 'extract' ? [] : undefined,
            outputPrefix: 'split',
          };
          const result = await splitPDF(files[0], options, undefined, setProgress);
          conversionResults = splitResultToConversionResults(result, files[0]);
          break;
        }

        case 'images-to-pdf': {
          const result = await generatePDFFromImages(files, pdfOptions, undefined, setProgress);
          conversionResults = [result];
          break;
        }
      }

      setResults(conversionResults);
      setStatus('completed');
      incrementUsage();
      toast.success(t('pdf.processComplete'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.conversionFailed');
      setError(errorMessage);
      setStatus('error');
      toast.error(errorMessage);
    }
  }, [files, activeTool, canPerformConversion, incrementUsage, mergeOptions, splitMode, pageRanges, pagesPerFile, pdfOptions, t]);

  // 下载结果
  const downloadResult = useCallback((result: ConversionResult) => {
    const url = URL.createObjectURL(result.convertedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.outputName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t('errors.downloadStarted'));
  }, [t]);

  // 下载所有
  const downloadAll = useCallback(() => {
    results.forEach((result, index) => {
      setTimeout(() => downloadResult(result), index * 500);
    });
  }, [results, downloadResult]);

  // 切换工具
  const handleToolChange = useCallback((tool: PDFTool) => {
    setActiveTool(tool);
    clearFiles();
  }, [clearFiles]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('pdf.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('pdf.subtitle')}
        </p>
      </div>

      {/* 订阅限制提示 */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
            <FiSettings className="w-4 h-4" />
            <span>
              {t('converter.remaining')}: <strong>{limits.remainingConversions === Infinity ? t('converter.unlimited') : limits.remainingConversions}</strong>
              {' · '}
              {t('converter.fileSizeLimit')}: <strong>{limits.maxFileSizeMB}MB</strong>
            </span>
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-300">
            {t('converter.batchLimit')}: <strong>{limits.batchSize}</strong> {t('converter.files')}
          </div>
        </div>
      </div>

      {/* 工具选择 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => handleToolChange(tool.id)}
              className={clsx(
                'p-6 rounded-xl border-2 text-left transition-all duration-200',
                activeTool === tool.id
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <div className={clsx(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                activeTool === tool.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{tool.label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{tool.description}</p>
            </button>
          );
        })}
      </div>

      {/* 上传区域 */}
      {files.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          )}
          {...getRootProps() as any}
        >
          <input {...getInputProps()} />
          <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <FiUpload className="w-10 h-10 text-primary" />
          </div>
          <p className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {isDragActive
              ? t('converter.dragActive')
              : t('converter.dragFile')}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t('converter.orClick')}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {activeTool === 'images-to-pdf'
              ? t('pdf.selectImage')
              : t('pdf.selectPdf')}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {t('converter.maxFileSize', { size: limits.maxFileSizeMB })} · {t('converter.maxFiles', { count: limits.batchSize })}
          </p>
        </motion.div>
      )}

      {/* 文件列表和设置 */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* 工具特定设置 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiSettings className="w-5 h-5" />
                {tools.find(t => t.id === activeTool)?.label} {t('converter.settings')}
              </h3>

              {/* 合并设置 */}
              {activeTool === 'merge' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('pdf.outputName')}
                  </label>
                  <input
                    type="text"
                    value={mergeOptions.outputName}
                    onChange={(e) => setMergeOptions({ ...mergeOptions, outputName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="merged.pdf"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t('pdf.mergeOrder', { count: files.length })}
                  </p>
                </div>
              )}

              {/* 拆分设置 */}
              {activeTool === 'split' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('pdf.splitMode')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['range', 'single', 'extract'] as SplitMode[]).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setSplitMode(mode)}
                          className={clsx(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                            splitMode === mode
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          )}
                        >
                          {mode === 'range' && t('pdf.byRange')}
                          {mode === 'single' && t('pdf.byPage')}
                          {mode === 'extract' && t('pdf.extract')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {splitMode === 'range' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('pdf.pageRange')}
                      </label>
                      <input
                        type="text"
                        value={pageRanges}
                        onChange={(e) => setPageRanges(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="1-3,5,7-10"
                      />
                    </div>
                  )}

                  {splitMode === 'single' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('pdf.pagesPerFile')}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={pagesPerFile}
                        onChange={(e) => setPagesPerFile(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 图片转PDF设置 */}
              {activeTool === 'images-to-pdf' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('pdf.pageSize')}
                    </label>
                    <select
                      value={pdfOptions.pageSize}
                      onChange={(e) => setPdfOptions({ ...pdfOptions, pageSize: e.target.value as PageSize })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="original">{t('pdf.original')}</option>
                      <option value="fit">{t('pdf.fit')}</option>
                      <option value="a4">{t('pdf.a4')}</option>
                      <option value="letter">{t('pdf.letter')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('pdf.orientation')}
                    </label>
                    <select
                      value={pdfOptions.orientation}
                      onChange={(e) => setPdfOptions({ ...pdfOptions, orientation: e.target.value as 'portrait' | 'landscape' })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="portrait">{t('pdf.portrait')}</option>
                      <option value="landscape">{t('pdf.landscape')}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 文件列表 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('converter.filesSelected')} {files.length} {t('converter.files')}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFiles}
                  disabled={status === 'converting'}
                  className="text-red-500 hover:text-red-600"
                >
                  <FiTrash2 className="w-4 h-4 mr-1" />
                  {t('converter.clear')}
                </Button>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                {files.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 flex items-center gap-4"
                  >
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <FiFileText className="w-8 h-8 text-red-500" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFile(file.id)}
                      disabled={status === 'converting'}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 转换进度 */}
            {status === 'converting' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 border border-primary/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <FiLoader className="w-6 h-6 text-primary animate-spin" />
                  <span className="font-medium text-gray-900 dark:text-white">{t('pdf.processing')}</span>
                </div>
                <Progress value={progress} size="lg" showLabel />
              </motion.div>
            )}

            {/* 错误提示 */}
            {status === 'error' && error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center gap-3">
                  <FiAlertCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">{t('pdf.processFailed')}</p>
                    <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 转换结果 */}
            {status === 'completed' && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <FiCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      {t('pdf.processComplete')}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {t('pdf.generatedCount', { count: results.length })}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FiFileText className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {result.outputName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(result.convertedBlob.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => downloadResult(result)}
                      >
                        <FiDownload className="w-4 h-4 mr-1" />
                        {t('converter.download')}
                      </Button>
                    </div>
                  ))}
                </div>

                {results.length > 1 && (
                  <Button onClick={downloadAll} className="w-full">
                    <FiDownload className="w-4 h-4 mr-2" />
                    {t('converter.downloadAll')}
                  </Button>
                )}
              </motion.div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  if (activeTool === 'images-to-pdf') {
                    input.accept = 'image/*';
                  } else {
                    input.accept = '.pdf';
                  }
                  input.onchange = (e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || []);
                    onDrop(files);
                  };
                  input.click();
                }}
                disabled={status === 'converting' || files.length >= limits.batchSize}
              >
                <FiUpload className="w-4 h-4 mr-2" />
                {t('converter.addMore')}
              </Button>
              <Button
                className="flex-1"
                onClick={startConversion}
                disabled={status === 'converting' || files.length === 0}
              >
                {status === 'converting' ? (
                  <>
                    <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                    {t('pdf.processing')}
                  </>
                ) : (
                  <>
                    {activeTool === 'merge' && <FiLayers className="w-4 h-4 mr-2" />}
                    {activeTool === 'split' && <FiScissors className="w-4 h-4 mr-2" />}
                    {activeTool === 'images-to-pdf' && <FiImage className="w-4 h-4 mr-2" />}
                    {t('converter.startConversion')}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 文件拒绝提示 */}
      {fileRejections.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
        >
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">{t('converter.someFilesRejected')}</p>
              <ul className="mt-1 text-sm text-red-600 dark:text-red-300">
                {fileRejections.map(({ file, errors }, index) => (
                  <li key={index}>
                    {file.name}: {errors.map((e) => e.message).join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
