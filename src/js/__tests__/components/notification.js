import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { SingleNotification } from '../../components/notification';
const shell = window.require('electron').shell;

function setup(props) {
  const wrapper = shallow(<SingleNotification {...props} />);

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
      url: 'https://api.github.com/repos/manosim/gitify/issues/173/',
      latest_comment_url: 'https://api.github.com/manosim/gitify/issues/173/224367941'
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

  it('should open a notification in the browser', function () {

    const props = {
      markNotification: sinon.spy(),
      markOnClick: false,
      notification: notification
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    wrapper.find('.subject').simulate('click');
    expect(shell.openExternal).to.have.been.calledOnce;

    shell.openExternal.reset();

  });

  it('should mark a notification as read', function () {

    const props = {
      markNotification: sinon.spy(),
      markOnClick: false,
      notification: notification
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    wrapper.find('.octicon-check').simulate('click');
    expect(props.markNotification).to.have.been.calledOnce;

  });

  it('should open a notification in browser & mark it as read', function () {

    const props = {
      markNotification: sinon.spy(),
      markOnClick: true,
      notification: notification
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    wrapper.find('.subject').simulate('click');
    expect(shell.openExternal).to.have.been.calledOnce;
    expect(props.markNotification).to.have.been.calledOnce;

    shell.openExternal.reset();
  });

});
