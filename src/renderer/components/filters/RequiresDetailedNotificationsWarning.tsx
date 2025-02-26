import { Text } from '@primer/react';
import type { FC } from 'react';

export const RequiresDetailedNotificationWarning: FC = () => (
  <Text className="text-gitify-caution">
    ⚠️ This filter requires the <Text as="strong">Detailed Notifications</Text>{' '}
    setting to be enabled.
  </Text>
);
