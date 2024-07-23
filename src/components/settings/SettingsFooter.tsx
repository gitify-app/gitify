import {
  AlertFillIcon,
  CheckCircleFillIcon,
  PersonIcon,
  XCircleIcon,
} from '@primer/octicons-react';
import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BUTTON_CLASS_NAME } from '../../styles/gitify';
import { IconColor, Size } from '../../types';
import { getAppVersion, quitApp } from '../../utils/comms';
import { openGitifyReleaseNotes } from '../../utils/links';

interface ISettingsFooter {
  isUpdateAvailable?: boolean;
}

export const SettingsFooter: FC<ISettingsFooter> = ({
  isUpdateAvailable = false,
}: ISettingsFooter) => {
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
          <span className="pb-1">
            {isUpdateAvailable ? (
              <span title="New version available">
                <AlertFillIcon
                  size={Size.XSMALL}
                  className={IconColor.YELLOW}
                />
              </span>
            ) : (
              <span title="You are using the latest version">
                <CheckCircleFillIcon
                  size={Size.XSMALL}
                  className={IconColor.GREEN}
                />
              </span>
            )}
          </span>
        </div>
      </button>
      <div>
        <button
          type="button"
          className={BUTTON_CLASS_NAME}
          title="Accounts"
          onClick={() => {
            navigate('/accounts');
          }}
        >
          <PersonIcon size={Size.LARGE} aria-label="Accounts" />
        </button>

        <button
          type="button"
          className={BUTTON_CLASS_NAME}
          title="Quit Gitify"
          onClick={quitApp}
        >
          <XCircleIcon size={Size.LARGE} aria-label="Quit Gitify" />
        </button>
      </div>
    </div>
  );
};
