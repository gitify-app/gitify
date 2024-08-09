import { render } from '@testing-library/react';
import { Errors } from '../../utils/constants';
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
    const offlineEmojis = Errors.NETWORK.emojis;

    const tree = render(<Emoji emoji={offlineEmojis[0]} />);

    expect(tree.baseElement.innerHTML).not.toContain('https://'); // Offline emojis should not have an online URL
    expect(offlineEmojis.length).toEqual(1); // Ensure all NETWORK error emojis are configured for offline use - future proofing
  });
});
