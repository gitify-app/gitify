import {
  FeedPersonIcon,
  FilterIcon,
  FilterRemoveIcon,
  NoteIcon,
} from '@primer/octicons-react';
import { type FC, useContext } from 'react';
import { Header } from '../components/Header';
import { Checkbox } from '../components/fields/Checkbox';
import { Legend } from '../components/settings/Legend';
import { AppContext } from '../context/App';
import { BUTTON_CLASS_NAME } from '../styles/gitify';
import { Size } from '../types';
import type { Reason } from '../typesGitHub';
import { FORMATTED_REASONS, formatReason } from '../utils/reason';

export const FiltersRoute: FC = () => {
  const { settings, clearFilters, updateSetting } = useContext(AppContext);

  const updateReasonFilter = (reason: Reason, checked: boolean) => {
    let reasons: Reason[] = settings.filterReasons;

    if (checked) {
      reasons.push(reason);
    } else {
      reasons = reasons.filter((r) => r !== reason);
    }

    updateSetting('filterReasons', reasons);
  };

  const shouldShowReason = (reason: Reason) => {
    return settings.filterReasons.includes(reason);
  };

  return (
    <div className="flex h-screen flex-col" data-testid="filters">
      <Header fetchOnBack={true} icon={FilterIcon}>
        Filters
      </Header>
      <div className="flex-grow overflow-x-auto px-8">
        <fieldset className="mb-3">
          <Legend icon={FeedPersonIcon}>Users</Legend>
          <Checkbox
            name="hideBots"
            label="Hide notifications from Bot accounts"
            checked={settings.detailedNotifications && settings.hideBots}
            onChange={(evt) =>
              settings.detailedNotifications &&
              updateSetting('hideBots', evt.target.checked)
            }
            disabled={!settings.detailedNotifications}
            tooltip={
              <div>
                <div className="pb-3">
                  Hide notifications from GitHub Bot accounts, such as
                  @dependabot, @renovate, @netlify, etc
                </div>
                <div className="text-orange-600">
                  ⚠️ This filter requires the{' '}
                  <strong>Detailed Notifications</strong> setting to be enabled.
                </div>
              </div>
            }
          />
        </fieldset>

        <fieldset className="mb-3">
          <Legend icon={NoteIcon}>Reason</Legend>
          <span className="text-xs italic">
            Note: if no reasons are selected, all notifications will be shown.
          </span>
          {Object.keys(FORMATTED_REASONS).map((reason: Reason) => {
            return (
              <Checkbox
                key={reason}
                name={reason}
                label={formatReason(reason).title}
                checked={shouldShowReason(reason)}
                onChange={(evt) =>
                  updateReasonFilter(reason, evt.target.checked)
                }
                tooltip={<div>{formatReason(reason).description}</div>}
              />
            );
          })}
        </fieldset>
      </div>

      <div className="flex items-center justify-between bg-gray-200 px-3 py-1 text-sm dark:bg-gray-darker">
        <div>
          <button
            type="button"
            className={BUTTON_CLASS_NAME}
            title="Clear filters"
            onClick={clearFilters}
          >
            <FilterRemoveIcon
              size={Size.LARGE}
              className="mr-2"
              aria-label="Clear filters"
            />
            Clear filters
          </button>
        </div>
      </div>
    </div>
  );
};
