import { fireEvent, render, screen } from '@testing-library/react';
import { type ITooltip, Tooltip } from './Tooltip';

describe('components/fields/Tooltip.tsx', () => {
  const props: ITooltip = {
    name: 'tooltip',
    tooltip: 'This is some tooltip text',
  };

  it('should render', () => {
    const tree = render(<Tooltip {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should display on mouse enter / leave', () => {
    render(<Tooltip {...props} />);

    const tooltipElement = screen.getByLabelText('tooltip');

    fireEvent.mouseEnter(tooltipElement);
    expect(tooltipElement).toMatchSnapshot();

    fireEvent.mouseLeave(tooltipElement);
    expect(tooltipElement).toMatchSnapshot();
  });
});
