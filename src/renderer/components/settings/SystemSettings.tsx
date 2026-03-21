import { type FC, useEffect, useRef, useState } from 'react';

import { DeviceDesktopIcon, SyncIcon } from '@primer/octicons-react';
import {
  Banner,
  Button,
  ButtonGroup,
  IconButton,
  Stack,
  Text,
} from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { defaultSettings } from '../../context/defaults';
import { useAppContext } from '../../hooks/useAppContext';

import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';
import { Title } from '../primitives/Title';

import { OpenPreference } from '../../types';

import {
  canDecreaseVolume,
  canIncreaseVolume,
  decreaseVolume,
  increaseVolume,
} from '../../utils/ui/volume';

import {
  formatAcceleratorForDisplay,
  keyboardEventToAccelerator,
} from '../../utils/system/keyboardShortcut';
import { VolumeDownIcon } from '../icons/VolumeDownIcon';
import { VolumeUpIcon } from '../icons/VolumeUpIcon';

export const SystemSettings: FC = () => {
  const {
    settings,
    updateSetting,
    shortcutRegistrationError,
    clearShortcutRegistrationError,
  } = useAppContext();

  const [recordingShortcut, setRecordingShortcut] = useState(false);
  const shortcutRowRef = useRef<HTMLDivElement>(null);
  const isMac = window.gitify.platform.isMacOS();

  useEffect(() => {
    if (!recordingShortcut) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (shortcutRowRef.current?.contains(event.target as Node)) {
        return;
      }
      setRecordingShortcut(false);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [recordingShortcut]);

  useEffect(() => {
    if (!recordingShortcut) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const accelerator = keyboardEventToAccelerator(event);
      if (accelerator) {
        clearShortcutRegistrationError();
        updateSetting('openGitifyShortcut', accelerator);
        setRecordingShortcut(false);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [recordingShortcut, updateSetting, clearShortcutRegistrationError]);

  const shortcutDisplay = formatAcceleratorForDisplay(
    settings.openGitifyShortcut,
    isMac,
  );

  return (
    <fieldset>
      <Title icon={DeviceDesktopIcon}>System</Title>

      <Stack direction="vertical" gap="condensed">
        <RadioGroup
          label="Open Links:"
          name="openLinks"
          onChange={(evt) => {
            updateSetting('openLinks', evt.target.value as OpenPreference);
          }}
          options={[
            { label: 'Foreground', value: OpenPreference.FOREGROUND },
            { label: 'Background', value: OpenPreference.BACKGROUND },
          ]}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                Controls the behavior of how external links should opened.
              </Text>
              <Text>
                <Text as="strong">Foreground</Text> will open the link and bring
                the opened window or browser to the front.
              </Text>
              <Text>
                <Text as="strong">Background</Text> opens the link without
                stealing focus from the current window.
              </Text>
            </Stack>
          }
          value={settings.openLinks}
        />

        {shortcutRegistrationError && (
          <Banner
            data-testid="banner-shortcut-registration-error"
            description={
              <Stack direction="vertical" gap="condensed">
                <Text>{shortcutRegistrationError}</Text>
                <Button
                  onClick={clearShortcutRegistrationError}
                  size="small"
                  variant="invisible"
                >
                  Dismiss
                </Button>
              </Stack>
            }
            hideTitle
            title="Shortcut error"
            variant="critical"
          />
        )}

        <Checkbox
          checked={settings.keyboardShortcut}
          label="Enable keyboard shortcut"
          name="keyboardShortcut"
          onChange={() =>
            updateSetting('keyboardShortcut', !settings.keyboardShortcut)
          }
          tooltip={
            <div>
              When enabled you can use{' '}
              <Text as="strong" className="text-gitify-caution">
                {shortcutDisplay}
              </Text>{' '}
              to show or hide {APPLICATION.NAME}.
            </div>
          }
        />

        {settings.keyboardShortcut && (
          <Stack
            className="text-sm"
            direction="vertical"
            gap="condensed"
            ref={shortcutRowRef}
          >
            <Text>
              Global shortcut:{' '}
              <Text as="strong" className="text-gitify-caution">
                {recordingShortcut
                  ? 'Press keys… (click outside this area to cancel)'
                  : shortcutDisplay}
              </Text>
            </Text>
            <Stack
              align="center"
              className="flex-nowrap"
              direction="horizontal"
              gap="condensed"
            >
              <Button
                data-testid="button-record-global-shortcut"
                disabled={recordingShortcut}
                onClick={() => {
                  clearShortcutRegistrationError();
                  setRecordingShortcut(true);
                }}
                size="small"
              >
                Change shortcut
              </Button>
              <Button
                className="shrink-0"
                data-testid="button-reset-global-shortcut"
                disabled={
                  recordingShortcut ||
                  settings.openGitifyShortcut ===
                    APPLICATION.DEFAULT_KEYBOARD_SHORTCUT
                }
                onClick={() => {
                  clearShortcutRegistrationError();
                  updateSetting(
                    'openGitifyShortcut',
                    APPLICATION.DEFAULT_KEYBOARD_SHORTCUT,
                  );
                }}
                size="small"
                variant="danger"
              >
                Reset to default
              </Button>
            </Stack>
          </Stack>
        )}

        <Checkbox
          checked={settings.showNotifications}
          label="Show system notifications"
          name="showNotifications"
          onChange={() =>
            updateSetting('showNotifications', !settings.showNotifications)
          }
          tooltip={
            <Text>
              Display native operating system notifications for new unread
              notifications.
            </Text>
          }
        />

        <Stack
          align="center"
          className="text-sm"
          direction="horizontal"
          gap="condensed"
        >
          <Checkbox
            checked={settings.playSound}
            label="Play sound"
            name="playSound"
            onChange={() => updateSetting('playSound', !settings.playSound)}
          />

          <ButtonGroup
            className="ml-2"
            data-testid="settings-volume-group"
            hidden={!settings.playSound}
          >
            <IconButton
              aria-label="Volume down"
              data-testid="settings-volume-down"
              disabled={!canDecreaseVolume(settings.notificationVolume)}
              icon={VolumeDownIcon}
              onClick={() => {
                updateSetting(
                  'notificationVolume',
                  decreaseVolume(settings.notificationVolume),
                );
              }}
              size="small"
              unsafeDisableTooltip={true}
            />

            <Button aria-label="Volume percentage" disabled size="small">
              {settings.notificationVolume.toFixed(0)}%
            </Button>

            <IconButton
              aria-label="Volume up"
              data-testid="settings-volume-up"
              disabled={!canIncreaseVolume(settings.notificationVolume)}
              icon={VolumeUpIcon}
              onClick={() => {
                updateSetting(
                  'notificationVolume',
                  increaseVolume(settings.notificationVolume),
                );
              }}
              size="small"
              unsafeDisableTooltip={true}
            />

            <IconButton
              aria-label="Reset volume"
              data-testid="settings-volume-reset"
              icon={SyncIcon}
              onClick={() => {
                updateSetting(
                  'notificationVolume',
                  defaultSettings.notificationVolume,
                );
              }}
              size="small"
              unsafeDisableTooltip={true}
              variant="danger"
            />
          </ButtonGroup>
        </Stack>

        <Checkbox
          checked={settings.openAtStartup}
          label="Open at startup"
          name="openAtStartup"
          onChange={() =>
            updateSetting('openAtStartup', !settings.openAtStartup)
          }
          tooltip={
            <Text>Launch {APPLICATION.NAME} automatically at startup.</Text>
          }
          visible={!window.gitify.platform.isLinux()}
        />
      </Stack>
    </fieldset>
  );
};
