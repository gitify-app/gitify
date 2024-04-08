import { act, fireEvent, render, waitFor } from '@testing-library/react';
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
    let tree;

    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <MemoryRouter>
          <LoginWithToken />
        </MemoryRouter>,
      );
    });

    expect(tree).toMatchSnapshot();
  });

  it('let us go back', () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <LoginWithToken />
      </MemoryRouter>,
    );

    fireEvent.click(getByLabelText('Go Back'));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should validate the form values', () => {
    let values;
    const emptyValues = {
      hostname: null,
      token: null,
    };

    values = {
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

  it("should click on the 'personal access tokens' link and open the browser", async () => {
    const { getByText } = render(
      <AppContext.Provider value={{ validateToken: mockValidateToken }}>
        <MemoryRouter>
          <LoginWithToken />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(getByText('personal access tokens'));

    expect(openExternalMock).toHaveBeenCalledTimes(1);
  });

  it('should login using a token - success', async () => {
    mockValidateToken.mockResolvedValueOnce(null);

    const { getByLabelText, getByTitle } = render(
      <AppContext.Provider value={{ validateToken: mockValidateToken }}>
        <MemoryRouter>
          <LoginWithToken />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.change(getByLabelText('Token'), {
      target: { value: '1234567890123456789012345678901234567890' },
    });
    fireEvent.change(getByLabelText('Hostname'), {
      target: { value: 'github.com' },
    });

    fireEvent.submit(getByTitle('Submit Button'));

    await waitFor(() => expect(mockValidateToken).toHaveBeenCalledTimes(1));

    expect(mockValidateToken).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should login using a token - failure', async () => {
    mockValidateToken.mockRejectedValueOnce(null);

    const { getByLabelText, getByTitle } = render(
      <AppContext.Provider value={{ validateToken: mockValidateToken }}>
        <MemoryRouter>
          <LoginWithToken />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    act(() => {
      fireEvent.change(getByLabelText('Token'), {
        target: { value: '1234567890123456789012345678901234567890' },
      });
      fireEvent.change(getByLabelText('Hostname'), {
        target: { value: 'github.com' },
      });
      fireEvent.submit(getByTitle('Submit Button'));
    });

    await waitFor(() => expect(mockValidateToken).toHaveBeenCalledTimes(1));

    expect(mockValidateToken).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(0);
  });

  it('should render the form with errors', () => {
    const { getByLabelText, getByTitle, getByText } = render(
      <MemoryRouter>
        <LoginWithToken />
      </MemoryRouter>,
    );

    fireEvent.change(getByLabelText('Hostname'), {
      target: { value: 'test' },
    });
    fireEvent.change(getByLabelText('Token'), {
      target: { value: '123' },
    });

    fireEvent.submit(getByTitle('Submit Button'));

    expect(getByText('Invalid hostname.')).toBeDefined();
    expect(getByText('Invalid token.')).toBeDefined();
  });
});
