import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { LoginPage } from '../../components/login';

const BrowserWindow = window.require('electron').remote.BrowserWindow;
const ipcRenderer = window.require('electron').ipcRenderer;
const shell = window.require('electron').shell;

function setup(props) {
  const options = {
    context: {
      router: {
        push: sinon.spy(),
        replace: sinon.spy()
      }
    }
  };

  const wrapper = shallow(<LoginPage {...props} />, options);

  return {
    context: options.context,
    props: props,
    wrapper: wrapper,
  };
};

describe('components/login.js', function () {

  beforeEach(function() {
    BrowserWindow().loadURL.reset();
    ipcRenderer.send.reset();
    shell.openExternal.reset();
  });

  it('should render itself & its children', function () {

    const props = {
      isLoggedIn: false,
      token: null,
      response: {},
      failed: false,
      isFetching: false
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.desc').text()).to.equal('GitHub notifications in your menu bar.');

  });

  it('should open the login window and get a code successfully (will-navigate)', function () {

    // BrowserWindow.webContents.on.restore();
    // sinon.spy(BrowserWindow.webContents, 'on');
    const code = '123123123';

    const eventStub = sinon.stub(BrowserWindow().webContents, 'on', function (event, callback) {
      if (event === 'will-navigate') {
        callback('will-navigate', `http://www.github.com/?code=${code}`);
      }
    });

    const expectedUrl = 'https://github.com/login/oauth/' +
      'authorize?client_id=3fef4433a29c6ad8f22c&scope=user:email,notifications';

    const props = {
      loginUser: sinon.spy(),
      token: null,
      response: {},
      failed: false,
      isFetching: false
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;

    wrapper.find('.btn').simulate('click');

    expect(BrowserWindow().loadURL).to.have.been.calledOnce;
    expect(BrowserWindow().loadURL).to.have.been.calledWith(expectedUrl);
    expect(props.loginUser).to.have.been.calledOnce;
    expect(props.loginUser).to.have.been.calledWith(code);

    eventStub.restore();

  });

  it('should open the login window and get a code successfully (did-get-redirect-request)', function () {

    const code = '123123123';

    const eventStub = sinon.stub(BrowserWindow().webContents, 'on', function (event, callback) {
      if (event === 'did-get-redirect-request') {
        callback('did-get-redirect-request', null, `http://www.github.com/?code=${code}`);
      }
    });

    const expectedUrl = 'https://github.com/login/oauth/' +
      'authorize?client_id=3fef4433a29c6ad8f22c&scope=user:email,notifications';

    const props = {
      loginUser: sinon.spy(),
      token: null,
      response: {},
      failed: false,
      isFetching: false
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;

    wrapper.find('.btn').simulate('click');

    expect(BrowserWindow().loadURL).to.have.been.calledOnce;
    expect(BrowserWindow().loadURL).to.have.been.calledWith(expectedUrl);
    expect(props.loginUser).to.have.been.calledOnce;
    expect(props.loginUser).to.have.been.calledWith(code);

    eventStub.restore();

  });


  it('should open the login window and get an error', function () {

    const error = 'Oops! Something went wrong.';

    const eventStub = sinon.stub(BrowserWindow().webContents, 'on', function (event, callback) {
      if (event === 'did-get-redirect-request') {
        callback('did-get-redirect-request', null, `http://www.github.com/?error=${error}`);
      }
    });

    const expectedUrl = 'https://github.com/login/oauth/' +
      'authorize?client_id=3fef4433a29c6ad8f22c&scope=user:email,notifications';

    const props = {
      loginUser: sinon.spy(),
      token: null,
      response: {},
      failed: false,
      isFetching: false
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;

    wrapper.find('.btn').simulate('click');

    expect(BrowserWindow().loadURL).to.have.been.calledOnce;
    expect(BrowserWindow().loadURL).to.have.been.calledWith(expectedUrl);
    expect(props.loginUser).to.not.have.been.calledOnce;
    expect(alert).to.have.been.calledOnce;
    expect(alert).to.have.been.calledWith(
      'Oops! Something went wrong and we couldn\'t log you in using Github. Please try again.'
    );

    eventStub.restore();

  });

  it('should redirect to notifications once logged in', function () {

    const props = {
      token: null,
      response: {},
      failed: false,
      isFetching: false
    };

    const { wrapper, context } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.desc').text()).to.equal('GitHub notifications in your menu bar.');

    wrapper.setProps({
      token: 'HELLO'
    });
    expect(ipcRenderer.send).to.have.been.calledOnce;
    expect(ipcRenderer.send).to.have.been.calledWith('reopen-window');
    expect(context.router.push).to.have.been.calledOnce;
    expect(context.router.push).to.have.been.calledWith('/notifications');

    context.router.push.reset();
  });

  it('should request the github token if the oauth code is received', function () {

    const code = 'thisisacode';

    const props = {
      loginUser: sinon.spy(),
      token: null,
      response: {},
      failed: false,
      isFetching: false
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;

    wrapper.instance().requestGithubToken(code);
    expect(props.loginUser).to.have.been.calledOnce;
    expect(props.loginUser).to.have.been.calledWith(code);

    props.loginUser.reset();

  });

});
