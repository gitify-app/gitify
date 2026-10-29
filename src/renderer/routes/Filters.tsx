import { useTranslation } from 'react-i18next';

import { FilterIcon, FilterRemoveIcon } from '@primer/octicons-react';
import { Button, Stack, Tooltip } from '@primer/react';

import { useAccountsStore, useFiltersStore } from '../stores';

import { AccountFilter } from '../components/filters/AccountFilter';
import { ReasonFilter } from '../components/filters/ReasonFilter';
import { ReviewRequestTypeFilter } from '../components/filters/ReviewRequestTypeFilter';
import { SearchFilter } from '../components/filters/SearchFilter';
import { StateFilter } from '../components/filters/StateFilter';
import { SubjectTypeFilter } from '../components/filters/SubjectTypeFilter';
import { UserTypeFilter } from '../components/filters/UserTypeFilter';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
import { Header } from '../components/primitives/Header';

export function FiltersRoute() {
  const { t } = useTranslation();
  const clearFilters = useFiltersStore((s) => s.reset);

  const hasMultipleAccounts = useAccountsStore((s) => s.hasMultipleAccounts());

  return (
    <Page testId="filters">
      <Header fetchOnBack icon={FilterIcon}>
        {t('filters.title', 'Filters')}
      </Header>

      <Contents paddingBottom scrollFade>
        <Stack direction="vertical" gap="spacious">
          {hasMultipleAccounts && <AccountFilter />}
          <SearchFilter />
          <UserTypeFilter />
          <SubjectTypeFilter />
          <StateFilter />
          <ReviewRequestTypeFilter />
          <ReasonFilter />
        </Stack>
      </Contents>

      <Footer justify="end">
        <Tooltip direction="n" text={t('filters.clear_all_tooltip', 'Clear all filters')}>
          <Button leadingVisual={FilterRemoveIcon} onClick={clearFilters}>
            {t('filters.clear_filters', 'Clear filters')}
          </Button>
        </Tooltip>
      </Footer>
    </Page>
  );
}
