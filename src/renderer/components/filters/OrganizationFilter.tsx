import { type FC, useContext, useEffect, useState } from 'react';

import {
  CheckCircleFillIcon,
  NoEntryFillIcon,
  OrganizationIcon,
} from '@primer/octicons-react';
import { Box, Stack, Text, TextInputWithTokens } from '@primer/react';

import { AppContext } from '../../context/App';
import { IconColor, type Organization } from '../../types';
import {
  hasExcludeOrganizationFilters,
  hasIncludeOrganizationFilters,
} from '../../utils/notifications/filters/organizations';
import { Tooltip } from '../fields/Tooltip';
import { Title } from '../primitives/Title';

type InputToken = {
  id: number;
  text: string;
};

const tokenEvents = ['Enter', 'Tab', ' ', ','];

export const OrganizationFilter: FC = () => {
  const { updateFilter, settings } = useContext(AppContext);

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to run this effect on organization filter changes
  useEffect(() => {
    if (!hasIncludeOrganizationFilters(settings)) {
      setIncludeOrganizations([]);
    }

    if (!hasExcludeOrganizationFilters(settings)) {
      setExcludeOrganizations([]);
    }
  }, [
    settings.filterIncludeOrganizations,
    settings.filterExcludeOrganizations,
  ]);

  const mapValuesToTokens = (values: string[]): InputToken[] => {
    return values.map((value, index) => ({
      id: index,
      text: value,
    }));
  };

  const [includeOrganizations, setIncludeOrganizations] = useState<
    InputToken[]
  >(mapValuesToTokens(settings.filterIncludeOrganizations));

  const addIncludeOrganizationsToken = (
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>,
  ) => {
    const value = (event.target as HTMLInputElement).value.trim();

    if (
      value.length > 0 &&
      !includeOrganizations.some((v) => v.text === value)
    ) {
      setIncludeOrganizations([
        ...includeOrganizations,
        { id: includeOrganizations.length, text: value },
      ]);
      updateFilter('filterIncludeOrganizations', value as Organization, true);

      (event.target as HTMLInputElement).value = '';
    }
  };

  const removeIncludeOrganizationToken = (tokenId: string | number) => {
    const value =
      includeOrganizations.find((v) => v.id === tokenId)?.text || '';
    updateFilter('filterIncludeOrganizations', value as Organization, false);

    setIncludeOrganizations(
      includeOrganizations.filter((v) => v.id !== tokenId),
    );
  };

  const includeOrganizationsKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (tokenEvents.includes(event.key)) {
      addIncludeOrganizationsToken(event);
    }
  };

  const [excludeOrganizations, setExcludeOrganizations] = useState<
    InputToken[]
  >(mapValuesToTokens(settings.filterExcludeOrganizations));

  const addExcludeOrganizationsToken = (
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>,
  ) => {
    const value = (event.target as HTMLInputElement).value.trim();

    if (
      value.length > 0 &&
      !excludeOrganizations.some((v) => v.text === value)
    ) {
      setExcludeOrganizations([
        ...excludeOrganizations,
        { id: excludeOrganizations.length, text: value },
      ]);
      updateFilter('filterExcludeOrganizations', value as Organization, true);

      (event.target as HTMLInputElement).value = '';
    }
  };

  const removeExcludeOrganizationToken = (tokenId: string | number) => {
    const value =
      excludeOrganizations.find((v) => v.id === tokenId)?.text || '';
    updateFilter('filterExcludeOrganizations', value as Organization, false);

    setExcludeOrganizations(
      excludeOrganizations.filter((v) => v.id !== tokenId),
    );
  };

  const excludeOrganizationsKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (tokenEvents.includes(event.key)) {
      addExcludeOrganizationsToken(event);
    }
  };

  return (
    <fieldset id="filter-organizations">
      <Stack direction="horizontal" gap="condensed" align="baseline">
        <Title icon={OrganizationIcon}>Organizations</Title>
        <Tooltip
          name="tooltip-filter-organizations"
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>Filter notifications by organization.</Text>
            </Stack>
          }
        />
      </Stack>
      <Stack direction="vertical" gap="condensed">
        <Stack
          direction="horizontal"
          gap="condensed"
          align="center"
          className="text-sm"
        >
          <Box className="font-medium text-gitify-font w-28">
            <Stack direction="horizontal" gap="condensed" align="center">
              <CheckCircleFillIcon className={IconColor.GREEN} />
              <Text>Include:</Text>
            </Stack>
          </Box>
          <TextInputWithTokens
            title="Include organizations"
            tokens={includeOrganizations}
            onTokenRemove={removeIncludeOrganizationToken}
            onKeyDown={includeOrganizationsKeyDown}
            onBlur={addIncludeOrganizationsToken}
            size="small"
            disabled={
              !settings.detailedNotifications ||
              hasExcludeOrganizationFilters(settings)
            }
            block
          />
        </Stack>

        <Stack
          direction="horizontal"
          gap="condensed"
          align="center"
          className="text-sm"
        >
          <Box className="font-medium text-gitify-font w-28">
            <Stack direction="horizontal" gap="condensed" align="center">
              <NoEntryFillIcon className={IconColor.RED} />
              <Text>Exclude:</Text>
            </Stack>
          </Box>
          <TextInputWithTokens
            title="Exclude organizations"
            tokens={excludeOrganizations}
            onTokenRemove={removeExcludeOrganizationToken}
            onKeyDown={excludeOrganizationsKeyDown}
            onBlur={addExcludeOrganizationsToken}
            size="small"
            disabled={
              !settings.detailedNotifications ||
              hasIncludeOrganizationFilters(settings)
            }
            block
          />
        </Stack>
      </Stack>
    </fieldset>
  );
};
