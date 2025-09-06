import { type FC, useContext, useEffect, useId, useState } from 'react';

import {
  CheckCircleFillIcon,
  NoEntryFillIcon,
  OrganizationIcon,
  PersonIcon,
  RepoIcon,
  SearchIcon,
} from '@primer/octicons-react';
import { Box, Stack, Text, TextInputWithTokens } from '@primer/react';

import { AppContext } from '../../context/App';
import { IconColor, type SearchToken, Size } from '../../types';
import {
  hasExcludeSearchFilters,
  hasIncludeSearchFilters,
} from '../../utils/notifications/filters/search';
import { Tooltip } from '../fields/Tooltip';
import { Title } from '../primitives/Title';
import { RequiresDetailedNotificationWarning } from './RequiresDetailedNotificationsWarning';

type InputToken = {
  id: number;
  text: string;
};

const tokenEvents = ['Enter', 'Tab', ' ', ','];

function parseRawValue(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (!value.includes(':')) return null; // must include prefix already
  const [prefix, rest] = value.split(':');
  if (!['author', 'org', 'repo'].includes(prefix) || rest.length === 0)
    return null;
  return `${prefix}:${rest}`;
}

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

  const addIncludeSearchToken = (
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>,
  ) => {
    const raw = (event.target as HTMLInputElement).value;
    const value = parseRawValue(raw);

    if (value && !includeSearchTokens.some((v) => v.text === value)) {
      setIncludeSearchTokens([
        ...includeSearchTokens,
        { id: includeSearchTokens.length, text: value },
      ]);
      updateFilter('filterIncludeSearchTokens', value as SearchToken, true);
      (event.target as HTMLInputElement).value = '';
    }
  };

  const removeIncludeSearchToken = (tokenId: string | number) => {
    const value = includeSearchTokens.find((v) => v.id === tokenId)?.text || '';
    updateFilter('filterIncludeSearchTokens', value as SearchToken, false);
    setIncludeSearchTokens(includeSearchTokens.filter((v) => v.id !== tokenId));
  };

  const includeSearchTokensKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (tokenEvents.includes(event.key)) {
      addIncludeSearchToken(event);
    }
  };

  const [excludeSearchTokens, setExcludeSearchTokens] = useState<InputToken[]>(
    mapValuesToTokens(settings.filterExcludeSearchTokens),
  );

  const addExcludeSearchToken = (
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>,
  ) => {
    const raw = (event.target as HTMLInputElement).value;
    const value = parseRawValue(raw);

    if (value && !excludeSearchTokens.some((v) => v.text === value)) {
      setExcludeSearchTokens([
        ...excludeSearchTokens,
        { id: excludeSearchTokens.length, text: value },
      ]);
      updateFilter('filterExcludeSearchTokens', value as SearchToken, true);
      (event.target as HTMLInputElement).value = '';
    }
  };

  const removeExcludeSearchToken = (tokenId: string | number) => {
    const value = excludeSearchTokens.find((v) => v.id === tokenId)?.text || '';
    updateFilter('filterExcludeSearchTokens', value as SearchToken, false);
    setExcludeSearchTokens(excludeSearchTokens.filter((v) => v.id !== tokenId));
  };

  const excludeSearchTokensKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (tokenEvents.includes(event.key)) {
      addExcludeSearchToken(event);
    }
  };

  // Basic suggestions for prefixes
  const fieldsetId = useId();

  return (
    <fieldset id={fieldsetId}>
      <Stack align="baseline" direction="horizontal" gap="condensed">
        <Title icon={SearchIcon}>Search</Title>
        <Tooltip
          name="tooltip-filter-actors"
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>Filter notifications by:</Text>
              <Box className="pl-4">
                <Stack direction="vertical" gap="condensed">
                  <Stack direction="horizontal" gap="condensed">
                    <PersonIcon size={Size.SMALL} />
                    Author (author:handle)
                  </Stack>
                  <Stack direction="horizontal" gap="condensed">
                    <OrganizationIcon size={Size.SMALL} />
                    Organization (org:orgname)
                  </Stack>
                  <Stack direction="horizontal" gap="condensed">
                    <RepoIcon size={Size.SMALL} /> Repository (repo:reponame)
                  </Stack>
                </Stack>
              </Box>
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
              hasExcludeSearchFilters(settings)
            }
            onBlur={addIncludeSearchToken}
            onKeyDown={includeSearchTokensKeyDown}
            onTokenRemove={removeIncludeSearchToken}
            placeholder="author:octocat org:microsoft repo:gitify"
            size="small"
            title="Include searches"
            tokens={includeSearchTokens}
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
              hasIncludeSearchFilters(settings)
            }
            onBlur={addExcludeSearchToken}
            onKeyDown={excludeSearchTokensKeyDown}
            onTokenRemove={removeExcludeSearchToken}
            placeholder="author:spambot org:legacycorp repo:oldrepo"
            size="small"
            title="Exclude searches"
            tokens={excludeSearchTokens}
          />
        </Stack>
      </Stack>
    </fieldset>
  );
};
