import { type FC, useEffect, useRef, useState } from 'react';

import { DeviceDesktopIcon, PencilIcon, SyncIcon } from '@primer/octicons-react';
import { Banner, Button, ButtonGroup, IconButton, Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { useAppContext } from '../../hooks/useAppContext';
import { DEFAULT_SETTINGS_STATE, useSettingsStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';
import { Title } from '../primitives/Title';

import { type KeyboardAcceleratorShortcut, OpenPreference } from '../../types';

import {
  formatAcceleratorForDisplay,
  keyboardEventToAccelerator,
  MODIFIER_SEGMENTS,
} from '../../utils/system/keyboardShortcut';
import {
  canDecreaseVolume,
  canIncreaseVolume,
  decreaseVolume,
  increaseVolume,
} from '../../utils/ui/volume';
import { VolumeDownIcon } from '../icons/VolumeDownIcon';
import { VolumeUpIcon } from '../icons/VolumeUpIcon';

const defaultSettings = DEFAULT_SETTINGS_STATE;

export const SystemSettings: FC = () => {
  const { shortcutRegistrationError, clearShortcutRegistrationError } = useAppContext();

  // Setting store actions
  const toggleSetting = useSettingsStore((s) => s.toggleSetting);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  // Setting store values
  const openLinks = useSettingsStore((s) => s.openLinks);
  const keyboardShortcut = useSettingsStore((s) => s.keyboardShortcut);
  const openGitifyShortcut = useSettingsStore((s) => s.openGitifyShortcut);
  const showNotifications = useSettingsStore((s) => s.showNotifications);
  const playSound = useSettingsStore((s) => s.playSound);
  const notificationVolume = useSettingsStore((s) => s.notificationVolume);
  const keepWindowOnBlur = useSettingsStore((s) => s.keepWindowOnBlur);
  const openAtStartup = useSettingsStore((s) => s.openAtStartup);

  const [recordingShortcut, setRecordingShortcut] = useState(false);
  const [liveModifierAccelerator, setLiveModifierAccelerator] = useState('');
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
      setLiveModifierAccelerator('');
      return;
    }

    const activeModifierAccelerator = (event: KeyboardEvent) =>
      MODIFIER_SEGMENTS.filter((m) => m.test(event))
        .map((m) => m.accelerator)
        .join('+');

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      setLiveModifierAccelerator(activeModifierAccelerator(event));

      const accelerator = keyboardEventToAccelerator(event);
      if (accelerator) {
        clearShortcutRegistrationError();
        updateSetting('openGitifyShortcut', accelerator as KeyboardAcceleratorShortcut);
        setLiveModifierAccelerator('');
        setRecordingShortcut(false);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      setLiveModifierAccelerator(activeModifierAccelerator(event));
    };

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
    };
  }, [recordingShortcut, updateSetting, clearShortcutRegistrationError]);

  const shortcutDisplay = formatAcceleratorForDisplay(openGitifyShortcut, isMac);

  const hasLiveModifiers = liveModifierAccelerator.length > 0;
  const liveModifierDisplay = formatAcceleratorForDisplay(liveModifierAccelerator, isMac);

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
              <Text>Controls the behavior of how external links should opened.</Text>
              <Text>
                <Text as="strong">Foreground</Text> will open the link and bring the opened window
                or browser to the front.
              </Text>
              <Text>
                <Text as="strong">Background</Text> opens the link without stealing focus from the
                current window.
              </Text>
            </Stack>
          }
          value={openLinks}
        />

        {shortcutRegistrationError && (
          <Banner
            data-testid="banner-shortcut-registration-error"
            description={
              <Stack direction="vertical" gap="condensed">
                <Text>{shortcutRegistrationError}</Text>
                <Button onClick={clearShortcutRegistrationError} size="small" variant="invisible">
                  Dismiss
                </Button>
              </Stack>
            }
            hideTitle
            title="Shortcut error"
            variant="critical"
          />
        )}

        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <Checkbox
            checked={keyboardShortcut}
            label="Global shortcut"
            name="keyboardShortcut"
            onChange={() => toggleSetting('keyboardShortcut')}
            tooltip={
              <Stack direction="vertical" gap="condensed">
                <Text>Global keyboard shortcut to show or hide {APPLICATION.NAME}.</Text>
                <Text>Shortcuts must include:</Text>
                <div className="pl-2">
                  <Stack direction="vertical" gap="none">
                    <Stack direction="horizontal" gap="condensed">
                      <Text>•</Text>
                      <Text>
                        Primary modifier:{' '}
                        <Text as="strong" className="text-gitify-caution">
                          {formatAcceleratorForDisplay('CommandOrControl', isMac)}
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
            hidden={!keyboardShortcut}
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
              disabled={openGitifyShortcut === defaultSettings.openGitifyShortcut}
              icon={SyncIcon}
              onClick={() => {
                clearShortcutRegistrationError();
                updateSetting('openGitifyShortcut', defaultSettings.openGitifyShortcut);
              }}
              size="small"
              unsafeDisableTooltip={true}
              variant="danger"
            />
          </ButtonGroup>
        </Stack>

        <Checkbox
          checked={showNotifications}
          label="Show system notifications"
          name="showNotifications"
          onChange={() => toggleSetting('showNotifications')}
          tooltip={
            <Text>Display native operating system notifications for new unread notifications.</Text>
          }
        />

        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <Checkbox
            checked={playSound}
            label="Play sound"
            name="playSound"
            onChange={() => toggleSetting('playSound')}
          />

          <ButtonGroup className="ml-2" data-testid="settings-volume-group" hidden={!playSound}>
            <IconButton
              aria-label="Volume down"
              data-testid="settings-volume-down"
              disabled={!canDecreaseVolume(notificationVolume)}
              icon={VolumeDownIcon}
              onClick={() => {
                updateSetting('notificationVolume', decreaseVolume(notificationVolume));
              }}
              size="small"
              unsafeDisableTooltip={true}
            />

            <Button aria-label="Volume percentage" disabled size="small">
              {notificationVolume.toFixed(0)}%
            </Button>

            <IconButton
              aria-label="Volume up"
              data-testid="settings-volume-up"
              disabled={!canIncreaseVolume(notificationVolume)}
              icon={VolumeUpIcon}
              onClick={() => {
                updateSetting('notificationVolume', increaseVolume(notificationVolume));
              }}
              size="small"
              unsafeDisableTooltip={true}
            />

            <IconButton
              aria-label="Reset volume"
              data-testid="settings-volume-reset"
              icon={SyncIcon}
              onClick={() => {
                updateSetting('notificationVolume', defaultSettings.notificationVolume);
              }}
              size="small"
              unsafeDisableTooltip={true}
              variant="danger"
            />
          </ButtonGroup>
        </Stack>

        <Checkbox
          checked={keepWindowOnBlur}
          label="Keep window open when it loses focus"
          name="keepWindowOnBlur"
          onChange={() => toggleSetting('keepWindowOnBlur')}
          tooltip={
            <Text>
              Prevent the {APPLICATION.NAME} window from automatically hiding when you click outside
              it.
            </Text>
          }
        />

        <Checkbox
          checked={openAtStartup}
          label="Open at startup"
          name="openAtStartup"
          onChange={() => toggleSetting('openAtStartup')}
          tooltip={<Text>Launch {APPLICATION.NAME} automatically at startup.</Text>}
          visible={!window.gitify.platform.isLinux()}
        />
      </Stack>
    </fieldset>
  );
};
