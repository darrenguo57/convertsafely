/**
 * ConvertSafely - FileUploader Component
 * 文件上传组件，支持拖拽上传和点击上传
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFile, FiX, FiAlertCircle } from 'react-icons/fi';
import { clsx } from 'clsx';
import type { ConversionFile } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatFileSize } from '@/utils/constants';
import { useFileUpload } from '@/hooks/useFileUpload';

export interface FileUploaderProps {
  /** 最大文件大小 (字节) */
  maxFileSize: number;
  /** 文件类别限制 */
  category?: string;
  /** 最大文件数量 */
  maxFiles?: number;
  /** 是否允许多选 */
  multiple?: boolean;
  /** 接受的文件类型 */
  accept?: string;
  /** 文件变化回调 */
  onFilesChange?: (files: ConversionFile[]) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 文件上传组件
 * 支持拖拽上传、点击上传、文件预览和移除
 */
export const FileUploader: React.FC<FileUploaderProps> = ({
  maxFileSize,
  category,
  maxFiles = 1,
  multiple = false,
  accept,
  onFilesChange,
  className,
}) => {
  const {
    files,
    status,
    errors,
    isDragging,
    isEmpty,
    isFull,
    removeFile,
    clearFiles,
    getRootProps,
    getInputProps,
    getTotalSize,
  } = useFileUpload({
    maxFileSize,
    category,
    maxFiles,
    multiple,
    accept,
    onFilesAdded: onFilesChange,
  });

  const rootProps = getRootProps({
    className: clsx(
      'relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer',
      'flex flex-col items-center justify-center p-8',
      isDragging
        ? 'border-primary bg-primary/5 scale-[1.02]'
        : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50',
      isFull && 'opacity-50 cursor-not-allowed',
      className
    ),
  });

  const inputProps = getInputProps();

  return (
    <div className="w-full space-y-4">
      {/* 拖拽上传区域 */}
      <div {...rootProps}>
        <input {...inputProps} />
        
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <FiUpload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isDragging ? '释放以上传文件' : '拖拽文件到此处'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                或点击选择文件
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                最大文件大小: {formatFileSize(maxFileSize)}
                {maxFiles > 1 && ` · 最多 ${maxFiles} 个文件`}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="has-files"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FiFile className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                已选择 {files.length} 个文件
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                总计: {getTotalSize()}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 文件列表 */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group"
              >
                {/* 文件预览 */}
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FiFile className="w-6 h-6 text-primary" />
                  </div>
                )}

                {/* 文件信息 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* 移除按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="移除文件"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </motion.div>
            ))}

            {/* 清空按钮 */}
            {files.length > 1 && (
              <div className="flex justify-end pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFiles();
                  }}
                >
                  清空所有
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 错误提示 */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  上传失败
                </p>
                <ul className="mt-1 space-y-1">
                  {errors.map((error, index) => (
                    <li
                      key={index}
                      className="text-sm text-red-600 dark:text-red-300"
                    >
                      {error.file.name}: {error.reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 验证状态 */}
      {status === 'validating' && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            正在验证文件...
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
