import type { Icon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

interface SettingsGroupHeadingProps {
  icon: Icon;
  children: string;
}

export function SettingsGroupHeading({
  icon: Icon,
  children,
}: Readonly<SettingsGroupHeadingProps>) {
  return (
    // Primer's Stack zeroes its own padding, so this needs an important value.
    // 1rem plus the preceding row's 8px padding keeps the same 24px separation
    // that section headings get, without drawing a divider after the last row.
    <Stack align="center" className="pb-2 pt-[1rem]!" direction="horizontal" gap="condensed">
      <Icon className="text-gitify-icon-muted" size={14} />
      <Text as="h5" className="text-sm font-semibold text-gitify-font">
        {children}
      </Text>
    </Stack>
  );
}
