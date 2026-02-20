import { renderWithAppContext } from '../../__helpers__/test-utils';

import { LabelsPill, type LabelsPillProps } from './LabelsPill';

describe('renderer/components/metrics/LabelsPill.tsx', () => {
  it('renders without labels', () => {
    const props: LabelsPillProps = { labels: [] };

    const tree = renderWithAppContext(<LabelsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders with labels', () => {
    const props: LabelsPillProps = {
      labels: [
        { name: 'enhancement', color: 'a2eeef' },
        { name: 'good-first-issue', color: '7057ff' },
      ],
    };

    const tree = renderWithAppContext(<LabelsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });
});
