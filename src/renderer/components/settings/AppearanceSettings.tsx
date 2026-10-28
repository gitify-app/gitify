import { PaintbrushIcon, SyncIcon, ZoomInIcon, ZoomOutIcon } from '@primer/octicons-react';
import { Button, ButtonGroup, IconButton, Select } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { useSettingsStore } from '../../stores';

import { SectionHeading } from '../primitives/SectionHeading';

import { DesignLanguage, Theme } from '../../types';

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

  return (
    <fieldset>
      <SectionHeading as="legend" icon={PaintbrushIcon}>
        Appearance
      </SectionHeading>

      <SettingsList>
        <SettingsChoice
          label="Design"
          name="designLanguage"
          onChange={(value) => updateSetting('designLanguage', value as DesignLanguage)}
          options={[
            { label: 'Classic', value: DesignLanguage.CLASSIC },
            { label: 'Glass', value: DesignLanguage.GLASS },
          ]}
          tooltip={`Choose Classic for the original ${APPLICATION.NAME} layout, or Glass for the translucent, layered design language.`}
          value={designLanguage}
        />

        <SettingsChoice
          label="Theme"
          name="theme"
          onChange={(value) => updateSetting('theme', value as Theme)}
          presentation="select"
          selectChildren={
            <>
              <Select.OptGroup label="System">
                <Select.Option value={Theme.SYSTEM}>System</Select.Option>
              </Select.OptGroup>
              <Select.OptGroup label="Light">
                <Select.Option value={Theme.LIGHT}>Light default</Select.Option>
                {colorModeSupported(Theme.LIGHT_COLORBLIND) && (
                  <Select.Option value={Theme.LIGHT_COLORBLIND}>Light colorblind</Select.Option>
                )}
                {colorModeSupported(Theme.LIGHT_TRITANOPIA) && (
                  <Select.Option value={Theme.LIGHT_TRITANOPIA}>Light Tritanopia</Select.Option>
                )}
              </Select.OptGroup>
              <Select.OptGroup label="Dark">
                <Select.Option value={Theme.DARK}>Dark default</Select.Option>
                {colorModeSupported(Theme.DARK_COLORBLIND) && (
                  <Select.Option value={Theme.DARK_COLORBLIND}>Dark colorblind</Select.Option>
                )}
                {colorModeSupported(Theme.DARK_TRITANOPIA) && (
                  <Select.Option value={Theme.DARK_TRITANOPIA}>Dark Tritanopia</Select.Option>
                )}
                {colorModeSupported(Theme.DARK_DIMMED) && (
                  <Select.Option value={Theme.DARK_DIMMED}>Soft dark</Select.Option>
                )}
              </Select.OptGroup>
            </>
          }
          tooltip="Choose a light, dark, or system color mode. Available options depend on the selected design language."
          value={resolveColorMode(designLanguage, theme)}
        />

        <SettingsToggle
          checked={increaseContrast}
          label="Increase contrast"
          name="increaseContrast"
          onChange={() => toggleSetting('increaseContrast')}
          tooltip="Use GitHub's high-contrast color schemes for improved legibility. Also applied automatically when your system's increase-contrast setting is enabled."
          visible={designLanguage === DesignLanguage.CLASSIC}
        />

        <SettingsToggle
          checked={showStatusIconColors}
          label="Show status icon colors"
          name="showStatusIconColors"
          onChange={() => toggleSetting('showStatusIconColors')}
          tooltip="Color the notification type icons by their state (open, closed, done, attention). Glass renders them monochrome by default."
          visible={designLanguage === DesignLanguage.GLASS}
        />

        <SettingsRow
          label="Zoom"
          name="zoom"
          tooltip="Change the size of the Gitify interface. The setting applies immediately and is remembered for the next launch."
        >
          <ButtonGroup>
            <IconButton
              aria-label="Zoom out"
              disabled={!canDecreaseZoom(zoomPercentage)}
              icon={ZoomOutIcon}
              onClick={() => decreaseZoom(zoomPercentage)}
              size="small"
              unsafeDisableTooltip={true}
            />

            <Button
              aria-label="Zoom percentage"
              className="pointer-events-none"
              size="small"
              tabIndex={-1}
            >
              {zoomPercentage.toFixed(0)}%
            </Button>

            <IconButton
              aria-label="Zoom in"
              disabled={!canIncreaseZoom(zoomPercentage)}
              icon={ZoomInIcon}
              onClick={() => increaseZoom(zoomPercentage)}
              size="small"
              unsafeDisableTooltip={true}
            />

            <IconButton
              aria-label="Reset zoom"
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
