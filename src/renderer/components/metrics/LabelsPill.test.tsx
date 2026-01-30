import { screen } from '@testing-library/react';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import { LabelsPill } from './LabelsPill';

describe('renderer/components/metrics/LabelsPill.tsx', () => {
  it('renders labels pill count', () => {
    const mockNotification = { ...mockGitifyNotification };
    mockNotification.subject.labels = [
      { name: 'enhancement', color: 'a2eeef' },
      { name: 'good-first-issue', color: '7057ff' },
    ];

    renderWithAppContext(
      <LabelsPill labels={mockNotification.subject.labels} />,
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
