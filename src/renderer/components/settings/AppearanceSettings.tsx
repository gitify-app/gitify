import { ipcRenderer, webFrame } from 'electron';
import { type FC, useContext, useEffect, useState } from 'react';

import {
  CheckIcon,
  CommentIcon,
  DashIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  MilestoneIcon,
  PaintbrushIcon,
  PlusIcon,
  TagIcon,
  XCircleIcon,
} from '@primer/octicons-react';
import { Button, ButtonGroup, IconButton, useTheme } from '@primer/react';
import type { ColorModeWithAuto } from '@primer/react/lib/ThemeProvider';

import { AppContext } from '../../context/App';
import { Size, Theme } from '../../types';
import { hasMultipleAccounts } from '../../utils/auth/utils';
import { zoomLevelToPercentage, zoomPercentageToLevel } from '../../utils/zoom';
import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';
import { Legend } from './Legend';

let timeout: NodeJS.Timeout;
const DELAY = 200;

export const AppearanceSettings: FC = () => {
  const { setColorMode } = useTheme();
  const { auth, settings, updateSetting } = useContext(AppContext);
  const [zoomPercentage, setZoomPercentage] = useState(
    zoomLevelToPercentage(webFrame.getZoomLevel()),
  );

  useEffect(() => {
    ipcRenderer.on('gitify:update-theme', (_, updatedTheme: Theme) => {
      if (settings.theme === Theme.SYSTEM) {
        setColorMode(updatedTheme === 'DARK' ? 'night' : 'day');
      }
    });
  }, [settings.theme, setColorMode]);

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
          let mode: ColorModeWithAuto;
          switch (evt.target.value) {
            case Theme.LIGHT:
              mode = 'day';
              break;
            case Theme.DARK:
              mode = 'night';
              break;
            default:
              mode = 'auto';
              break;
          }

          setColorMode(mode);
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

        <ButtonGroup>
          <IconButton
            aria-label="Zoom out"
            icon={DashIcon}
            size="small"
            onClick={() =>
              zoomPercentage > 0 &&
              webFrame.setZoomLevel(zoomPercentageToLevel(zoomPercentage - 10))
            }
          />
          <Button aria-label="Zoom Percentage" size="small" disabled>
            {zoomPercentage.toFixed(0)}%
          </Button>
          <IconButton
            aria-label="Zoom in"
            icon={PlusIcon}
            size="small"
            onClick={() =>
              zoomPercentage < 120 &&
              webFrame.setZoomLevel(zoomPercentageToLevel(zoomPercentage + 10))
            }
          />
          <IconButton
            aria-label="Reset zoom level"
            icon={XCircleIcon}
            size="small"
            variant="danger"
            onClick={() => webFrame.setZoomLevel(0)}
          />
        </ButtonGroup>
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
        checked={settings.showAccountHeader || hasMultipleAccounts(auth)}
        disabled={hasMultipleAccounts(auth)}
        onChange={(evt) =>
          updateSetting('showAccountHeader', evt.target.checked)
        }
      />
    </fieldset>
  );
};
