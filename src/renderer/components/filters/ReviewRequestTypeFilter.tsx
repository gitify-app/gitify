import type { FC } from 'react';

import { GitPullRequestIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { reviewRequestTypeFilter } from '../../utils/notifications/filters';
import { FilterSection } from './FilterSection';

export const ReviewRequestTypeFilter: FC = () => {
  return (
    <FilterSection
      filter={reviewRequestTypeFilter}
      filterSetting="reviewRequestTypes"
      icon={GitPullRequestIcon}
      id="filter-review-request-types"
      title="Review Request Type"
      tooltip={
        <Stack direction="vertical" gap="condensed">
          <Text>
            Filter review requests by whether you were directly requested or requested via a team.
            Selecting an option shows only matching review requests.
          </Text>
          <Text>
            Other shows all notifications that are not a review request, such as mentions, comments,
            and assigned issues.
          </Text>
        </Stack>
      }
    />
  );
};
