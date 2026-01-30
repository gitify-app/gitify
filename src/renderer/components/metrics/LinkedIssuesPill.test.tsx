import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import { LinkedIssuesPill } from './LinkedIssuesPill';

describe('renderer/components/metrics/LinkedIssuesPill.tsx', () => {
  it('renders when linked to one issue/pr', () => {
    const mockNotification = { ...mockGitifyNotification };
    mockNotification.subject.linkedIssues = ['#1'];

    const tree = renderWithAppContext(
      <LinkedIssuesPill linkedIssues={mockNotification.subject.linkedIssues} />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('renders when linked to multiple issues/prs', () => {
    const mockNotification = { ...mockGitifyNotification };
    mockNotification.subject.linkedIssues = ['#1', '#2'];

    const tree = renderWithAppContext(
      <LinkedIssuesPill linkedIssues={mockNotification.subject.linkedIssues} />,
    );

    expect(tree).toMatchSnapshot();
  });
});
