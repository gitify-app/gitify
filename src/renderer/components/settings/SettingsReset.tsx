import { useTranslation } from 'react-i18next';

import { Button, Stack, useConfirm } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { useSettingsStore } from '../../stores';

import { rendererLogInfo } from '../../utils/core/logger';

export function SettingsReset() {
  const { t } = useTranslation();
  const resetSettings = useSettingsStore((s) => s.reset);

  const confirm = useConfirm();

  const handleReset = async () => {
    const confirmed = await confirm({
      title: t('settings.reset.confirm_title', 'Reset settings?'),
      content: t(
        'settings.reset.confirm_content',
        'Please confirm that you want to reset all settings to the {{appName}} defaults',
        { appName: APPLICATION.NAME },
      ),

      confirmButtonContent: t('settings.reset.confirm', 'Reset'),
      cancelButtonContent: t('common.cancel', 'Cancel'),
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
        {t('settings.reset.title', 'Reset Settings')}
      </Button>
    </Stack>
  );
}
