import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { DeviceDesktopIcon, PencilIcon, SyncIcon } from '@primer/octicons-react';
import { Banner, Button, ButtonGroup, IconButton, Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import {
  DEFAULT_SETTINGS_STATE,
  useSettingsStore,
  useShortcutRegistrationStore,
} from '../../stores';

import { SectionHeading } from '../primitives/SectionHeading';

import { type KeyboardAcceleratorShortcut, OpenPreference, toLink } from '../../types';

import { openExternalLink } from '../../utils/system/comms';
import {
  formatAcceleratorForDisplay,
  keyboardEventToAccelerator,
  MODIFIER_SEGMENTS,
} from '../../utils/system/keyboardShortcut';
import { SettingsChoice } from './controls/SettingsChoice';
import { SettingsList } from './controls/SettingsList';
import { SettingsReveal } from './controls/SettingsReveal';
import { SettingsRow } from './controls/SettingsRow';
import { SettingsToggle } from './controls/SettingsToggle';

const defaultSettings = DEFAULT_SETTINGS_STATE;

export function SystemSettings() {
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
    shortcutButtonLabel = hasLiveModifiers
      ? `${liveModifierDisplay}…`
      : t('settings.system.press_keys', 'Press keys…');
  }

  return (
    <fieldset>
      <SectionHeading as="legend" icon={DeviceDesktopIcon}>
        {t('settings.system.title', 'System')}
      </SectionHeading>

      <SettingsList>
        <SettingsChoice
          label={t('settings.system.link_focus', 'Link focus')}
          name="openLinks"
          onChange={(value) => updateSetting('openLinks', value as OpenPreference)}
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
                  'Controls whether opening an external link brings the destination app to the front.',
                )}
              </Text>
              <Trans
                i18nKey="settings.system.open_links_foreground_help"
                components={[<Text as="strong" key={0} />]}
                defaults="<0>Foreground</0> brings the opened window or browser to the front."
              />
              <Trans
                i18nKey="settings.system.open_links_background_help"
                components={[<Text as="strong" key={0} />]}
                defaults="<0>Background</0> opens the link without stealing focus from the current window."
              />
              <Text>
                {t(
                  'settings.system.open_links_help_scope',
                  'This applies to every link {{appName}} opens, including notification links opened in the browser.',
                  { appName: APPLICATION.NAME },
                )}
              </Text>
            </Stack>
          }
          value={openLinks}
        />

        {shortcutRegistrationError && (
          <Banner
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

        <SettingsToggle
          checked={keyboardShortcut}
          label={t('settings.system.enable_shortcut', 'Enable global shortcut')}
          name="keyboardShortcut"
          onChange={() => {
            if (keyboardShortcut) {
              setRecordingShortcut(false);
              setLiveModifierAccelerator('');
            }
            toggleSetting('keyboardShortcut');
          }}
          tooltip={t(
            'settings.system.enable_shortcut_help',
            'Show or hide {{appName}} from anywhere with a keyboard shortcut.',
            { appName: APPLICATION.NAME },
          )}
        />

        <SettingsReveal name="shortcutRecorder" open={keyboardShortcut}>
          <div ref={shortcutRowRef}>
            <SettingsRow
              label={t('settings.system.shortcut_label', 'Global shortcut')}
              name="shortcut"
              tooltip={
                <Stack direction="vertical" gap="condensed">
                  <Text>
                    {t(
                      'settings.system.keyboard_shortcut_help_modifiers',
                      'Shortcuts must include:',
                    )}
                  </Text>
                  <div className="pl-2">
                    <Stack direction="vertical" gap="none">
                      <Stack direction="horizontal" gap="condensed">
                        <Text>•</Text>
                        <Trans
                          i18nKey="settings.system.keyboard_shortcut_primary_modifier"
                          components={[
                            <Text as="strong" className="text-gitify-caution" key={0} />,
                          ]}
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
            >
              <ButtonGroup data-testid="settings-shortcut-group">
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
                  aria-label={t('settings.system.current_shortcut', 'Current shortcut')}
                  className="pointer-events-none"
                  size="small"
                  tabIndex={-1}
                >
                  <Text as="strong" className="text-gitify-caution">
                    {shortcutButtonLabel}
                  </Text>
                </Button>
                <IconButton
                  aria-label={t(
                    'settings.system.reset_shortcut',
                    'Reset global shortcut to default',
                  )}
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
            </SettingsRow>
          </div>
        </SettingsReveal>

        <SettingsToggle
          checked={keepWindowOnBlur}
          label={t('settings.system.keep_window_on_blur', 'Keep window open when unfocused')}
          name="keepWindowOnBlur"
          onChange={() => toggleSetting('keepWindowOnBlur')}
          tooltip={t(
            'settings.system.keep_window_on_blur_help',
            'Keep the {{appName}} window open when you click outside it.',
            { appName: APPLICATION.NAME },
          )}
        />

        <SettingsToggle
          checked={openAtStartup}
          label={t('settings.system.open_at_startup', 'Launch at startup')}
          name="openAtStartup"
          onChange={() => toggleSetting('openAtStartup')}
          tooltip={t(
            'settings.system.open_at_startup_help',
            'Launch {{appName}} automatically at startup.',
            { appName: APPLICATION.NAME },
          )}
          visible={!isLinux}
        />

        <SettingsToggle
          checked={useX11Backend}
          label={t('settings.system.use_x11_backend', 'Use X11 backend (restart required)')}
          name="useX11Backend"
          onChange={() => toggleSetting('useX11Backend')}
          tooltip={t(
            'settings.system.use_x11_backend_help',
            'Run {{appName}} under X11/XWayland so the window can open next to the tray icon. Takes effect after restarting {{appName}}.',
            { appName: APPLICATION.NAME },
          )}
          visible={isLinux}
        />
      </SettingsList>

      {isLinux && (
        <Stack className="pt-2" gap="condensed">
          <Text className="text-sm text-gitify-font">
            {t(
              'settings.system.gnome_extension_help',
              "On GNOME Wayland, install the Gitify extension to open the window next to its tray icon. Install and manage it through GNOME's extension tools.",
            )}
          </Text>
          <Button
            onClick={() => openExternalLink(toLink('https://github.com/gitify-app/gnome#install'))}
            size="small"
          >
            {t('settings.system.gnome_extension_button', 'GNOME extension installation')}
          </Button>
        </Stack>
      )}
    </fieldset>
  );
}
