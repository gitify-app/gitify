import { MarkGithubIcon } from '@primer/octicons-react';
import { fireEvent, render, screen } from '@testing-library/react';
import { shell } from 'electron';
import type { Link } from '../../types';
import { Button, type IButton } from './Button';

describe('components/buttons/Button.tsx', () => {
  const openExternalMock = jest.spyOn(shell, 'openExternal');

  const props: IButton = {
    label: 'button',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render without icon', () => {
    const tree = render(<Button {...props}>Button</Button>);
    expect(tree).toMatchSnapshot();
  });

  it('should render with icon', () => {
    const tree = render(
      <Button {...props} icon={{ icon: MarkGithubIcon }}>
        Button
      </Button>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render with url', () => {
    render(
      <Button {...props} url={'https://github.com' as Link} variant="link">
        Button
      </Button>,
    );

    const buttonElement = screen.getByLabelText('button');

    fireEvent.click(buttonElement);
    expect(openExternalMock).toHaveBeenCalledTimes(1);
  });
});
