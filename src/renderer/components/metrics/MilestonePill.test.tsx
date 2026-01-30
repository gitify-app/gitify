import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import type { GitifyMilestone } from '../../types';

import { MilestonePill } from './MilestonePill';

describe('renderer/components/metrics/MilestonePill.tsx', () => {
  it('renders open milestone pill', () => {
    const mockNotification = { ...mockGitifyNotification };
    mockNotification.subject.milestone = {
      title: 'Milestone 1',
      state: 'OPEN',
    } as GitifyMilestone;

    const tree = renderWithAppContext(
      <MilestonePill milestone={mockNotification.subject.milestone} />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('renders closed milestone pill', () => {
    const mockNotification = { ...mockGitifyNotification };
    mockNotification.subject.milestone = {
      title: 'Milestone 1',
      state: 'CLOSED',
    } as GitifyMilestone;

    const tree = renderWithAppContext(
      <MilestonePill milestone={mockNotification.subject.milestone} />,
    );

    expect(tree).toMatchSnapshot();
  });
});
