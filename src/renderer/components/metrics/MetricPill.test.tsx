import { render } from '@testing-library/react';

import { MarkGithubIcon } from '@primer/octicons-react';

import { IconColor } from '../../types';
import { MetricPill, type MetricPillProps } from './MetricPill';

describe('renderer/components/metrics/MetricPill.tsx', () => {
  it('should render with metric', () => {
    const props: MetricPillProps = {
      title: 'Mock Pill',
      metric: 1,
      icon: MarkGithubIcon,
      color: IconColor.GREEN,
    };
    const tree = render(<MetricPill {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render without metric', () => {
    const props: MetricPillProps = {
      title: 'Mock Pill',
      icon: MarkGithubIcon,
      color: IconColor.GREEN,
    };
    const tree = render(<MetricPill {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
