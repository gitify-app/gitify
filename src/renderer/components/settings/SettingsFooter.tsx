import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PersonIcon, XCircleIcon } from '@primer/octicons-react';
import { Button, IconButton, Stack, Tooltip } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { getAppVersion, quitApp } from '../../utils/comms';
import { openGitifyReleaseNotes } from '../../utils/links';
import { Footer } from '../primitives/Footer';

export const SettingsFooter: FC = () => {
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const navigate = useNavigate();

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
        <Tooltip direction="n" text="Accounts">
          <IconButton
            aria-label="Accounts"
            data-testid="settings-accounts"
            icon={PersonIcon}
            onClick={() => {
              navigate('/accounts');
            }}
          />
        </Tooltip>

        <Tooltip direction="nw" text={`Quit ${APPLICATION.NAME}`}>
          <IconButton
            aria-label={`Quit ${APPLICATION.NAME}`}
            data-testid="settings-quit"
            icon={XCircleIcon}
            onClick={() => {
              quitApp();
            }}
            variant="danger"
          />
        </Tooltip>
      </Stack>
    </Footer>
  );
};
