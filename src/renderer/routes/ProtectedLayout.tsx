import { Navigate, Outlet, useLocation } from 'react-router';

import { useAccountsStore } from '../stores';

/**
 * Single guard for every authenticated route. Reading the account store here
 * keeps the redirect reactive to login and logout without a router
 * invalidation.
 */
export function ProtectedLayout() {
  const isLoggedIn = useAccountsStore((s) => s.isLoggedIn());
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}
