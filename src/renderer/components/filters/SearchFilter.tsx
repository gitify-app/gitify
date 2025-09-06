import { type FC, useContext, useEffect, useId, useState } from 'react';

import {
  CheckCircleFillIcon,
  NoEntryFillIcon,
  OrganizationIcon,
  PersonIcon,
  RepoIcon,
  SearchIcon,
} from '@primer/octicons-react';
import {
  ActionList,
  Box,
  Popover,
  Stack,
  Text,
  TextInputWithTokens,
} from '@primer/react';

import { AppContext } from '../../context/App';
import { IconColor, type SearchToken, Size } from '../../types';
import {
  hasExcludeSearchFilters,
  hasIncludeSearchFilters,
  SEARCH_PREFIXES,
} from '../../utils/notifications/filters/search';
import { Tooltip } from '../fields/Tooltip';
import { Title } from '../primitives/Title';
import { RequiresDetailedNotificationWarning } from './RequiresDetailedNotificationsWarning';

type InputToken = { id: number; text: string };

type Qualifier = {
  key: string; // the qualifier prefix shown to user (author, org, repo)
  description: string;
  example: string;
};

const QUALIFIERS: Qualifier[] = [
  {
    key: 'author:',
    description: 'Filter by notification author',
    example: 'author:octocat',
  },
  {
    key: 'org:',
    description: 'Filter by organization owner',
    example: 'org:microsoft',
  },
  {
    key: 'repo:',
    description: 'Filter by repository full name',
    example: 'repo:gitify-app/gitify',
  },
];

const tokenEvents = ['Enter', 'Tab', ' ', ','];

function parseRawValue(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  // Find a matching prefix (prefixes already include the colon)
  const matched = SEARCH_PREFIXES.find((p) =>
    value.toLowerCase().startsWith(p),
  );
  if (!matched) return null;
  const rest = value.substring(matched.length);
  if (rest.length === 0) return null;
  return `${matched}${rest}`; // matched already has ':'
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

  const [includeInputValue, setIncludeInputValue] = useState('');
  const [showIncludeSuggestions, setShowIncludeSuggestions] = useState(false);

  const includeSearchTokensKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (tokenEvents.includes(event.key)) {
      addIncludeSearchToken(event);
      setShowIncludeSuggestions(false);
    } else if (event.key === 'ArrowDown') {
      setShowIncludeSuggestions(true);
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

  const [excludeInputValue, setExcludeInputValue] = useState('');
  const [showExcludeSuggestions, setShowExcludeSuggestions] = useState(false);

  const excludeSearchTokensKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (tokenEvents.includes(event.key)) {
      addExcludeSearchToken(event);
      setShowExcludeSuggestions(false);
    } else if (event.key === 'ArrowDown') {
      setShowExcludeSuggestions(true);
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
          <Box flexGrow={1} position="relative">
            <TextInputWithTokens
              block
              disabled={
                !settings.detailedNotifications ||
                hasExcludeSearchFilters(settings)
              }
              onBlur={(e) => {
                addIncludeSearchToken(e);
                setShowIncludeSuggestions(false);
              }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setIncludeInputValue(e.target.value);
                // Show suggestions once user starts typing or clears until prefix chosen
                const val = e.target.value.trim();
                if (!val.includes(':')) {
                  setShowIncludeSuggestions(true);
                } else {
                  setShowIncludeSuggestions(false);
                }
              }}
              onKeyDown={includeSearchTokensKeyDown}
              onTokenRemove={removeIncludeSearchToken}
              placeholder="author:octocat org:microsoft repo:gitify"
              size="small"
              title="Include searches"
              tokens={includeSearchTokens}
            />
            {showIncludeSuggestions && (
              <Popover
                caret={false}
                onOpenChange={() => setShowIncludeSuggestions(false)}
                open
              >
                <Popover.Content sx={{ p: 0, mt: 1, width: '100%' }}>
                  <ActionList>
                    {QUALIFIERS.filter(
                      (q) =>
                        q.key.startsWith(includeInputValue.toLowerCase()) ||
                        includeInputValue === '',
                    ).map((q) => (
                      <ActionList.Item
                        key={q.key}
                        onSelect={() => {
                          setIncludeInputValue(`${q.key}:`);
                          const inputEl =
                            document.querySelector<HTMLInputElement>(
                              `fieldset#${fieldsetId} input[title='Include searches']`,
                            );
                          if (inputEl) {
                            inputEl.value = `${q.key}:`;
                            inputEl.focus();
                          }
                          setShowIncludeSuggestions(false);
                        }}
                      >
                        <Stack direction="vertical" gap="none">
                          <Text>{q.key}</Text>
                          <Text className="text-xs opacity-70">
                            {q.description}
                          </Text>
                        </Stack>
                      </ActionList.Item>
                    ))}
                  </ActionList>
                </Popover.Content>
              </Popover>
            )}
          </Box>
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
          <Box flexGrow={1} position="relative">
            <TextInputWithTokens
              block
              disabled={
                !settings.detailedNotifications ||
                hasIncludeSearchFilters(settings)
              }
              onBlur={(e) => {
                addExcludeSearchToken(e);
                setShowExcludeSuggestions(false);
              }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setExcludeInputValue(e.target.value);
                const val = e.target.value.trim();
                if (!val.includes(':')) {
                  setShowExcludeSuggestions(true);
                } else {
                  setShowExcludeSuggestions(false);
                }
              }}
              onKeyDown={excludeSearchTokensKeyDown}
              onTokenRemove={removeExcludeSearchToken}
              placeholder="author:spambot org:legacycorp repo:oldrepo"
              size="small"
              title="Exclude searches"
              tokens={excludeSearchTokens}
            />
            {showExcludeSuggestions && (
              <Popover
                caret={false}
                onOpenChange={() => setShowExcludeSuggestions(false)}
                open
              >
                <Popover.Content sx={{ p: 0, mt: 1, width: '100%' }}>
                  <ActionList>
                    {QUALIFIERS.filter(
                      (q) =>
                        q.key.startsWith(excludeInputValue.toLowerCase()) ||
                        excludeInputValue === '',
                    ).map((q) => (
                      <ActionList.Item
                        key={q.key}
                        onSelect={() => {
                          setExcludeInputValue(`${q.key}:`);
                          const inputEl =
                            document.querySelector<HTMLInputElement>(
                              `fieldset#${fieldsetId} input[title='Exclude searches']`,
                            );
                          if (inputEl) {
                            inputEl.value = `${q.key}:`;
                            inputEl.focus();
                          }
                          setShowExcludeSuggestions(false);
                        }}
                      >
                        <Stack direction="vertical" gap="none">
                          <Text>{q.key}</Text>
                          <Text className="text-xs opacity-70">
                            {q.description}
                          </Text>
                        </Stack>
                      </ActionList.Item>
                    ))}
                  </ActionList>
                </Popover.Content>
              </Popover>
            )}
          </Box>
        </Stack>
      </Stack>
    </fieldset>
  );
};
