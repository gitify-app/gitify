import { Outlet } from 'react-router';

import { GlobalShortcuts } from '../components/GlobalShortcuts';
import { AppLayout } from '../components/layout/AppLayout';

/**
 * Root layout for the application shell. The sidebar and window controls stay
 * outside the routed content, so a route change never remounts them.
 */
export function RootLayout() {
  return (
    <>
      <GlobalShortcuts />
      <AppLayout>
        <Outlet />
      </AppLayout>
    </>
  );
}
