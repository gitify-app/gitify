import {
  CheckIcon,
  CommentIcon,
  IssueClosedIcon,
  MilestoneIcon,
  TagIcon,
} from '@primer/octicons-react';
import { ipcRenderer } from 'electron';
import { type FC, useContext, useEffect } from 'react';
import { AppContext } from '../../context/App';
import { Size, Theme } from '../../types';
import { setTheme } from '../../utils/theme';
import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';

export const AppearanceSettings: FC = () => {
  const { settings, updateSetting } = useContext(AppContext);

  useEffect(() => {
    ipcRenderer.on('gitify:update-theme', (_, updatedTheme: Theme) => {
      if (settings.theme === Theme.SYSTEM) {
        setTheme(updatedTheme);
      }
    });
  }, [settings.theme]);

  return (
    <fieldset className="mb-3">
      <legend id="appearance" className="mb-1 mt-2 font-semibold">
        Appearance
      </legend>
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
          updateSetting('theme', evt.target.value);
        }}
        className="mb-0"
      />
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
        name="showAccountHostname"
        label="Show account hostname"
        checked={settings.showAccountHostname}
        onChange={(evt) =>
          updateSetting('showAccountHostname', evt.target.checked)
        }
      />
    </fieldset>
  );
};
