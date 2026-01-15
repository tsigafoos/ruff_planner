import { Platform } from 'react-native';
import { ReactNode } from 'react';
import AppLayout from './AppLayout';

interface WebLayoutProps {
  children: ReactNode;
}

/**
 * WebLayout - Wrapper component for web platform
 * 
 * Uses AppLayout which provides:
 * - TopNavbar (logo + dropdowns)
 * - Collapsible Sidebar (navigation)
 * - Main content area with consistent margins
 * - Footer (sync status)
 * 
 * On non-web platforms, renders children directly.
 */
export default function WebLayout({ children }: WebLayoutProps) {
  // On non-web platforms, just render children without layout
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}

// Re-export layout components for convenience
export { default as AppLayout } from './AppLayout';
export { default as TopNavbar } from './TopNavbar';
export { default as Sidebar, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from './Sidebar';
export { default as Footer, FOOTER_HEIGHT } from './Footer';
export { default as PageHeader, commonActions } from './PageHeader';
export type { ActionButton } from './PageHeader';
