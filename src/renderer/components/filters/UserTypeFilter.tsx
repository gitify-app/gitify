import type { FC } from 'react';

import {
  DependabotIcon,
  FeedPersonIcon,
  OrganizationIcon,
  PersonIcon,
} from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { Size } from '../../types';

import { userTypeFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

export const UserTypeFilter: FC = () => {
  return (
    <FilterSection
      filter={userTypeFilter}
      filterSetting="filterUserTypes"
      icon={FeedPersonIcon}
      id="filter-user-types"
      layout="horizontal"
      title="User Type"
      tooltip={
        <Stack direction="vertical" gap="condensed">
          <Text>Filter notifications by user type:</Text>
          <div className="pl-4">
            <Stack direction="vertical" gap="condensed">
              <Stack direction="horizontal" gap="condensed">
                <PersonIcon size={Size.SMALL} />
                {userTypeFilter.FILTER_TYPES['User'].title}
              </Stack>
              <Stack direction="horizontal" gap="condensed">
                <DependabotIcon size={Size.SMALL} />
                {userTypeFilter.FILTER_TYPES['Bot'].description}
              </Stack>
              <Stack direction="horizontal" gap="condensed">
                <OrganizationIcon size={Size.SMALL} />
                {userTypeFilter.FILTER_TYPES['Organization'].title}
              </Stack>
            </Stack>
          </div>
        </Stack>
      }
    />
  );
};
