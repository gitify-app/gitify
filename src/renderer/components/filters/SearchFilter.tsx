import { type FC, useEffect, useState } from 'react';

import {
  CheckCircleFillIcon,
  NoEntryFillIcon,
  OrganizationIcon,
  PersonIcon,
  RepoIcon,
  SearchIcon,
} from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { useAppContext } from '../../context/App';
import { IconColor, type SearchToken, Size } from '../../types';
import { cn } from '../../utils/cn';
import {
  hasExcludeSearchFilters,
  hasIncludeSearchFilters,
} from '../../utils/notifications/filters/search';
import { Title } from '../primitives/Title';
import { RequiresDetailedNotificationWarning } from './RequiresDetailedNotificationsWarning';
import { TokenSearchInput } from './TokenSearchInput';

export const SearchFilter: FC = () => {
  const { updateFilter, settings } = useAppContext();

  // biome-ignore lint/correctness/useExhaustiveDependencies: only run on search filter changes
  useEffect(() => {
    if (!hasIncludeSearchFilters(settings)) {
      setIncludeSearchTokens([]);
    }

    if (!hasExcludeSearchFilters(settings)) {
      setExcludeSearchTokens([]);
    }
  }, [settings.filterIncludeSearchTokens, settings.filterExcludeSearchTokens]);

  const [includeSearchTokens, setIncludeSearchTokens] = useState<SearchToken[]>(
    settings.filterIncludeSearchTokens,
  );

  const addIncludeSearchToken = (value: string) => {
    if (!value || includeSearchTokens.includes(value as SearchToken)) {
      return;
    }

    setIncludeSearchTokens([...includeSearchTokens, value as SearchToken]);
    updateFilter('filterIncludeSearchTokens', value as SearchToken, true);
  };

  const removeIncludeSearchToken = (token: SearchToken) => {
    if (!token) {
      return;
    }

    updateFilter('filterIncludeSearchTokens', token, false);
    setIncludeSearchTokens(includeSearchTokens.filter((t) => t !== token));
  };

  const [excludeSearchTokens, setExcludeSearchTokens] = useState<SearchToken[]>(
    settings.filterExcludeSearchTokens,
  );

  const addExcludeSearchToken = (value: string) => {
    if (!value || excludeSearchTokens.includes(value as SearchToken)) {
      return;
    }

    setExcludeSearchTokens([...excludeSearchTokens, value as SearchToken]);
    updateFilter('filterExcludeSearchTokens', value as SearchToken, true);
  };

  const removeExcludeSearchToken = (token: SearchToken) => {
    if (!token) {
      return;
    }

    updateFilter('filterExcludeSearchTokens', token, false);
    setExcludeSearchTokens(excludeSearchTokens.filter((t) => t !== token));
  };

  return (
    <fieldset>
      <Title
        icon={SearchIcon}
        tooltip={
          <Stack direction="vertical" gap="condensed">
            <Text>Filter notifications by:</Text>
            <div className="pl-4">
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
            </div>
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
