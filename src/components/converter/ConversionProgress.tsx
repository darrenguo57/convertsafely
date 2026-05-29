/**
 * ConvertSafely - ConversionProgress Component
 * 转换进度显示组件
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
  FiFile,
  FiClock,
} from 'react-icons/fi';
import { clsx } from 'clsx';
import { Progress } from '@/components/ui/Progress';
import type { ConversionProgress as ConversionProgressType } from '@/hooks/useConversion';
import type { ConversionStatus } from '@/hooks/useConversion';

export interface ConversionProgressProps {
  /** 转换状态 */
  status: ConversionStatus;
  /** 进度信息 */
  progress: ConversionProgressType;
  /** 自定义类名 */
  className?: string;
  /** 取消回调 */
  onCancel?: () => void;
}

/**
 * 转换进度组件
 * 显示转换过程中的进度和状态
 */
export const ConversionProgress: React.FC<ConversionProgressProps> = ({
  status,
  progress,
  className,
  onCancel,
}) => {
  const isPreparing = status === 'preparing';
  const isConverting = status === 'converting';
  const isCompleted = status === 'completed';
  const isError = status === 'error';
  const isActive = isPreparing || isConverting;

  // 计算估计剩余时间（简化版）
  const estimatedTime = React.useMemo(() => {
    if (!isConverting || progress.overallProgress === 0) return null;
    
    // 假设每个文件平均需要 5 秒
    const avgTimePerFile = 5;
    const remainingFiles = progress.totalFiles - progress.currentFile;
    const remainingSeconds = remainingFiles * avgTimePerFile;
    
    if (remainingSeconds < 60) {
      return `约 ${Math.round(remainingSeconds)} 秒`;
    }
    return `约 ${Math.round(remainingSeconds / 60)} 分钟`;
  }, [isConverting, progress]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-xl border p-6',
        isActive && 'border-primary/30 shadow-lg shadow-primary/5',
        isCompleted && 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10',
        isError && 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10',
        !isActive && !isCompleted && !isError && 'border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {/* 状态图标和标题 */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className={clsx(
            'w-14 h-14 rounded-full flex items-center justify-center',
            isActive && 'bg-primary/10',
            isCompleted && 'bg-green-100 dark:bg-green-900/30',
            isError && 'bg-red-100 dark:bg-red-900/30',
            !isActive && !isCompleted && !isError && 'bg-gray-100 dark:bg-gray-700'
          )}
        >
          {isActive && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <FiLoader
                className={clsx(
                  'w-7 h-7',
                  isPreparing ? 'text-yellow-500' : 'text-primary'
                )}
              />
            </motion.div>
          )}
          {isCompleted && (
            <FiCheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
          )}
          {isError && (
            <FiAlertCircle className="w-7 h-7 text-red-600 dark:text-red-400" />
          )}
          {!isActive && !isCompleted && !isError && (
            <FiFile className="w-7 h-7 text-gray-400" />
          )}
        </div>

        <div className="flex-1">
          <h3
            className={clsx(
              'text-lg font-semibold',
              isActive && 'text-primary',
              isCompleted && 'text-green-700 dark:text-green-300',
              isError && 'text-red-700 dark:text-red-300',
              !isActive && !isCompleted && !isError && 'text-gray-700 dark:text-gray-300'
            )}
          >
            {isPreparing && '准备中...'}
            {isConverting && '正在转换'}
            {isCompleted && '转换完成'}
            {isError && '转换失败'}
            {!isActive && !isCompleted && !isError && '等待开始'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isPreparing && '正在准备文件...'}
            {isConverting && progress.currentFileName}
            {isCompleted && `成功转换 ${progress.totalFiles} 个文件`}
            {isError && '请检查文件后重试'}
            {!isActive && !isCompleted && !isError && '点击开始转换按钮'}
          </p>
        </div>

        {/* 取消按钮 */}
        {isActive && onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            取消
          </button>
        )}
      </div>

      {/* 进度信息 */}
      {(isActive || isCompleted) && progress.totalFiles > 0 && (
        <div className="space-y-4">
          {/* 总体进度 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                总体进度
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {progress.currentFile} / {progress.totalFiles} 文件
              </span>
            </div>
            <Progress
              value={progress.overallProgress}
              size="lg"
              variant={isCompleted ? 'success' : 'default'}
              showLabel
              labelPosition="inside"
            />
          </div>

          {/* 当前文件进度 */}
          {isConverting && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  当前文件
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {progress.fileProgress}%
                </span>
              </div>
              <Progress
                value={progress.fileProgress}
                size="md"
                variant="default"
              />
            </div>
          )}

          {/* 估计时间 */}
          {estimatedTime && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <FiClock className="w-4 h-4" />
              <span>预计剩余时间: {estimatedTime}</span>
            </div>
          )}
        </div>
      )}

      {/* 文件计数指示器（多文件时显示） */}
      {progress.totalFiles > 1 && (
        <div className="mt-6 flex items-center gap-2">
          {Array.from({ length: progress.totalFiles }).map((_, index) => (
            <motion.div
              key={index}
              className={clsx(
                'w-2 h-2 rounded-full transition-colors duration-300',
                index < progress.currentFile
                  ? 'bg-green-500'
                  : index === progress.currentFile - 1 && isConverting
                  ? 'bg-primary animate-pulse'
                  : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export interface ConversionProgressMiniProps {
  /** 进度百分比 */
  progress: number;
  /** 自定义类名 */
  className?: string;
}

/**
 * 迷你进度组件
 * 用于紧凑空间显示进度
 */
export const ConversionProgressMini: React.FC<ConversionProgressMiniProps> = ({
  progress,
  className,
}) => {
  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <div className="flex-1">
        <Progress value={progress} size="sm" showLabel />
      </div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <FiLoader className="w-4 h-4 text-primary" />
      </motion.div>
    </div>
  );
};

export default ConversionProgress;
