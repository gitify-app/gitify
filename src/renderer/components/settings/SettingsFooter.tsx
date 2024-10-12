import { PersonIcon, XCircleIcon } from '@primer/octicons-react';
import { IconButton, Tooltip } from '@primer/react';
import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="flex items-center justify-between bg-gray-200 px-8 py-1 text-sm dark:bg-gray-darker">
      <button
        type="button"
        className="cursor-pointer font-semibold"
        title="View release notes"
        onClick={() => openGitifyReleaseNotes(appVersion)}
      >
        <div className="flex items-center gap-1">
          <span aria-label="app-version">Gitify {appVersion}</span>
        </div>
      </button>
      <div>
        <Tooltip text="Accounts" direction="n">
          <IconButton
            icon={PersonIcon}
            aria-label="Accounts"
            onClick={() => {
              navigate('/accounts');
            }}
          />
        </Tooltip>

        <Tooltip text="Quit Gitify" direction="n">
          <IconButton
            icon={XCircleIcon}
            aria-label="Quit Gitify"
            onClick={() => {
              quitApp();
            }}
          />
        </Tooltip>
      </div>
    </div>
  );
};
