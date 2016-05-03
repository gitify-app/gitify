import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { Login } from '../../components/login';

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
  const wrapper = shallow(<Login {...props} />, options);

  return {
    context: options.context,
    props: props,
    wrapper: wrapper,
  };
};

describe('components/login.js', function () {

  beforeEach(function() {
    ipcRenderer.send.reset();
    shell.openExternal.reset();
  });

  it('should render itself & its children', function () {
    const props = {
      token: 'token',
      response: 'response',
      failed: 'failed',
      isFetching: 'isFetching'
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.desc').text()).to.equal('GitHub notifications in your menu bar.');

  });

});
