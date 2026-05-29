import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card content */
  children: ReactNode;
  /** Enable hover elevation effect */
  hoverable?: boolean;
  /** Card padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Card shadow level */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  /** Border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Click handler for interactive cards */
  onClick?: () => void;
}

/**
 * Card container component with hover effects
 * Supports various padding, shadow, and radius options
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      hoverable = false,
      padding = 'md',
      shadow = 'md',
      rounded = 'lg',
      onClick,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-200';

    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-8',
    };

    const shadowStyles = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    };

    const roundedStyles = {
      none: '',
      sm: 'rounded',
      md: 'rounded-lg',
      lg: 'rounded-xl',
      xl: 'rounded-2xl',
    };

    const hoverStyles = hoverable
      ? 'hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 dark:hover:border-primary/30 cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={clsx(
          baseStyles,
          paddingStyles[padding],
          shadowStyles[shadow],
          roundedStyles[rounded],
          hoverStyles,
          onClick && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card subcomponents for structured content
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={clsx('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({
  children,
  as: Component = 'h3',
  className,
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={clsx(
        'text-lg font-semibold text-gray-900 dark:text-white',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function CardDescription({ children, className, ...props }: CardDescriptionProps) {
  return (
    <p className={clsx('text-sm text-gray-500 dark:text-gray-400 mt-1', className)} {...props}>
      {children}
    </p>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={clsx('', className)} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      className={clsx('mt-4 pt-4 border-t border-gray-200 dark:border-gray-700', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
