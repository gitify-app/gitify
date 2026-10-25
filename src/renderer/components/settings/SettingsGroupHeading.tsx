import type { Icon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

interface SettingsGroupHeadingProps {
  icon: Icon;
  children: string;
  divider?: boolean;
}

export function SettingsGroupHeading({
  icon: Icon,
  children,
  divider = true,
}: Readonly<SettingsGroupHeadingProps>) {
  return (
    <Stack
      align="center"
      className={divider ? 'border-t border-gitify-notification-border pt-4' : undefined}
      direction="horizontal"
      gap="condensed"
    >
      <Icon className="text-gitify-icon-muted" size={14} />
      <Text as="h5" className="text-sm font-semibold text-gitify-font">
        {children}
      </Text>
    </Stack>
  );
}
