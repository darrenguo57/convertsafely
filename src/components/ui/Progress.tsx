import { clsx } from 'clsx';

export interface ProgressProps {
  /** Current progress value (0-100) */
  value: number;
  /** Maximum value */
  max?: number;
  /** Progress bar size */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'success' | 'warning' | 'error';
  /** Show percentage label */
  showLabel?: boolean;
  /** Label position */
  labelPosition?: 'inside' | 'outside';
  /** Accessible label */
  ariaLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Progress bar component with multiple sizes and color variants
 * Supports accessible labels and percentage display
 */
export function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  labelPosition = 'outside',
  ariaLabel = 'Progress',
  className,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const containerSizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantStyles = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            'flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
            containerSizes[size]
          )}
          role="progressbar"
          aria-label={ariaLabel}
          aria-valuenow={Math.round(value)}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-300 ease-out',
              variantStyles[variant]
            )}
            style={{ width: `${percentage}%` }}
          >
            {showLabel && labelPosition === 'inside' && size === 'lg' && (
              <span className="flex items-center justify-center h-full text-xs font-medium text-white">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>
        {showLabel && labelPosition === 'outside' && (
          <span
            className={clsx(
              'font-medium text-gray-700 dark:text-gray-300 tabular-nums flex-shrink-0',
              labelSizes[size]
            )}
          >
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
}

export default Progress;
