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
import {
  Button,
  ButtonGroup,
  IconButton,
  Select,
  useTheme,
} from '@primer/react';

import { namespacedEvent } from '../../../shared/events';
import { AppContext } from '../../context/App';
import { Size, ThemeMode } from '../../types';
import { hasMultipleAccounts } from '../../utils/auth/utils';
import {
  DEFAULT_DAY_COLOR_SCHEME,
  DEFAULT_NIGHT_COLOR_SCHEME,
  isDayScheme,
  setScrollbarTheme,
} from '../../utils/theme';
import { zoomLevelToPercentage, zoomPercentageToLevel } from '../../utils/zoom';
import { Checkbox } from '../fields/Checkbox';
import { FieldLabel } from '../fields/FieldLabel';
import { Title } from '../primitives/Title';

let timeout: NodeJS.Timeout;
const DELAY = 200;

export const AppearanceSettings: FC = () => {
  const { setColorMode, setDayScheme, setNightScheme } = useTheme();
  const { auth, settings, updateSetting } = useContext(AppContext);
  const [zoomPercentage, setZoomPercentage] = useState(
    zoomLevelToPercentage(webFrame.getZoomLevel()),
  );

  useEffect(() => {
    ipcRenderer.on(
      namespacedEvent('update-theme'),
      (_, updatedTheme: ThemeMode) => {
        if (settings.themeMode === ThemeMode.SYSTEM) {
          const mode = isDayScheme(updatedTheme) ? 'day' : 'night';
          setColorMode('auto');
          setDayScheme(DEFAULT_DAY_COLOR_SCHEME);
          setNightScheme(DEFAULT_NIGHT_COLOR_SCHEME);
          setScrollbarTheme(mode);
        }
      },
    );
  }, [settings.themeMode, setColorMode, setDayScheme, setNightScheme]);

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
      <Title icon={PaintbrushIcon}>Appearance</Title>

      <div className="flex items-center mt-3 mb-2 text-sm">
        <FieldLabel name="theme" label="Theme:" />

        <Select
          id="theme"
          value={settings.themeMode}
          onChange={(evt) =>
            updateSetting('themeMode', evt.target.value as ThemeMode)
          }
          data-testid="settings-theme-mode"
        >
          <Select.OptGroup label="System">
            <Select.Option value={ThemeMode.SYSTEM}>System</Select.Option>
          </Select.OptGroup>
          <Select.OptGroup label="Light">
            <Select.Option value={ThemeMode.LIGHT_DEFAULT}>
              Light default
            </Select.Option>
            <Select.Option value={ThemeMode.LIGHT_HIGH_CONTRAST}>
              Light high contrast
            </Select.Option>
            <Select.Option value={ThemeMode.LIGHT_COLOR_BLIND}>
              Light Protanopia & Deuteranopia
            </Select.Option>
            <Select.Option value={ThemeMode.LIGHT_TRITANOPIA}>
              Light Tritanopia
            </Select.Option>
          </Select.OptGroup>
          <Select.OptGroup label="Dark">
            <Select.Option value={ThemeMode.DARK_DEFAULT}>
              Dark default
            </Select.Option>
            <Select.Option value={ThemeMode.DARK_HIGH_CONTRAST}>
              Dark high contrast
            </Select.Option>
            <Select.Option value={ThemeMode.DARK_COLOR_BLIND}>
              Dark Protanopia & Deuteranopia
            </Select.Option>
            <Select.Option value={ThemeMode.DARK_TRITANOPIA}>
              Dark Tritanopia
            </Select.Option>
            <Select.Option value={ThemeMode.DARK_DIMMED}>
              Dark dimmed
            </Select.Option>
          </Select.OptGroup>
        </Select>
      </div>

      <div className="flex items-center mt-3 mb-2 text-sm">
        <FieldLabel name="zoom" label="Zoom:" />

        <ButtonGroup>
          <IconButton
            aria-label="Zoom out"
            size="small"
            icon={DashIcon}
            unsafeDisableTooltip={true}
            onClick={() =>
              zoomPercentage > 0 &&
              webFrame.setZoomLevel(zoomPercentageToLevel(zoomPercentage - 10))
            }
            data-testid="settings-zoom-out"
          />

          <Button aria-label="Zoom percentage" size="small" disabled>
            {zoomPercentage.toFixed(0)}%
          </Button>

          <IconButton
            aria-label="Zoom in"
            size="small"
            icon={PlusIcon}
            unsafeDisableTooltip={true}
            onClick={() =>
              zoomPercentage < 120 &&
              webFrame.setZoomLevel(zoomPercentageToLevel(zoomPercentage + 10))
            }
            data-testid="settings-zoom-in"
          />

          <IconButton
            aria-label="Reset zoom"
            size="small"
            variant="danger"
            icon={XCircleIcon}
            unsafeDisableTooltip={true}
            onClick={() => webFrame.setZoomLevel(0)}
            data-testid="settings-zoom-reset"
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
            <div className="text-gitify-caution">
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
            <div className="pl-4">
              <ul>
                <li className="flex items-center gap-1">
                  <IssueClosedIcon size={Size.SMALL} />
                  linked issues
                </li>
                <li className="flex items-center gap-1">
                  <CheckIcon size={Size.SMALL} />
                  pr reviews
                </li>
                <li className="flex items-center gap-1">
                  <CommentIcon size={Size.SMALL} />
                  comments
                </li>
                <li className="flex items-center gap-1">
                  <TagIcon size={Size.SMALL} />
                  labels
                </li>
                <li className="flex items-center gap-1">
                  <MilestoneIcon size={Size.SMALL} />
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
            <div className="pl-4">
              <ul>
                <li className="flex items-center gap-1">
                  <CommentIcon size={Size.SMALL} />
                  Discussion
                </li>
                <li className="flex items-center gap-1">
                  <IssueClosedIcon size={Size.SMALL} />
                  Issue
                </li>
                <li className="flex items-center gap-1">
                  <GitPullRequestIcon size={Size.SMALL} />
                  Pull Request
                </li>
              </ul>
            </div>
            <div className="pt-3 text-gitify-caution">
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
