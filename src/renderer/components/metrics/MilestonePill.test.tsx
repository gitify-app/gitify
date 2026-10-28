import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { MilestonePill, type MilestonePillProps } from './MilestonePill';

describe('renderer/components/metrics/MilestonePill.tsx', () => {
  it('renders with no milestone', () => {
    const props: MilestonePillProps = {};

    const tree = renderWithProviders(<MilestonePill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders open milestone pill', () => {
    const props: MilestonePillProps = {
      milestone: {
        title: 'Milestone 1',
        state: 'OPEN',
      },
    };

    const tree = renderWithProviders(<MilestonePill {...props} />);

    expect(screen.getByText('Milestone: Milestone 1 (open)')).toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('renders closed milestone pill', () => {
    const props: MilestonePillProps = {
      milestone: {
        title: 'Milestone 1',
        state: 'CLOSED',
      },
    };

    const tree = renderWithProviders(<MilestonePill {...props} />);

    expect(screen.getByText('Milestone: Milestone 1 (closed)')).toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });
});
