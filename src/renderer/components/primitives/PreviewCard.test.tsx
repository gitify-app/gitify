import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { PreviewCard } from './PreviewCard';

describe('renderer/components/primitives/PreviewCard.tsx', () => {
  const renderPreview = () =>
    renderWithProviders(
      <PreviewCard card={<div>Preview body</div>} closeDelayMs={0} openDelayMs={0}>
        <button type="button">anchor</button>
      </PreviewCard>,
    );

  it('does not render the card before hovering', () => {
    renderPreview();

    expect(screen.queryByTestId('preview-card')).not.toBeInTheDocument();
  });

  it('opens the card on hover', async () => {
    renderPreview();

    await userEvent.hover(screen.getByRole('button', { name: 'anchor' }));

    expect(await screen.findByTestId('preview-card')).toBeInTheDocument();
    expect(screen.getByText('Preview body')).toBeInTheDocument();
  });

  it('closes the card when the pointer leaves', async () => {
    renderPreview();

    const anchor = screen.getByRole('button', { name: 'anchor' });
    await userEvent.hover(anchor);
    expect(await screen.findByTestId('preview-card')).toBeInTheDocument();

    await userEvent.unhover(anchor);

    await waitFor(() => expect(screen.queryByTestId('preview-card')).not.toBeInTheDocument());
  });

  it('closes the card when the list scrolls', async () => {
    const tree = renderPreview();

    // Make the render container a scrollable ancestor of the anchor.
    tree.container.style.overflowY = 'auto';
    Object.defineProperty(tree.container, 'scrollHeight', { configurable: true, value: 500 });
    Object.defineProperty(tree.container, 'clientHeight', { configurable: true, value: 100 });

    await userEvent.hover(screen.getByRole('button', { name: 'anchor' }));
    expect(await screen.findByTestId('preview-card')).toBeInTheDocument();

    fireEvent.scroll(tree.container);

    await waitFor(() => expect(screen.queryByTestId('preview-card')).not.toBeInTheDocument());
  });

  it('caps the card with an internal scroll region and does not steal focus', async () => {
    renderPreview();

    const anchor = screen.getByRole('button', { name: 'anchor' });
    anchor.focus();
    expect(anchor).toHaveFocus();

    const scrollRegion = await screen.findByTestId('preview-card-scroll');
    expect(scrollRegion).toHaveClass('overflow-y-auto');
    expect(scrollRegion).toHaveClass('max-h-[320px]');

    // The preview must not trap or move focus away from the trigger.
    expect(anchor).toHaveFocus();
  });
});
