import { render } from '@testing-library/react';
import { Emoji, type IEmoji } from './Emoji';

describe('components/icons/Emoji.tsx', () => {
  it('should render - online CDN SVGs', () => {
    const props: IEmoji = {
      emoji: '🍺',
    };
    const tree = render(<Emoji {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render - offline SVGs', () => {
    const props: IEmoji = {
      emoji: '🛜',
    };
    const tree = render(<Emoji {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
