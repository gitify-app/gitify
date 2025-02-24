import { type FC, useContext } from 'react';

import { BellIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { AppContext } from '../../context/App';
import type { FilterStateType } from '../../types';
import {
  FILTERS_STATE_TYPES,
  getStateDetails,
  getStateFilterCount,
  isStateFilterSet,
} from '../../utils/notifications/filters/state';
import { Checkbox } from '../fields/Checkbox';
import { Tooltip } from '../fields/Tooltip';
import { Title } from '../primitives/Title';

export const StateFilter: FC = () => {
  const { updateFilter, settings, notifications } = useContext(AppContext);

  return (
    <fieldset id="filter-state" className="mb-3">
      <Stack direction="horizontal" gap="condensed" align="baseline">
        <Title icon={BellIcon}>State</Title>
        <Tooltip
          name="tooltip-filter-state"
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>Filter notifications by state.</Text>
              <Text className="text-gitify-caution">
                ⚠️ This filter requires the{' '}
                <Text as="strong">Detailed Notifications</Text> setting to be
                enabled.
              </Text>
            </Stack>
          }
        />
      </Stack>

      <Stack direction="vertical" gap="condensed">
        {Object.keys(FILTERS_STATE_TYPES).map((stateType: FilterStateType) => {
          const stateDetails = getStateDetails(stateType);
          const stateTitle = stateDetails.title;
          const stateDescription = stateDetails.description;
          const isStateChecked = isStateFilterSet(settings, stateType);
          const stateCount = getStateFilterCount(notifications, stateType);

          return (
            <Checkbox
              key={stateType}
              name={stateTitle}
              label={stateTitle}
              checked={isStateChecked}
              onChange={(evt) =>
                updateFilter('filterStates', stateType, evt.target.checked)
              }
              tooltip={
                stateDescription ? <Text>{stateDescription}</Text> : null
              }
              disabled={!settings.detailedNotifications}
              counter={stateCount}
            />
          );
        })}
      </Stack>
    </fieldset>
  );
};
