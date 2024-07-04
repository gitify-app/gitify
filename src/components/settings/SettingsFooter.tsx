import { PersonIcon, UndoIcon, XCircleIcon } from '@primer/octicons-react';
import { type FC, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/App';
import { BUTTON_CLASS_NAME } from '../../styles/gitify';
import { Size } from '../../types';
import { getAppVersion, quitApp } from '../../utils/comms';
import { openGitifyReleaseNotes } from '../../utils/links';

export const SettingsFooter: FC = () => {
  const { resetSettings } = useContext(AppContext);
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
        <span title="app-version">Gitify {appVersion}</span>
      </button>
      <div>
        <button
          type="button"
          className={BUTTON_CLASS_NAME}
          title="Reset default settings"
          onClick={() => {
            confirm('Are you sure you want to reset all settings?') &&
              resetSettings();
          }}
        >
          <UndoIcon size={Size.LARGE} aria-label="Reset default settings" />
        </button>
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
