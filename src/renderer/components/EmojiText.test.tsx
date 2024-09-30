import { render } from '@testing-library/react';
import { mockDirectoryPath } from '../__mocks__/utils';
import { EmojiText, type IEmojiText } from './EmojiText';

describe('renderer/components/Emoji.tsx', () => {
  beforeEach(() => {
    mockDirectoryPath();
  });

  it('should render', () => {
    const props: IEmojiText = {
      text: '🍺',
    };
    const tree = render(<EmojiText {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
