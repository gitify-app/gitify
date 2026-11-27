import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { IconColor } from '../../types';

import { IssueStatusPill } from './IssueStatusPill';

describe('renderer/components/metrics/IssueStatusPill.tsx', () => {
  it('renders nothing without a status', () => {
    const tree = renderWithProviders(<IssueStatusPill />);

    expect(tree.container).toBeEmptyDOMElement();
  });

  it('renders the status name', () => {
    renderWithProviders(
      <IssueStatusPill status={{ name: 'In review', kind: 'in_review', color: IconColor.GREEN }} />,
    );

    expect(screen.getByRole('button', { name: 'Issue status: In review' })).toHaveTextContent(
      'In review',
    );
  });

  it('exposes an accessible issue status label', () => {
    renderWithProviders(
      <IssueStatusPill status={{ name: 'Done', kind: 'done', color: IconColor.PURPLE }} />,
    );

    expect(screen.getByRole('button', { name: 'Issue status: Done' })).toBeInTheDocument();
  });

  it('renders an unknown status name with its neutral color', () => {
    renderWithProviders(
      <IssueStatusPill status={{ name: 'Blocked', kind: 'unknown', color: IconColor.GRAY }} />,
    );

    const status = screen.getByRole('button', { name: 'Issue status: Blocked' });
    expect(status).toHaveTextContent('Blocked');
    expect(status.querySelector('svg')).toHaveClass(IconColor.GRAY);
  });
});
