import { renderWithAppContext } from '../../__helpers__/test-utils';

import { MilestonePill, type MilestonePillProps } from './MilestonePill';

describe('renderer/components/metrics/MilestonePill.tsx', () => {
  it('renders with no milestone', () => {
    const props: MilestonePillProps = { milestone: null };

    const tree = renderWithAppContext(<MilestonePill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders open milestone pill', () => {
    const props: MilestonePillProps = {
      milestone: {
        title: 'Milestone 1',
        state: 'OPEN',
      },
    };

    const tree = renderWithAppContext(<MilestonePill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders closed milestone pill', () => {
    const props: MilestonePillProps = {
      milestone: {
        title: 'Milestone 1',
        state: 'CLOSED',
      },
    };

    const tree = renderWithAppContext(<MilestonePill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });
});
