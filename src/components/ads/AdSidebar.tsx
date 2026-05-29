/**
 * ConvertSafely - AdSidebar Component
 * Sidebar advertisement component
 */

import { AdSense } from './AdSense';
import { clsx } from 'clsx';

export interface AdSidebarProps {
  /** Position: left or right */
  position?: 'left' | 'right';
  /** Custom className */
  className?: string;
  /** Ad slot ID */
  slot?: string;
  /** Make ad sticky while scrolling */
  sticky?: boolean;
}

/**
 * Sidebar Ad Component
 * Displays a vertical ad in the sidebar
 */
export function AdSidebar({
  position = 'right',
  className,
  slot = 'sidebar-main',
  sticky = true,
}: AdSidebarProps) {
  return (
    <aside
      className={clsx(
        'hidden lg:block w-[300px] flex-shrink-0',
        sticky && 'sticky top-24',
        position === 'left' ? 'mr-8' : 'ml-8',
        className
      )}
    >
      <div className="space-y-4">
        {/* Main sidebar ad */}
        <AdSense
          slot={slot}
          format="vertical"
          minWidth={300}
          minHeight={600}
        />
        
        {/* Secondary smaller ad */}
        <AdSense
          slot={`${slot}-secondary`}
          format="rectangle"
          minWidth={300}
          minHeight={250}
        />
      </div>
    </aside>
  );
}

export default AdSidebar;
