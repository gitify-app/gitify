import type { FC } from 'react';

import { ActionList, Popover, Text } from '@primer/react';

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
  if (!open) return null;

  return (
    <Popover caret={false} onOpenChange={onClose} open>
      <Popover.Content sx={{ p: 0, mt: 1, width: '100%' }}>
        <ActionList>
          {QUALIFIERS.filter(
            (q) =>
              q.prefix.startsWith(inputValue.toLowerCase()) ||
              inputValue === '',
          ).map((q) => (
            <ActionList.Item key={q.prefix}>
              <Text className="text-xs">{q.prefix}</Text>
              <ActionList.Description variant="block">
                <Text className="text-xs">{q.description}</Text>
              </ActionList.Description>
            </ActionList.Item>
          ))}
        </ActionList>
      </Popover.Content>
    </Popover>
  );
};
