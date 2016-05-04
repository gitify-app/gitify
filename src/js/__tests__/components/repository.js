import React from 'react'; // eslint-disable-line no-unused-vars
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

  const repository = [{
    repository: {
      full_name: 'ekonstantinidis/gitify',
      html_url: 'http://github.com/ekonstantinidis/gitify/issues/123',
      name: 'gitify',
      owner: {
        avatar_url: 'http://manos.avatar/img.png',
        login: 'ekonstantinidis',
        full_name: 'Emmanouil Konstantinidis'
      }
    }
  }];

  beforeEach(function() {
    shell.openExternal.reset();
  });

  afterEach(function() {

  });

  it('should render itself & its children (logged in)', function () {

    const props = {
      repo: repository,
      repoName: 'ekonstantinidis/gitify'
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.octicon-check').length).to.equal(1);
    expect(wrapper.find('.name').text()).to.contain('gitify');
    expect(wrapper.find('.name').text()).to.contain('ekonstantinidis');

  });

  it('should render itself & its children (logged in)', function () {

    const props = {
      repo: repository,
      repoName: 'ekonstantinidis/gitify'
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.octicon-check').length).to.equal(1);

    wrapper.find('.name').simulate('click');

    expect(wrapper.find('.name').text()).to.contain('gitify');
    expect(wrapper.find('.name').text()).to.contain('ekonstantinidis');

    expect(shell.openExternal).to.have.been.calledOnce;
    expect(shell.openExternal).to.have.been.calledWith('http://github.com/ekonstantinidis/gitify/issues/123');

  });

  it('should mark a repo as read', function () {

    const props = {
      repo: repository,
      repoName: 'ekonstantinidis/gitify',
      markRepoNotifications: sinon.spy()
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.octicon-check').length).to.equal(1);

    wrapper.find('.octicon-check').simulate('click');
    expect(props.markRepoNotifications).to.have.been.calledWith('ekonstantinidis', 'gitify', 'ekonstantinidis/gitify');

  });

});
