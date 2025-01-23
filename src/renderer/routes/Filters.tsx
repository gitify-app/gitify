import { type FC, useContext } from 'react';

import {
  FeedPersonIcon,
  FilterIcon,
  FilterRemoveIcon,
  NoteIcon,
} from '@primer/octicons-react';
import { Button, Tooltip } from '@primer/react';

import { Checkbox } from '../components/fields/Checkbox';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
import { Header } from '../components/primitives/Header';
import { Title } from '../components/primitives/Title';
import { AppContext } from '../context/App';
import type { Reason } from '../typesGitHub';
import { FORMATTED_REASONS, formatReason } from '../utils/reason';

export const FiltersRoute: FC = () => {
  const { settings, clearFilters, updateSetting } = useContext(AppContext);

  const updateReasonFilter = (reason: Reason, checked: boolean) => {
    let reasons: Reason[] = [...settings.filterReasons];

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
    <Page id="filters">
      <Header fetchOnBack={true} icon={FilterIcon}>
        Filters
      </Header>

      <Contents>
        <fieldset className="mb-3">
          <Title icon={FeedPersonIcon}>Users</Title>
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
                <div className="text-gitify-caution">
                  ⚠️ This filter requires the{' '}
                  <strong>Detailed Notifications</strong> setting to be enabled.
                </div>
              </div>
            }
          />
        </fieldset>

        <fieldset className="mb-3">
          <Title icon={NoteIcon}>Reason</Title>
          <span className="text-xs italic">
            Note: If no reasons are selected, all notifications will be shown.
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
      </Contents>

      <Footer justify="end">
        <Tooltip text="Clear all filters" direction="n">
          <Button
            leadingVisual={FilterRemoveIcon}
            onClick={() => clearFilters()}
            data-testid="filters-clear"
          >
            Clear filters
          </Button>
        </Tooltip>
      </Footer>
    </Page>
  );
};
