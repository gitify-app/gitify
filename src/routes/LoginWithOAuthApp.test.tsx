import { fireEvent, render, screen } from '@testing-library/react';
import { shell } from 'electron';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '../context/App';
import type { AuthState, ClientID, ClientSecret, Hostname } from '../types';
import { LoginWithOAuthApp, validate } from './LoginWithOAuthApp';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('routes/LoginWithOAuthApp.tsx', () => {
  const openExternalMock = jest.spyOn(shell, 'openExternal');

  const mockAuth: AuthState = {
    accounts: [],
  };

  beforeEach(() => {
    openExternalMock.mockReset();
    mockNavigate.mockReset();
  });

  it('renders correctly', () => {
    const tree = render(
      <AppContext.Provider value={{ auth: mockAuth }}>
        <MemoryRouter>
          <LoginWithOAuthApp />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('let us go back', () => {
    render(
      <AppContext.Provider value={{ auth: mockAuth }}>
        <MemoryRouter>
          <LoginWithOAuthApp />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByLabelText('Go Back'));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should validate the form values', () => {
    const emptyValues = {
      hostname: null,
      clientId: null,
      clientSecret: null,
    };

    let values = {
      ...emptyValues,
    };
    expect(validate(values).hostname).toBe('Required');
    expect(validate(values).clientId).toBe('Required');
    expect(validate(values).clientSecret).toBe('Required');

    values = {
      ...emptyValues,
      hostname: 'hello' as Hostname,
      clientId: '!@£INVALID-.1' as ClientID,
      clientSecret: '!@£INVALID-.1' as ClientSecret,
    };
    expect(validate(values).hostname).toBe('Invalid hostname.');
    expect(validate(values).clientId).toBe('Invalid client id.');
    expect(validate(values).clientSecret).toBe('Invalid client secret.');
  });

  describe("'Create new OAuth App' button", () => {
    it('should be disabled if no hostname configured', async () => {
      render(
        <AppContext.Provider value={{ auth: mockAuth }}>
          <MemoryRouter>
            <LoginWithOAuthApp />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByText('Create new OAuth App'));

      expect(openExternalMock).toHaveBeenCalledTimes(0);
    });

    it('should open in browser if hostname configured', async () => {
      render(
        <AppContext.Provider value={{ auth: mockAuth }}>
          <MemoryRouter>
            <LoginWithOAuthApp />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.change(screen.getByLabelText('Hostname'), {
        target: { value: 'company.github.com' },
      });

      fireEvent.click(screen.getByText('Create new OAuth App'));

      expect(openExternalMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should render the form with errors', () => {
    render(
      <AppContext.Provider value={{ auth: mockAuth }}>
        <MemoryRouter>
          <LoginWithOAuthApp />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.change(screen.getByLabelText('Hostname'), {
      target: { value: 'test' },
    });
    fireEvent.change(screen.getByLabelText('Client ID'), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByLabelText('Client Secret'), {
      target: { value: 'abc' },
    });

    fireEvent.submit(screen.getByTitle('Login'));

    expect(screen.getByText('Invalid hostname.')).toBeTruthy();
    expect(screen.getByText('Invalid client id.')).toBeTruthy();
    expect(screen.getByText('Invalid client secret.')).toBeTruthy();
  });

  it('should open help docs in the browser', async () => {
    render(
      <AppContext.Provider value={{ auth: mockAuth }}>
        <MemoryRouter>
          <LoginWithOAuthApp />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByLabelText('GitHub Docs'));

    expect(openExternalMock).toHaveBeenCalledTimes(1);
  });
});
