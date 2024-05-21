import { fireEvent, render, screen } from '@testing-library/react';

import * as TestRenderer from 'react-test-renderer';

import { MarkGithubIcon } from '@primer/octicons-react';
import { shell } from 'electron';
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
    const tree = TestRenderer.create(<Button {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render with icon', () => {
    const tree = TestRenderer.create(
      <Button {...props} icon={MarkGithubIcon} />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render with url', () => {
    render(<Button {...props} url="https://github.com" />);

    const buttonElement = screen.getByLabelText('button');

    fireEvent.click(buttonElement);
    expect(openExternalMock).toHaveBeenCalledTimes(1);
  });
});
