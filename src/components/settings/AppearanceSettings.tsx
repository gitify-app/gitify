import {
  CheckIcon,
  CommentIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  MilestoneIcon,
  PaintbrushIcon,
  TagIcon,
} from '@primer/octicons-react';
import { ipcRenderer, webFrame } from 'electron';
import { type FC, useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/App';
import { Size, Theme } from '../../types';
import { setTheme } from '../../utils/theme';
import { zoomLevelToPercentage, zoomPercentageToLevel } from '../../utils/zoom';
import { Button } from '../buttons/Button';
import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';
import { Legend } from './Legend';

let timeout: NodeJS.Timeout;
const DELAY = 200;

export const AppearanceSettings: FC = () => {
  const { settings, updateSetting } = useContext(AppContext);
  const [zoomPercentage, setZoomPercentage] = useState(
    zoomLevelToPercentage(webFrame.getZoomLevel()),
  );

  useEffect(() => {
    ipcRenderer.on('gitify:update-theme', (_, updatedTheme: Theme) => {
      if (settings.theme === Theme.SYSTEM) {
        setTheme(updatedTheme);
      }
    });
  }, [settings.theme]);

  window.addEventListener('resize', () => {
    // clear the timeout
    clearTimeout(timeout);
    // start timing for event "completion"
    timeout = setTimeout(() => {
      const zoomPercentage = zoomLevelToPercentage(webFrame.getZoomLevel());
      setZoomPercentage(zoomPercentage);
      updateSetting('zoomPercentage', zoomPercentage);
    }, DELAY);
  });

  return (
    <fieldset>
      <Legend icon={PaintbrushIcon}>Appearance</Legend>
      <RadioGroup
        name="theme"
        label="Theme:"
        value={settings.theme}
        options={[
          { label: 'System', value: Theme.SYSTEM },
          { label: 'Light', value: Theme.LIGHT },
          { label: 'Dark', value: Theme.DARK },
        ]}
        onChange={(evt) => {
          updateSetting('theme', evt.target.value as Theme);
        }}
      />
      <div className="flex items-center mt-3 mb-2 text-sm">
        <label
          htmlFor="Zoom"
          className="mr-3 content-center font-medium text-gray-700 dark:text-gray-200"
        >
          Zoom:
        </label>
        <Button
          label="Zoom Out"
          onClick={() =>
            zoomPercentage > 0 &&
            webFrame.setZoomLevel(zoomPercentageToLevel(zoomPercentage - 10))
          }
          className="rounded-r-none"
          size="inline"
        >
          -
        </Button>
        <span className="flex w-16 h-5 items-center justify-center rounded-none border border-gray-300 bg-transparent text-xs text-gray-700 dark:text-gray-200">
          {zoomPercentage.toFixed(0)}%
        </span>
        <Button
          label="Zoom In"
          onClick={() =>
            zoomPercentage < 120 &&
            webFrame.setZoomLevel(zoomPercentageToLevel(zoomPercentage + 10))
          }
          className="rounded-none"
          size="inline"
        >
          +
        </Button>
        <Button
          label="Reset Zoom"
          onClick={() => webFrame.setZoomLevel(0)}
          variant="destructive"
          className="rounded-l-none"
          size="inline"
        >
          X
        </Button>
      </div>
      <Checkbox
        name="detailedNotifications"
        label="Detailed notifications"
        checked={settings.detailedNotifications}
        onChange={(evt) =>
          updateSetting('detailedNotifications', evt.target.checked)
        }
        tooltip={
          <div>
            <div className="pb-3">
              Enrich notifications with author or last commenter profile
              information, state and GitHub-like colors.
            </div>
            <div className="text-orange-600">
              ⚠️ Users with a large number of unread notifications <i>may</i>{' '}
              experience rate limiting under certain circumstances. Disable this
              setting if you experience this.
            </div>
          </div>
        }
      />
      <Checkbox
        name="showPills"
        label="Show notification metric pills"
        checked={settings.showPills}
        onChange={(evt) => updateSetting('showPills', evt.target.checked)}
        tooltip={
          <div>
            <div>Show notification metric pills for:</div>
            <div className="pl-6">
              <ul className="list-disc">
                <li>
                  <IssueClosedIcon size={Size.MEDIUM} className="pr-1" />
                  linked issues
                </li>
                <li>
                  <CheckIcon size={Size.MEDIUM} className="pr-1" /> pr reviews
                </li>
                <li>
                  <CommentIcon size={Size.MEDIUM} className="pr-1" />
                  comments
                </li>

                <li>
                  <TagIcon size={Size.MEDIUM} className="pr-1" />
                  labels
                </li>
                <li>
                  <MilestoneIcon size={Size.MEDIUM} className="pr-1" />
                  milestones
                </li>
              </ul>
            </div>
          </div>
        }
      />
      <Checkbox
        name="showNumber"
        label="Show number"
        checked={settings.detailedNotifications && settings.showNumber}
        onChange={(evt) =>
          settings.detailedNotifications &&
          updateSetting('showNumber', evt.target.checked)
        }
        disabled={!settings.detailedNotifications}
        tooltip={
          <div>
            <div>Show GitHub number for:</div>
            <div className="pl-6">
              <ul className="list-disc">
                <li>
                  <CommentIcon size={Size.MEDIUM} className="pr-1" />
                  Discussion
                </li>
                <li>
                  <IssueClosedIcon size={Size.MEDIUM} className="pr-1" />
                  Issue
                </li>
                <li>
                  <GitPullRequestIcon size={Size.MEDIUM} className="pr-1" />
                  Pull Request
                </li>
              </ul>
            </div>
            <div className="pt-3 text-orange-600">
              ⚠️ This setting requires <strong>Detailed Notifications</strong> to
              be enabled.
            </div>
          </div>
        }
      />
      <Checkbox
        name="showAccountHeader"
        label="Show account header"
        checked={settings.showAccountHeader}
        onChange={(evt) =>
          updateSetting('showAccountHeader', evt.target.checked)
        }
      />
    </fieldset>
  );
};
