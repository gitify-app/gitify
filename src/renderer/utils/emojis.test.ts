import { EMOJI_CODE_POINTS } from './emojis';

describe('renderer/utils/emojis.ts', () => {
  it('emoji code points', () => {
    expect(EMOJI_CODE_POINTS).toHaveLength(20);
    expect(EMOJI_CODE_POINTS).toMatchSnapshot();
  });
});
