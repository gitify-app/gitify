import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { shell } from 'electron';

import { MemoryRouter } from 'react-router-dom';
import TestRenderer from 'react-test-renderer';

import { AppContext } from '../context/App';
import {
  LoginWithPersonalAccessToken,
  validate,
} from './LoginWithPersonalAccessToken';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('routes/LoginWithPersonalAccessToken.tsx', () => {
  const openExternalMock = jest.spyOn(shell, 'openExternal');

  const mockValidateToken = jest.fn();

  beforeEach(() => {
    mockValidateToken.mockReset();
    openExternalMock.mockReset();
    mockNavigate.mockReset();
  });

  it('renders correctly', () => {
    const tree = TestRenderer.create(
      <MemoryRouter>
        <LoginWithPersonalAccessToken />
      </MemoryRouter>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('let us go back', () => {
    render(
      <MemoryRouter>
        <LoginWithPersonalAccessToken />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText('Go Back'));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should validate the form values', () => {
    const emptyValues = {
      hostname: null,
      token: null,
    };

    let values = {
      ...emptyValues,
    };
    expect(validate(values).hostname).toBe('Required');
    expect(validate(values).token).toBe('Required');

    values = {
      ...emptyValues,
      hostname: 'hello',
      token: '!@£INVALID-.1',
    };
    expect(validate(values).hostname).toBe('Invalid hostname.');
    expect(validate(values).token).toBe('Invalid token.');
  });

  describe("'Generate a PAT' button", () => {
    it('should be disabled if no hostname configured', async () => {
      render(
        <AppContext.Provider value={{ validateToken: mockValidateToken }}>
          <MemoryRouter>
            <LoginWithPersonalAccessToken />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.change(screen.getByLabelText('Hostname'), {
        target: { value: '' },
      });

      fireEvent.click(screen.getByText('Generate a PAT'));

      expect(openExternalMock).toHaveBeenCalledTimes(0);
    });

    it('should open in browser if hostname configured', async () => {
      render(
        <AppContext.Provider value={{ validateToken: mockValidateToken }}>
          <MemoryRouter>
            <LoginWithPersonalAccessToken />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByText('Generate a PAT'));

      expect(openExternalMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should login using a token - success', async () => {
    mockValidateToken.mockResolvedValueOnce(null);

    render(
      <AppContext.Provider value={{ validateToken: mockValidateToken }}>
        <MemoryRouter>
          <LoginWithPersonalAccessToken />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.change(screen.getByLabelText('Token'), {
      target: { value: '1234567890123456789012345678901234567890' },
    });
    fireEvent.change(screen.getByLabelText('Hostname'), {
      target: { value: 'github.com' },
    });

    fireEvent.submit(screen.getByTitle('Login'));

    await waitFor(() => expect(mockValidateToken).toHaveBeenCalledTimes(1));

    expect(mockValidateToken).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should login using a token - failure', async () => {
    mockValidateToken.mockRejectedValueOnce(null);

    render(
      <AppContext.Provider value={{ validateToken: mockValidateToken }}>
        <MemoryRouter>
          <LoginWithPersonalAccessToken />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    act(() => {
      fireEvent.change(screen.getByLabelText('Token'), {
        target: { value: '1234567890123456789012345678901234567890' },
      });
      fireEvent.change(screen.getByLabelText('Hostname'), {
        target: { value: 'github.com' },
      });
      fireEvent.submit(screen.getByTitle('Login'));
    });

    await waitFor(() => expect(mockValidateToken).toHaveBeenCalledTimes(1));

    expect(mockValidateToken).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(0);
  });

  it('should render the form with errors', () => {
    render(
      <MemoryRouter>
        <LoginWithPersonalAccessToken />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Hostname'), {
      target: { value: 'test' },
    });
    fireEvent.change(screen.getByLabelText('Token'), {
      target: { value: '123' },
    });

    fireEvent.submit(screen.getByTitle('Login'));

    expect(screen.getByText('Invalid hostname.')).toBeDefined();
    expect(screen.getByText('Invalid token.')).toBeDefined();
  });

  it('should open help docs in the browser', async () => {
    render(
      <AppContext.Provider value={{ validateToken: mockValidateToken }}>
        <MemoryRouter>
          <LoginWithPersonalAccessToken />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByLabelText('GitHub Docs'));

    expect(openExternalMock).toHaveBeenCalledTimes(1);
  });
});
