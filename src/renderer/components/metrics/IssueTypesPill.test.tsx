import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { IconColor } from '../../types';

import { IssueTypesPill } from './IssueTypesPill';

describe('renderer/components/metrics/IssueTypesPill.tsx', () => {
  it('renders nothing when no type provided', () => {
    const tree = renderWithProviders(<IssueTypesPill />);
    expect(tree.container).toBeEmptyDOMElement();
  });

  it('renders a pill for the native issue type', () => {
    renderWithProviders(<IssueTypesPill issueType={{ name: 'Bug', color: IconColor.RED }} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
