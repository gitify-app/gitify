import { MarkGithubIcon } from '@primer/octicons-react';
import { render } from '@testing-library/react';

import { HoverButton } from './HoverButton';

describe('renderer/components/primitives/HoverButton.tsx', () => {
  it('should render', () => {
    const mockAction = jest.fn();

    const tree = render(
      <HoverButton
        label="Hover Button"
        icon={MarkGithubIcon}
        testid="hover-button"
        action={mockAction}
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render - disabled', () => {
    const mockAction = jest.fn();

    const tree = render(
      <HoverButton
        label="Hover Button"
        icon={MarkGithubIcon}
        testid="hover-button"
        enabled={false}
        action={mockAction}
      />,
    );
    expect(tree).toMatchSnapshot();
  });
});
