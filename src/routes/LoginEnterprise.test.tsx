import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { fireEvent, render } from '@testing-library/react';
import { Router } from 'react-router';
import { MemoryRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const { ipcRenderer } = require('electron');

import { AppContext } from '../context/App';
import { AuthState } from '../types';
import { LoginEnterpriseRoute, validate } from './LoginEnterprise';
import { mockedEnterpriseAccounts } from '../__mocks__/mockedData';

describe('routes/LoginEnterprise.js', () => {
  const history = createMemoryHistory();
  const goBackMock = jest.spyOn(history, 'goBack');

  const mockAccounts: AuthState = {
    enterpriseAccounts: [],
    user: null,
  };

  beforeEach(function () {
    goBackMock.mockReset();

    spyOn(ipcRenderer, 'send');
  });

  it('renders correctly', () => {
    const tree = TestRenderer.create(
      <AppContext.Provider value={{ accounts: mockAccounts }}>
        <MemoryRouter>
          <LoginEnterpriseRoute />
        </MemoryRouter>
      </AppContext.Provider>
    );

    expect(tree).toMatchSnapshot();
  });

  it('let us go back', () => {
    const goBackMock = jest.spyOn(history, 'goBack');

    const { getByLabelText } = render(
      <AppContext.Provider value={{ accounts: mockAccounts }}>
        <Router history={history}>
          <LoginEnterpriseRoute />
        </Router>
      </AppContext.Provider>
    );

    fireEvent.click(getByLabelText('Go Back'));
    expect(goBackMock).toHaveBeenCalledTimes(1);
  });

  it('should validate the form values', () => {
    let values;
    const emptyValues = {
      hostname: null,
      clientId: null,
      clientSecret: null,
    };

    values = {
      ...emptyValues,
    };
    expect(validate(values).hostname).toBe('Required');
    expect(validate(values).clientId).toBe('Required');
    expect(validate(values).clientSecret).toBe('Required');

    values = {
      ...emptyValues,
      hostname: 'hello',
      clientId: '!@£INVALID-.1',
      clientSecret: '!@£INVALID-.1',
    };
    expect(validate(values).hostname).toBe('Invalid hostname.');
    expect(validate(values).clientId).toBe('Invalid client id.');
    expect(validate(values).clientSecret).toBe('Invalid client secret.');
  });

  it('should receive a logged-in enterprise account', () => {
    const { rerender } = render(
      <AppContext.Provider value={{ accounts: mockAccounts }}>
        <Router history={history}>
          <LoginEnterpriseRoute />
        </Router>
      </AppContext.Provider>
    );

    rerender(
      <AppContext.Provider
        value={{
          accounts: {
            enterpriseAccounts: mockedEnterpriseAccounts,
            user: null,
          },
        }}
      >
        <Router history={history}>
          <LoginEnterpriseRoute />
        </Router>
      </AppContext.Provider>
    );

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('reopen-window');
    expect(goBackMock).toHaveBeenCalledTimes(1);
  });

  it('should render the form with errors', () => {
    const { getByLabelText, getByTitle, getByText } = render(
      <AppContext.Provider value={{ accounts: mockAccounts }}>
        <MemoryRouter>
          <LoginEnterpriseRoute />
        </MemoryRouter>
      </AppContext.Provider>
    );

    fireEvent.change(getByLabelText('Hostname'), {
      target: { value: 'test' },
    });
    fireEvent.change(getByLabelText('Client ID'), {
      target: { value: '123' },
    });
    fireEvent.change(getByLabelText('Client Secret'), {
      target: { value: 'abc' },
    });

    fireEvent.submit(getByTitle('Login Button'));

    expect(getByText('Invalid hostname.')).toBeTruthy();
    expect(getByText('Invalid client id.')).toBeTruthy();
    expect(getByText('Invalid client secret.')).toBeTruthy();
  });
});
