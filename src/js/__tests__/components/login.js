import React from 'react'; // eslint-disable-line no-unused-vars
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { Map } from 'immutable';
import { MemoryRouter } from 'react-router';

// import {authGithub} from '../../utils/Helpers';
import * as Helpers from '../../utils/Helpers';
import { LoginPage, mapStateToProps } from '../../components/login';
import { mockedEnterpriseAccounts } from '../../__mocks__/mockedData';

const { ipcRenderer, remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;

describe('components/login.js', () => {
  const props = {
    dispatch: jest.fn()
  };

  beforeEach(function() {
    BrowserWindow().loadURL.mockReset();
    ipcRenderer.send.mockReset();
  });

  it('should test the mapStateToProps method', () => {
    const state = {
      auth: Map({
        token: '123456',
        failed: false,
        isFetching: false,
        enterpriseAccounts: mockedEnterpriseAccounts
      }),
    };

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.isEitherLoggedIn).toBeTruthy();
  });

  it('should render itself & its children', () => {
    const props = {
      isEitherLoggedIn: false,
    };

    const tree = renderer.create(
      <MemoryRouter>
        <LoginPage {...props} />
      </MemoryRouter>
    );

    expect(tree).toMatchSnapshot();
  });

  it('should open the login window and get a code successfully (will-navigate)', () => {
    const code = '123123123';

    // console.log(Helpers);
    // spyOn(authGithub).and.callFake(() => {});
    // authGithub = jest.fn();
    spyOn(Helpers, 'authGithub');

    spyOn(BrowserWindow().webContents, 'on').and.callFake((event, callback) => {
      if (event === 'will-navigate') {
        callback('will-navigate', `http://www.github.com/?code=${code}`);
      }
    });

    const expectedUrl = 'https://github.com/login/oauth/' +
      'authorize?client_id=3fef4433a29c6ad8f22c&scope=user:email,notifications';

    const caseProps = {
      ...props,
      isEitherLoggedIn: false,
    };

    const wrapper = shallow(<LoginPage {...caseProps} />);

    expect(wrapper).toBeDefined();

    wrapper.find('button').simulate('click');

    // console.log(Helpers.authGithub.toString());

    expect(Helpers.authGithub).toHaveBeenCalledTimes(1);
    // expect(BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    // expect(BrowserWindow().loadURL).toHaveBeenCalledWith(expectedUrl);
    // expect(props.dispatch).toHaveBeenCalledTimes(1);
    // expect(props.dispatch.calls).toHaveBeenCalledWith(code);
  });

  it('should open the login window and get a code successfully (did-get-redirect-request)', () => {
    const code = '123123123';

    spyOn(BrowserWindow().webContents, 'on').and.callFake((event, callback) => {
      if (event === 'did-get-redirect-request') {
        callback('did-get-redirect-request', null, `http://www.github.com/?code=${code}`);
      }
    });

    const expectedUrl = 'https://github.com/login/oauth/' +
      'authorize?client_id=3fef4433a29c6ad8f22c&scope=user:email,notifications';

    const caseProps = {
      isEitherLoggedIn: false,
    };

    const wrapper = shallow(<LoginPage {...caseProps} />);

    expect(wrapper).toBeDefined();

    wrapper.find('.github').simulate('click');

    expect(BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(BrowserWindow().loadURL).toHaveBeenCalledWith(expectedUrl);
    expect(props.loginUser).toHaveBeenCalledTimes(1);
    expect(props.loginUser).toHaveBeenCalledWith(code);
  });

  it('should open the login window and get an error', () => {
    const error = 'Oops! Something went wrong.';

    spyOn(BrowserWindow().webContents, 'on').and.callFake((event, callback) => {
      if (event === 'did-get-redirect-request') {
        callback('did-get-redirect-request', null, `http://www.github.com/?error=${error}`);
      }
    });

    const expectedUrl = 'https://github.com/login/oauth/' +
      'authorize?client_id=3fef4433a29c6ad8f22c&scope=user:email,notifications';

    const props = {
      loginUser: jest.fn(),
      token: null,
      response: {},
      failed: false,
      isFetching: false,
      settings: Map({
        baseUrl: 'github.com',
        clientId: '3fef4433a29c6ad8f22c',
        clientSecret: '9670de733096c15322183ff17ed0fc8704050379'
      }),
    };

    const wrapper = shallow(<LoginPage {...props} />);

    expect(wrapper).toBeDefined();

    wrapper.find('.github').simulate('click');

    expect(BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(BrowserWindow().loadURL).toHaveBeenCalledWith(expectedUrl);
    expect(props.loginUser).not.toHaveBeenCalled();

    expect(alert).toHaveBeenCalledTimes(1);
    expect(alert).toHaveBeenCalledWith(
      'Oops! Something went wrong and we couldn\'t log you in using Github. Please try again.'
    );
  });

  it('should close the browser window before logging in', () => {
    spyOn(BrowserWindow(), 'on').and.callFake((event, callback) => {
      if (event === 'close') {
        callback();
      }
    });

    const props = {
      loginUser: jest.fn(),
      token: null,
      response: {},
      failed: false,
      isFetching: false,
      settings: Map({
        baseUrl: 'github.com',
        clientId: '3fef4433a29c6ad8f22c',
        clientSecret: '9670de733096c15322183ff17ed0fc8704050379'
      }),
    };

    const wrapper = shallow(<LoginPage {...props} />);

    expect(wrapper).toBeDefined();

    wrapper.find('.github').simulate('click');

    expect(BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(props.loginUser).not.toHaveBeenCalled();
  });

  it('should redirect to notifications once logged in', () => {
    const props = {
      isLoggedIn: false,
      response: {},
      failed: false,
      isFetching: false,
      settings: Map({
        baseUrl: 'github.com',
        clientId: '3fef4433a29c6ad8f22c',
        clientSecret: '9670de733096c15322183ff17ed0fc8704050379'
      }),
    };

    const wrapper = shallow(<LoginPage {...props} />);

    expect(wrapper).toBeDefined();

    wrapper.setProps({
      isLoggedIn: true
    });

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('reopen-window');

    expect(wrapper.props().to).toEqual('/');
  });

  it('should request the github token if the oauth code is received', () => {
    const code = 'thisisacode';

    const props = {
      loginUser: jest.fn(),
      token: null,
      response: {},
      failed: false,
      isFetching: false
    };

    const wrapper = shallow(<LoginPage {...props} />);

    expect(wrapper).toBeDefined();

    wrapper.instance().requestGithubToken(code);
    expect(props.loginUser).toHaveBeenCalledTimes(1);
    expect(props.loginUser).toHaveBeenCalledWith(code);
  });
});
