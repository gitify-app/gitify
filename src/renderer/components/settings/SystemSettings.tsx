import { type FC, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { DeviceDesktopIcon, PencilIcon, SyncIcon } from '@primer/octicons-react';
import { Banner, Button, ButtonGroup, IconButton, Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { useShortcutRegistrationStore } from '../../hooks/useShortcutRegistration';
import { DEFAULT_SETTINGS_STATE, useSettingsStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';
import { Title } from '../primitives/Title';

import { type KeyboardAcceleratorShortcut, OpenPreference, toLink } from '../../types';

import { openExternalLink } from '../../utils/system/comms';
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
  const { t } = useTranslation();
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
  const showNotifications = useSettingsStore((s) => s.showNotifications);
  const playSound = useSettingsStore((s) => s.playSound);
  const notificationVolume = useSettingsStore((s) => s.notificationVolume);
  const keepWindowOnBlur = useSettingsStore((s) => s.keepWindowOnBlur);
  const openAtStartup = useSettingsStore((s) => s.openAtStartup);
  const showUpdateNotifications = useSettingsStore((s) => s.showUpdateNotifications);
  const useX11Backend = useSettingsStore((s) => s.useX11Backend);

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
    shortcutButtonLabel = hasLiveModifiers
      ? `${liveModifierDisplay}…`
      : t('settings.system.press_keys', 'Press keys…');
  }

  return (
    <fieldset>
      <Title icon={DeviceDesktopIcon}>{t('settings.system.title', 'System')}</Title>

      <Stack direction="vertical" gap="condensed">
        <RadioGroup
          label={t('settings.system.open_links', 'Open Links:')}
          name="openLinks"
          onChange={(evt) => {
            updateSetting('openLinks', evt.target.value as OpenPreference);
          }}
          options={[
            {
              label: t('settings.system.open_links_foreground', 'Foreground'),
              value: OpenPreference.FOREGROUND,
            },
            {
              label: t('settings.system.open_links_background', 'Background'),
              value: OpenPreference.BACKGROUND,
            },
          ]}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                {t(
                  'settings.system.open_links_help',
                  'Controls the behavior of how external links should opened.',
                )}
              </Text>
              <Trans
                i18nKey="settings.system.open_links_foreground_help"
                components={[<Text as="strong" key={0} />]}
                defaults="<0>Foreground</0> will open the link and bring the opened window or browser to the front."
              />
              <Trans
                i18nKey="settings.system.open_links_background_help"
                components={[<Text as="strong" key={0} />]}
                defaults="<0>Background</0> opens the link without stealing focus from the current window."
              />
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
                  {t('settings.system.shortcut_error_dismiss', 'Dismiss')}
                </Button>
              </Stack>
            }
            hideTitle
            title={t('settings.system.shortcut_error_title', 'Shortcut error')}
            variant="critical"
          />
        )}

        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <Checkbox
            checked={keyboardShortcut}
            label={t('settings.system.keyboard_shortcut', 'Global shortcut')}
            name="keyboardShortcut"
            onChange={() => toggleSetting('keyboardShortcut')}
            tooltip={
              <Stack direction="vertical" gap="condensed">
                <Text>
                  {t(
                    'settings.system.keyboard_shortcut_help',
                    'Global keyboard shortcut to show or hide {{appName}}.',
                    { appName: APPLICATION.NAME },
                  )}
                </Text>
                <Text>
                  {t('settings.system.keyboard_shortcut_help_modifiers', 'Shortcuts must include:')}
                </Text>
                <div className="pl-2">
                  <Stack direction="vertical" gap="none">
                    <Stack direction="horizontal" gap="condensed">
                      <Text>•</Text>
                      <Trans
                        i18nKey="settings.system.keyboard_shortcut_primary_modifier"
                        components={[<Text as="strong" className="text-gitify-caution" key={0} />]}
                        defaults="Primary modifier: <0>{{accelerator}}</0>"
                        values={{
                          accelerator: formatAcceleratorForDisplay('CommandOrControl', isMac),
                        }}
                      />
                    </Stack>
                    <Stack direction="horizontal" gap="condensed">
                      <Text>•</Text>
                      <Trans
                        i18nKey="settings.system.keyboard_shortcut_optional_modifiers"
                        components={[
                          <Text as="strong" className="text-gitify-caution" key={0} />,
                          <Text as="strong" className="text-gitify-caution" key={1} />,
                        ]}
                        defaults="Optional modifiers: <0>{{modifier1}}</0>, <1>{{modifier2}}</1>"
                        values={{
                          modifier1: formatAcceleratorForDisplay('Shift', isMac),
                          modifier2: formatAcceleratorForDisplay('Alt', isMac),
                        }}
                      />
                    </Stack>
                    <Stack direction="horizontal" gap="condensed">
                      <Text>•</Text>
                      <Text>
                        {t(
                          'settings.system.keyboard_shortcut_non_modifier',
                          'A non-modifier key (letter, number, etc.)',
                        )}
                      </Text>
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
              aria-label={t('settings.system.edit_shortcut', 'Edit global shortcut')}
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
              aria-label={t('settings.system.shortcut_display', 'Global shortcut')}
              className="pointer-events-none"
              size="small"
              tabIndex={-1}
            >
              <Text as="strong" className="text-gitify-caution">
                {shortcutButtonLabel}
              </Text>
            </Button>
            <IconButton
              aria-label={t('settings.system.reset_shortcut', 'Reset global shortcut to default')}
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
          label={t('settings.system.show_notifications', 'Show system notifications')}
          name="showNotifications"
          onChange={() => toggleSetting('showNotifications')}
          tooltip={
            <Text>
              {t(
                'settings.system.show_notifications_help',
                'Display native operating system notifications for new unread notifications.',
              )}
            </Text>
          }
        />

        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <Checkbox
            checked={playSound}
            label={t('settings.system.play_sound', 'Play sound')}
            name="playSound"
            onChange={() => toggleSetting('playSound')}
          />

          <ButtonGroup className="ml-2" data-testid="settings-volume-group" hidden={!playSound}>
            <IconButton
              aria-label={t('settings.system.volume_down', 'Volume down')}
              data-testid="settings-volume-down"
              disabled={!canDecreaseVolume(notificationVolume)}
              icon={VolumeDownIcon}
              onClick={() => {
                updateSetting('notificationVolume', decreaseVolume(notificationVolume));
              }}
              size="small"
              unsafeDisableTooltip={true}
            />

            <Button
              aria-label={t('settings.system.volume_percentage', 'Volume percentage')}
              className="pointer-events-none"
              size="small"
              tabIndex={-1}
            >
              {notificationVolume.toFixed(0)}%
            </Button>

            <IconButton
              aria-label={t('settings.system.volume_up', 'Volume up')}
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
              aria-label={t('settings.system.volume_reset', 'Reset volume')}
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
          label={t('settings.system.keep_window_on_blur', 'Keep window open when it loses focus')}
          name="keepWindowOnBlur"
          onChange={() => toggleSetting('keepWindowOnBlur')}
          tooltip={
            <Text>
              {t(
                'settings.system.keep_window_on_blur_help',
                'Prevent the {{appName}} window from automatically hiding when you click outside it.',
                { appName: APPLICATION.NAME },
              )}
            </Text>
          }
        />

        <Checkbox
          checked={openAtStartup}
          label={t('settings.system.open_at_startup', 'Open at startup')}
          name="openAtStartup"
          onChange={() => toggleSetting('openAtStartup')}
          tooltip={
            <Text>
              {t(
                'settings.system.open_at_startup_help',
                'Launch {{appName}} automatically at startup.',
                {
                  appName: APPLICATION.NAME,
                },
              )}
            </Text>
          }
          visible={!window.gitify.platform.isLinux()}
        />

        <Checkbox
          checked={showUpdateNotifications}
          label={t('settings.system.show_update_notifications', 'Show update notifications')}
          name="showUpdateNotifications"
          onChange={() => toggleSetting('showUpdateNotifications')}
          tooltip={
            <Text>
              {t(
                'settings.system.show_update_notifications_help',
                'Show a notification when a {{appName}} update is ready. Updates will still be checked and shown in the menu bar.',
                { appName: APPLICATION.NAME },
              )}
            </Text>
          }
        />

        <Checkbox
          checked={useX11Backend}
          label={t('settings.system.use_x11_backend', 'Use X11 backend (restart required)')}
          name="useX11Backend"
          onChange={() => toggleSetting('useX11Backend')}
          tooltip={
            <Text>
              {t(
                'settings.system.use_x11_backend_help',
                'Run under X11/XWayland so the window opens next to the tray icon. On Wayland, window placement depends on your compositor and its extensions. Enabling this also disables Vulkan, which crashes under X11 on some drivers, and may soften text on displays using fractional scaling. Takes effect after restarting {{appName}}.',
                { appName: APPLICATION.NAME },
              )}
            </Text>
          }
          visible={window.gitify.platform.isLinux()}
        />
        {window.gitify.platform.isLinux() && (
          <Stack gap="condensed">
            <Text className="text-sm text-gitify-font">
              {t(
                'settings.system.gnome_extension_help',
                "On GNOME Wayland, install the Gitify extension to open the window next to its tray icon. Install and manage it through GNOME's extension tools.",
              )}
            </Text>
            <Button
              onClick={() =>
                openExternalLink(toLink('https://github.com/gitify-app/gnome#install'))
              }
              size="small"
            >
              {t('settings.system.gnome_extension_button', 'GNOME extension installation')}
            </Button>
          </Stack>
        )}
      </Stack>
    </fieldset>
  );
};
