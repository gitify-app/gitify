import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { FieldLabel, type FieldLabelProps } from './FieldLabel';

describe('renderer/components/fields/FieldLabel.tsx', () => {
  const props: FieldLabelProps = {
    name: 'appearance',
    label: 'Appearance',
  };

  it('should render', () => {
    const tree = renderWithProviders(<FieldLabel {...props} />);
    expect(tree.container).toMatchSnapshot();
  });

  it('should render optional help and show it on click', async () => {
    renderWithProviders(<FieldLabel {...props} tooltip="Appearance help" />);

    expect(screen.getByText('Appearance')).not.toHaveClass('mr-1');
    expect(screen.getByTestId('tooltip-icon-tooltip-appearance')).toBeInTheDocument();
    expect(screen.queryByText('Appearance help')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('tooltip-icon-tooltip-appearance'));

    expect(screen.getByText('Appearance help')).toBeInTheDocument();
  });
});
