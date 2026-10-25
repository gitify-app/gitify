import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../__helpers__/test-utils';

import { SettingsChoice } from './SettingsChoice';

describe('renderer/components/settings/controls/SettingsChoice.tsx', () => {
  it('renders a labelled segmented choice', () => {
    renderWithProviders(
      <SettingsChoice
        caption="Choose how notifications are grouped."
        label="Group by"
        name="groupBy"
        onChange={vi.fn()}
        options={[
          { label: 'Repository', value: 'repository' },
          { label: 'Date', value: 'date' },
        ]}
        value="repository"
      />,
    );

    expect(screen.getByText('Group by', { selector: 'button' })).toBeInTheDocument();
    expect(screen.getByText('Choose how notifications are grouped.')).toBeInTheDocument();
    expect(screen.getByTestId('choice-groupBy-repository')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('choice-groupBy-date')).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange when a segment is selected', async () => {
    const onChange = vi.fn();

    renderWithProviders(
      <SettingsChoice
        label="Group by"
        name="groupBy"
        onChange={onChange}
        options={[
          { label: 'Repository', value: 'repository' },
          { label: 'Date', value: 'date' },
        ]}
        value="repository"
      />,
    );

    await userEvent.click(screen.getByTestId('choice-groupBy-date'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('date');
  });

  it('cycles to the next segment when the label is clicked', async () => {
    const onChange = vi.fn();

    renderWithProviders(
      <SettingsChoice
        label="Group by"
        name="groupBy"
        onChange={onChange}
        options={[
          { label: 'Repository', value: 'repository' },
          { label: 'Date', value: 'date' },
        ]}
        value="repository"
      />,
    );

    await userEvent.click(screen.getByText('Group by', { selector: 'button' }));

    expect(onChange).toHaveBeenCalledWith('date');
  });

  it('renders a select variant', async () => {
    const onChange = vi.fn();

    renderWithProviders(
      <SettingsChoice
        label="Theme"
        name="theme"
        onChange={onChange}
        options={[
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
        ]}
        presentation="select"
        value="light"
      />,
    );

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Theme' }), 'dark');

    expect(onChange).toHaveBeenCalledWith('dark');
  });

  it('focuses the select when the label is clicked', async () => {
    renderWithProviders(
      <SettingsChoice
        label="Theme"
        name="theme"
        onChange={vi.fn()}
        options={[
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
        ]}
        presentation="select"
        value="light"
      />,
    );

    await userEvent.click(screen.getByText('Theme', { selector: 'button' }));

    expect(screen.getByRole('combobox', { name: 'Theme' })).toHaveFocus();
  });

  it('renders nothing when hidden', () => {
    renderWithProviders(
      <SettingsChoice
        label="Group by"
        name="groupBy"
        onChange={vi.fn()}
        options={[{ label: 'Repository', value: 'repository' }]}
        value="repository"
        visible={false}
      />,
    );

    expect(screen.queryByText('Group by')).not.toBeInTheDocument();
  });
});
