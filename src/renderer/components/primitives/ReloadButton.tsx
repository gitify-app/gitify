import { useTranslation } from 'react-i18next';

import { SyncIcon } from '@primer/octicons-react';
import { Button } from '@primer/react';

/** Reloads the renderer; shared by the route fallback and the outer boundary. */
export function reloadRenderer() {
  window.location.reload();
}

/** Typed recovery action used by `Oops` and the application error fallback. */
export function useReloadAction() {
  const { t } = useTranslation();

  return {
    icon: SyncIcon,
    label: t('errors.reload', 'Reload'),
    onClick: reloadRenderer,
  } as const;
}

export function ReloadButton() {
  const action = useReloadAction();

  return (
    <Button leadingVisual={action.icon} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}
