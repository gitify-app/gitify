import { memo, type ReactNode, useMemo } from 'react';

import type { Icon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { useAppContext } from '../../hooks/useAppContext';
import {
  type FiltersState,
  useFiltersStore,
  useSettingsStore,
} from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { Title } from '../primitives/Title';

import type { Filter } from '../../utils/notifications/filters';
import { RequiresDetailedNotificationWarning } from './RequiresDetailedNotificationsWarning';

export interface FilterSectionProps<K extends keyof FiltersState> {
  id: string;
  title: string;
  icon: Icon;
  filter: Filter<FiltersState[K][number]>;
  filterSetting: K;
  tooltip?: ReactNode;
  layout?: 'horizontal' | 'vertical';
}

const FilterSectionComponent = <K extends keyof FiltersState>({
  id,
  title,
  icon,
  filter,
  filterSetting,
  tooltip,
  layout = 'vertical',
}: FilterSectionProps<K>) => {
  const { notifications } = useAppContext();
  const updateFilter = useFiltersStore((s) => s.updateFilter);

  const detailedNotifications = useSettingsStore(
    (s) => s.detailedNotifications,
  );

  // Subscribe to the specific filter state so component re-renders when filters change
  useFiltersStore((s) => s[filterSetting]);

  // Memoize filter counts to avoid recalculating on every render
  const filterCounts = useMemo(() => {
    const counts = new Map<FiltersState[K][number], number>();
    for (const type of Object.keys(
      filter.FILTER_TYPES,
    ) as FiltersState[K][number][]) {
      counts.set(type, filter.getFilterCount(notifications, type));
    }
    return counts;
  }, [notifications, filter]);

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
        {(Object.keys(filter.FILTER_TYPES) as FiltersState[K][number][])
          .sort((a, b) =>
            filter
              .getTypeDetails(a)
              .title.toLocaleLowerCase()
              .localeCompare(
                filter.getTypeDetails(b).title.toLocaleLowerCase(),
              ),
          )
          .map((type) => {
            const typeDetails = filter.getTypeDetails(type);
            const typeTitle = typeDetails.title;
            const typeDescription = typeDetails.description;
            const isChecked = filter.isFilterSet(type);
            const count = filterCounts.get(type) ?? 0;

            return (
              <Checkbox
                checked={isChecked}
                counter={count}
                disabled={
                  filter.requiresDetailsNotifications && !detailedNotifications
                }
                key={type as string}
                label={typeTitle}
                name={typeTitle}
                onChange={() => updateFilter(filterSetting, type, !isChecked)}
                tooltip={
                  typeDescription ? <Text>{typeDescription}</Text> : null
                }
              />
            );
          })}
      </Stack>
    </fieldset>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const FilterSection = memo(
  FilterSectionComponent,
) as typeof FilterSectionComponent;
