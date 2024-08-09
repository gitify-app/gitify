import { render } from '@testing-library/react';
import { Emoji, type IEmoji } from './Emoji';

describe('components/icons/Emoji.tsx', () => {
  it('should render', () => {
    const props: IEmoji = {
      emoji: '🍺',
    };
    const tree = render(<Emoji {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
