import { render } from '@testing-library/react';

import { MarkGithubIcon } from '@primer/octicons-react';

import { HoverButton } from './HoverButton';

describe('renderer/components/primitives/HoverButton.tsx', () => {
  it('should render', () => {
    const mockAction = jest.fn();

    const tree = render(
      <HoverButton
        action={mockAction}
        icon={MarkGithubIcon}
        label="Hover Button"
        testid="hover-button"
      />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render - disabled', () => {
    const mockAction = jest.fn();

    const tree = render(
      <HoverButton
        action={mockAction}
        enabled={false}
        icon={MarkGithubIcon}
        label="Hover Button"
        testid="hover-button"
      />,
    );
    expect(tree).toMatchSnapshot();
  });
});
