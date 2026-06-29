import type { FC } from 'react';

import { GitPullRequestIcon } from '@primer/octicons-react';
import { Text } from '@primer/react';

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
        <Text>
          Filter review requests by whether you were directly requested or requested via a team.
        </Text>
      }
    />
  );
};
