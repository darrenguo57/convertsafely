import { Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import { Header } from './Header';
import { Footer } from './Footer';

export interface LayoutProps {
  /** Show advertisement slot */
  showAd?: boolean;
  /** Ad position */
  adPosition?: 'top' | 'sidebar';
  /** Additional CSS classes for main content */
  className?: string;
  /** Full width content (no max-width constraint) */
  fullWidth?: boolean;
}

/**
 * Main layout component with Header, Footer, and optional ad slots
 * Supports dark mode and responsive design
 */
export function Layout({
  showAd = false,
  adPosition = 'sidebar',
  className,
  fullWidth = false,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex-1 pt-16">
        {' '}
        {/* pt-16 for fixed header */}
        {showAd && adPosition === 'top' && <AdBanner />}
        <div
          className={clsx(
            'flex gap-6 px-4 sm:px-6 lg:px-8 py-6',
            fullWidth ? '' : 'max-w-7xl mx-auto'
          )}
        >
          {/* Main Content */}
          <main className={clsx('flex-1 min-w-0', className)}>
            <Outlet />
          </main>

          {/* Sidebar Ad */}
          {showAd && adPosition === 'sidebar' && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <AdSidebar />
            </aside>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

/**
 * Top banner advertisement slot
 * Designed for Google AdSense integration
 */
function AdBanner() {
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
          {/* Google AdSense will be injected here */}
          <div className="text-center">
            <p>Advertisement</p>
            <p className="text-xs mt-1">(AdSense Slot: Banner)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sidebar advertisement slot
 * Designed for Google AdSense integration
 */
function AdSidebar() {
  return (
    <div className="sticky top-24 space-y-4">
      {/* Primary Ad Slot */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
          {/* Google AdSense will be injected here */}
          <div className="text-center">
            <p>Advertisement</p>
            <p className="text-xs mt-1">(AdSense Slot: Sidebar)</p>
          </div>
        </div>
      </div>

      {/* Secondary Info Card */}
      <div className="bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 p-4">
        <h4 className="font-semibold text-primary dark:text-primary-light text-sm mb-2">
          Go Ad-Free
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          Upgrade to Pro and enjoy an ad-free experience with unlimited conversions.
        </p>
        <a
          href="/pricing"
          className="inline-flex items-center justify-center w-full px-3 py-2 text-xs font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
        >
          View Plans
        </a>
      </div>
    </div>
  );
}

export default Layout;
