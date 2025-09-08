import type { FC } from 'react';

import { Box, Popover, Stack, Text } from '@primer/react';

import { Opacity } from '../../types';
import { cn } from '../../utils/cn';
import {
  SEARCH_DELIMITER,
  SEARCH_QUALIFIERS,
} from '../../utils/notifications/filters/search';

const QUALIFIERS = Object.values(SEARCH_QUALIFIERS);

interface SearchFilterSuggestionsProps {
  open: boolean;
  inputValue: string;
  isDetailedNotificationsEnabled: boolean;
  onClose: () => void;
}

export const SearchFilterSuggestions: FC<SearchFilterSuggestionsProps> = ({
  open,
  inputValue,
  isDetailedNotificationsEnabled,
  onClose,
}) => {
  if (!open) {
    return null;
  }

  const lower = inputValue.toLowerCase();
  const base = isDetailedNotificationsEnabled
    ? QUALIFIERS
    : QUALIFIERS.filter((q) => !q.requiresDetailsNotifications);
  const suggestions = base.filter(
    (q) => q.prefix.startsWith(lower) || inputValue === '',
  );
  const beginsWithKnownQualifier = base.some((q) =>
    lower.startsWith(q.prefix),
  );

  return (
    <Popover caret={false} onOpenChange={onClose} open>
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
                  {base.map((q) =>
                    q.prefix.replace(SEARCH_DELIMITER, ''),
                  ).join(', ')}
                  ]
                </Text>
              </Box>
            )}
        </Stack>
      </Popover.Content>
    </Popover>
  );
};
