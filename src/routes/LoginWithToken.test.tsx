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
import { LoginWithToken, validate } from './LoginWithToken';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('routes/LoginWithToken.tsx', () => {
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
        <LoginWithToken />
      </MemoryRouter>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('let us go back', () => {
    render(
      <MemoryRouter>
        <LoginWithToken />
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

  it("should click on the 'Generate a PAT' link and open the browser", async () => {
    render(
      <AppContext.Provider value={{ validateToken: mockValidateToken }}>
        <MemoryRouter>
          <LoginWithToken />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByText('Generate a PAT'));

    expect(openExternalMock).toHaveBeenCalledTimes(1);
  });

  it('should login using a token - success', async () => {
    mockValidateToken.mockResolvedValueOnce(null);

    render(
      <AppContext.Provider value={{ validateToken: mockValidateToken }}>
        <MemoryRouter>
          <LoginWithToken />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.change(screen.getByLabelText('Token'), {
      target: { value: '1234567890123456789012345678901234567890' },
    });
    fireEvent.change(screen.getByLabelText('Hostname'), {
      target: { value: 'github.com' },
    });

    fireEvent.submit(screen.getByTitle('Submit Button'));

    await waitFor(() => expect(mockValidateToken).toHaveBeenCalledTimes(1));

    expect(mockValidateToken).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should login using a token - failure', async () => {
    mockValidateToken.mockRejectedValueOnce(null);

    render(
      <AppContext.Provider value={{ validateToken: mockValidateToken }}>
        <MemoryRouter>
          <LoginWithToken />
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
      fireEvent.submit(screen.getByTitle('Submit Button'));
    });

    await waitFor(() => expect(mockValidateToken).toHaveBeenCalledTimes(1));

    expect(mockValidateToken).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(0);
  });

  it('should render the form with errors', () => {
    render(
      <MemoryRouter>
        <LoginWithToken />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Hostname'), {
      target: { value: 'test' },
    });
    fireEvent.change(screen.getByLabelText('Token'), {
      target: { value: '123' },
    });

    fireEvent.submit(screen.getByTitle('Submit Button'));

    expect(screen.getByText('Invalid hostname.')).toBeDefined();
    expect(screen.getByText('Invalid token.')).toBeDefined();
  });
});
