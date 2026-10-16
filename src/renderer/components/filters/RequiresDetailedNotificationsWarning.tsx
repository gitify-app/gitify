import { Text } from '@primer/react';

export function RequiresDetailedNotificationWarning() {
  return (
    <Text className="text-gitify-caution">
      ⚠️ This filter requires the <Text as="strong">Detailed Notifications</Text> setting to be
      enabled.
    </Text>
  );
}
