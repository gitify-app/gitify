import { type FC, useContext } from 'react';

import {
  DependabotIcon,
  FeedPersonIcon,
  OrganizationIcon,
  PersonIcon,
} from '@primer/octicons-react';
import { Box, Stack, Text } from '@primer/react';

import { AppContext } from '../../context/App';
import { Size } from '../../types';
import type { UserType } from '../../typesGitHub';
import {
  FILTERS_USER_TYPES,
  getUserTypeDetails,
  getUserTypeFilterCount,
  isUserTypeFilterSet,
} from '../../utils/notifications/filters/userType';
import { Checkbox } from '../fields/Checkbox';
import { Tooltip } from '../fields/Tooltip';
import { Title } from '../primitives/Title';

export const UserTypeFilter: FC = () => {
  const { updateFilter, settings, notifications } = useContext(AppContext);

  return (
    <fieldset id="filter-user-types">
      <Stack direction="horizontal" gap="condensed" align="baseline">
        <Title icon={FeedPersonIcon}>User Type</Title>
        <Tooltip
          name="tooltip-filter-user-type"
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>Filter notifications by user type:</Text>
              <Box className="pl-4">
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
              </Box>
              <Text className="text-gitify-caution">
                ⚠️ This filter requires the{' '}
                <Text as="strong">Detailed Notifications</Text> setting to be
                enabled.
              </Text>
            </Stack>
          }
        />
      </Stack>

      <Stack direction="horizontal" gap="normal">
        {Object.keys(FILTERS_USER_TYPES).map((userType: UserType) => {
          const userTypeDetails = getUserTypeDetails(userType);
          const userTypeTitle = userTypeDetails.title;
          const userTypeDescription = userTypeDetails.description;
          const isUserTypeChecked = isUserTypeFilterSet(settings, userType);
          const userTypeCount = getUserTypeFilterCount(notifications, userType);

          return (
            <Checkbox
              key={userType}
              name={userTypeTitle}
              label={userTypeTitle}
              checked={isUserTypeChecked}
              onChange={(evt) =>
                updateFilter('filterUserTypes', userType, evt.target.checked)
              }
              tooltip={
                userTypeDescription ? <Text>{userTypeDescription}</Text> : null
              }
              disabled={!settings.detailedNotifications}
              counter={userTypeCount}
            />
          );
        })}
      </Stack>
    </fieldset>
  );
};
