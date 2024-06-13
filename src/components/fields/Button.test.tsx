import { MarkGithubIcon } from '@primer/octicons-react';
import { fireEvent, render, screen } from '@testing-library/react';
import { shell } from 'electron';
import type { WebUrl } from '../../types';
import { Button, type IButton } from './Button';

describe('components/fields/Button.tsx', () => {
  const openExternalMock = jest.spyOn(shell, 'openExternal');

  const props: IButton = {
    name: 'Button',
    label: 'button',
    size: 16,
  };

  beforeEach(() => {
    openExternalMock.mockReset();
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
    render(<Button {...props} url={'https://github.com' as WebUrl} />);

    const buttonElement = screen.getByLabelText('button');

    fireEvent.click(buttonElement);
    expect(openExternalMock).toHaveBeenCalledTimes(1);
  });
});
