import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PersonIcon, XCircleIcon } from '@primer/octicons-react';
import { Button, IconButton, Stack, Tooltip } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { useShortcutActions } from '../../hooks/useShortcutActions';

import { Footer } from '../primitives/Footer';

import { getAppVersion } from '../../utils/system/comms';
import { openGitifyReleaseNotes } from '../../utils/system/links';

export function SettingsFooter() {
  const { t } = useTranslation();
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const { shortcuts } = useShortcutActions();

  useEffect(() => {
    void (async () => {
      const result = await getAppVersion();
      setAppVersion(result);
    })();
  }, []);

  return (
    <Footer justify="space-between">
      <Stack direction="horizontal">
        <Tooltip direction="ne" text={t('settings.footer.release_notes', 'View release notes')}>
          <Button
            data-testid="settings-release-notes"
            onClick={() => openGitifyReleaseNotes(appVersion!)}
          >
            {APPLICATION.NAME} {appVersion}
          </Button>
        </Tooltip>
      </Stack>
      <Stack direction="horizontal" gap="normal">
        <IconButton
          aria-label={t('settings.footer.accounts', 'Accounts')}
          data-testid="settings-accounts"
          description={t('settings.footer.accounts', 'Accounts')}
          icon={PersonIcon}
          keybindingHint={shortcuts.accounts.key}
          onClick={() => {
            shortcuts.accounts.action();
          }}
          tooltipDirection="n"
        />

        <IconButton
          aria-label={t('settings.footer.quit', 'Quit {{appName}}', { appName: APPLICATION.NAME })}
          data-testid="settings-quit"
          description={t('settings.footer.quit', 'Quit {{appName}}', { appName: APPLICATION.NAME })}
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
}
