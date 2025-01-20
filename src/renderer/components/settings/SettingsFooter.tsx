import { PersonIcon, XCircleIcon } from '@primer/octicons-react';
import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APPLICATION } from '../../../shared/constants';
import { BUTTON_CLASS_NAME } from '../../styles/gitify';
import { Size } from '../../types';
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
        title={`View ${APPLICATION.NAME} release notes`}
        onClick={() => openGitifyReleaseNotes(appVersion)}
      >
        <div className="flex items-center gap-1">
          <span aria-label="app-version">
            {APPLICATION.NAME} {appVersion}
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
          title={`Quit ${APPLICATION.NAME}`}
          onClick={quitApp}
        >
          <XCircleIcon
            size={Size.LARGE}
            aria-label={`Quit ${APPLICATION.NAME}`}
          />
        </button>
      </div>
    </div>
  );
};
