/**
 * ConvertSafely - useFileUpload Hook
 * 提供文件上传、验证和预览功能
 */

import { useState, useCallback, useRef } from 'react';
import type { ConversionFile } from '@/types';
import { validateFiles, revokeObjectURL } from '@/utils/fileUtils';
import { formatFileSize } from '@/utils/constants';

/**
 * 上传错误类型
 */
export interface UploadError {
  file: File;
  reason: string;
}

/**
 * 上传状态
 */
export type UploadStatus = 'idle' | 'validating' | 'uploading' | 'success' | 'error';

/**
 * 文件上传 Hook 选项
 */
interface UseFileUploadOptions {
  /** 最大文件大小 (字节) */
  maxFileSize: number;
  /** 文件类别限制 */
  category?: string;
  /** 最大文件数量 */
  maxFiles?: number;
  /** 是否允许多选 */
  multiple?: boolean;
  /** 文件接受类型 */
  accept?: string;
  /** 文件添加回调 */
  onFilesAdded?: (files: ConversionFile[]) => void;
  /** 错误回调 */
  onError?: (errors: UploadError[]) => void;
}

/**
 * 使用文件上传的 Hook
 */
export function useFileUpload(options: UseFileUploadOptions) {
  const {
    maxFileSize,
    category,
    maxFiles = 1,
    multiple = false,
    accept,
    onFilesAdded,
    onError,
  } = options;

  const [files, setFiles] = useState<ConversionFile[]>([]);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * 验证并添加文件
   */
  const addFiles = useCallback(
    async (newFiles: FileList | null) => {
      if (!newFiles || newFiles.length === 0) return;

      setStatus('validating');
      setErrors([]);

      const fileArray = Array.from(newFiles);
      
      // 如果不允许多选，只取第一个文件
      const filesToProcess = multiple ? fileArray : [fileArray[0]];

      try {
        const result = await validateFiles(filesToProcess, {
          maxSizeBytes: maxFileSize,
          category,
          maxFiles: multiple ? maxFiles : 1,
        });

        if (result.errors.length > 0) {
          setErrors(result.errors);
          onError?.(result.errors);
        }

        if (result.valid.length > 0) {
          setFiles((prev) => {
            const updated = multiple ? [...prev, ...result.valid] : result.valid;
            // 限制最大数量
            return updated.slice(0, maxFiles);
          });
          onFilesAdded?.(result.valid);
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
        const errorMsg = error instanceof Error ? error.message : '验证失败';
        const uploadErrors = fileArray.map((file) => ({ file, reason: errorMsg }));
        setErrors(uploadErrors);
        onError?.(uploadErrors);
      }
    },
    [maxFileSize, category, maxFiles, multiple, onFilesAdded, onError]
  );

  /**
   * 移除文件
   */
  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const fileToRemove = prev.find((f) => f.id === id);
        if (fileToRemove?.preview) {
          revokeObjectURL(fileToRemove.preview);
        }
        return prev.filter((f) => f.id !== id);
      });
      setStatus('idle');
    },
    []
  );

  /**
   * 清空所有文件
   */
  const clearFiles = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) {
        revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setErrors([]);
    setStatus('idle');
  }, [files]);

  /**
   * 处理拖拽进入
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  /**
   * 处理拖拽离开
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  /**
   * 处理文件拖放
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(e.target.files);
      // 重置 input 值以允许重复选择相同文件
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [addFiles]
  );

  /**
   * 打开文件选择对话框
   */
  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  /**
   * 获取拖拽事件处理器
   */
  const getDragProps = useCallback(
    () => ({
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    }),
    [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]
  );

  /**
   * 获取 input 元素属性
   */
  const getInputProps = useCallback(
    () => ({
      ref: inputRef,
      type: 'file' as const,
      accept,
      multiple,
      onChange: handleFileSelect,
      style: { display: 'none' } as React.CSSProperties,
    }),
    [accept, multiple, handleFileSelect]
  );

  /**
   * 获取根元素属性 (用于 react-dropzone 兼容)
   */
  const getRootProps = useCallback(
    (props: React.HTMLAttributes<HTMLElement> = {}) => ({
      ...props,
      ...getDragProps(),
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        // 如果点击的是 input，不触发文件选择
        if ((e.target as HTMLElement).tagName !== 'INPUT') {
          openFileDialog();
        }
        props.onClick?.(e);
      },
    }),
    [getDragProps, openFileDialog]
  );

  /**
   * 格式化文件大小显示
   */
  const getTotalSize = useCallback(() => {
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    return formatFileSize(totalBytes);
  }, [files]);

  return {
    // 状态
    files,
    status,
    errors,
    isDragging,
    isEmpty: files.length === 0,
    isFull: files.length >= maxFiles,
    
    // 操作方法
    addFiles,
    removeFile,
    clearFiles,
    openFileDialog,
    
    // 属性获取器
    getRootProps,
    getInputProps,
    getDragProps,
    
    // 工具
    getTotalSize,
    inputRef,
  };
}

export default useFileUpload;
