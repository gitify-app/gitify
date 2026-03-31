import { type FC, useEffect, useRef, useState } from 'react';

import {
  DeviceDesktopIcon,
  PencilIcon,
  SyncIcon,
} from '@primer/octicons-react';
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
  emptyModifierState,
  formatAcceleratorForDisplay,
  formatModifiersForDisplay,
  keyboardEventToAccelerator,
  type ModifierState,
  modifiersFromEvent,
} from '../../utils/system/keyboardShortcut';
import {
  canDecreaseVolume,
  canIncreaseVolume,
  decreaseVolume,
  increaseVolume,
} from '../../utils/ui/volume';
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
  const [liveModifiers, setLiveModifiers] =
    useState<ModifierState>(emptyModifierState);
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
      setLiveModifiers(emptyModifierState);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      setLiveModifiers(modifiersFromEvent(event));

      const accelerator = keyboardEventToAccelerator(event);
      if (accelerator) {
        clearShortcutRegistrationError();
        updateSetting('openGitifyShortcut', accelerator);
        setLiveModifiers(emptyModifierState);
        setRecordingShortcut(false);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      setLiveModifiers(modifiersFromEvent(event));
    };

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
    };
  }, [recordingShortcut, updateSetting, clearShortcutRegistrationError]);

  const shortcutDisplay = formatAcceleratorForDisplay(
    settings.openGitifyShortcut,
    isMac,
  );

  const hasLiveModifiers =
    liveModifiers.meta ||
    liveModifiers.ctrl ||
    liveModifiers.shift ||
    liveModifiers.alt;
  const liveModifierDisplay = formatModifiersForDisplay(liveModifiers, isMac);

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

        <Stack
          align="center"
          className="text-sm"
          direction="horizontal"
          gap="condensed"
        >
          <Checkbox
            checked={settings.keyboardShortcut}
            label="Global shortcut"
            name="keyboardShortcut"
            onChange={() =>
              updateSetting('keyboardShortcut', !settings.keyboardShortcut)
            }
            tooltip={
              <Stack direction="vertical" gap="condensed">
                <Text>
                  Global keyboard shortcut to show or hide {APPLICATION.NAME}.
                </Text>
                <Text>Shortcuts must include:</Text>
                <div className="pl-2">
                  <Stack direction="vertical" gap="none">
                    <Stack direction="horizontal" gap="condensed">
                      <Text>•</Text>
                      <Text>
                        Primary modifier:{' '}
                        <Text as="strong" className="text-gitify-caution">
                          {formatAcceleratorForDisplay(
                            'CommandOrControl',
                            isMac,
                          )}
                        </Text>
                      </Text>
                    </Stack>
                    <Stack direction="horizontal" gap="condensed">
                      <Text>•</Text>
                      <Text>
                        Optional modifiers:{' '}
                        <Text as="strong" className="text-gitify-caution">
                          {formatAcceleratorForDisplay('Shift', isMac)}
                        </Text>
                        ,{' '}
                        <Text as="strong" className="text-gitify-caution">
                          {formatAcceleratorForDisplay('Alt', isMac)}
                        </Text>
                      </Text>
                    </Stack>
                    <Stack direction="horizontal" gap="condensed">
                      <Text>•</Text>
                      <Text>A non-modifier key (letter, number, etc.)</Text>
                    </Stack>
                  </Stack>
                </div>
              </Stack>
            }
          />

          <ButtonGroup
            className="ml-2"
            data-testid="settings-shortcut-group"
            hidden={!settings.keyboardShortcut}
          >
            <IconButton
              aria-label="Edit global shortcut"
              data-testid="settings-shortcut-edit"
              icon={PencilIcon}
              onClick={() => {
                clearShortcutRegistrationError();
                setRecordingShortcut(true);
              }}
              size="small"
              unsafeDisableTooltip={true}
            />
            <Button aria-label="Global shortcut" disabled size="small">
              <Text as="strong" className="text-gitify-caution">
                {recordingShortcut
                  ? hasLiveModifiers
                    ? `${liveModifierDisplay}…`
                    : 'Press keys…'
                  : shortcutDisplay}
              </Text>
            </Button>
            <IconButton
              aria-label="Reset global shortcut to default"
              data-testid="settings-shortcut-reset"
              icon={SyncIcon}
              onClick={() => {
                clearShortcutRegistrationError();
                updateSetting(
                  'openGitifyShortcut',
                  defaultSettings.openGitifyShortcut,
                );
              }}
              size="small"
              unsafeDisableTooltip={true}
              variant="danger"
            />
          </ButtonGroup>
        </Stack>

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
