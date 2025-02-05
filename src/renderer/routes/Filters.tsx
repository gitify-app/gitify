import { type FC, useContext, useState } from 'react';

import {
  CheckCircleFillIcon,
  FeedPersonIcon,
  FilterIcon,
  FilterRemoveIcon,
  MentionIcon,
  NoEntryFillIcon,
  NoteIcon,
} from '@primer/octicons-react';
import {
  Box,
  Button,
  Stack,
  Text,
  TextInputWithTokens,
  Tooltip,
} from '@primer/react';

import { Checkbox } from '../components/fields/Checkbox';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
import { Header } from '../components/primitives/Header';
import { Title } from '../components/primitives/Title';
import { AppContext } from '../context/App';
import { IconColor } from '../types';
import type { Reason, UserType } from '../typesGitHub';
import {
  getReasonFilterCount,
  isReasonFilterSet,
} from '../utils/notifications/filters/reason';
import {
  FILTERS_USER_TYPES,
  getUserTypeDetails,
  getUserTypeFilterCount,
  isUserTypeFilterSet,
} from '../utils/notifications/filters/userType';
import { FORMATTED_REASONS, getReasonDetails } from '../utils/reason';

type InputToken = {
  id: number;
  text: string;
};

const tokenEvents = ['Enter', 'Tab', ' ', ','];

export const FiltersRoute: FC = () => {
  const { settings, clearFilters, updateFilter, notifications } =
    useContext(AppContext);

  const mapValuesToTokens = (values: string[]): InputToken[] => {
    return values.map((value, index) => ({
      id: index,
      text: value,
    }));
  };

  const [includeHandles, setIncludeHandles] = useState<InputToken[]>(
    mapValuesToTokens(settings.filterIncludeHandles),
  );

  const removeIncludeHandleToken = (tokenId: string | number) => {
    const value = includeHandles.find((v) => v.id === tokenId)?.text || '';
    updateFilter('filterIncludeHandles', value, false);

    setIncludeHandles(includeHandles.filter((v) => v.id !== tokenId));
  };

  const includeHandlesKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const value = (event.target as HTMLInputElement).value.trim();

    if (
      tokenEvents.includes(event.key) &&
      !includeHandles.some((v) => v.text === value) &&
      value.length > 0
    ) {
      event.preventDefault();

      setIncludeHandles([
        ...includeHandles,
        { id: includeHandles.length, text: value },
      ]);
      updateFilter('filterIncludeHandles', value, true);

      (event.target as HTMLInputElement).value = '';
    }
  };

  const [excludeHandles, setExcludeHandles] = useState<InputToken[]>(
    mapValuesToTokens(settings.filterExcludeHandles),
  );

  const removeExcludeHandleToken = (tokenId: string | number) => {
    const value = excludeHandles.find((v) => v.id === tokenId)?.text || '';
    updateFilter('filterExcludeHandles', value, false);

    setExcludeHandles(excludeHandles.filter((v) => v.id !== tokenId));
  };

  const excludeHandlesKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const value = (event.target as HTMLInputElement).value.trim();

    if (
      tokenEvents.includes(event.key) &&
      !includeHandles.some((v) => v.text === value) &&
      value.length > 0
    ) {
      event.preventDefault();

      setExcludeHandles([
        ...excludeHandles,
        { id: excludeHandles.length, text: value },
      ]);
      updateFilter('filterExcludeHandles', value, true);

      (event.target as HTMLInputElement).value = '';
    }
  };

  return (
    <Page id="filters">
      <Header fetchOnBack={true} icon={FilterIcon}>
        Filters
      </Header>

      <Contents>
        <Stack direction="vertical" gap="condensed">
          <fieldset className="mb-3">
            <Title icon={FeedPersonIcon}>User Type</Title>

            <Stack direction="horizontal" gap="normal">
              {Object.keys(FILTERS_USER_TYPES).map((userType: UserType) => {
                const userTypeDetails = getUserTypeDetails(userType);
                const userTypeTitle = userTypeDetails.title;
                const userTypeDescription = userTypeDetails.description;
                const isUserTypeChecked = isUserTypeFilterSet(
                  settings,
                  userType,
                );
                const userTypeCount = getUserTypeFilterCount(
                  notifications,
                  userType,
                );

                return (
                  <Checkbox
                    key={userType}
                    name={userTypeTitle}
                    label={userTypeTitle}
                    checked={isUserTypeChecked}
                    onChange={(evt) =>
                      updateFilter(
                        'filterUserTypes',
                        userType,
                        evt.target.checked,
                      )
                    }
                    tooltip={<Text>{userTypeDescription}</Text>}
                    counter={userTypeCount}
                  />
                );
              })}
            </Stack>
          </fieldset>

          <fieldset className="mb-3">
            <Title icon={MentionIcon}>Handles</Title>
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
                  tokens={includeHandles}
                  onTokenRemove={removeIncludeHandleToken}
                  onKeyDown={includeHandlesKeyDown}
                  size="small"
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
                  tokens={excludeHandles}
                  onTokenRemove={removeExcludeHandleToken}
                  onKeyDown={excludeHandlesKeyDown}
                  size="small"
                  block
                />
              </Stack>
            </Stack>
          </fieldset>

          <fieldset className="mb-3">
            <Title icon={NoteIcon}>Reason</Title>
            <Stack direction="vertical" gap="condensed">
              {Object.keys(FORMATTED_REASONS).map((reason: Reason) => {
                const reasonDetails = getReasonDetails(reason);
                const reasonTitle = reasonDetails.title;
                const reasonDescription = reasonDetails.description;
                const isReasonChecked = isReasonFilterSet(settings, reason);
                const reasonCount = getReasonFilterCount(notifications, reason);

                return (
                  <Checkbox
                    key={reason}
                    name={reasonTitle}
                    label={reasonTitle}
                    checked={isReasonChecked}
                    onChange={(evt) =>
                      updateFilter('filterReasons', reason, evt.target.checked)
                    }
                    tooltip={<Text>{reasonDescription}</Text>}
                    counter={reasonCount}
                  />
                );
              })}
            </Stack>
          </fieldset>
        </Stack>
      </Contents>

      <Footer justify="end">
        <Tooltip text="Clear all filters" direction="n">
          <Button
            leadingVisual={FilterRemoveIcon}
            onClick={() => {
              clearFilters();
              setIncludeHandles([]);
              setExcludeHandles([]);
            }}
            data-testid="filters-clear"
          >
            Clear filters
          </Button>
        </Tooltip>
      </Footer>
    </Page>
  );
};
