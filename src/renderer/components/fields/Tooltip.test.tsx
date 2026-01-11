import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { Tooltip, type TooltipProps } from './Tooltip';

describe('renderer/components/fields/Tooltip.tsx', () => {
  const props: TooltipProps = {
    name: 'test',
    tooltip: 'This is some tooltip text',
  };

  it('should render', () => {
    renderWithAppContext(<Tooltip {...props} />);

    expect(screen.getByTestId('tooltip-icon-test')).toBeInTheDocument();
    expect(screen.queryByText(props.tooltip as string)).not.toBeInTheDocument();
  });

  it('should toggle (show/hide) tooltip on clicking tooltip icon', async () => {
    renderWithAppContext(<Tooltip {...props} />);

    const tooltipIconElement = screen.getByTestId('tooltip-icon-test');

    await userEvent.click(tooltipIconElement);
    expect(screen.queryByText(props.tooltip as string)).toBeInTheDocument();

    await userEvent.click(tooltipIconElement);
    expect(screen.queryByText(props.tooltip as string)).not.toBeInTheDocument();
  });
});
