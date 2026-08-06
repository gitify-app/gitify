import type { FC } from 'react';

import { PaintbrushIcon, SyncIcon, ZoomInIcon, ZoomOutIcon } from '@primer/octicons-react';
import { Button, ButtonGroup, IconButton, Select, Stack, Text } from '@primer/react';

import { useAccountsStore, useSettingsStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { FieldLabel } from '../fields/FieldLabel';
import { Title } from '../primitives/Title';

import { DesignLanguage, Theme } from '../../types';

import { resolveColorMode, supportedColorModes } from '../../utils/ui/theme';
import {
  canDecreaseZoom,
  canIncreaseZoom,
  decreaseZoom,
  increaseZoom,
  resetZoomLevel,
} from '../../utils/ui/zoom';

export const AppearanceSettings: FC = () => {
  // Account store values
  const hasMultipleAccounts = useAccountsStore((s) => s.hasMultipleAccounts);

  // Setting store actions
  const toggleSetting = useSettingsStore((s) => s.toggleSetting);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  // Setting store values
  const designLanguage = useSettingsStore((s) => s.designLanguage);
  const theme = useSettingsStore((s) => s.theme);
  const increaseContrast = useSettingsStore((s) => s.increaseContrast);
  const showStatusIconColors = useSettingsStore((s) => s.showStatusIconColors);

  const colorModeSupported = (mode: Theme) => supportedColorModes(designLanguage).includes(mode);
  const showAccountHeader = useSettingsStore((s) => s.showAccountHeader);
  const wrapNotificationTitle = useSettingsStore((s) => s.wrapNotificationTitle);
  const zoomPercentage = useSettingsStore((s) => s.zoomPercentage);

  return (
    <fieldset>
      <Title icon={PaintbrushIcon}>Appearance</Title>

      <Stack direction="vertical" gap="condensed">
        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <FieldLabel label="Design:" name="design-language" />
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
          <FieldLabel label="Theme:" name="theme" />
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
          <FieldLabel label="Zoom:" name="zoom" />

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

        <Checkbox
          checked={showAccountHeader}
          label="Show account header"
          name="showAccountHeader"
          onChange={() => toggleSetting('showAccountHeader')}
          tooltip={
            <Text>
              When enabled, displays an account header (avatar, username and quick links) above the
              notifications list.
            </Text>
          }
          visible={!hasMultipleAccounts()}
        />

        <Checkbox
          checked={wrapNotificationTitle}
          label="Show full notification title"
          name="wrapNotificationTitle"
          onChange={() => toggleSetting('wrapNotificationTitle')}
          tooltip={
            <Text>
              Wrap long notification titles onto multiple lines instead of truncating with an
              ellipsis. This shows the full title but may increase the height of the notification
              list.
            </Text>
          }
        />
      </Stack>
    </fieldset>
  );
};
