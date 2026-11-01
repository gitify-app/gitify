import { useTranslation } from 'react-i18next';

import { SyncIcon } from '@primer/octicons-react';
import { Button } from '@primer/react';

import { getErrorDetails } from '../utils/core/errors';
import { Oops } from './Oops';

/**
 * Route-level fallback. React Router renders it inside the nearest layout, so
 * an error in a protected screen keeps the sidebar and the rest of the shell.
 */
export function RouteError() {
  const { t } = useTranslation();

  return (
    <Oops
      error={getErrorDetails('UNKNOWN')}
      extraActions={
        <Button leadingVisual={SyncIcon} onClick={() => window.location.reload()}>
          {t('errors.reload', 'Reload')}
        </Button>
      }
    />
  );
}
