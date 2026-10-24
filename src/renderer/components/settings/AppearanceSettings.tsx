import { PaintbrushIcon, SyncIcon, ZoomInIcon, ZoomOutIcon } from '@primer/octicons-react';
import { Button, ButtonGroup, IconButton, Select, Stack, Text } from '@primer/react';

import { useSettingsStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { FieldLabel } from '../fields/FieldLabel';
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

      <Stack direction="vertical" gap="condensed">
        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <FieldLabel
            label="Design:"
            name="design-language"
            tooltip={
              <Text>
                Choose Classic for the original Gitify layout, or Glass for the translucent, layered
                design language.
              </Text>
            }
          />
          <Select
            data-testid="settings-design-language"
            onChange={(evt) => updateSetting('designLanguage', evt.target.value as DesignLanguage)}
            value={designLanguage}
          >
            <Select.Option value={DesignLanguage.CLASSIC}>Classic</Select.Option>
            <Select.Option value={DesignLanguage.GLASS}>Glass</Select.Option>
          </Select>
        </Stack>

        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <FieldLabel
            label="Theme:"
            name="theme"
            tooltip={
              <Text>
                Choose a light, dark, or system color mode. Available options depend on the selected
                design language.
              </Text>
            }
          />
          <Select
            data-testid="settings-theme"
            onChange={(evt) => updateSetting('theme', evt.target.value as Theme)}
            value={resolveColorMode(designLanguage, theme)}
          >
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
          </Select>
        </Stack>

        <Checkbox
          checked={increaseContrast}
          label="Increase contrast"
          name="increaseContrast"
          onChange={() => toggleSetting('increaseContrast')}
          tooltip={
            <Text>
              Use GitHub's high-contrast color schemes for improved legibility. Also applied
              automatically when your system's increase-contrast setting is enabled.
            </Text>
          }
          visible={designLanguage === DesignLanguage.CLASSIC}
        />

        <Checkbox
          checked={showStatusIconColors}
          label="Show status icon colors"
          name="showStatusIconColors"
          onChange={() => toggleSetting('showStatusIconColors')}
          tooltip={
            <Text>
              Color the notification type icons by their state (open, closed, done, attention).
              Glass renders them monochrome by default.
            </Text>
          }
          visible={designLanguage === DesignLanguage.GLASS}
        />

        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <FieldLabel
            label="Zoom:"
            name="zoom"
            tooltip={
              <Text>
                Change the size of the Gitify interface. The setting applies immediately and is
                remembered for the next launch.
              </Text>
            }
          />

          <ButtonGroup className="ml-2">
            <IconButton
              aria-label="Zoom out"
              data-testid="settings-zoom-out"
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
              data-testid="settings-zoom-in"
              disabled={!canIncreaseZoom(zoomPercentage)}
              icon={ZoomInIcon}
              onClick={() => increaseZoom(zoomPercentage)}
              size="small"
              unsafeDisableTooltip={true}
            />

            <IconButton
              aria-label="Reset zoom"
              data-testid="settings-zoom-reset"
              icon={SyncIcon}
              onClick={() => resetZoomLevel()}
              size="small"
              unsafeDisableTooltip={true}
              variant="danger"
            />
          </ButtonGroup>
        </Stack>
      </Stack>
    </fieldset>
  );
}
