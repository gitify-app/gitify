import type { FC } from 'react';

import { Box, Popover, Stack, Text } from '@primer/react';

import { Opacity } from '../../types';
import { cn } from '../../utils/cn';
import { SEARCH_QUALIFIERS } from '../../utils/notifications/filters/search';

const QUALIFIERS = Object.values(SEARCH_QUALIFIERS);

interface SearchFilterSuggestionsProps {
  open: boolean;
  inputValue: string;
  onClose: () => void;
}

export const SearchFilterSuggestions: FC<SearchFilterSuggestionsProps> = ({
  open,
  inputValue,
  onClose,
}) => {
  if (!open) {
    return null;
  }

  return (
    <Popover caret={false} onOpenChange={onClose} open>
      <Popover.Content sx={{ p: 2, mt: 2, width: '100%' }}>
        <Stack direction="vertical" gap="condensed">
          {QUALIFIERS.filter(
            (q) =>
              q.prefix.startsWith(inputValue.toLowerCase()) ||
              inputValue === '',
          ).map((q) => (
            <Box key={q.prefix}>
              <Stack direction="vertical" gap="none">
                <Text className="text-xs font-semibold">{q.prefix}</Text>
                <Text className={cn('text-xs', Opacity.HIGH)}>
                  {q.description}
                </Text>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Popover.Content>
    </Popover>
  );
};
