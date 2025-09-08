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
      <Title
        icon={OrganizationIcon}
        tooltip={
          <Stack direction="vertical" gap="condensed">
            <Text>Filter notifications by organization.</Text>
          </Stack>
        }
      >
        Organizations
      </Title>

      <Stack direction="vertical" gap="condensed">
        <Stack
          align="center"
          className="text-sm"
          direction="horizontal"
          gap="condensed"
        >
          <Box className="font-medium text-gitify-font w-28">
            <Stack align="center" direction="horizontal" gap="condensed">
              <CheckCircleFillIcon className={IconColor.GREEN} />
              <Text>Include:</Text>
            </Stack>
          </Box>
          <TextInputWithTokens
            block
            disabled={
              !settings.detailedNotifications ||
              hasExcludeOrganizationFilters(settings)
            }
            onBlur={addIncludeOrganizationsToken}
            onKeyDown={includeOrganizationsKeyDown}
            onTokenRemove={removeIncludeOrganizationToken}
            size="small"
            title="Include organizations"
            tokens={includeOrganizations}
          />
        </Stack>

        <Stack
          align="center"
          className="text-sm"
          direction="horizontal"
          gap="condensed"
        >
          <Box className="font-medium text-gitify-font w-28">
            <Stack align="center" direction="horizontal" gap="condensed">
              <NoEntryFillIcon className={IconColor.RED} />
              <Text>Exclude:</Text>
            </Stack>
          </Box>
          <TextInputWithTokens
            block
            disabled={
              !settings.detailedNotifications ||
              hasIncludeOrganizationFilters(settings)
            }
            onBlur={addExcludeOrganizationsToken}
            onKeyDown={excludeOrganizationsKeyDown}
            onTokenRemove={removeExcludeOrganizationToken}
            size="small"
            title="Exclude organizations"
            tokens={excludeOrganizations}
          />
        </Stack>
      </Stack>
    </fieldset>
  );
};
