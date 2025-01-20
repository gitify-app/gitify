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
      if (process.env.NODE_ENV === 'development') {
        setAppVersion('dev');
      } else {
        const result = await getAppVersion();
        setAppVersion(`v${result}`);
      }
    })();
  }, []);

  return (
    <Footer justify="justify-between">
      <Stack direction="horizontal">
        <Tooltip text="View release notes" direction="n">
          <Button
            onClick={() => openGitifyReleaseNotes(appVersion)}
            data-testid="settings-release-notes"
          >
            {APPLICATION.NAME} {appVersion}
          </Button>
        </Tooltip>
      </Stack>
      <Stack direction="horizontal" gap="normal">
        <Tooltip text="Accounts" direction="n">
          <IconButton
            aria-label="Accounts"
            icon={PersonIcon}
            onClick={() => {
              navigate('/accounts');
            }}
            data-testid="settings-accounts"
          />
        </Tooltip>

        <Tooltip text={`Quit ${APPLICATION.NAME}`} direction="nw">
          <IconButton
            aria-label={`Quit ${APPLICATION.NAME}`}
            variant="danger"
            icon={XCircleIcon}
            onClick={() => {
              quitApp();
            }}
            data-testid="settings-quit"
          />
        </Tooltip>
      </Stack>
    </Footer>
  );
};
