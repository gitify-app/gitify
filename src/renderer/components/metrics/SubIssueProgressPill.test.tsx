import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import type { GitifySubIssueProgress } from '../../types';

import {
  SubIssueProgressPill,
  type SubIssueProgressPillProps,
  SubIssueProgressWheel,
} from './SubIssueProgressPill';

describe('renderer/components/metrics/SubIssueProgressPill.tsx', () => {
  it('renders nothing when progress is undefined or null', () => {
    const { container } = renderWithProviders(<SubIssueProgressPill progress={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when total is 0', () => {
    const { container } = renderWithProviders(
      <SubIssueProgressPill progress={{ total: 0, completed: 0, percentCompleted: 0 }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders in-progress sub-issue pill with progress wheel', () => {
    const progress: GitifySubIssueProgress = {
      total: 5,
      completed: 2,
      percentCompleted: 40,
    };
    const props: SubIssueProgressPillProps = { progress };

    const tree = renderWithProviders(<SubIssueProgressPill {...props} />);

    expect(screen.getByText('2/5')).toBeInTheDocument();
    expect(screen.getByTestId('sub-issue-progress-wheel')).toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('renders completed sub-issue pill with 100% progress wheel', () => {
    const progress: GitifySubIssueProgress = {
      total: 5,
      completed: 5,
      percentCompleted: 100,
    };
    const props: SubIssueProgressPillProps = { progress };

    const tree = renderWithProviders(<SubIssueProgressPill {...props} />);

    expect(screen.getByText('5/5')).toBeInTheDocument();
    expect(screen.getByTestId('sub-issue-progress-wheel')).toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  describe('SubIssueProgressWheel', () => {
    it('renders with 0% progress (only track circle)', () => {
      const { container } = renderWithProviders(<SubIssueProgressWheel percent={0} />);
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBe(1);
    });

    it('renders with >0% progress (track circle + progress arc)', () => {
      const { container } = renderWithProviders(<SubIssueProgressWheel percent={50} />);
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBe(2);
      expect(circles[1]).toHaveClass('text-gitify-icon-done');
    });
  });
});
