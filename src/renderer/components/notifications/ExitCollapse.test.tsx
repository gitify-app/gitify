import { renderWithProviders } from '../../__helpers__/test-utils';

import { ExitCollapse } from './ExitCollapse';

describe('renderer/components/notifications/ExitCollapse.tsx', () => {
  const renderCollapse = (isExiting: boolean) =>
    renderWithProviders(
      <ExitCollapse isExiting={isExiting}>
        <div data-testid="content">Notification</div>
      </ExitCollapse>,
    );

  it('renders its content without exit markers', () => {
    const tree = renderCollapse(false);

    expect(tree.getByTestId('content')).toBeInTheDocument();
    expect(tree.container.querySelector('[data-exit-motion]')).toBeNull();
    expect(tree.container.querySelector('[data-exit-collapse]')).toBeNull();
    expect(tree.container.firstElementChild?.firstElementChild).toHaveClass('grid-rows-[1fr]');
  });

  it('marks both layers and applies the slide and collapse classes while exiting', () => {
    const tree = renderCollapse(true);

    expect(tree.container.querySelector('[data-exit-motion]')).toHaveClass(
      'translate-x-full',
      'opacity-0',
      'overflow-hidden',
      'duration-350',
      'motion-reduce:transition-none',
    );
    expect(tree.container.querySelector('[data-exit-collapse]')).toHaveClass(
      'grid-rows-[0fr]',
      'duration-0',
      'delay-350',
      'motion-reduce:transition-none',
    );
  });

  it('clears the exit markers and classes when the exit stops', () => {
    const tree = renderCollapse(true);

    tree.rerender(
      <ExitCollapse isExiting={false}>
        <div data-testid="content">Notification</div>
      </ExitCollapse>,
    );

    expect(tree.container.querySelector('[data-exit-motion]')).toBeNull();
    expect(tree.container.querySelector('[data-exit-collapse]')).toBeNull();
    expect(tree.container.firstElementChild).not.toHaveClass('translate-x-full');
  });
});
