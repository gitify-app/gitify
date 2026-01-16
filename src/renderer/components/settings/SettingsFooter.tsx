import { type FC, useEffect, useState } from 'react';

import { PersonIcon, XCircleIcon } from '@primer/octicons-react';
import { Button, IconButton, Stack, Tooltip } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { useShortcutActions } from '../../hooks/useShortcutActions';

import { Footer } from '../primitives/Footer';

import { getAppVersion } from '../../utils/comms';
import { openGitifyReleaseNotes } from '../../utils/links';

export const SettingsFooter: FC = () => {
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const { shortcuts } = useShortcutActions();

  useEffect(() => {
    (async () => {
      const result = await getAppVersion();
      setAppVersion(result);
    })();
  }, []);

  return (
    <Footer justify="space-between">
      <Stack direction="horizontal">
        <Tooltip direction="ne" text="View release notes">
          <Button
            data-testid="settings-release-notes"
            onClick={() => openGitifyReleaseNotes(appVersion)}
          >
            {APPLICATION.NAME} {appVersion}
          </Button>
        </Tooltip>
      </Stack>
      <Stack direction="horizontal" gap="normal">
        <IconButton
          aria-label="Accounts"
          data-testid="settings-accounts"
          description="Accounts"
          icon={PersonIcon}
          keybindingHint={shortcuts.accounts.key}
          onClick={() => {
            shortcuts.accounts.action();
          }}
          tooltipDirection="n"
        />

        <IconButton
          aria-label={`Quit ${APPLICATION.NAME}`}
          data-testid="settings-quit"
          description={`Quit ${APPLICATION.NAME}`}
          icon={XCircleIcon}
          keybindingHint={shortcuts.quit.key}
          onClick={() => {
            shortcuts.quit.action();
          }}
          tooltipDirection="nw"
          variant="danger"
        />
      </Stack>
    </Footer>
  );
};
