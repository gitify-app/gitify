import { render } from '@testing-library/react';
import { mockDirectoryPath } from '../../__mocks__/utils';
import { Emoji, type IEmoji } from './Emoji';

describe('components/icons/Emoji.tsx', () => {
  beforeEach(() => {
    mockDirectoryPath();
  });

  it('should render', () => {
    const props: IEmoji = {
      emoji: '🍺',
    };
    const tree = render(<Emoji {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
