import type { FC } from 'react';

import {
  CheckCircleFillIcon,
  NoEntryFillIcon,
  OrganizationIcon,
  PersonIcon,
  RepoIcon,
  SearchIcon,
} from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { useAppContext } from '../../hooks/useAppContext';

import { Title } from '../primitives/Title';

import { IconColor, type SearchToken, Size } from '../../types';

import { useFiltersStore } from '../../stores';
import { cn } from '../../utils/cn';
import {
  hasExcludeSearchFilters,
  hasIncludeSearchFilters,
} from '../../utils/notifications/filters/search';
import { RequiresDetailedNotificationWarning } from './RequiresDetailedNotificationsWarning';
import { TokenSearchInput } from './TokenSearchInput';

export const SearchFilter: FC = () => {
  const { settings } = useAppContext();

  const updateFilter = useFiltersStore((s) => s.updateFilter);
  const includeSearchTokens = useFiltersStore((s) => s.includeSearchTokens);
  const excludeSearchTokens = useFiltersStore((s) => s.excludeSearchTokens);

  const addIncludeSearchToken = (value: string) => {
    if (!value || includeSearchTokens.includes(value as SearchToken)) {
      return;
    }

    updateFilter('includeSearchTokens', value as SearchToken, true);
  };

  const removeIncludeSearchToken = (token: SearchToken) => {
    if (!token) {
      return;
    }

    updateFilter('includeSearchTokens', token, false);
  };

  const addExcludeSearchToken = (value: string) => {
    if (!value || excludeSearchTokens.includes(value as SearchToken)) {
      return;
    }

    updateFilter('excludeSearchTokens', value as SearchToken, true);
  };

  const removeExcludeSearchToken = (token: SearchToken) => {
    if (!token) {
      return;
    }

    updateFilter('excludeSearchTokens', token, false);
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
          showSuggestionsOnFocusIfEmpty={!hasIncludeSearchFilters()}
          tokens={includeSearchTokens}
        />

        <TokenSearchInput
          icon={NoEntryFillIcon}
          iconColorClass={IconColor.RED}
          label="Exclude"
          onAdd={addExcludeSearchToken}
          onRemove={removeExcludeSearchToken}
          showSuggestionsOnFocusIfEmpty={!hasExcludeSearchFilters()}
          tokens={excludeSearchTokens}
        />
      </Stack>
    </fieldset>
  );
};
