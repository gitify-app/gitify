import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockSettings } from '../../__mocks__/state-mocks';
import { Tooltip, type TooltipProps } from './Tooltip';

describe('renderer/components/fields/Tooltip.tsx', () => {
  const props: TooltipProps = {
    name: 'test',
    tooltip: 'This is some tooltip text',
  };

  it('should render', () => {
    renderWithAppContext(<Tooltip {...props} />, {});

    expect(screen.getByTestId('tooltip-test')).toBeInTheDocument();
  });

  it('should display on mouse enter / leave', async () => {
    renderWithAppContext(<Tooltip {...props} />, {});

    const tooltipElement = screen.getByTestId('tooltip-test');

    await userEvent.hover(tooltipElement);
    expect(screen.queryByText(props.tooltip as string)).toBeInTheDocument();

    await userEvent.unhover(tooltipElement);
    expect(screen.queryByText(props.tooltip as string)).not.toBeInTheDocument();
  });
});
