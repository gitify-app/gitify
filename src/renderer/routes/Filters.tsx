import { type FC, useContext } from 'react';

import { FilterIcon, FilterRemoveIcon } from '@primer/octicons-react';
import { Button, Stack, Tooltip } from '@primer/react';

import { ReasonFilter } from '../components/filters/ReasonFilter';
import { UserHandleFilter } from '../components/filters/UserHandleFilter';
import { UserTypeFilter } from '../components/filters/UserTypeFilter';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
import { Header } from '../components/primitives/Header';
import { AppContext } from '../context/App';

export const FiltersRoute: FC = () => {
  const { clearFilters } = useContext(AppContext);

  return (
    <Page id="filters">
      <Header fetchOnBack={true} icon={FilterIcon}>
        Filters
      </Header>

      <Contents>
        <Stack direction="vertical" gap="condensed">
          <UserTypeFilter />
          <UserHandleFilter />
          <ReasonFilter />
        </Stack>
      </Contents>

      <Footer justify="end">
        <Tooltip text="Clear all filters" direction="n">
          <Button
            leadingVisual={FilterRemoveIcon}
            onClick={clearFilters}
            data-testid="filters-clear"
          >
            Clear filters
          </Button>
        </Tooltip>
      </Footer>
    </Page>
  );
};
