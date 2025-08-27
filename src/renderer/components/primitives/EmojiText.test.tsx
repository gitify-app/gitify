import { act, render } from '@testing-library/react';

import { EmojiText, type IEmojiText } from './EmojiText';

describe('renderer/components/primitives/EmojiText.tsx', () => {
  it('should render', async () => {
    const props: IEmojiText = {
      text: '🍺',
    };

    let tree: ReturnType<typeof render> | null = null;

    await act(async () => {
      tree = render(<EmojiText {...props} />);
    });

    expect(tree).toMatchSnapshot();
  });
});
