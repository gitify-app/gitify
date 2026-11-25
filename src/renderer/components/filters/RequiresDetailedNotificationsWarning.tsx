import { Trans } from 'react-i18next';

import { Text } from '@primer/react';

export function RequiresDetailedNotificationWarning() {
  return (
    <Text className="text-gitify-caution">
      <Trans
        i18nKey="filters.requires_detailed_notifications"
        components={[<Text as="strong" key={0} />]}
        defaults="⚠️ This filter requires the <0>Detailed Notifications</0> setting to be enabled."
      />
    </Text>
  );
}
