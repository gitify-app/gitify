import { type FC, useContext } from 'react';

import { Button, Stack, useConfirm } from '@primer/react';

import { AppContext } from '../../context/App';
import { rendererLogInfo } from '../../utils/logger';

export const SettingsReset: FC = () => {
  const { resetSettings } = useContext(AppContext);

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
        data-testid="settings-reset"
        onClick={handleReset}
        sx={{ width: '200px' }}
        variant="danger"
      >
        Reset Settings
      </Button>
    </Stack>
  );
};
