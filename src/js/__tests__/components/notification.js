import React from 'react'; // eslint-disable-line no-unused-vars
import { Map } from 'immutable';
import { shallow } from 'enzyme';

const { shell } = require('electron');

import {
  SingleNotification,
  mapStateToProps,
} from '../../components/notification';

function setup(props) {
  const wrapper = shallow(<SingleNotification {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
}

describe('components/notification.js', () => {
  const notification = Map({
    id: 1,
    subject: Map({
      title: 'Hello. This is a notification.',
      type: 'Issue',
      url: 'https://api.github.com/repos/manosim/gitify/pulls/123',
    }),
  });

  beforeEach(() => {
    shell.openExternal.mockReset();
  });

  it('should test the mapStateToProps method', () => {
    const state = {
      settings: Map({
        markOnClick: true,
      }),
    };

    const mappedProps = mapStateToProps(state);

    expect(mappedProps.markOnClick).toBeTruthy();
  });

  it('should render itself & its children', () => {
    const props = {
      markNotification: jest.fn(),
      markOnClick: false,
      notification: notification,
      hostname: 'github.com',
    };

    const { wrapper } = setup(props);

    expect(wrapper).toBeDefined();
    expect(wrapper.find('h6').text()).toBe(
      notification.getIn(['subject', 'title'])
    );
    expect(wrapper.find('.octicon').first().props().className).toContain(
      'octicon-issue-opened'
    );

    wrapper.setProps({
      ...props,
      notification: notification.setIn(['subject', 'type'], 'PullRequest'),
    });

    expect(wrapper.find('.octicon').first().props().className).toContain(
      'octicon-git-pull-request'
    );

    wrapper.setProps({
      ...props,
      notification: notification.setIn(['subject', 'type'], 'Commit'),
    });
    expect(wrapper.find('.octicon').first().props().className).toContain(
      'octicon-git-commit'
    );

    wrapper.setProps({
      ...props,
      notification: notification.setIn(['subject', 'type'], 'Release'),
    });
    expect(wrapper.find('.octicon').first().props().className).toContain(
      'octicon-tag'
    );

    wrapper.setProps({
      ...props,
      notification: notification.setIn(['subject', 'type'], 'AnotherType'),
    });
    expect(wrapper.find('.octicon').first().props().className).toContain(
      'octicon-question'
    );
  });

  it('should open a notification in the browser', () => {
    const props = {
      markNotification: jest.fn(),
      markOnClick: false,
      notification: notification,
      hostname: 'github.com',
    };

    const { wrapper } = setup(props);

    expect(wrapper).toBeDefined();
    wrapper.find('.subject').simulate('click');
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
  });

  it('should mark a notification as read', () => {
    const props = {
      markNotification: jest.fn(),
      markOnClick: false,
      notification: notification,
      hostname: 'github.com',
    };

    const { wrapper } = setup(props);

    expect(wrapper).toBeDefined();
    wrapper.find('.octicon-check').simulate('click');
    expect(props.markNotification).toHaveBeenCalledTimes(1);
  });

  it('should open a notification in browser & mark it as read', () => {
    const props = {
      markNotification: jest.fn(),
      markOnClick: true,
      notification: notification,
      hostname: 'github.com',
    };

    const { wrapper } = setup(props);

    expect(wrapper).toBeDefined();
    wrapper.find('.subject').simulate('click');
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(props.markNotification).toHaveBeenCalledTimes(1);
  });
});
