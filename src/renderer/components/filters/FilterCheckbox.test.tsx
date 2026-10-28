import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { FilterCheckbox } from './FilterCheckbox';

describe('renderer/components/filters/FilterCheckbox.tsx', () => {
  it('renders a labelled checkbox with a counter', () => {
    renderWithProviders(
      <FilterCheckbox checked={true} counter={3} label="Issues" name="issues" onChange={vi.fn()} />,
    );

    expect(screen.getByRole('checkbox', { name: 'Issues' })).toBeChecked();
    expect(screen.getByText('Issues')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders help and disabled state', async () => {
    renderWithProviders(
      <FilterCheckbox
        checked={false}
        disabled={true}
        label="Issues"
        name="issues"
        onChange={vi.fn()}
        tooltip="Only issues assigned to you."
      />,
    );

    expect(screen.getByRole('checkbox', { name: 'Issues' })).toBeDisabled();

    await userEvent.click(screen.getByTestId('tooltip-icon-tooltip-issues'));

    expect(screen.getByText('Only issues assigned to you.')).toBeInTheDocument();
  });
});
