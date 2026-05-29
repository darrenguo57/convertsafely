/**
 * ConvertSafely - FilePreview Component
 * 文件预览组件，支持图片缩略图和文件信息展示
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  FiFile,
  FiImage,
  FiVideo,
  FiMusic,
  FiFileText,
  FiCheckCircle,
} from 'react-icons/fi';
import { clsx } from 'clsx';
import type { ConversionFile, ConversionResult } from '@/types';
import { formatFileSize } from '@/utils/constants';
import { getFormatDisplayName, getFormatIcon } from '@/utils/formatUtils';

export interface FilePreviewProps {
  /** 要预览的文件 */
  file: ConversionFile | ConversionResult;
  /** 是否显示转换结果 */
  showResult?: boolean;
  /** 是否显示文件大小 */
  showSize?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 尺寸变体 */
  size?: 'sm' | 'md' | 'lg';
  /** 点击回调 */
  onClick?: () => void;
}

/**
 * 获取文件类型图标
 */
const getFileTypeIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return FiImage;
  if (mimeType.startsWith('video/')) return FiVideo;
  if (mimeType.startsWith('audio/')) return FiMusic;
  if (mimeType.includes('pdf') || mimeType.includes('document')) return FiFileText;
  return FiFile;
};

/**
 * 文件预览组件
 * 显示文件缩略图、名称、大小等信息
 */
export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  showResult = false,
  showSize = true,
  className,
  size = 'md',
  onClick,
}) => {
  // 判断是 ConversionFile 还是 ConversionResult
  const isResult = 'convertedBlob' in file;
  const originalFile = isResult ? file.originalFile : file;
  const resultFile = isResult ? file : null;

  const Icon = getFileTypeIcon(originalFile.type);

  const sizeClasses = {
    sm: {
      container: 'p-2 gap-2',
      image: 'w-10 h-10',
      icon: 'w-8 h-8',
      title: 'text-xs',
      subtitle: 'text-[10px]',
    },
    md: {
      container: 'p-3 gap-3',
      image: 'w-14 h-14',
      icon: 'w-10 h-10',
      title: 'text-sm',
      subtitle: 'text-xs',
    },
    lg: {
      container: 'p-4 gap-4',
      image: 'w-20 h-20',
      icon: 'w-14 h-14',
      title: 'text-base',
      subtitle: 'text-sm',
    },
  };

  const classes = sizeClasses[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        'flex items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
        'transition-all duration-200 hover:shadow-md',
        onClick && 'cursor-pointer hover:border-primary/50',
        classes.container,
        className
      )}
      onClick={onClick}
    >
      {/* 缩略图或图标 */}
      <div className="flex-shrink-0">
        {originalFile.preview ? (
          <img
            src={originalFile.preview}
            alt={originalFile.name}
            className={clsx(
              'object-cover rounded-lg',
              classes.image
            )}
          />
        ) : (
          <div
            className={clsx(
              'rounded-lg bg-primary/10 flex items-center justify-center',
              classes.icon
            )}
          >
            <Icon className="w-1/2 h-1/2 text-primary" />
          </div>
        )}
      </div>

      {/* 文件信息 */}
      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            'font-medium text-gray-900 dark:text-white truncate',
            classes.title
          )}
          title={originalFile.name}
        >
          {originalFile.name}
        </p>
        
        {showSize && (
          <p className={clsx('text-gray-500 dark:text-gray-400', classes.subtitle)}>
            {formatFileSize(originalFile.size)}
          </p>
        )}

        {/* 转换结果信息 */}
        {showResult && resultFile && (
          <div className="flex items-center gap-2 mt-1">
            <FiCheckCircle className="w-3 h-3 text-green-500" />
            <span className={clsx('text-green-600 dark:text-green-400', classes.subtitle)}>
              已转换为 {getFormatDisplayName(resultFile!.outputFormat)}
            </span>
          </div>
        )}
      </div>

      {/* 右侧格式标识 */}
      <div className="flex-shrink-0 text-right">
        <span className="text-2xl" role="img" aria-label="format">
          {getFormatIcon(
            isResult && resultFile
              ? resultFile.outputFormat
              : originalFile.name.split('.').pop() || ''
          )}
        </span>
      </div>
    </motion.div>
  );
};

export interface FilePreviewListProps {
  /** 文件列表 */
  files: ConversionFile[] | ConversionResult[];
  /** 是否显示转换结果 */
  showResults?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 空状态提示 */
  emptyText?: string;
  /** 文件点击回调 */
  onFileClick?: (file: ConversionFile | ConversionResult) => void;
}

/**
 * 文件预览列表组件
 */
export const FilePreviewList: React.FC<FilePreviewListProps> = ({
  files,
  showResults = false,
  className,
  emptyText = '暂无文件',
  onFileClick,
}) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <FiFile className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-3', className)}>
      {files.map((file, index) => (
        <motion.div
          key={'id' in file ? file.id : `file-${index}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <FilePreview
            file={file}
            showResult={showResults}
            onClick={() => onFileClick?.(file)}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default FilePreview;
