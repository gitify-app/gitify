import { render } from '@testing-library/react';

import { EmojiText, type IEmojiText } from './EmojiText';

describe('renderer/components/primitives/EmojiText.tsx', () => {
  it('should render', () => {
    const props: IEmojiText = {
      text: '🍺',
    };
    const tree = render(<EmojiText {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
