import React from 'react'; // eslint-disable-line no-unused-vars
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import { List, Map } from 'immutable';
import { reduxForm } from 'redux-form';

import { mockedEnterpriseAccounts } from './../__mocks__/mockedData';

const { ipcRenderer, remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;

import { EnterpriseLogin, mapStateToProps, validate } from './enterprise-login';

describe('routes/enterprise-login.js', () => {
  const mockedEnterpriseAccountFormData = {
    hostname: 'github.gitify.io',
    clientId: '1234567890',
    clientSecret: '1234567890987654321012345678900987654321',
  };

  const props = {
    enterpriseAccounts: List(),
    dispatch: jest.fn(),
    handleSubmit: cb => cb,
    history: {
      goBack: jest.fn(),
    },
  };

  beforeEach(function() {
    BrowserWindow().loadURL.mockReset();
    ipcRenderer.send.mockReset();
    props.dispatch.mockReset();
  });

  it('should test the mapStateToProps method', () => {
    const state = {
      auth: Map({
        enterpriseAccounts: mockedEnterpriseAccounts,
      }),
    };

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.enterpriseAccounts).toBe(mockedEnterpriseAccounts);
  });

  it('renders correctly', () => {
    const Decorated = reduxForm({ form: 'loginEnterprise' })(EnterpriseLogin);

    const tree = renderer.create(
      <Provider store={createStore(() => {})}>
        <MemoryRouter>
          <Decorated {...props} />
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

    const wrapper = shallow(<EnterpriseLogin {...caseProps} />);

    expect(wrapper).toBeDefined();

    wrapper.setProps({
      enterpriseAccounts: List.of(Map(mockedEnterpriseAccountFormData)),
    });

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('reopen-window');
    expect(props.history.goBack).toHaveBeenCalledTimes(1);
  });

  it('should open the login window and get a code successfully (will-navigate)', () => {
    const code = '123123123';

    spyOn(BrowserWindow().webContents, 'on').and.callFake((event, callback) => {
      if (event === 'will-navigate') {
        callback('will-navigate', `http://www.github.com/?code=${code}`);
      }
    });

    const expectedUrl =
      'https://github.gitify.io/login/oauth/' +
      'authorize?client_id=1234567890&scope=user:email,notifications';

    const wrapper = shallow(<EnterpriseLogin {...props} />);

    expect(wrapper).toBeDefined();

    wrapper
      .find('form')
      .simulate('submit', mockedEnterpriseAccountFormData, props.dispatch);

    expect(BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(BrowserWindow().loadURL).toHaveBeenCalledWith(expectedUrl);
    expect(props.dispatch).toHaveBeenCalledTimes(1);
  });

  it('should open the login window with a not-found url and raise an alert', () => {
    const error = 'Oops! Something went wrong.';

    spyOn(BrowserWindow().webContents, 'on').and.callFake((event, callback) => {
      if (event === 'did-fail-load') {
        callback(
          'did-fail-load',
          '404',
          'Not Found',
          `http://github.invalid.com/?error=${error}`
        );
      }
    });

    const caseProps = {
      ...props,
    };

    const wrapper = shallow(<EnterpriseLogin {...caseProps} />);

    expect(wrapper).toBeDefined();

    wrapper.find('form').simulate(
      'submit',
      {
        ...mockedEnterpriseAccountFormData,
        hostname: 'github.invalid.com',
      },
      props.dispatch
    );

    expect(BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(props.dispatch).not.toHaveBeenCalled();

    expect(dialog.showErrorBox).toHaveBeenCalledTimes(1);
    expect(dialog.showErrorBox).toHaveBeenCalledWith(
      'Invalid Hostname',
      'Could not load https://github.invalid.com/.'
    );
  });
});
