import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../__helpers__/test-utils';

import { SettingsToggle } from './SettingsToggle';

describe('renderer/components/settings/controls/SettingsToggle.tsx', () => {
  it('renders a labelled switch with a caption', () => {
    renderWithProviders(
      <SettingsToggle
        caption="Shows new notifications."
        checked={false}
        label="Show notifications"
        name="showNotifications"
        onChange={vi.fn()}
      />,
    );

    const toggle = screen.getByRole('button', { name: 'Show notifications' });

    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveAccessibleDescription(/Shows new notifications\./);
    expect(screen.getByTestId('switch-showNotifications')).toContainElement(toggle);
  });

  it('calls onChange with the next value', async () => {
    const onChange = vi.fn();

    renderWithProviders(
      <SettingsToggle
        checked={false}
        label="Show notifications"
        name="showNotifications"
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Show notifications' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles from the label', async () => {
    const onChange = vi.fn();

    renderWithProviders(
      <SettingsToggle
        checked={true}
        label="Show notifications"
        name="showNotifications"
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByText('Show notifications'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('does not toggle when disabled', async () => {
    const onChange = vi.fn();

    renderWithProviders(
      <SettingsToggle
        checked={false}
        disabled={true}
        label="Show notifications"
        name="showNotifications"
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Show notifications' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Show notifications' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('renders nothing when hidden', () => {
    renderWithProviders(
      <SettingsToggle
        checked={false}
        label="Show notifications"
        name="showNotifications"
        onChange={vi.fn()}
        visible={false}
      />,
    );

    expect(screen.queryByTestId('switch-showNotifications')).not.toBeInTheDocument();
  });
});
