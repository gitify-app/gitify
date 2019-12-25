import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { mockedEnterpriseAccounts } from '../__mocks__/mockedData';

const { ipcRenderer, remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;

import { EnterpriseLogin, mapStateToProps, validate } from './enterprise-login';
import { AppState } from '../../types/reducers';

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: props => {
    const mockProps = {
      onClick: props.onClick,
      title: props.title,
    };

    return <div {...mockProps}>FAIcon{props.title}</div>;
  },
}));

describe('routes/enterprise-login.js', () => {
  const mockedEnterpriseAccountFormData = {
    hostname: 'github.gitify.io',
    clientId: '1234567890',
    clientSecret: '1234567890987654321012345678900987654321',
  };

  const props = {
    enterpriseAccountsCount: 0,
    dispatch: jest.fn(),
    handleSubmit: cb => cb,
    history: {
      goBack: jest.fn(),
    },
  };

  beforeEach(function() {
    // @ts-ignore
    new BrowserWindow().loadURL.mockReset();
    spyOn(ipcRenderer, 'send');
    props.dispatch.mockReset();
  });

  it('should test the mapStateToProps method', () => {
    const state = {
      auth: {
        enterpriseAccounts: mockedEnterpriseAccounts,
      },
    } as AppState;

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.enterpriseAccountsCount).toBe(
      mockedEnterpriseAccounts.length
    );
  });

  it('renders correctly', () => {
    const tree = TestRenderer.create(
      <Provider store={createStore(() => {})}>
        <MemoryRouter>
          <EnterpriseLogin {...props} />
        </MemoryRouter>
      </Provider>
    );

    expect(tree).toMatchSnapshot();
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
    const caseProps = {
      ...props,
    };

    const { rerender } = render(
      <Provider store={createStore(() => {})}>
        <MemoryRouter>
          <EnterpriseLogin {...caseProps} />
        </MemoryRouter>
      </Provider>
    );

    rerender(
      <Provider store={createStore(() => {})}>
        <MemoryRouter>
          <EnterpriseLogin
            {...caseProps}
            enterpriseAccountsCount={props.enterpriseAccountsCount + 1}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('reopen-window');
    expect(props.history.goBack).toHaveBeenCalledTimes(1);
  });

  it('should render the form with errors', () => {
    const { getByLabelText, getByTitle, getByText } = render(
      <Provider store={createStore(() => {})}>
        <MemoryRouter>
          <EnterpriseLogin {...props} />
        </MemoryRouter>
      </Provider>
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

    fireEvent.submit(getByTitle('GitHub'));

    expect(getByText('Invalid hostname.')).toBeTruthy();
    expect(getByText('Invalid client id.')).toBeTruthy();
    expect(getByText('Invalid client secret.')).toBeTruthy();
  });

  it('should open the login window and get a code successfully (will-redirect)', () => {
    const code = '123123123';
    const hostname = 'github.gitify.io';
    const clientId = '12312312312312312312';

    spyOn(new BrowserWindow().webContents, 'on').and.callFake(
      (event, callback) => {
        if (event === 'will-redirect') {
          const event = new Event('will-redirect');
          callback(event, `https://${hostname}/?code=${code}`);
        }
      }
    );

    const expectedUrl = `https://${hostname}/login/oauth/authorize?client_id=${clientId}&scope=user:email,notifications`;

    const { getByLabelText, getByTitle } = render(
      <Provider store={createStore(() => {})}>
        <MemoryRouter>
          <EnterpriseLogin {...props} />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.change(getByLabelText('Hostname'), {
      target: { value: hostname },
    });
    fireEvent.change(getByLabelText('Client ID'), {
      target: { value: clientId },
    });
    fireEvent.change(getByLabelText('Client Secret'), {
      target: { value: 'ABC123ABCDABC123ABCDABC123ABCDABC123ABCD' },
    });

    fireEvent.submit(getByTitle('GitHub'));

    expect(new BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(new BrowserWindow().loadURL).toHaveBeenCalledWith(expectedUrl);
    expect(props.dispatch).toHaveBeenCalledTimes(1);
  });
});
