import { type FC, useCallback, useContext, useState } from 'react';

import { Button, Dialog, Stack, Text } from '@primer/react';

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
        data-testid="settings-reset"
        onClick={() => setIsOpen(!isOpen)}
        sx={{ width: '200px' }}
        variant="danger"
      >
        Reset Settings
      </Button>
      {isOpen && (
        <Dialog
          data-testid="reset-dialog"
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
          onClose={onDialogClose}
          title="Reset Settings"
          width="large"
        >
          Please confirm that you want to reset all settings to the{' '}
          <Text as="strong">Gitify defaults</Text>
        </Dialog>
      )}
    </Stack>
  );
};
