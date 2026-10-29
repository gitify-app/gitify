import { useTranslation } from 'react-i18next';

import { PaintbrushIcon, SyncIcon, ZoomInIcon, ZoomOutIcon } from '@primer/octicons-react';
import { Button, ButtonGroup, IconButton, Select } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { useSettingsStore } from '../../stores';

import { SectionHeading } from '../primitives/SectionHeading';

import { DesignLanguage, Theme } from '../../types';

import { LANGUAGES, type Language, loadLanguageLocale, setLanguage } from '../../i18n';
import { resolveColorMode, supportedColorModes } from '../../utils/ui/theme';
import {
  canDecreaseZoom,
  canIncreaseZoom,
  decreaseZoom,
  increaseZoom,
  resetZoomLevel,
} from '../../utils/ui/zoom';
import { SettingsChoice } from './controls/SettingsChoice';
import { SettingsList } from './controls/SettingsList';
import { SettingsRow } from './controls/SettingsRow';
import { SettingsToggle } from './controls/SettingsToggle';

export function AppearanceSettings() {
  const { t } = useTranslation();

  // Setting store actions
  const toggleSetting = useSettingsStore((s) => s.toggleSetting);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  // Setting store values
  const designLanguage = useSettingsStore((s) => s.designLanguage);
  const theme = useSettingsStore((s) => s.theme);
  const increaseContrast = useSettingsStore((s) => s.increaseContrast);
  const showStatusIconColors = useSettingsStore((s) => s.showStatusIconColors);

  const colorModeSupported = (mode: Theme) => supportedColorModes(designLanguage).includes(mode);
  const zoomPercentage = useSettingsStore((s) => s.zoomPercentage);

  // Language is stored independently of the settings store (see i18n/loader).
  const language = loadLanguageLocale();
  // A selector with a single option is noise; show it once a second locale ships.
  const showLanguageSelector = LANGUAGES.length > 1;

  return (
    <fieldset>
      <SectionHeading as="legend" icon={PaintbrushIcon}>
        {t('settings.appearance.title', 'Appearance')}
      </SectionHeading>

      <SettingsList>
        {showLanguageSelector && (
          <SettingsRow
            label={t('settings.appearance.language', 'Language')}
            name="language"
            tooltip={t(
              'settings.appearance.language_help',
              'Choose the language for the {{appName}} interface.',
              { appName: APPLICATION.NAME },
            )}
          >
            <Select
              aria-label={t('settings.appearance.language', 'Language')}
              data-testid="settings-language"
              onChange={(evt) => {
                void setLanguage(evt.target.value as Language);
              }}
              value={language}
            >
              {LANGUAGES.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </SettingsRow>
        )}

        <SettingsChoice
          label={t('settings.appearance.design', 'Design')}
          name="designLanguage"
          onChange={(value) => updateSetting('designLanguage', value as DesignLanguage)}
          options={[
            {
              label: t('settings.appearance.design_language_classic', 'Classic'),
              value: DesignLanguage.CLASSIC,
            },
            {
              label: t('settings.appearance.design_language_glass', 'Glass'),
              value: DesignLanguage.GLASS,
            },
          ]}
          tooltip={t(
            'settings.appearance.design_help',
            'Choose Classic for the original {{appName}} layout, or Glass for the translucent, layered design language.',
            { appName: APPLICATION.NAME },
          )}
          value={designLanguage}
        />

        <SettingsChoice
          label={t('settings.appearance.theme', 'Theme')}
          name="theme"
          onChange={(value) => updateSetting('theme', value as Theme)}
          presentation="select"
          selectChildren={
            <>
              <Select.OptGroup label={t('settings.appearance.theme_group_system', 'System')}>
                <Select.Option value={Theme.SYSTEM}>
                  {t('settings.appearance.theme_system', 'System')}
                </Select.Option>
              </Select.OptGroup>
              <Select.OptGroup label={t('settings.appearance.theme_group_light', 'Light')}>
                <Select.Option value={Theme.LIGHT}>
                  {t('settings.appearance.theme_light_default', 'Light default')}
                </Select.Option>
                {colorModeSupported(Theme.LIGHT_COLORBLIND) && (
                  <Select.Option value={Theme.LIGHT_COLORBLIND}>
                    {t('settings.appearance.theme_light_colorblind', 'Light colorblind')}
                  </Select.Option>
                )}
                {colorModeSupported(Theme.LIGHT_TRITANOPIA) && (
                  <Select.Option value={Theme.LIGHT_TRITANOPIA}>
                    {t('settings.appearance.theme_light_tritanopia', 'Light Tritanopia')}
                  </Select.Option>
                )}
              </Select.OptGroup>
              <Select.OptGroup label={t('settings.appearance.theme_group_dark', 'Dark')}>
                <Select.Option value={Theme.DARK}>
                  {t('settings.appearance.theme_dark_default', 'Dark default')}
                </Select.Option>
                {colorModeSupported(Theme.DARK_COLORBLIND) && (
                  <Select.Option value={Theme.DARK_COLORBLIND}>
                    {t('settings.appearance.theme_dark_colorblind', 'Dark colorblind')}
                  </Select.Option>
                )}
                {colorModeSupported(Theme.DARK_TRITANOPIA) && (
                  <Select.Option value={Theme.DARK_TRITANOPIA}>
                    {t('settings.appearance.theme_dark_tritanopia', 'Dark Tritanopia')}
                  </Select.Option>
                )}
                {colorModeSupported(Theme.DARK_DIMMED) && (
                  <Select.Option value={Theme.DARK_DIMMED}>
                    {t('settings.appearance.theme_dark_dimmed', 'Soft dark')}
                  </Select.Option>
                )}
              </Select.OptGroup>
            </>
          }
          tooltip={t(
            'settings.appearance.theme_help',
            'Choose a light, dark, or system color mode. Available options depend on the selected design language.',
          )}
          value={resolveColorMode(designLanguage, theme)}
        />

        <SettingsToggle
          checked={increaseContrast}
          label={t('settings.appearance.increase_contrast', 'Increase contrast')}
          name="increaseContrast"
          onChange={() => toggleSetting('increaseContrast')}
          tooltip={t(
            'settings.appearance.increase_contrast_help',
            "Use GitHub's high-contrast color schemes for improved legibility. Also applied automatically when your system's increase-contrast setting is enabled.",
          )}
          visible={designLanguage === DesignLanguage.CLASSIC}
        />

        <SettingsToggle
          checked={showStatusIconColors}
          label={t('settings.appearance.show_status_icon_colors', 'Show status icon colors')}
          name="showStatusIconColors"
          onChange={() => toggleSetting('showStatusIconColors')}
          tooltip={t(
            'settings.appearance.show_status_icon_colors_help',
            'Color the notification type icons by their state (open, closed, done, attention). Glass renders them monochrome by default.',
          )}
          visible={designLanguage === DesignLanguage.GLASS}
        />

        <SettingsRow
          label={t('settings.appearance.zoom', 'Zoom')}
          name="zoom"
          tooltip={t(
            'settings.appearance.zoom_help',
            'Change the size of the {{appName}} interface. The setting applies immediately and is remembered for the next launch.',
            { appName: APPLICATION.NAME },
          )}
        >
          <ButtonGroup>
            <IconButton
              aria-label={t('settings.appearance.zoom_out', 'Zoom out')}
              disabled={!canDecreaseZoom(zoomPercentage)}
              icon={ZoomOutIcon}
              onClick={() => decreaseZoom(zoomPercentage)}
              size="small"
              unsafeDisableTooltip={true}
            />

            <Button
              aria-label={t('settings.appearance.zoom_percentage', 'Zoom percentage')}
              className="pointer-events-none"
              size="small"
              tabIndex={-1}
            >
              {zoomPercentage.toFixed(0)}%
            </Button>

            <IconButton
              aria-label={t('settings.appearance.zoom_in', 'Zoom in')}
              disabled={!canIncreaseZoom(zoomPercentage)}
              icon={ZoomInIcon}
              onClick={() => increaseZoom(zoomPercentage)}
              size="small"
              unsafeDisableTooltip={true}
            />

            <IconButton
              aria-label={t('settings.appearance.zoom_reset', 'Reset zoom')}
              icon={SyncIcon}
              onClick={() => resetZoomLevel()}
              size="small"
              unsafeDisableTooltip={true}
              variant="danger"
            />
          </ButtonGroup>
        </SettingsRow>
      </SettingsList>
    </fieldset>
  );
}
