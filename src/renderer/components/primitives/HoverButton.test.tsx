import { MarkGithubIcon } from '@primer/octicons-react';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { HoverButton } from './HoverButton';

describe('renderer/components/primitives/HoverButton.tsx', () => {
  it('should render', () => {
    const mockAction = jest.fn();

    const tree = renderWithAppContext(
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

    const tree = renderWithAppContext(
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
