import { type FC, useState } from 'react';

import { Box, Stack, Text, TextInputWithTokens } from '@primer/react';

import type { SearchToken } from '../../types';
import {
  parseSearchInput,
  SEARCH_DELIMITER,
} from '../../utils/notifications/filters/search';
import { SearchFilterSuggestions } from './SearchFilterSuggestions';

interface TokenSearchInputProps {
  label: string;
  icon: FC<{ className?: string }>;
  iconColorClass: string;
  tokens: readonly SearchToken[]; // raw token strings
  showSuggestionsOnFocusIfEmpty: boolean;
  onAdd: (token: SearchToken) => void;
  onRemove: (token: SearchToken) => void;
}

const INPUT_KEY_EVENTS = ['Enter', 'Tab', ' ', ','];

export const TokenSearchInput: FC<TokenSearchInputProps> = ({
  label,
  icon: Icon,
  iconColorClass,
  tokens,
  showSuggestionsOnFocusIfEmpty,
  onAdd,
  onRemove,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const tokenItems = tokens.map((text, id) => ({ id, text }));

  function tryAddToken(
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>,
  ) {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = parseSearchInput(raw);
    const token = parsed?.token as SearchToken | undefined;
    if (token && !tokens.includes(token)) {
      onAdd(token);
      (event.target as HTMLInputElement).value = '';
      setInputValue('');
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (INPUT_KEY_EVENTS.includes(e.key)) {
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
          onTokenRemove={(id) => {
            const token = tokenItems.find((t) => t.id === id)?.text;

            if (token) {
              onRemove(token);
            }
          }}
          size="small"
          title={`${label} searches`}
          tokens={tokenItems}
        />
        <SearchFilterSuggestions
          inputValue={inputValue}
          open={showSuggestions}
        />
      </Box>
    </Stack>
  );
};
