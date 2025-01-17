import { type FC, useCallback, useContext, useState } from 'react';

import { GearIcon } from '@primer/octicons-react';
import { Button, Stack } from '@primer/react';
import { Dialog } from '@primer/react/experimental';

import { Contents } from '../components/primitives/Contents';
import { Header } from '../components/primitives/Header';
import { Page } from '../components/primitives/Page';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { SettingsFooter } from '../components/settings/SettingsFooter';
import { SystemSettings } from '../components/settings/SystemSettings';
import { AppContext } from '../context/App';

export const SettingsRoute: FC = () => {
  const { resetSettings } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const onDialogClose = useCallback(() => setIsOpen(false), []);
  const onDialogProceed = useCallback(() => {
    resetSettings();
    setIsOpen(false);
  }, [resetSettings]);

  return (
    <Page id="settings">
      <Header fetchOnBack icon={GearIcon}>
        Settings
      </Header>

      <Contents>
        <Stack direction="vertical" gap="spacious">
          <AppearanceSettings />
          <NotificationSettings />
          <SystemSettings />
        </Stack>
        <Stack align="center">
          <Button
            variant="danger"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="settings-reset"
            sx={{ width: '200px' }} // Set the width of the button
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
              <strong>Gitify defaults</strong>
            </Dialog>
          )}
        </Stack>
      </Contents>

      <SettingsFooter />
    </Page>
  );
};
