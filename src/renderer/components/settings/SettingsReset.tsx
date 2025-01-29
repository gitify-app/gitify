import { type FC, useCallback, useContext, useState } from 'react';

import { Button, Stack, Text } from '@primer/react';
import { Dialog } from '@primer/react/experimental';
import { AppContext } from '../../context/App';

export const SettingsReset: FC = () => {
  const { resetSettings } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const onDialogClose = useCallback(() => setIsOpen(false), []);
  const onDialogProceed = useCallback(() => {
    resetSettings();
    setIsOpen(false);
  }, [resetSettings]);

  return (
    <Stack align="center">
      <Button
        variant="danger"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="settings-reset"
        sx={{ width: '200px' }}
      >
        Reset Settings
      </Button>
      {isOpen && (
        <Dialog
          title="Reset Settings"
          width="large"
          onClose={onDialogClose}
          footerButtons={[
            {
              buttonType: 'default',
              content: 'Cancel',
              onClick: onDialogClose,
            },
            {
              buttonType: 'danger',
              content: 'Reset',
              onClick: onDialogProceed,
            },
          ]}
          data-testid="reset-dialog"
        >
          Please confirm that you want to reset all settings to the{' '}
          <Text as="strong">Gitify defaults</Text>
        </Dialog>
      )}
    </Stack>
  );
};
