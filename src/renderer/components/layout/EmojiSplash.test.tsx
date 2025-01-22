import { render } from '@testing-library/react';
import { EmojiSplash } from './EmojiSplash';

describe('renderer/components/layout/EmojiSplash.tsx', () => {
  it('should render itself & its children - heading only', () => {
    const tree = render(<EmojiSplash emoji="🍺" heading="Test Heading" />);

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - heading and sub-heading', () => {
    const tree = render(
      <EmojiSplash
        emoji="🍺"
        heading="Test Heading"
        subHeadings={['Test Sub-Heading']}
      />,
    );

    expect(tree).toMatchSnapshot();
  });
});
