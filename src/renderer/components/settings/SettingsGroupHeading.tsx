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
    <Stack align="center" className="pt-2" direction="horizontal" gap="condensed">
      <Icon className="text-gitify-icon-muted" size={14} />
      <Text as="h5" className="text-sm font-semibold text-gitify-font">
        {children}
      </Text>
    </Stack>
  );
}
