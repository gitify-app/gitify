import { type FC, useContext, useEffect, useState } from 'react';

import {
  CheckCircleFillIcon,
  MentionIcon,
  NoEntryFillIcon,
} from '@primer/octicons-react';
import { Box, Stack, Text, TextInputWithTokens } from '@primer/react';

import { AppContext } from '../../context/App';
import { IconColor, type UserHandle } from '../../types';
import {
  hasExcludeHandleFilters,
  hasIncludeHandleFilters,
} from '../../utils/notifications/filters/handles';
import { Tooltip } from '../fields/Tooltip';
import { Title } from '../primitives/Title';
import { RequiresDetailedNotificationWarning } from './RequiresDetailedNotificationsWarning';

type InputToken = {
  id: number;
  text: string;
};

const tokenEvents = ['Enter', 'Tab', ' ', ','];

export const UserHandleFilter: FC = () => {
  const { updateFilter, settings } = useContext(AppContext);

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this effect on handle filter changes
  useEffect(() => {
    if (!hasIncludeHandleFilters(settings)) {
      setIncludeHandles([]);
    }

    if (!hasExcludeHandleFilters(settings)) {
      setExcludeHandles([]);
    }
  }, [settings.filterIncludeHandles, settings.filterExcludeHandles]);

  const mapValuesToTokens = (values: string[]): InputToken[] => {
    return values.map((value, index) => ({
      id: index,
      text: value,
    }));
  };

  const [includeHandles, setIncludeHandles] = useState<InputToken[]>(
    mapValuesToTokens(settings.filterIncludeHandles),
  );

  const addIncludeHandlesToken = (
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>,
  ) => {
    const value = (event.target as HTMLInputElement).value.trim();

    if (value.length > 0 && !includeHandles.some((v) => v.text === value)) {
      setIncludeHandles([
        ...includeHandles,
        { id: includeHandles.length, text: value },
      ]);
      updateFilter('filterIncludeHandles', value as UserHandle, true);

      (event.target as HTMLInputElement).value = '';
    }
  };

  const removeIncludeHandleToken = (tokenId: string | number) => {
    const value = includeHandles.find((v) => v.id === tokenId)?.text || '';
    updateFilter('filterIncludeHandles', value as UserHandle, false);

    setIncludeHandles(includeHandles.filter((v) => v.id !== tokenId));
  };

  const includeHandlesKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (tokenEvents.includes(event.key)) {
      addIncludeHandlesToken(event);
    }
  };

  const [excludeHandles, setExcludeHandles] = useState<InputToken[]>(
    mapValuesToTokens(settings.filterExcludeHandles),
  );

  const addExcludeHandlesToken = (
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>,
  ) => {
    const value = (event.target as HTMLInputElement).value.trim();

    if (value.length > 0 && !excludeHandles.some((v) => v.text === value)) {
      setExcludeHandles([
        ...excludeHandles,
        { id: excludeHandles.length, text: value },
      ]);
      updateFilter('filterExcludeHandles', value as UserHandle, true);

      (event.target as HTMLInputElement).value = '';
    }
  };

  const removeExcludeHandleToken = (tokenId: string | number) => {
    const value = excludeHandles.find((v) => v.id === tokenId)?.text || '';
    updateFilter('filterExcludeHandles', value as UserHandle, false);

    setExcludeHandles(excludeHandles.filter((v) => v.id !== tokenId));
  };

  const excludeHandlesKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (tokenEvents.includes(event.key)) {
      addExcludeHandlesToken(event);
    }
  };

  return (
    <fieldset id="filter-user-handles">
      <Stack align="baseline" direction="horizontal" gap="condensed">
        <Title icon={MentionIcon}>Handles</Title>
        <Tooltip
          name="tooltip-filter-handles"
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>Filter notifications by user handle.</Text>
              <RequiresDetailedNotificationWarning />
            </Stack>
          }
        />
      </Stack>
      <Stack direction="vertical" gap="condensed">
        <Stack
          align="center"
          className="text-sm"
          direction="horizontal"
          gap="condensed"
        >
          <Box className="font-medium text-gitify-font w-28">
            <Stack align="center" direction="horizontal" gap="condensed">
              <CheckCircleFillIcon className={IconColor.GREEN} />
              <Text>Include:</Text>
            </Stack>
          </Box>
          <TextInputWithTokens
            block
            disabled={
              !settings.detailedNotifications ||
              hasExcludeHandleFilters(settings)
            }
            onBlur={addIncludeHandlesToken}
            onKeyDown={includeHandlesKeyDown}
            onTokenRemove={removeIncludeHandleToken}
            size="small"
            title="Include handles"
            tokens={includeHandles}
          />
        </Stack>

        <Stack
          align="center"
          className="text-sm"
          direction="horizontal"
          gap="condensed"
        >
          <Box className="font-medium text-gitify-font w-28">
            <Stack align="center" direction="horizontal" gap="condensed">
              <NoEntryFillIcon className={IconColor.RED} />
              <Text>Exclude:</Text>
            </Stack>
          </Box>
          <TextInputWithTokens
            block
            disabled={
              !settings.detailedNotifications ||
              hasIncludeHandleFilters(settings)
            }
            onBlur={addExcludeHandlesToken}
            onKeyDown={excludeHandlesKeyDown}
            onTokenRemove={removeExcludeHandleToken}
            size="small"
            title="Exclude handles"
            tokens={excludeHandles}
          />
        </Stack>
      </Stack>
    </fieldset>
  );
};
