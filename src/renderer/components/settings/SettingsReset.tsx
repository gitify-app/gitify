import type { FC } from 'react';

import { Button, Stack, useConfirm } from '@primer/react';

import { useSettingsStore } from '../../stores';

import { rendererLogInfo } from '../../utils/logger';

export const SettingsReset: FC = () => {
  const resetSettings = useSettingsStore((s) => s.reset);

  const confirm = useConfirm();

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Reset settings?',
      content:
        'Please confirm that you want to reset all settings to the Gitify defaults',

      confirmButtonContent: 'Reset',
      cancelButtonContent: 'Cancel',
      confirmButtonType: 'danger',
    });

    if (confirmed) {
      resetSettings();
      rendererLogInfo('settingsReset', 'Settings have been reset to defaults');
    }
  };

  return (
    <Stack align="center">
      <Button
        className="w-[200px]"
        data-testid="settings-reset"
        onClick={handleReset}
        variant="danger"
      >
        Reset Settings
      </Button>
    </Stack>
  );
};
