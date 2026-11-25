import { useTranslation } from 'react-i18next';

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

export function UserTypeFilter() {
  const { t } = useTranslation();

  return (
    <FilterSection
      filter={userTypeFilter}
      filterSetting="userTypes"
      icon={FeedPersonIcon}
      id="filter-user-types"
      title={t('filters.user_type.title', 'User Type')}
      tooltip={
        <Stack direction="vertical" gap="condensed">
          <Text>{t('filters.user_type.help', 'Filter notifications by user type:')}</Text>
          <div className="pl-4">
            <Stack direction="vertical" gap="condensed">
              <Stack direction="horizontal" gap="condensed">
                <PersonIcon size={Size.SMALL} />
                {userTypeFilter.FILTER_TYPES.User.title}
              </Stack>
              <Stack direction="horizontal" gap="condensed">
                <DependabotIcon size={Size.SMALL} />
                {userTypeFilter.FILTER_TYPES.Bot.description}
              </Stack>
              <Stack direction="horizontal" gap="condensed">
                <OrganizationIcon size={Size.SMALL} />
                {userTypeFilter.FILTER_TYPES.Organization.title}
              </Stack>
              <Stack direction="horizontal" gap="condensed">
                <PersonIcon size={Size.SMALL} />
                {userTypeFilter.FILTER_TYPES.other.title}
              </Stack>
            </Stack>
          </div>
          <Text>
            {t(
              'filters.user_type.other_help',
              'Other covers notifications with no author or a non-human, non-organization author.',
            )}
          </Text>
        </Stack>
      }
    />
  );
}
