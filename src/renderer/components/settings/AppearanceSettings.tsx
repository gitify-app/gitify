import { type FC, useContext, useState } from 'react';

import {
  PaintbrushIcon,
  SyncIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '@primer/octicons-react';
import {
  Button,
  ButtonGroup,
  IconButton,
  Select,
  Stack,
  Text,
} from '@primer/react';

import { AppContext } from '../../context/App';
import { Theme } from '../../types';
import { hasMultipleAccounts } from '../../utils/auth/utils';
import { zoomLevelToPercentage, zoomPercentageToLevel } from '../../utils/zoom';
import { Checkbox } from '../fields/Checkbox';
import { FieldLabel } from '../fields/FieldLabel';
import { Title } from '../primitives/Title';

let timeout: NodeJS.Timeout;
const DELAY = 200;

export const AppearanceSettings: FC = () => {
  const { auth, settings, updateSetting } = useContext(AppContext);
  const [zoomPercentage, setZoomPercentage] = useState(
    zoomLevelToPercentage(window.gitify.zoom.getLevel()),
  );

  window.addEventListener('resize', () => {
    // clear the timeout
    clearTimeout(timeout);
    // start timing for event "completion"
    timeout = setTimeout(() => {
      const zoomPercentage = zoomLevelToPercentage(
        window.gitify.zoom.getLevel(),
      );
      setZoomPercentage(zoomPercentage);
      updateSetting('zoomPercentage', zoomPercentage);
    }, DELAY);
  });

  return (
    <fieldset>
      <Title icon={PaintbrushIcon}>Appearance</Title>

      <Stack direction="vertical" gap="condensed">
        <Stack
          align="center"
          className="text-sm"
          direction="horizontal"
          gap="condensed"
        >
          <FieldLabel label="Theme:" name="theme" />
          <Select
            data-testid="settings-theme"
            onChange={(evt) =>
              updateSetting('theme', evt.target.value as Theme)
            }
            value={settings.theme}
          >
            <Select.OptGroup label="System">
              <Select.Option value={Theme.SYSTEM}>System</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Light">
              <Select.Option value={Theme.LIGHT}>Light default</Select.Option>
              <Select.Option value={Theme.LIGHT_COLORBLIND}>
                Light colorblind
              </Select.Option>
              <Select.Option value={Theme.LIGHT_TRITANOPIA}>
                Light Tritanopia
              </Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Dark">
              <Select.Option value={Theme.DARK}>Dark default</Select.Option>
              <Select.Option value={Theme.DARK_COLORBLIND}>
                Dark colorblind
              </Select.Option>
              <Select.Option value={Theme.DARK_TRITANOPIA}>
                Dark Tritanopia
              </Select.Option>
              <Select.Option value={Theme.DARK_DIMMED}>Soft dark</Select.Option>
            </Select.OptGroup>
          </Select>
        </Stack>

        <Checkbox
          checked={settings.increaseContrast}
          label="Increase contrast"
          name="increaseContrast"
          onChange={(evt) =>
            updateSetting('increaseContrast', evt.target.checked)
          }
          tooltip={<Text>Enable high contrast.</Text>}
        />

        <Stack
          align="center"
          className="text-sm"
          direction="horizontal"
          gap="condensed"
        >
          <FieldLabel label="Zoom:" name="zoom" />

          <ButtonGroup className="ml-2">
            <IconButton
              aria-label="Zoom out"
              data-testid="settings-zoom-out"
              icon={ZoomOutIcon}
              onClick={() =>
                zoomPercentage > 0 &&
                window.gitify.zoom.setLevel(
                  zoomPercentageToLevel(zoomPercentage - 10),
                )
              }
              size="small"
              unsafeDisableTooltip={true}
            />

            <Button aria-label="Zoom percentage" disabled size="small">
              {zoomPercentage.toFixed(0)}%
            </Button>

            <IconButton
              aria-label="Zoom in"
              data-testid="settings-zoom-in"
              icon={ZoomInIcon}
              onClick={() =>
                zoomPercentage < 120 &&
                window.gitify.zoom.setLevel(
                  zoomPercentageToLevel(zoomPercentage + 10),
                )
              }
              size="small"
              unsafeDisableTooltip={true}
            />

            <IconButton
              aria-label="Reset zoom"
              data-testid="settings-zoom-reset"
              icon={SyncIcon}
              onClick={() => window.gitify.zoom.setLevel(0)}
              size="small"
              unsafeDisableTooltip={true}
              variant="danger"
            />
          </ButtonGroup>
        </Stack>

        <Checkbox
          checked={settings.showAccountHeader}
          label="Show account header"
          name="showAccountHeader"
          onChange={(evt) =>
            updateSetting('showAccountHeader', evt.target.checked)
          }
          visible={!hasMultipleAccounts(auth)}
        />

        <Checkbox
          checked={settings.wrapNotificationTitle}
          label="Show full notification title"
          name="wrapNotificationTitle"
          onChange={(evt) =>
            updateSetting('wrapNotificationTitle', evt.target.checked)
          }
          tooltip={
            <Text>
              Wrap long notification titles instead of truncating them.
            </Text>
          }
        />
      </Stack>
    </fieldset>
  );
};
