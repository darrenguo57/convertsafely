/**
 * ConvertSafely - DownloadButton Component
 * 下载按钮组件，支持单个和批量下载
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDownload,
  FiFile,
  FiCheck,
  FiChevronDown,
  FiArchive,
  FiTrash2,
} from 'react-icons/fi';
import { clsx } from 'clsx';
import type { ConversionResult } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatFileSize } from '@/utils/constants';
import { FilePreview } from './FilePreview';

export interface DownloadButtonProps {
  /** 转换结果 */
  results: ConversionResult[];
  /** 下载回调 */
  onDownload: (result: ConversionResult) => void;
  /** 下载全部回调 */
  onDownloadAll?: () => void;
  /** 清除回调 */
  onClear?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 变体 */
  variant?: 'default' | 'compact' | 'list';
}

/**
 * 下载按钮组件
 * 提供单个下载、批量下载和结果列表功能
 */
export const DownloadButton: React.FC<DownloadButtonProps> = ({
  results,
  onDownload,
  onDownloadAll,
  onClear,
  className,
  variant = 'default',
}) => {
  const [showList, setShowList] = useState(false);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  const handleDownload = (result: ConversionResult) => {
    onDownload(result);
    setDownloadedIds((prev) => new Set([...prev, result.id]));
  };

  const handleDownloadAll = () => {
    onDownloadAll?.();
    setDownloadedIds(new Set(results.map((r) => r.id)));
  };

  const allDownloaded = results.length > 0 && results.every((r) => downloadedIds.has(r.id));

  // 计算总大小
  const totalSize = results.reduce(
    (sum, r) => sum + r.convertedBlob.size,
    0
  );

  if (variant === 'compact') {
    return (
      <Button
        variant="primary"
        leftIcon={<FiDownload />}
        onClick={handleDownloadAll}
        className={className}
      >
        下载全部 ({results.length})
      </Button>
    );
  }

  if (variant === 'list') {
    return (
      <div className={clsx('space-y-3', className)}>
        {results.map((result) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <FilePreview file={result} showResult size="sm" />
            <Button
              variant="outline"
              size="sm"
              leftIcon={downloadedIds.has(result.id) ? <FiCheck /> : <FiDownload />}
              onClick={() => handleDownload(result)}
            >
              {downloadedIds.has(result.id) ? '已下载' : '下载'}
            </Button>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      {/* 主下载按钮 */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<FiDownload />}
          rightIcon={results.length > 1 ? <FiChevronDown /> : undefined}
          onClick={
            results.length === 1
              ? () => handleDownload(results[0])
              : () => setShowList(!showList)
          }
          className="flex-1"
        >
          {results.length === 1 ? (
            '下载文件'
          ) : (
            <span className="flex items-center gap-2">
              <FiArchive />
              下载全部 ({results.length} 个文件)
            </span>
          )}
        </Button>

        {results.length > 1 && onDownloadAll && (
          <Button
            variant="secondary"
            size="lg"
            leftIcon={<FiDownload />}
            onClick={handleDownloadAll}
          >
            全部
          </Button>
        )}

        {onClear && (
          <Button
            variant="ghost"
            size="lg"
            leftIcon={<FiTrash2 />}
            onClick={onClear}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            清除
          </Button>
        )}
      </div>

      {/* 文件信息 */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 px-1">
        <span>
          {results.length} 个文件 · 总计 {formatFileSize(totalSize)}
        </span>
        {allDownloaded && (
          <span className="flex items-center gap-1 text-green-600">
            <FiCheck className="w-4 h-4" />
            全部已下载
          </span>
        )}
      </div>

      {/* 文件列表 */}
      <AnimatePresence>
        {(showList || results.length <= 3) && results.length > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                  downloadedIds.has(result.id)
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                )}
              >
                <div className="flex-shrink-0">
                  <FiFile
                    className={clsx(
                      'w-5 h-5',
                      downloadedIds.has(result.id)
                        ? 'text-green-500'
                        : 'text-gray-400'
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {result.outputName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(result.convertedBlob.size)}
                  </p>
                </div>

                <Button
                  variant={downloadedIds.has(result.id) ? 'ghost' : 'outline'}
                  size="sm"
                  leftIcon={
                    downloadedIds.has(result.id) ? <FiCheck /> : <FiDownload />
                  }
                  onClick={() => handleDownload(result)}
                  className={
                    downloadedIds.has(result.id)
                      ? 'text-green-600'
                      : undefined
                  }
                >
                  {downloadedIds.has(result.id) ? '已下载' : '下载'}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提示信息 */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        文件将在您的浏览器中生成，不会上传到任何服务器
      </p>
    </div>
  );
};

export interface DownloadButtonSingleProps {
  /** 文件名 */
  fileName: string;
  /** 文件大小 */
  fileSize?: number;
  /** 下载回调 */
  onDownload: () => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 单个下载按钮组件
 * 简化版，用于单个文件下载
 */
export const DownloadButtonSingle: React.FC<DownloadButtonSingleProps> = ({
  fileName,
  fileSize,
  onDownload,
  className,
}) => {
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleClick = () => {
    onDownload();
    setIsDownloaded(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        'flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <FiFile className="w-6 h-6 text-green-600 dark:text-green-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">
          {fileName}
        </p>
        {fileSize && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatFileSize(fileSize)}
          </p>
        )}
      </div>

      <Button
        variant={isDownloaded ? 'ghost' : 'primary'}
        leftIcon={isDownloaded ? <FiCheck /> : <FiDownload />}
        onClick={handleClick}
        className={isDownloaded ? 'text-green-600' : undefined}
      >
        {isDownloaded ? '已下载' : '下载'}
      </Button>
    </motion.div>
  );
};

export default DownloadButton;
