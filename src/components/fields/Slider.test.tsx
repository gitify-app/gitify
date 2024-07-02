import { fireEvent, render, screen } from '@testing-library/react';
import { type ISlider, Slider } from './Slider';

global.ResizeObserver = require('resize-observer-polyfill');

describe('components/fields/Slider.tsx', () => {
  const changeValue = jest.fn();

  const props: ISlider = {
    min: 0,
    max: 100,
    step: 1,
    defaultValue: [50],
    onValueChange: changeValue,
  };

  it('should render', () => {
    const tree = render(<Slider {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render with a name', () => {
    const tree = render(<Slider visualSteps={6} {...props} name="slider" />);
    expect(tree).toMatchSnapshot();
  });

  it('should check that on interaction the value changes', () => {
    render(<Slider {...props} />);
    const slider = screen.getByRole('slider');

    fireEvent.keyDown(slider, { key: 'ArrowRight' });

    expect(changeValue).toHaveBeenCalledWith([51]);
  });
});
