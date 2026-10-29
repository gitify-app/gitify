import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';

import type { Link } from '../../types';

import * as comms from '../../utils/system/comms';
import { LinkedIssuesPill, type LinkedIssuesPillProps } from './LinkedIssuesPill';

const issue1 = { number: 1, url: 'https://github.com/gitify-app/gitify/issues/1' as Link };
const issue2 = { number: 2, url: 'https://github.com/gitify-app/gitify/issues/2' as Link };

describe('renderer/components/metrics/LinkedIssuesPill.tsx', () => {
  it('renders when no linked issues/prs', () => {
    const props: LinkedIssuesPillProps = { linkedIssues: [] };

    const tree = renderWithProviders(<LinkedIssuesPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders when linked to one issue/pr', () => {
    const props: LinkedIssuesPillProps = { linkedIssues: [issue1] };

    const tree = renderWithProviders(<LinkedIssuesPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders when linked to multiple issues/prs', () => {
    const props: LinkedIssuesPillProps = { linkedIssues: [issue1, issue2] };

    const tree = renderWithProviders(<LinkedIssuesPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('opens the linked issue on click when there is exactly one', async () => {
    const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());
    const onRowClick = vi.fn();

    renderWithProviders(
      <div onClick={onRowClick}>
        <LinkedIssuesPill linkedIssues={[issue1]} />
      </div>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(openExternalLinkSpy).toHaveBeenCalledWith(issue1.url);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('does not open anything on click when there are multiple linked issues', async () => {
    const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

    renderWithProviders(<LinkedIssuesPill linkedIssues={[issue1, issue2]} />);

    await userEvent.click(screen.getByRole('button'));

    expect(openExternalLinkSpy).not.toHaveBeenCalled();
  });
});
