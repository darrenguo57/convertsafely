/**
 * ConvertSafely - FormatSelector Component
 * 格式选择组件，支持下拉选择输出格式
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiCheck, FiInfo } from 'react-icons/fi';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import {
  getCategoryOutputFormats,
  getFormatDisplayName,
  getFormatDescription,
  getFormatIcon,
} from '@/utils/formatUtils';
import type { FormatCategory } from '@/utils/formatUtils';

export interface FormatSelectorProps {
  /** 格式类别 */
  category: FormatCategory;
  /** 当前选中的格式 */
  value: string;
  /** 格式变化回调 */
  onChange: (format: string) => void;
  /** 禁用状态 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 占位符文本 */
  placeholder?: string;
  /** 标签文本 */
  label?: string;
}

/**
 * 格式选择器组件
 * 提供下拉菜单选择输出格式
 */
export const FormatSelector: React.FC<FormatSelectorProps> = ({
  category,
  value,
  onChange,
  disabled = false,
  className,
  placeholder,
  label,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const formats = getCategoryOutputFormats(category);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 键盘导航
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < formats.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (formats[highlightedIndex]) {
            onChange(formats[highlightedIndex]);
            setIsOpen(false);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, formats, highlightedIndex, onChange]);

  // 打开菜单时重置高亮
  useEffect(() => {
    if (isOpen) {
      const selectedIndex = formats.indexOf(value);
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [isOpen, formats, value]);

  const selectedFormat = value ? getFormatDisplayName(value) : null;

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* 选择器按钮 */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'w-full flex items-center justify-between px-4 py-3',
          'bg-white dark:bg-gray-800 border rounded-xl',
          'text-left transition-all duration-200',
          disabled
            ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 cursor-pointer',
          isOpen && 'border-primary ring-2 ring-primary/20'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-3">
          {selectedFormat ? (
            <>
              <span className="text-xl" role="img" aria-label="format">
                {getFormatIcon(value)}
              </span>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedFormat}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getFormatDescription(value)}
                </p>
              </div>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{placeholder || t('converter.selectOutputFormat')}</span>
          )}
        </div>
        <FiChevronDown
          className={clsx(
            'w-5 h-5 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
            role="listbox"
          >
            <div className="max-h-64 overflow-y-auto py-1">
              {formats.map((format, index) => {
                const isSelected = format === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={format}
                    type="button"
                    onClick={() => {
                      onChange(format);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                      isHighlighted && 'bg-gray-100 dark:bg-gray-700',
                      isSelected && 'bg-primary/5 dark:bg-primary/10'
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="text-xl" role="img" aria-label="format">
                      {getFormatIcon(format)}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={clsx(
                            'font-medium',
                            isSelected
                              ? 'text-primary'
                              : 'text-gray-900 dark:text-white'
                          )}
                        >
                          {getFormatDisplayName(format)}
                        </span>
                        {isSelected && (
                          <FiCheck className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getFormatDescription(format)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提示信息 */}
      <div className="mt-2 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
        <FiInfo className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>{t('converter.formatSelectorHint')}</p>
      </div>
    </div>
  );
};

export default FormatSelector;
