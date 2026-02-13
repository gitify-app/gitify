import { renderWithAppContext } from '../../__helpers__/test-utils';

import {
  LinkedIssuesPill,
  type LinkedIssuesPillProps,
} from './LinkedIssuesPill';

describe('renderer/components/metrics/LinkedIssuesPill.tsx', () => {
  it('renders when no linked issues/prs', () => {
    const props: LinkedIssuesPillProps = { linkedIssues: [] };

    const tree = renderWithAppContext(<LinkedIssuesPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders when linked to one issue/pr', () => {
    const props: LinkedIssuesPillProps = { linkedIssues: ['#1'] };

    const tree = renderWithAppContext(<LinkedIssuesPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders when linked to multiple issues/prs', () => {
    const props: LinkedIssuesPillProps = { linkedIssues: ['#1', '#2'] };

    const tree = renderWithAppContext(<LinkedIssuesPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });
});
