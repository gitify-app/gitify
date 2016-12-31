import React from 'react'; // eslint-disable-line no-unused-vars
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';
import { Repository } from '../../components/repository';

const { shell } = require('electron');

function setup(props) {
  const wrapper = shallow(<Repository {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
};

describe('components/repository.js', function () {

  const repository = fromJS([{
    id: '123',
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
    shell.openExternal.mockReset();
  });

  afterEach(function() {

  });

  it('should render itself & its children (logged in)', function () {

    const props = {
      repo: repository,
      repoName: 'manosim/gitify'
    };

    const { wrapper } = setup(props);

    expect(wrapper).toBeDefined();
    expect(wrapper.find('.octicon-check').length).toBe(1);
    expect(wrapper.find('.name').text()).toContain('gitify');
    expect(wrapper.find('.name').text()).toContain('manosim');

  });

  it('should render itself & its children (logged in)', function () {

    const props = {
      repo: repository,
      repoName: 'manosim/gitify'
    };

    const { wrapper } = setup(props);

    expect(wrapper).toBeDefined();
    expect(wrapper.find('.octicon-check').length).toBe(1);

    wrapper.find('.name span').simulate('click');

    expect(wrapper.find('.name').text()).toContain('gitify');
    expect(wrapper.find('.name').text()).toContain('manosim');

    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(shell.openExternal).toHaveBeenCalledWith('http://github.com/manosim/gitify/issues/123');

  });

  it('should mark a repo as read', function () {

    const props = {
      repo: repository,
      repoName: 'manosim/gitify',
      markRepoNotifications: jest.fn()
    };

    const { wrapper } = setup(props);

    expect(wrapper).toBeDefined();
    expect(wrapper.find('.octicon-check').length).toBe(1);

    wrapper.find('.octicon-check').simulate('click');
    expect(props.markRepoNotifications).toHaveBeenCalledWith('manosim/gitify');

  });

});
