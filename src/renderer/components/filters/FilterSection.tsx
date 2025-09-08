import { type ReactNode, useContext } from 'react';

import type { Icon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { AppContext } from '../../context/App';
import type { FilterSettingsState, FilterValue } from '../../types';
import type { Filter } from '../../utils/notifications/filters';
import { Checkbox } from '../fields/Checkbox';
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
      <Title
        icon={icon}
        tooltip={
          tooltip && (
            <>
              {tooltip}
              {filter.requiresDetailsNotifications && (
                <RequiresDetailedNotificationWarning />
              )}
            </>
          )
        }
      >
        {title}
      </Title>

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
              checked={isChecked}
              counter={count}
              disabled={
                filter.requiresDetailsNotifications &&
                !settings.detailedNotifications
              }
              key={type as string}
              label={typeTitle}
              name={typeTitle}
              onChange={(evt) =>
                updateFilter(filterSetting, type, evt.target.checked)
              }
              tooltip={typeDescription ? <Text>{typeDescription}</Text> : null}
            />
          );
        })}
      </Stack>
    </fieldset>
  );
};
