import { MarkGithubIcon } from '@primer/octicons-react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppContext } from '../../context/App';
import { Header } from './Header';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('renderer/components/primitives/Header.tsx', () => {
  const fetchNotifications = jest.fn();

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render itself & its children', () => {
    const tree = render(<Header icon={MarkGithubIcon}>Test Header</Header>);

    expect(tree).toMatchSnapshot();
  });

  it('should navigate back', async () => {
    render(<Header icon={MarkGithubIcon}>Test Header</Header>);

    await userEvent.click(screen.getByTestId('header-nav-back'));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should navigate back and fetch notifications', async () => {
    render(
      <AppContext.Provider
        value={{
          fetchNotifications,
        }}
      >
        <Header fetchOnBack icon={MarkGithubIcon}>
          Test Header
        </Header>
      </AppContext.Provider>,
    );

    await userEvent.click(screen.getByTestId('header-nav-back'));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
    expect(fetchNotifications).toHaveBeenCalledTimes(1);
  });
});
