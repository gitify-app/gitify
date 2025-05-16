import { fireEvent, render, screen } from '@testing-library/react';

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

  it('should display on mouse enter / leave', () => {
    render(<Tooltip {...props} />);

    const tooltipElement = screen.getByTestId('tooltip-test');

    fireEvent.mouseEnter(tooltipElement);
    expect(tooltipElement).toMatchSnapshot();

    fireEvent.mouseLeave(tooltipElement);
    expect(tooltipElement).toMatchSnapshot();
  });
});
