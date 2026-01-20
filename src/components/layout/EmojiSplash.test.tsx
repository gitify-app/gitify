import { act } from '@testing-library/react';

import { renderWithAppContext } from '../../__helpers__/test-utils';

import { EmojiSplash } from './EmojiSplash';

describe('renderer/components/layout/EmojiSplash.tsx', () => {
  it('should render itself & its children - heading only', async () => {
    let tree: ReturnType<typeof renderWithAppContext> | null = null;

    await act(async () => {
      tree = await act(async () => {
        return renderWithAppContext(
          <EmojiSplash emoji="🍺" heading="Test Heading" />,
        );
      });
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - heading and sub-heading', async () => {
    let tree: ReturnType<typeof renderWithAppContext> | null = null;

    await act(async () => {
      tree = await act(async () => {
        return renderWithAppContext(
          <EmojiSplash
            emoji="🍺"
            heading="Test Heading"
            subHeadings={['Test Sub-Heading']}
          />,
        );
      });
    });

    expect(tree).toMatchSnapshot();
  });
});
