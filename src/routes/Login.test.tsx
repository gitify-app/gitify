import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '../context/App';
import * as comms from '../utils/comms';
import { LoginRoute } from './Login';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('routes/Login.tsx', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children', () => {
    const tree = render(
      <MemoryRouter>
        <LoginRoute />
      </MemoryRouter>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should redirect to notifications once logged in', () => {
    const showWindowMock = jest.spyOn(comms, 'showWindow');

    const { rerender } = render(
      <AppContext.Provider value={{ isLoggedIn: false }}>
        <MemoryRouter>
          <LoginRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    rerender(
      <AppContext.Provider value={{ isLoggedIn: true }}>
        <MemoryRouter>
          <LoginRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(showWindowMock).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/', { replace: true });
  });

  it('should navigate to login with personal access token', () => {
    render(
      <MemoryRouter>
        <LoginRoute />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText('Login with Personal Access Token'));

    expect(mockNavigate).toHaveBeenNthCalledWith(
      1,
      '/login-personal-access-token',
    );
  });

  it('should navigate to login with oauth app', () => {
    render(
      <MemoryRouter>
        <LoginRoute />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText('Login with OAuth App'));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/login-oauth-app');
  });
});
