import { renderWithAppContext } from '../../__helpers__/test-utils';

import { CommentsPill, type CommentsPillProps } from './CommentsPill';

describe('renderer/components/metrics/CommentsPill.tsx', () => {
  it('renders with no comments (null)', () => {
    const props: CommentsPillProps = null;

    const tree = renderWithAppContext(<CommentsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders with 1 comment', () => {
    const props: CommentsPillProps = {
      commentCount: 1,
    };

    const tree = renderWithAppContext(<CommentsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders with multiple comments', () => {
    const props: CommentsPillProps = {
      commentCount: 2,
    };

    const tree = renderWithAppContext(<CommentsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });
});
