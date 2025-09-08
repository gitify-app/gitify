import { type FC, useContext, useEffect, useId, useState } from 'react';

import {
  CheckCircleFillIcon,
  NoEntryFillIcon,
  OrganizationIcon,
  PersonIcon,
  RepoIcon,
  SearchIcon,
} from '@primer/octicons-react';
import { Box, Stack, Text } from '@primer/react';

import { AppContext } from '../../context/App';
import { IconColor, type SearchToken, Size } from '../../types';
import { cn } from '../../utils/cn';
import {
  hasExcludeSearchFilters,
  hasIncludeSearchFilters,
} from '../../utils/notifications/filters/search';
import { Title } from '../primitives/Title';
import { RequiresDetailedNotificationWarning } from './RequiresDetailedNotificationsWarning';
import { TokenSearchInput } from './TokenSearchInput';

type InputToken = { id: number; text: string };

export const SearchFilter: FC = () => {
  const { updateFilter, settings } = useContext(AppContext);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only run on search filter changes
  useEffect(() => {
    if (!hasIncludeSearchFilters(settings)) {
      setIncludeSearchTokens([]);
    }

    if (!hasExcludeSearchFilters(settings)) {
      setExcludeSearchTokens([]);
    }
  }, [settings.filterIncludeSearchTokens, settings.filterExcludeSearchTokens]);

  const mapValuesToTokens = (values: string[]): InputToken[] =>
    values.map((value, index) => ({ id: index, text: value }));

  const [includeSearchTokens, setIncludeSearchTokens] = useState<InputToken[]>(
    mapValuesToTokens(settings.filterIncludeSearchTokens),
  );

  const addIncludeSearchToken = (value: string) => {
    if (!value || includeSearchTokens.some((v) => v.text === value)) return;
    const nextId =
      includeSearchTokens.reduce((m, t) => Math.max(m, t.id), -1) + 1;
    setIncludeSearchTokens([
      ...includeSearchTokens,
      { id: nextId, text: value },
    ]);
    updateFilter('filterIncludeSearchTokens', value as SearchToken, true);
  };

  const removeIncludeSearchToken = (tokenId: string | number) => {
    const value = includeSearchTokens.find((v) => v.id === tokenId)?.text || '';
    if (value)
      updateFilter('filterIncludeSearchTokens', value as SearchToken, false);
    setIncludeSearchTokens(includeSearchTokens.filter((v) => v.id !== tokenId));
  };

  const [excludeSearchTokens, setExcludeSearchTokens] = useState<InputToken[]>(
    mapValuesToTokens(settings.filterExcludeSearchTokens),
  );

  const addExcludeSearchToken = (value: string) => {
    if (!value || excludeSearchTokens.some((v) => v.text === value)) return;
    const nextId =
      excludeSearchTokens.reduce((m, t) => Math.max(m, t.id), -1) + 1;
    setExcludeSearchTokens([
      ...excludeSearchTokens,
      { id: nextId, text: value },
    ]);
    updateFilter('filterExcludeSearchTokens', value as SearchToken, true);
  };

  const removeExcludeSearchToken = (tokenId: string | number) => {
    const value = excludeSearchTokens.find((v) => v.id === tokenId)?.text || '';
    if (value)
      updateFilter('filterExcludeSearchTokens', value as SearchToken, false);
    setExcludeSearchTokens(excludeSearchTokens.filter((v) => v.id !== tokenId));
  };

  // Basic suggestions for prefixes
  const fieldsetId = useId();

  return (
    <fieldset id={fieldsetId}>
      <Title
        icon={SearchIcon}
        tooltip={
          <Stack direction="vertical" gap="condensed">
            <Text>Filter notifications by:</Text>
            <Box className="pl-4">
              <Stack direction="vertical" gap="condensed">
                <Stack direction="horizontal" gap="condensed">
                  <PersonIcon size={Size.SMALL} />
                  <Text
                    className={cn(
                      'text-gitify-caution',
                      !settings.detailedNotifications && 'line-through',
                    )}
                  >
                    Author (author:handle)
                  </Text>
                </Stack>
                <Stack direction="horizontal" gap="condensed">
                  <OrganizationIcon size={Size.SMALL} />
                  <Text>Organization (org:name)</Text>
                </Stack>
                <Stack direction="horizontal" gap="condensed">
                  <RepoIcon size={Size.SMALL} />
                  <Text>Repository (repo:fullname)</Text>
                </Stack>
              </Stack>
            </Box>
            <RequiresDetailedNotificationWarning />
          </Stack>
        }
      >
        Search
      </Title>

      <Stack direction="vertical" gap="condensed">
        <TokenSearchInput
          icon={CheckCircleFillIcon}
          iconColorClass={IconColor.GREEN}
          label="Include"
          onAdd={addIncludeSearchToken}
          onRemove={removeIncludeSearchToken}
          showSuggestionsOnFocusIfEmpty={!hasIncludeSearchFilters(settings)}
          tokens={includeSearchTokens}
        />
        <TokenSearchInput
          icon={NoEntryFillIcon}
          iconColorClass={IconColor.RED}
          label="Exclude"
          onAdd={addExcludeSearchToken}
          onRemove={removeExcludeSearchToken}
          showSuggestionsOnFocusIfEmpty={!hasExcludeSearchFilters(settings)}
          tokens={excludeSearchTokens}
        />
      </Stack>
    </fieldset>
  );
};
