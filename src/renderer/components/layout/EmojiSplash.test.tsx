import { render } from '@testing-library/react';
import { act } from 'react';

import { EmojiSplash } from './EmojiSplash';

describe('renderer/components/layout/EmojiSplash.tsx', () => {
  it('should render itself & its children - heading only', async () => {
    let tree: ReturnType<typeof render> | null = null;

    await act(async () => {
      tree = await act(async () => {
        return render(<EmojiSplash emoji="🍺" heading="Test Heading" />);
      });
    });

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - heading and sub-heading', async () => {
    let tree: ReturnType<typeof render> | null = null;

    await act(async () => {
      tree = await act(async () => {
        return render(
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
