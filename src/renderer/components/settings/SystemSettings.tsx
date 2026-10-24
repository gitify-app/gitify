import { useEffect, useRef, useState } from 'react';

import { DeviceDesktopIcon, PencilIcon, SyncIcon } from '@primer/octicons-react';
import { Banner, Button, ButtonGroup, IconButton, Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import {
  DEFAULT_SETTINGS_STATE,
  useSettingsStore,
  useShortcutRegistrationStore,
} from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';
import { SectionHeading } from '../primitives/SectionHeading';

import { type KeyboardAcceleratorShortcut, OpenPreference, toLink } from '../../types';

import { openExternalLink } from '../../utils/system/comms';
import {
  formatAcceleratorForDisplay,
  keyboardEventToAccelerator,
  MODIFIER_SEGMENTS,
} from '../../utils/system/keyboardShortcut';

const defaultSettings = DEFAULT_SETTINGS_STATE;

export function SystemSettings() {
  const shortcutRegistrationError = useShortcutRegistrationStore(
    (s) => s.shortcutRegistrationError,
  );
  const clearShortcutRegistrationError = useShortcutRegistrationStore(
    (s) => s.clearShortcutRegistrationError,
  );

  // Setting store actions
  const toggleSetting = useSettingsStore((s) => s.toggleSetting);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  // Setting store values
  const openLinks = useSettingsStore((s) => s.openLinks);
  const keyboardShortcut = useSettingsStore((s) => s.keyboardShortcut);
  const openGitifyShortcut = useSettingsStore((s) => s.openGitifyShortcut);
  const keepWindowOnBlur = useSettingsStore((s) => s.keepWindowOnBlur);
  const openAtStartup = useSettingsStore((s) => s.openAtStartup);
  const useX11Backend = useSettingsStore((s) => s.useX11Backend);

  const [recordingShortcut, setRecordingShortcut] = useState(false);
  const [liveModifierAccelerator, setLiveModifierAccelerator] = useState('');
  const shortcutRowRef = useRef<HTMLDivElement>(null);
  const isMac = window.gitify.platform.isMacOS();
  const isLinux = window.gitify.platform.isLinux();

  useEffect(() => {
    if (!recordingShortcut) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (shortcutRowRef.current?.contains(event.target as Node)) {
        return;
      }
      setLiveModifierAccelerator('');
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

  let shortcutButtonLabel = shortcutDisplay;
  if (recordingShortcut) {
    shortcutButtonLabel = hasLiveModifiers ? `${liveModifierDisplay}…` : 'Press keys…';
  }

  return (
    <fieldset>
      <SectionHeading as="legend" icon={DeviceDesktopIcon}>
        System
      </SectionHeading>

      <Stack direction="vertical" gap="condensed">
        <RadioGroup
          label="Link focus:"
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
                Controls whether opening an external link brings the destination app to the front.
              </Text>
              <Text>
                <Text as="strong">Foreground</Text> brings the opened window or browser to the
                front.
              </Text>
              <Text>
                <Text as="strong">Background</Text> opens the link without stealing focus from the
                current window.
              </Text>
              <Text>
                This applies to every link {APPLICATION.NAME} opens, including notification links
                opened in the browser.
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

          {keyboardShortcut && (
            <ButtonGroup className="ml-2" data-testid="settings-shortcut-group">
              <IconButton
                aria-label="Edit global shortcut"
                data-testid="settings-shortcut-edit"
                icon={PencilIcon}
                onClick={() => {
                  clearShortcutRegistrationError();
                  setLiveModifierAccelerator('');
                  setRecordingShortcut(true);
                }}
                size="small"
                unsafeDisableTooltip={true}
              />
              <Button
                aria-label="Global shortcut"
                className="pointer-events-none"
                size="small"
                tabIndex={-1}
              >
                <Text as="strong" className="text-gitify-caution">
                  {shortcutButtonLabel}
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
          )}
        </Stack>

        <Checkbox
          checked={keepWindowOnBlur}
          label="Keep window open when unfocused"
          name="keepWindowOnBlur"
          onChange={() => toggleSetting('keepWindowOnBlur')}
          tooltip={<Text>Keep the {APPLICATION.NAME} window open when you click outside it.</Text>}
        />

        <Checkbox
          checked={openAtStartup}
          label="Launch at startup"
          name="openAtStartup"
          onChange={() => toggleSetting('openAtStartup')}
          tooltip={<Text>Launch {APPLICATION.NAME} automatically at startup.</Text>}
          visible={!isLinux}
        />

        <Checkbox
          checked={useX11Backend}
          label="Use X11 backend (restart required)"
          name="useX11Backend"
          onChange={() => toggleSetting('useX11Backend')}
          tooltip={
            <Text>
              Run {APPLICATION.NAME} under X11/XWayland so the window can open next to the tray
              icon. Wayland placement still depends on your compositor and its extensions. This
              disables Vulkan and may soften text on fractional-scaling displays. Takes effect after
              restarting {APPLICATION.NAME}.
            </Text>
          }
          visible={isLinux}
        />

        {isLinux && (
          <Stack gap="condensed">
            <Text className="text-sm text-gitify-font">
              On GNOME Wayland, install the {APPLICATION.NAME} extension to open the window next to
              its tray icon. Install and manage it through GNOME's extension tools.
            </Text>
            <Button
              onClick={() =>
                openExternalLink(toLink('https://github.com/gitify-app/gnome#install'))
              }
              size="small"
            >
              GNOME extension installation
            </Button>
          </Stack>
        )}
      </Stack>
    </fieldset>
  );
}
