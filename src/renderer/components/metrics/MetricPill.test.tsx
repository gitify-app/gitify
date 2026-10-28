import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MarkGithubIcon } from '@primer/octicons-react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { IconColor } from '../../types';

import { MetricPill, type MetricPillProps } from './MetricPill';

describe('renderer/components/metrics/MetricPill.tsx', () => {
  it('renders with metric', () => {
    const props: MetricPillProps = {
      contents: 'Mock Pill',
      metric: 1,
      icon: MarkGithubIcon,
      color: IconColor.GREEN,
    };

    const tree = renderWithProviders(<MetricPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders without metric', () => {
    const props: MetricPillProps = {
      contents: 'Mock Pill',
      icon: MarkGithubIcon,
      color: IconColor.GREEN,
    };

    const tree = renderWithProviders(<MetricPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('has a single tab stop when the pill is not clickable', async () => {
    renderWithProviders(
      <>
        <MetricPill color={IconColor.GREEN} contents="Mock Pill" icon={MarkGithubIcon} metric={1} />
        <button type="button">Next</button>
      </>,
    );

    await userEvent.tab();
    expect(screen.getByRole('button', { name: /Mock Pill|1/ })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
  });
});
