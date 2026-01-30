import { renderWithAppContext } from '../../__helpers__/test-utils';

import { ReactionsPill, type ReactionsPillProps } from './ReactionsPill';

describe('renderer/components/metrics/ReactionsPill.tsx', () => {
  it('renders with no reactions', () => {
    const props: ReactionsPillProps = { reactionGroups: [], reactionsCount: 0 };

    const tree = renderWithAppContext(<ReactionsPill {...props} />);

    expect(tree).toMatchSnapshot();
  });

  it('renders when one reaction', () => {
    const props: ReactionsPillProps = {
      reactionGroups: [
        {
          content: 'ROCKET',
          reactors: { totalCount: 1 },
        },
      ],
      reactionsCount: 1,
    };

    const tree = renderWithAppContext(<ReactionsPill {...props} />);

    expect(tree).toMatchSnapshot();
  });

  it('renders when multiple reactions', () => {
    const props: ReactionsPillProps = {
      reactionGroups: [
        { content: 'THUMBS_UP', reactors: { totalCount: 1 } },
        { content: 'THUMBS_DOWN', reactors: { totalCount: 1 } },
        { content: 'LAUGH', reactors: { totalCount: 2 } },
        { content: 'HOORAY', reactors: { totalCount: 3 } },
        { content: 'CONFUSED', reactors: { totalCount: 5 } },
        { content: 'ROCKET', reactors: { totalCount: 8 } },
        { content: 'EYES', reactors: { totalCount: 13 } },
        { content: 'HEART', reactors: { totalCount: 21 } },
      ],
      reactionsCount: 54,
    };

    const tree = renderWithAppContext(<ReactionsPill {...props} />);

    expect(tree).toMatchSnapshot();
  });
});
