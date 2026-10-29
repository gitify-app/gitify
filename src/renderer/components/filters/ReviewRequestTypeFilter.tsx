import { useTranslation } from 'react-i18next';

import { GitPullRequestIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { reviewRequestTypeFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

export function ReviewRequestTypeFilter() {
  const { t } = useTranslation();

  return (
    <FilterSection
      filter={reviewRequestTypeFilter}
      filterSetting="reviewRequestTypes"
      icon={GitPullRequestIcon}
      id="filter-review-request-types"
      title={t('filters.review_request_type.title', 'Review Request Type')}
      tooltip={
        <Stack direction="vertical" gap="condensed">
          <Text>
            {t(
              'filters.review_request_type.help',
              'Filter review requests by whether you were directly requested or requested via a team. Selecting an option shows only matching review requests.',
            )}
          </Text>
          <Text>
            {t(
              'filters.review_request_type.other_help',
              'Other shows all notifications that are not a review request, such as mentions, comments, and assigned issues.',
            )}
          </Text>
        </Stack>
      }
    />
  );
}
