import { useReloadAction } from './primitives/ReloadButton';

import { getErrorDetails } from '../utils/core/errors';
import { Oops } from './Oops';

/**
 * Route-level fallback. React Router renders it inside the nearest layout, so
 * an error in a protected screen keeps the sidebar and the rest of the shell.
 */
export function RouteError() {
  const recovery = useReloadAction();

  return <Oops error={getErrorDetails('UNKNOWN')} recovery={recovery} />;
}
