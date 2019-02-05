import React from 'react'; // eslint-disable-line no-unused-vars
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { Map } from 'immutable';
import { MemoryRouter } from 'react-router';

import { mockedEnterpriseAccounts } from './../__mocks__/mockedData';

const { ipcRenderer, remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;

import { LoginPage, mapStateToProps } from './login';

jest.mock('../components/logos/dark');

describe('components/login.js', () => {
  const props = {
    dispatch: jest.fn(),
  };

  beforeEach(function() {
    BrowserWindow().loadURL.mockReset();
    ipcRenderer.send.mockReset();
    props.dispatch.mockReset();
  });

  it('should test the mapStateToProps method', () => {
    const state = {
      auth: Map({
        token: '123456',
        failed: false,
        isFetching: false,
        enterpriseAccounts: mockedEnterpriseAccounts,
      }),
    };

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.isEitherLoggedIn).toBeTruthy();
  });

  it('should render itself & its children', () => {
    const caseProps = {
      ...props,
      isEitherLoggedIn: false,
    };

    const tree = renderer.create(
      <MemoryRouter>
        <LoginPage {...caseProps} />
      </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
  });

  it('should open the login window and get a code successfully (will-navigate)', () => {
    const code = '123123123';

    spyOn(BrowserWindow().webContents, 'on').and.callFake((event, callback) => {
      if (event === 'will-navigate') {
        callback('will-navigate', `http://www.github.com/?code=${code}`);
      }
    });

    const expectedUrl =
      'https://github.com/login/oauth/' +
      'authorize?client_id=3fef4433a29c6ad8f22c&scope=user:email,notifications';

    const caseProps = {
      ...props,
      isEitherLoggedIn: false,
    };

    const wrapper = shallow(<LoginPage {...caseProps} />);

    expect(wrapper).toBeDefined();

    wrapper.find('button').simulate('click');

    expect(BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(BrowserWindow().loadURL).toHaveBeenCalledWith(expectedUrl);
    expect(props.dispatch).toHaveBeenCalledTimes(1);
  });

  it('should open the login window and get a code successfully (did-get-redirect-request)', () => {
    const code = '123123123';

    spyOn(BrowserWindow().webContents, 'on').and.callFake((event, callback) => {
      if (event === 'did-get-redirect-request') {
        callback(
          'did-get-redirect-request',
          null,
          `http://www.github.com/?code=${code}`
        );
      }
    });

    const expectedUrl =
      'https://github.com/login/oauth/' +
      'authorize?client_id=3fef4433a29c6ad8f22c&scope=user:email,notifications';

    const caseProps = {
      ...props,
      isEitherLoggedIn: false,
    };

    const wrapper = shallow(<LoginPage {...caseProps} />);

    expect(wrapper).toBeDefined();

    wrapper.find('button').simulate('click');

    expect(BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(BrowserWindow().loadURL).toHaveBeenCalledWith(expectedUrl);
    expect(props.dispatch).toHaveBeenCalledTimes(1);
  });

  it('should open the login window and get an error', () => {
    const error = 'Oops! Something went wrong.';

    spyOn(BrowserWindow().webContents, 'on').and.callFake((event, callback) => {
      if (event === 'did-get-redirect-request') {
        callback(
          'did-get-redirect-request',
          null,
          `http://www.github.com/?error=${error}`
        );
      }
    });

    const expectedUrl =
      'https://github.com/login/oauth/' +
      'authorize?client_id=3fef4433a29c6ad8f22c&scope=user:email,notifications';

    const caseProps = {
      ...props,
      isEitherLoggedIn: false,
    };

    const wrapper = shallow(<LoginPage {...caseProps} />);

    expect(wrapper).toBeDefined();

    wrapper.find('button').simulate('click');

    expect(BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(BrowserWindow().loadURL).toHaveBeenCalledWith(expectedUrl);
    expect(props.dispatch).not.toHaveBeenCalled();

    expect(alert).toHaveBeenCalledTimes(1);
    expect(alert).toHaveBeenCalledWith(
      "Oops! Something went wrong and we couldn't log you in using Github. Please try again."
    );
  });

  it('should close the browser window before logging in', () => {
    spyOn(BrowserWindow(), 'on').and.callFake((event, callback) => {
      if (event === 'close') {
        callback();
      }
    });

    const caseProps = {
      ...props,
      isEitherLoggedIn: false,
    };

    const wrapper = shallow(<LoginPage {...caseProps} />);

    expect(wrapper).toBeDefined();

    wrapper.find('button').simulate('click');

    expect(BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(props.dispatch).not.toHaveBeenCalled();
  });

  it('should redirect to notifications once logged in', () => {
    const caseProps = {
      ...props,
      isEitherLoggedIn: false,
    };

    const wrapper = shallow(<LoginPage {...caseProps} />);

    expect(wrapper).toBeDefined();

    wrapper.setProps({
      isEitherLoggedIn: true,
    });

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('reopen-window');

    expect(wrapper.props().to).toEqual('/');
  });
});
