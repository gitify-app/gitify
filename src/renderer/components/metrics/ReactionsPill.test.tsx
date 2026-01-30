import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import { ReactionsPill } from './ReactionsPill';

describe('renderer/components/metrics/ReactionsPill.tsx', () => {
  it('renders when one reaction', () => {
    const mockNotification = { ...mockGitifyNotification };
    mockNotification.subject.reactionsCount = 1;
    mockNotification.subject.reactionGroups = [
      {
        content: 'ROCKET',
        reactors: { totalCount: 1 },
      },
    ];

    const tree = renderWithAppContext(
      <ReactionsPill
        reactionGroups={mockNotification.subject.reactionGroups}
        reactionsCount={mockNotification.subject.reactionsCount}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('renders when multiple reactions', () => {
    const mockNotification = { ...mockGitifyNotification };
    mockNotification.subject.reactionsCount = 53;
    mockNotification.subject.reactionGroups = [
      { content: 'THUMBS_UP', reactors: { totalCount: 1 } },
      { content: 'THUMBS_DOWN', reactors: { totalCount: 1 } },
      { content: 'LAUGH', reactors: { totalCount: 2 } },
      { content: 'HOORAY', reactors: { totalCount: 3 } },
      { content: 'CONFUSED', reactors: { totalCount: 5 } },
      { content: 'ROCKET', reactors: { totalCount: 8 } },
      { content: 'EYES', reactors: { totalCount: 13 } },
      { content: 'HEART', reactors: { totalCount: 21 } },
    ];

    const tree = renderWithAppContext(
      <ReactionsPill
        reactionGroups={mockNotification.subject.reactionGroups}
        reactionsCount={mockNotification.subject.reactionsCount}
      />,
    );

    expect(tree).toMatchSnapshot();
  });
});
