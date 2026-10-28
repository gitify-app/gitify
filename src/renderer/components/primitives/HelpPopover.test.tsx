import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { HelpPopover, type HelpPopoverProps } from './HelpPopover';

describe('renderer/components/primitives/HelpPopover.tsx', () => {
  const props: HelpPopoverProps = {
    name: 'test',
    label: 'Test setting',
    content: 'This is some help text',
  };

  it('renders', () => {
    renderWithProviders(<HelpPopover {...props} />);

    expect(screen.getByRole('button', { name: 'Help: Test setting' })).toBeInTheDocument();
    expect(screen.queryByText(props.content as string)).not.toBeInTheDocument();
  });

  it('toggles (show/hide) help on clicking the icon', async () => {
    renderWithProviders(<HelpPopover {...props} />);

    const icon = screen.getByRole('button', { name: 'Help: Test setting' });

    await userEvent.click(icon);
    expect(screen.getByText(props.content as string)).toBeInTheDocument();

    await userEvent.click(icon);
    expect(screen.queryByText(props.content as string)).not.toBeInTheDocument();
  });

  it('hides help when its scroll container scrolls', async () => {
    renderWithProviders(
      <div data-testid="scroll-container" style={{ overflowY: 'auto' }}>
        <div style={{ height: 400 }}>
          <HelpPopover {...props} />
        </div>
      </div>,
    );

    const scrollContainer = screen.getByTestId('scroll-container');
    Object.defineProperty(scrollContainer, 'clientHeight', { configurable: true, value: 100 });
    Object.defineProperty(scrollContainer, 'scrollHeight', { configurable: true, value: 400 });

    await userEvent.click(screen.getByRole('button', { name: 'Help: Test setting' }));
    expect(screen.getByText(props.content as string)).toBeInTheDocument();

    fireEvent.scroll(scrollContainer);

    await waitFor(() => {
      expect(screen.queryByText(props.content as string)).not.toBeInTheDocument();
    });
  });

  it('hides help when clicking outside', async () => {
    renderWithProviders(<HelpPopover {...props} />);

    const icon = screen.getByRole('button', { name: 'Help: Test setting' });

    await userEvent.click(icon);
    expect(screen.getByText(props.content as string)).toBeInTheDocument();

    await userEvent.click(document.body);
    expect(screen.queryByText(props.content as string)).not.toBeInTheDocument();
  });
});
