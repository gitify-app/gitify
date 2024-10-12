import { ALL_EMOJI_SVG_FILENAMES } from './emojis';

describe('renderer/utils/emojis.ts', () => {
  it('emoji svg filenames', () => {
    expect(ALL_EMOJI_SVG_FILENAMES).toHaveLength(20);
    expect(ALL_EMOJI_SVG_FILENAMES).toMatchSnapshot();
  });
});
