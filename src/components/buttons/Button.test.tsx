import { MarkGithubIcon } from '@primer/octicons-react';
import { fireEvent, render, screen } from '@testing-library/react';
import { shell } from 'electron';
import { type Link, Size } from '../../types';
import { Button, type IButton } from './Button';

describe('components/buttons/Button.tsx', () => {
  const openExternalMock = jest.spyOn(shell, 'openExternal');

  const props: IButton = {
    name: 'Button',
    label: 'button',
    size: Size.MEDIUM,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render without icon', () => {
    const tree = render(<Button {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render with icon', () => {
    const tree = render(<Button {...props} icon={MarkGithubIcon} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render with url', () => {
    render(<Button {...props} url={'https://github.com' as Link} />);

    const buttonElement = screen.getByLabelText('button');

    fireEvent.click(buttonElement);
    expect(openExternalMock).toHaveBeenCalledTimes(1);
  });
});
