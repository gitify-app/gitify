import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PersonIcon, XCircleIcon } from '@primer/octicons-react';
import { Button, IconButton, Stack, Tooltip } from '@primer/react';

import { getAppVersion, quitApp } from '../../utils/comms';
import { openGitifyReleaseNotes } from '../../utils/links';

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
    <div className="flex items-center justify-between bg-gray-200 px-4 py-1 text-sm dark:bg-gray-darker">
      <Stack direction={'horizontal'}>
        <Tooltip text="View release notes" direction="n">
          <Button onClick={() => openGitifyReleaseNotes(appVersion)}>
            Gitify {appVersion}
          </Button>
        </Tooltip>
      </Stack>

      <Stack direction={'horizontal'} gap={'normal'}>
        <Tooltip text="Accounts" direction="n">
          <IconButton
            aria-label="Accounts"
            icon={PersonIcon}
            onClick={() => {
              navigate('/accounts');
            }}
          />
        </Tooltip>

        <Tooltip text="Quit Gitify" direction="nw">
          <IconButton
            aria-label="Quit Gitify"
            variant="danger"
            icon={XCircleIcon}
            onClick={() => {
              quitApp();
            }}
          />
        </Tooltip>
      </Stack>
    </div>
  );
};
