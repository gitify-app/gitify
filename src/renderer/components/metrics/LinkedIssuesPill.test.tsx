import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';

import type { GitifyLinkedIssue } from '../../types';

import { LinkedIssuesPill, type LinkedIssuesPillProps } from './LinkedIssuesPill';

const linkedIssue = (number: number): GitifyLinkedIssue => ({
  number,
  title: `Issue ${number}`,
  state: 'OPEN',
  url: `https://github.com/gitify-app/notifications-test/issues/${number}` as GitifyLinkedIssue['url'],
});

describe('renderer/components/metrics/LinkedIssuesPill.tsx', () => {
  it('renders when no linked issues/prs', () => {
    const props: LinkedIssuesPillProps = { linkedIssues: [] };

    const tree = renderWithProviders(<LinkedIssuesPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders when linked to one issue/pr', () => {
    const props: LinkedIssuesPillProps = { linkedIssues: [linkedIssue(1)] };

    const tree = renderWithProviders(<LinkedIssuesPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders when linked to multiple issues/prs', () => {
    const props: LinkedIssuesPillProps = { linkedIssues: [linkedIssue(1), linkedIssue(2)] };

    const tree = renderWithProviders(<LinkedIssuesPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('shows the linked issues preview on hovering the pill', async () => {
    const props: LinkedIssuesPillProps = { linkedIssues: [linkedIssue(1)] };

    renderWithProviders(<LinkedIssuesPill {...props} />);

    await userEvent.hover(screen.getByRole('button'));

    expect(await screen.findByTestId('linked-issues-preview')).toBeInTheDocument();
    expect(screen.getByText('Issue 1')).toBeInTheDocument();
  });
});
