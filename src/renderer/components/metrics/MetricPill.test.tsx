import { MarkGithubIcon } from '@primer/octicons-react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { IconColor } from '../../types';

import { MetricPill, type MetricPillProps } from './MetricPill';

describe('renderer/components/metrics/MetricPill.tsx', () => {
  it('should render with metric', () => {
    const props: MetricPillProps = {
      contents: 'Mock Pill',
      metric: 1,
      icon: MarkGithubIcon,
      color: IconColor.GREEN,
    };

    const tree = renderWithProviders(<MetricPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('should render without metric', () => {
    const props: MetricPillProps = {
      contents: 'Mock Pill',
      icon: MarkGithubIcon,
      color: IconColor.GREEN,
    };

    const tree = renderWithProviders(<MetricPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });
});
