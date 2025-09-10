import { type FC, useContext } from 'react';

import { Box, Popover, Stack, Text } from '@primer/react';

import { AppContext } from '../../context/App';
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
  const { settings } = useContext(AppContext);

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
    <Popover open>
      <Popover.Content sx={{ p: 2, mt: 2, width: '100%' }}>
        <Stack direction="vertical" gap="condensed">
          {suggestions.length > 0 &&
            suggestions.map((q) => (
              <Box key={q.prefix}>
                <Stack direction="vertical" gap="none">
                  <Text className="text-xs font-semibold">{q.prefix}</Text>
                  <Text className={cn('text-xs', Opacity.HIGH)}>
                    {q.description}
                  </Text>
                </Stack>
              </Box>
            ))}
          {inputValue !== '' &&
            suggestions.length === 0 &&
            !beginsWithKnownQualifier && (
              <Box>
                <Text className={cn('text-xs', Opacity.HIGH)}>
                  Please use one of the supported filters [
                  {base
                    .map((q) => q.prefix.replace(SEARCH_DELIMITER, ''))
                    .join(', ')}
                  ]
                </Text>
              </Box>
            )}
        </Stack>
      </Popover.Content>
    </Popover>
  );
};
