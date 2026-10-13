import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import type { GitifyLinkedIssue, Link } from '../../types';

import * as comms from '../../utils/system/comms';
import { LinkedIssuesCard, MAX_VISIBLE_LINKED_ISSUES } from './LinkedIssuesCard';

const linkedIssue = (
  number: number,
  state: GitifyLinkedIssue['state'] = 'OPEN',
): GitifyLinkedIssue => ({
  number,
  title: `Issue ${number}`,
  state,
  url: `https://github.com/gitify-app/notifications-test/issues/${number}` as Link,
});

describe('renderer/components/previews/LinkedIssuesCard.tsx', () => {
  it('renders nothing when there are no linked issues', () => {
    const { container } = renderWithProviders(<LinkedIssuesCard linkedIssues={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders a short list of linked issues', () => {
    const tree = renderWithProviders(
      <LinkedIssuesCard linkedIssues={[linkedIssue(1), linkedIssue(2, 'CLOSED')]} />,
    );

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Issue 1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('caps a long list with a summary', () => {
    const linkedIssues = Array.from({ length: MAX_VISIBLE_LINKED_ISSUES + 2 }, (_, index) =>
      linkedIssue(index + 1),
    );

    const tree = renderWithProviders(<LinkedIssuesCard linkedIssues={linkedIssues} />);

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.queryByText(`#${MAX_VISIBLE_LINKED_ISSUES + 1}`)).not.toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('opens a linked issue on click and stops propagation', () => {
    const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());
    const onRowClick = vi.fn();

    renderWithProviders(
      <div onClick={onRowClick}>
        <LinkedIssuesCard linkedIssues={[linkedIssue(1)]} />
      </div>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open issue #1 Issue 1' }));

    expect(openExternalLinkSpy).toHaveBeenCalledWith(linkedIssue(1).url);
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
