import { MarkGithubIcon } from '@primer/octicons-react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { HoverButton } from './HoverButton';

describe('renderer/components/primitives/HoverButton.tsx', () => {
  it('should render', () => {
    const actionMock = vi.fn();

    const tree = renderWithProviders(
      <HoverButton
        action={actionMock}
        icon={MarkGithubIcon}
        label="Hover Button"
        testid="hover-button"
      />,
    );
    expect(tree.container).toMatchSnapshot();
  });

  it('should render - disabled', () => {
    const actionMock = vi.fn();

    const tree = renderWithProviders(
      <HoverButton
        action={actionMock}
        enabled={false}
        icon={MarkGithubIcon}
        label="Hover Button"
        testid="hover-button"
      />,
    );
    expect(tree.container).toMatchSnapshot();
  });
});
