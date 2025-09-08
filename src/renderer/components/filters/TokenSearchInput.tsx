import { type FC, useState } from 'react';

import { Box, Stack, Text, TextInputWithTokens } from '@primer/react';

import type { SearchToken } from '../../types';
import {
  normalizeSearchInputToToken,
  SEARCH_DELIMITER,
} from '../../utils/notifications/filters/search';
import { SearchFilterSuggestions } from './SearchFilterSuggestions';

export interface TokenInputItem {
  id: number; // stable index-based id (unique within its list)
  text: string; // actual token string (e.g. "author:octocat")
}

interface TokenSearchInputProps {
  label: string;
  icon: FC<{ className?: string }>;
  iconColorClass: string;
  tokens: TokenInputItem[];
  showSuggestionsOnFocusIfEmpty: boolean; 
  isDetailedNotificationsEnabled: boolean;
  onAdd: (token: string) => void;
  onRemove: (tokenId: string | number) => void;
}

const tokenEvents = ['Enter', 'Tab', ' ', ','];

export const TokenSearchInput: FC<TokenSearchInputProps> = ({
  label,
  icon: Icon,
  iconColorClass,
  tokens,
  showSuggestionsOnFocusIfEmpty,
  isDetailedNotificationsEnabled,
  onAdd,
  onRemove,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  function tryAddToken(
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>,
  ) {
    const raw = (event.target as HTMLInputElement).value;
    const value = normalizeSearchInputToToken(raw);
    if (value && !tokens.some((t) => t.text === value)) {
      onAdd(value as SearchToken);
      (event.target as HTMLInputElement).value = '';
      setInputValue('');
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (tokenEvents.includes(e.key)) {
      tryAddToken(e);
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown') {
      setShowSuggestions(true);
    }
  }

  return (
    <Stack
      align="center"
      className="text-sm"
      direction="horizontal"
      gap="condensed"
    >
      <Box className="font-medium text-gitify-font w-20">
        <Stack align="center" direction="horizontal" gap="condensed">
          <Icon className={iconColorClass} />
          <Text>{label}:</Text>
        </Stack>
      </Box>
      <Box flexGrow={1} position="relative">
        <TextInputWithTokens
          block
          onBlur={(e) => {
            tryAddToken(e);
            setShowSuggestions(false);
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value);
            const val = e.target.value.trim();
            if (
              !val.includes(SEARCH_DELIMITER) ||
              val.endsWith(SEARCH_DELIMITER)
            ) {
              setShowSuggestions(true);
            } else {
              setShowSuggestions(false);
            }
          }}
          onFocus={(e) => {
            if (
              showSuggestionsOnFocusIfEmpty &&
              (e.target as HTMLInputElement).value.trim() === ''
            ) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={onKeyDown}
          onTokenRemove={onRemove}
          size="small"
          title={`${label} searches`}
          tokens={tokens}
        />
        <SearchFilterSuggestions
          inputValue={inputValue}
          onClose={() => setShowSuggestions(false)}
          isDetailedNotificationsEnabled={isDetailedNotificationsEnabled}
          open={showSuggestions}
        />
      </Box>
    </Stack>
  );
};
