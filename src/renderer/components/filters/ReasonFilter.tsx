import { type FC, useContext } from 'react';

import { NoteIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { AppContext } from '../../context/App';
import type { Reason } from '../../typesGitHub';
import {
  getReasonFilterCount,
  isReasonFilterSet,
} from '../../utils/notifications/filters/reason';
import { FORMATTED_REASONS, getReasonDetails } from '../../utils/reason';
import { Checkbox } from '../fields/Checkbox';
import { Title } from '../primitives/Title';

export const ReasonFilter: FC = () => {
  const { updateFilter, settings, notifications } = useContext(AppContext);

  return (
    <fieldset id="filter-reasons" className="mb-3">
      <Title icon={NoteIcon}>Reason</Title>
      <Stack direction="vertical" gap="condensed">
        {Object.keys(FORMATTED_REASONS).map((reason: Reason) => {
          const reasonDetails = getReasonDetails(reason);
          const reasonTitle = reasonDetails.title;
          const reasonDescription = reasonDetails.description;
          const isReasonChecked = isReasonFilterSet(settings, reason);
          const reasonCount = getReasonFilterCount(notifications, reason);

          return (
            <Checkbox
              key={reason}
              name={reasonTitle}
              label={reasonTitle}
              checked={isReasonChecked}
              onChange={(evt) =>
                updateFilter('filterReasons', reason, evt.target.checked)
              }
              tooltip={<Text>{reasonDescription}</Text>}
              counter={reasonCount}
            />
          );
        })}
      </Stack>
    </fieldset>
  );
};
