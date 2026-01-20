import type { FC } from 'react';

import { Popover, Stack, Text } from '@primer/react';

import { useAppContext } from '../../hooks/useAppContext';

import { Opacity } from '../../types';

import { cn } from '../../utils/cn';
import {
  ALL_SEARCH_QUALIFIERS,
  BASE_SEARCH_QUALIFIERS,
  SEARCH_DELIMITER,
} from '../../utils/notifications/filters/search';

interface SearchFilterSuggestionsProps {
  open: boolean;
  inputValue: string;
}

export const SearchFilterSuggestions: FC<SearchFilterSuggestionsProps> = ({
  open,
  inputValue,
}) => {
  const { settings } = useAppContext();

  if (!open) {
    return null;
  }

  const lower = inputValue.toLowerCase();
  const base = settings.detailedNotifications
    ? ALL_SEARCH_QUALIFIERS
    : BASE_SEARCH_QUALIFIERS;
  const suggestions = base.filter(
    (q) => q.prefix.startsWith(lower) || inputValue === '',
  );
  const beginsWithKnownQualifier = base.some((q) => lower.startsWith(q.prefix));

  return (
    <Popover caret="top-left" open>
      <Popover.Content className="p-2 mt-2" height="auto" width="auto">
        <Stack direction="vertical" gap="condensed">
          {suggestions.length > 0 &&
            suggestions.map((q) => (
              <div key={q.prefix}>
                <Stack direction="vertical" gap="none">
                  <Text className="text-xs font-semibold">{q.prefix}</Text>
                  <Text className={cn('text-xs', Opacity.HIGH)}>
                    {q.description}
                  </Text>
                </Stack>
              </div>
            ))}
          {inputValue !== '' &&
            suggestions.length === 0 &&
            !beginsWithKnownQualifier && (
              <div>
                <Text className={cn('text-xs', Opacity.HIGH)}>
                  Please use one of the supported filters [
                  {base
                    .map((q) => q.prefix.replace(SEARCH_DELIMITER, ''))
                    .join(', ')}
                  ]
                </Text>
              </div>
            )}
        </Stack>
      </Popover.Content>
    </Popover>
  );
};
