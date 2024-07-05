import { type FC, type MouseEvent, useContext } from 'react';
import { AppContext } from '../../context/App';
import { GroupBy } from '../../types';
import { openGitHubParticipatingDocs } from '../../utils/links';
import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';

export const NotificationSettings: FC = () => {
  const { settings, updateSetting } = useContext(AppContext);

  return (
    <fieldset>
      <legend id="notifications" className="mb-1 mt-2 font-semibold">
        Notifications
      </legend>
      <RadioGroup
        name="groupBy"
        label="Group by:"
        value={settings.groupBy}
        options={[
          { label: 'Repository', value: GroupBy.REPOSITORY },
          { label: 'Date', value: GroupBy.DATE },
        ]}
        onChange={(evt) => {
          updateSetting('groupBy', evt.target.value as GroupBy);
        }}
      />
      <Checkbox
        name="showOnlyParticipating"
        label="Show only participating"
        checked={settings.participating}
        onChange={(evt) => updateSetting('participating', evt.target.checked)}
        tooltip={
          <div>
            See
            <button
              type="button"
              className="mx-1 text-blue-500"
              title="Open GitHub documentation for participating and watching notifications"
              onClick={(event: MouseEvent<HTMLElement>) => {
                // Don't trigger onClick of parent element.
                event.stopPropagation();
                openGitHubParticipatingDocs();
              }}
            >
              official docs
            </button>
            for more details.
          </div>
        }
      />
      <Checkbox
        name="markAsDoneOnOpen"
        label="Mark as done on open"
        checked={settings.markAsDoneOnOpen}
        onChange={(evt) =>
          updateSetting('markAsDoneOnOpen', evt.target.checked)
        }
      />
      <Checkbox
        name="delayNotificationState"
        label="Delay notification state"
        checked={settings.delayNotificationState}
        onChange={(evt) =>
          updateSetting('delayNotificationState', evt.target.checked)
        }
        tooltip={
          <div>
            Keep the notification within Gitify window upon interaction (click,
            mark as read, mark as done, etc) until the next refresh window
            (scheduled or user initiated).
          </div>
        }
      />
    </fieldset>
  );
};
