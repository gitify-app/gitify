import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';
import { SingleNotification } from '../../components/notification';

function setup(props) {
  const wrapper = mount(<SingleNotification {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
};

describe('components/notification.js', function () {

  const notification = {
    id: 1,
    subject: {
      title: 'Hello. This is a notification.',
      type: 'Issue',
      url: 'https://api.github.com/repos/ekonstantinidis/gitify/issues/123'
    }
  };

  it('should render itself & its children', function () {
    const props = {
      markNotification: sinon.spy(),
      markOnClick: false,
      notification: notification
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;

    expect(wrapper.find('.subject').text()).to.equal(notification.subject.title);
    expect(wrapper.find('.octicon').first().props().className).to.contain('octicon-issue-opened');

    wrapper.setProps({
      ...props,
      notification: {
        ...notification,
        subject: {
          ...notification.subject,
          type: 'PullRequest'
        }
      }
    });
    expect(wrapper.find('.octicon').first().props().className).to.contain('octicon-git-pull-request');

    wrapper.setProps({
      ...props,
      notification: {
        ...notification,
        subject: {
          ...notification.subject,
          type: 'Commit'
        }
      }
    });
    expect(wrapper.find('.octicon').first().props().className).to.contain('octicon-git-commit');

    wrapper.setProps({
      ...props,
      notification: {
        ...notification,
        subject: {
          ...notification.subject,
          type: 'Release'
        }
      }
    });
    expect(wrapper.find('.octicon').first().props().className).to.contain('octicon-tag');

    wrapper.setProps({
      ...props,
      notification: {
        ...notification,
        subject: {
          ...notification.subject,
          type: 'AnotherType'
        }
      }
    });
    expect(wrapper.find('.octicon').first().props().className).to.contain('octicon-question');

  });

});
