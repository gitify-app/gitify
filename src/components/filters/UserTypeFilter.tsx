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
                User
              </Stack>
              <Stack direction="horizontal" gap="condensed">
                <DependabotIcon size={Size.SMALL} />
                Bot accounts such as @dependabot, @renovate, @netlify, etc
              </Stack>
              <Stack direction="horizontal" gap="condensed">
                <OrganizationIcon size={Size.SMALL} />
                Organization
              </Stack>
            </Stack>
          </div>
        </Stack>
      }
    />
  );
};
