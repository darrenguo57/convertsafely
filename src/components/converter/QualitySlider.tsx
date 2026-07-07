/**
 * ConvertSafely - QualitySlider Component
 * 质量滑块组件，用于调整转换质量
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiInfo, FiImage, FiVideo, FiMusic } from 'react-icons/fi';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import {
  getQualityConfig,
  getQualityLabel,
  type FormatCategory,
} from '@/utils/formatUtils';

export interface QualitySliderProps {
  /** 格式类别 */
  category: FormatCategory;
  /** 当前质量值 */
  value: number;
  /** 质量变化回调 */
  onChange: (value: number) => void;
  /** 禁用状态 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 标签文本 */
  label?: string;
}

/**
 * 获取类别图标
 */
const getCategoryIcon = (category: FormatCategory) => {
  switch (category) {
    case 'image':
      return FiImage;
    case 'video':
      return FiVideo;
    case 'audio':
      return FiMusic;
    default:
      return FiInfo;
  }
};

/**
 * 质量滑块组件
 * 允许用户调整输出文件的质量
 */
export const QualitySlider: React.FC<QualitySliderProps> = ({
  category,
  value,
  onChange,
  disabled = false,
  className,
  label,
}) => {
  const { t } = useTranslation();
  const config = getQualityConfig(category);
  const Icon = getCategoryIcon(category);

  // 如果没有质量配置，不渲染组件
  if (!config) {
    return null;
  }

  const { min, max, step, default: defaultValue } = config;

  // 计算百分比位置
  const percentage = useMemo(() => {
    return ((value - min) / (max - min)) * 100;
  }, [value, min, max]);

  // 获取质量标签
  const qualityLabel = useMemo(() => {
    return getQualityLabel(category, value);
  }, [category, value]);

  // 获取质量颜色
  const qualityColor = useMemo(() => {
    const ratio = (value - min) / (max - min);
    if (ratio <= 0.25) return 'bg-red-500';
    if (ratio <= 0.5) return 'bg-yellow-500';
    if (ratio <= 0.75) return 'bg-blue-500';
    return 'bg-green-500';
  }, [value, min, max]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  return (
    <div className={clsx('space-y-3', className)}>
      {/* 标签和当前值 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label || t('converter.quality')}
          </label>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-primary">
            {qualityLabel}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {category === 'image' && `${Math.round(value * 100)}%`}
            {category === 'video' && `CRF ${Math.round(value)}`}
            {category === 'audio' && `${Math.round(value)} kbps`}
          </span>
        </div>
      </div>

      {/* 滑块容器 */}
      <div className="relative">
        {/* 轨道背景 */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* 进度条 */}
          <motion.div
            className={clsx('h-full rounded-full', qualityColor)}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* 滑块输入 */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={clsx(
            'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
            disabled && 'cursor-not-allowed'
          )}
          aria-label={t('converter.adjustQuality')}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />

        {/* 滑块thumb (视觉) */}
        <motion.div
          className={clsx(
            'absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md border-2',
            disabled ? 'border-gray-300 cursor-not-allowed' : 'border-primary cursor-pointer'
          )}
          initial={false}
          animate={{ left: `calc(${percentage}% - 10px)` }}
          transition={{ duration: 0.1 }}
          style={{ pointerEvents: 'none' }}
        />
      </div>

      {/* 刻度标记 */}
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 px-1">
        <span>{config.labels.low}</span>
        <span>{config.labels.maximum}</span>
      </div>

      {/* 提示信息 */}
      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
        <FiInfo className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium mb-1">
            {category === 'image' && t('converter.imageQualityTitle')}
            {category === 'video' && t('converter.videoQualityTitle')}
            {category === 'audio' && t('converter.audioBitrateTitle')}
          </p>
          <p>
            {category === 'image' &&
              t('converter.imageQualityDesc')}
            {category === 'video' &&
              t('converter.videoQualityDesc')}
            {category === 'audio' &&
              t('converter.audioQualityDesc')}
          </p>
        </div>
      </div>

      {/* 重置按钮 */}
      {value !== defaultValue && (
        <button
          type="button"
          onClick={() => onChange(defaultValue)}
          disabled={disabled}
          className="text-xs text-primary hover:text-primary-dark transition-colors disabled:opacity-50"
        >
          {t('converter.resetToDefault')} ({category === 'image' && `${Math.round(defaultValue * 100)}%`}
          {category === 'video' && `CRF ${defaultValue}`}
          {category === 'audio' && `${defaultValue} kbps`})
        </button>
      )}
    </div>
  );
};

export default QualitySlider;
