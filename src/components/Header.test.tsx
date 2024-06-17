import { fireEvent, render, screen } from '@testing-library/react';
import { Header } from './Header';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('components/Header.tsx', () => {
  it('should render itself & its children', () => {
    const tree = render(<Header>Test Header</Header>);

    expect(tree).toMatchSnapshot();
  });

  it('should navigate back', () => {
    render(<Header>Test Header</Header>);

    fireEvent.click(screen.getByLabelText('Go Back'));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
