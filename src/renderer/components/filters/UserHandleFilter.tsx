import { type FC, useContext, useEffect, useState } from 'react';

import { Box, Stack, Text, TextInputWithTokens } from '@primer/react';

import {
  CheckCircleFillIcon,
  MentionIcon,
  NoEntryFillIcon,
} from '@primer/octicons-react';
import { AppContext } from '../../context/App';
import { IconColor, type UserHandle } from '../../types';
import {
  hasExcludeHandleFilters,
  hasIncludeHandleFilters,
} from '../../utils/notifications/filters/handles';
import { Tooltip } from '../fields/Tooltip';
import { Title } from '../primitives/Title';

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
    <fieldset id="filter-user-handles" className="mb-3">
      <Stack direction="horizontal" gap="condensed" align="baseline">
        <Title icon={MentionIcon}>Handles</Title>
        <Tooltip
          name="tooltip-filter-handles"
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>Filter notifications by user handle.</Text>
              <Text className="text-gitify-caution">
                ⚠️ This filter requires the{' '}
                <Text as="strong">Detailed Notifications</Text> setting to be
                enabled.
              </Text>
            </Stack>
          }
        />
      </Stack>
      <Stack direction="vertical" gap="condensed">
        <Stack
          direction="horizontal"
          gap="condensed"
          align="center"
          className="text-sm"
        >
          <Box className="font-medium text-gitify-font w-28">
            <Stack direction="horizontal" gap="condensed" align="center">
              <CheckCircleFillIcon className={IconColor.GREEN} />
              <Text>Include:</Text>
            </Stack>
          </Box>
          <TextInputWithTokens
            title="Include handles"
            tokens={includeHandles}
            onTokenRemove={removeIncludeHandleToken}
            onKeyDown={includeHandlesKeyDown}
            onBlur={addIncludeHandlesToken}
            size="small"
            disabled={
              !settings.detailedNotifications ||
              hasExcludeHandleFilters(settings)
            }
            block
          />
        </Stack>

        <Stack
          direction="horizontal"
          gap="condensed"
          align="center"
          className="text-sm"
        >
          <Box className="font-medium text-gitify-font w-28">
            <Stack direction="horizontal" gap="condensed" align="center">
              <NoEntryFillIcon className={IconColor.RED} />
              <Text>Exclude:</Text>
            </Stack>
          </Box>
          <TextInputWithTokens
            title="Exclude handles"
            tokens={excludeHandles}
            onTokenRemove={removeExcludeHandleToken}
            onKeyDown={excludeHandlesKeyDown}
            onBlur={addExcludeHandlesToken}
            size="small"
            disabled={
              !settings.detailedNotifications ||
              hasIncludeHandleFilters(settings)
            }
            block
          />
        </Stack>
      </Stack>
    </fieldset>
  );
};
