import { FilterRemoveIcon } from '@primer/octicons-react';
import { type FC, useContext } from 'react';
import { Header } from '../components/Header';
import { Checkbox } from '../components/fields/Checkbox';
import { AppContext, defaultSettings } from '../context/App';
import { BUTTON_CLASS_NAME } from '../styles/gitify';
import { Size } from '../types';
import type { Reason } from '../typesGitHub';
import { FORMATTED_REASONS, formatReason } from '../utils/reason';

export const FiltersRoute: FC = () => {
  const { settings, updateSetting } = useContext(AppContext);

  const updateReasonFilter = (reason: Reason, checked: boolean) => {
    let reasons: Reason[];

    if (!settings.filterReasons) {
      reasons = [];
    } else {
      reasons = settings.filterReasons.split(',') as Reason[];
    }

    if (checked) {
      reasons.push(reason);
    } else {
      reasons = reasons.filter((r) => r !== reason);
    }

    updateSetting('filterReasons', reasons.join(','));
  };

  const shouldShowReason = (reason: Reason) => {
    return settings.filterReasons.split(',').includes(reason);
  };

  const resetToDefaultFilters = () => {
    updateSetting('filterReasons', defaultSettings.filterReasons);
    updateSetting('showBots', defaultSettings.showBots);
  };

  return (
    <div className="flex h-screen flex-col" data-testid="filters">
      <Header fetchOnBack={true}>Filters</Header>
      <div className="flex-grow overflow-x-auto px-8">
        <fieldset className="mb-3">
          <legend id="notifications" className="mb-1 mt-2 font-semibold">
            Users
          </legend>
          <Checkbox
            name="showBots"
            label="Show notifications from Bot accounts"
            checked={!settings.detailedNotifications || settings.showBots}
            onChange={(evt) =>
              settings.detailedNotifications &&
              updateSetting('showBots', evt.target.checked)
            }
            disabled={!settings.detailedNotifications}
            tooltip={
              <div>
                <div className="pb-3">
                  Show or hide notifications from Bot accounts, such as
                  @dependabot, @renovatebot, etc
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
          <legend id="appearance" className="mb-1 mt-2 font-semibold">
            Reason
          </legend>
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
            title="Reset to default filters"
            onClick={resetToDefaultFilters}
          >
            <FilterRemoveIcon
              size={Size.LARGE}
              className="mr-2"
              aria-label="Reset to default filters"
            />
            Reset to default filters
          </button>
        </div>
      </div>
    </div>
  );
};
