import { type FC, useContext } from 'react';

import { BellIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { AppContext } from '../../context/App';
import type { SubjectType } from '../../typesGitHub';
import {
  FILTERS_SUBJECT_TYPES,
  getSubjectTypeDetails,
  getSubjectTypeFilterCount,
  isSubjectTypeFilterSet,
} from '../../utils/notifications/filters/subjectType';
import { Checkbox } from '../fields/Checkbox';
import { Tooltip } from '../fields/Tooltip';
import { Title } from '../primitives/Title';

export const SubjectTypeFilter: FC = () => {
  const { updateFilter, settings, notifications } = useContext(AppContext);

  return (
    <fieldset id="filter-subject-type" className="mb-3">
      <Stack direction="horizontal" gap="condensed" align="baseline">
        <Title icon={BellIcon}>Type</Title>
        <Tooltip
          name="tooltip-filter-subject-type"
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>Filter notifications by type.</Text>
            </Stack>
          }
        />
      </Stack>

      <Stack direction="vertical" gap="condensed">
        {Object.keys(FILTERS_SUBJECT_TYPES).map((subjectType: SubjectType) => {
          const subjectTypeDetails = getSubjectTypeDetails(subjectType);
          const subjectTypeTitle = subjectTypeDetails.title;
          const subjectTypeDescription = subjectTypeDetails.description;
          const isSubjectTypeChecked = isSubjectTypeFilterSet(
            settings,
            subjectType,
          );
          const subjectTypeCount = getSubjectTypeFilterCount(
            notifications,
            subjectType,
          );

          return (
            <Checkbox
              key={subjectType}
              name={subjectTypeTitle}
              label={subjectTypeTitle}
              checked={isSubjectTypeChecked}
              onChange={(evt) =>
                updateFilter(
                  'filterSubjectTypes',
                  subjectType,
                  evt.target.checked,
                )
              }
              tooltip={
                subjectTypeDescription ? (
                  <Text>{subjectTypeDescription}</Text>
                ) : null
              }
              disabled={!settings.detailedNotifications}
              counter={subjectTypeCount}
            />
          );
        })}
      </Stack>
    </fieldset>
  );
};
