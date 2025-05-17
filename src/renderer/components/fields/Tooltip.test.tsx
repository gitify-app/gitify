import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { type ITooltip, Tooltip } from './Tooltip';

describe('renderer/components/fields/Tooltip.tsx', () => {
  const props: ITooltip = {
    name: 'test',
    tooltip: 'This is some tooltip text',
  };

  it('should render', () => {
    const tree = render(<Tooltip {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should display on mouse enter / leave', async () => {
    render(<Tooltip {...props} />);

    const tooltipElement = screen.getByTestId('tooltip-test');

    await userEvent.hover(tooltipElement);
    expect(tooltipElement).toMatchSnapshot();

    await userEvent.unhover(tooltipElement);
    expect(tooltipElement).toMatchSnapshot();
  });
});
