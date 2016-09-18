import React from 'react'; // eslint-disable-line no-unused-vars
import { fromJS } from 'immutable';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { Repository } from '../../components/repository';
// const ipcRenderer = window.require('electron').ipcRenderer;
const shell = window.require('electron').shell;

function setup(props) {
  const wrapper = shallow(<Repository {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
};

describe('components/repository.js', function () {

  const repository = fromJS([{
    repository: {
      full_name: 'manosim/gitify',
      html_url: 'http://github.com/manosim/gitify/issues/123',
      name: 'gitify',
      owner: {
        avatar_url: 'http://manos.avatar/img.png',
        login: 'manosim',
        full_name: 'Emmanouil Konstantinidis'
      }
    }
  }]);

  beforeEach(function() {
    shell.openExternal.reset();
  });

  afterEach(function() {

  });

  it('should render itself & its children (logged in)', function () {

    const props = {
      repo: repository,
      repoName: 'manosim/gitify'
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.octicon-check').length).to.equal(1);
    expect(wrapper.find('.name').text()).to.contain('gitify');
    expect(wrapper.find('.name').text()).to.contain('manosim');

  });

  it('should render itself & its children (logged in)', function () {

    const props = {
      repo: repository,
      repoName: 'manosim/gitify'
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.octicon-check').length).to.equal(1);

    wrapper.find('.name').simulate('click');

    expect(wrapper.find('.name').text()).to.contain('gitify');
    expect(wrapper.find('.name').text()).to.contain('manosim');

    expect(shell.openExternal).to.have.been.calledOnce;
    expect(shell.openExternal).to.have.been.calledWith('http://github.com/manosim/gitify/issues/123');

  });

  it('should mark a repo as read', function () {

    const props = {
      repo: repository,
      repoName: 'manosim/gitify',
      markRepoNotifications: sinon.spy()
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.octicon-check').length).to.equal(1);

    wrapper.find('.octicon-check').simulate('click');
    expect(props.markRepoNotifications).to.have.been.calledWith('manosim/gitify');

  });

});
