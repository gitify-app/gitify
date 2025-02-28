import { type ReactNode, useContext } from 'react';

import type { Icon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { AppContext } from '../../context/App';
import type { FilterSettingsState, FilterValue } from '../../types';
import type { Filter } from '../../utils/notifications/filters';
import { Checkbox } from '../fields/Checkbox';
import { Tooltip } from '../fields/Tooltip';
import { Title } from '../primitives/Title';
import { RequiresDetailedNotificationWarning } from './RequiresDetailedNotificationsWarning';

export interface IFilterSection<T extends FilterValue> {
  id: string;
  title: string;
  icon: Icon;
  filter: Filter<T>;
  filterSetting: keyof FilterSettingsState;
  tooltip?: ReactNode;
  layout?: 'horizontal' | 'vertical';
}

export const FilterSection = <T extends FilterValue>({
  id,
  title,
  icon,
  filter,
  filterSetting,
  tooltip,
  layout = 'vertical',
}: IFilterSection<T>) => {
  const { updateFilter, settings, notifications } = useContext(AppContext);

  return (
    <fieldset id={id}>
      <Stack direction="horizontal" gap="condensed" align="baseline">
        <Title icon={icon}>{title}</Title>
        {tooltip && (
          <Tooltip
            name={`tooltip-${id}`}
            tooltip={
              <Stack direction="vertical" gap="condensed">
                {tooltip}
                {filter.requiresDetailsNotifications && (
                  <RequiresDetailedNotificationWarning />
                )}
              </Stack>
            }
          />
        )}
      </Stack>

      <Stack
        direction={layout}
        gap={layout === 'horizontal' ? 'normal' : 'condensed'}
      >
        {(Object.keys(filter.FILTER_TYPES) as T[]).map((type) => {
          const typeDetails = filter.getTypeDetails(type);
          const typeTitle = typeDetails.title;
          const typeDescription = typeDetails.description;
          const isChecked = filter.isFilterSet(settings, type);
          const count = filter.getFilterCount(notifications, type);

          return (
            <Checkbox
              key={type as string}
              name={typeTitle}
              label={typeTitle}
              checked={isChecked}
              onChange={(evt) =>
                updateFilter(filterSetting, type, evt.target.checked)
              }
              tooltip={typeDescription ? <Text>{typeDescription}</Text> : null}
              disabled={
                filter.requiresDetailsNotifications &&
                !settings.detailedNotifications
              }
              counter={count}
            />
          );
        })}
      </Stack>
    </fieldset>
  );
};
