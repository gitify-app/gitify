import { type FC, useContext } from 'react';

import {
  FeedPersonIcon,
  FilterIcon,
  FilterRemoveIcon,
  NoteIcon,
} from '@primer/octicons-react';
import { Box, Button, Stack, Text, Tooltip } from '@primer/react';

import { Checkbox } from '../components/fields/Checkbox';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
import { Header } from '../components/primitives/Header';
import { Title } from '../components/primitives/Title';
import { AppContext } from '../context/App';
import type { Reason } from '../typesGitHub';
import { getNonBotFilterCount, getReasonFilterCount } from '../utils/filters';
import { FORMATTED_REASONS, formatReason } from '../utils/reason';

export const FiltersRoute: FC = () => {
  const { settings, clearFilters, updateSetting, notifications } =
    useContext(AppContext);

  const updateReasonFilter = (reason: Reason, checked: boolean) => {
    let reasons: Reason[] = [...settings.filterReasons];

    if (checked) {
      reasons.push(reason);
    } else {
      reasons = reasons.filter((r) => r !== reason);
    }

    updateSetting('filterReasons', reasons);
  };

  const isReasonFilterSet = (reason: Reason) => {
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
              <Stack direction="vertical" gap="condensed">
                <Text>
                  Hide notifications from GitHub Bot accounts, such as
                  @dependabot, @renovate, @netlify, etc
                </Text>
                <Text className="text-gitify-caution">
                  ⚠️ This filter requires the{' '}
                  <Text as="strong">Detailed Notifications</Text> setting to be
                  enabled.
                </Text>
              </Stack>
            }
            counter={getNonBotFilterCount(notifications)}
          />
        </fieldset>

        <fieldset className="mb-3">
          <Title icon={NoteIcon}>Reason</Title>
          <Box className="text-xs -mt-2 mb-2">
            <Text as="i">
              Note: If no reasons are selected, all notifications will be shown.
            </Text>
          </Box>

          <Stack direction="vertical" gap="condensed">
            {Object.keys(FORMATTED_REASONS).map((reason: Reason) => {
              const reasonTitle = formatReason(reason).title;
              const isReasonChecked = isReasonFilterSet(reason);
              const reasonDescription = formatReason(reason).description;
              const reasonCount = getReasonFilterCount(notifications, reason);

              return (
                <Checkbox
                  key={reason}
                  name={reason}
                  label={reasonTitle}
                  checked={isReasonChecked}
                  onChange={(evt) =>
                    updateReasonFilter(reason, evt.target.checked)
                  }
                  tooltip={<Text>{reasonDescription}</Text>}
                  counter={reasonCount}
                />
              );
            })}
          </Stack>
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
