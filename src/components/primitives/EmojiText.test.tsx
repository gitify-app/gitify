import { act } from '@testing-library/react';

import { renderWithAppContext } from '../../__helpers__/test-utils';

import { EmojiText, type IEmojiText } from './EmojiText';

describe('renderer/components/primitives/EmojiText.tsx', () => {
  it('should render', async () => {
    const props: IEmojiText = {
      text: '🍺',
    };

    let tree: ReturnType<typeof renderWithAppContext> | null = null;

    await act(async () => {
      tree = renderWithAppContext(<EmojiText {...props} />);
    });

    expect(tree).toMatchSnapshot();
  });
});
