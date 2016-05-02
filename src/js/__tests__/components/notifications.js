import React from 'react'; // eslint-disable-line no-unused-vars
import { expect } from 'chai';
import { shallow } from 'enzyme';
// import sinon from 'sinon';
import { NotificationsPage } from '../../components/notifications';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
// const shell = window.require('electron').shell;

function setup(props) {
  const wrapper = shallow(<NotificationsPage {...props} />);

  return {
    props: props,
    wrapper: wrapper,
  };
};

describe('components/notifications.js', function () {

  const notifications = [
    {
      id: 1,
      subject: {
        title: 'Hello. This is a notification.',
        type: 'Issue',
        url: 'https://api.github.com/repos/ekonstantinidis/gitify/issues/123'
      },
      repository: {
        full_name: 'ekonstantinidis/gitify'
      }
    },
    {
      id: 2,
      subject: {
        title: 'Another Test.',
        type: 'PullRequest',
        url: 'https://api.github.com/repos/ekonstantinidis/gitify/pulls/456'
      },
      repository: {
        full_name: 'ekonstantinidis/trevor'
      }
    }
  ];

  it('should render itself & its children', function () {

    const props = {
      failed: false,
      isFetching: false,
      notifications: notifications,
      searchQuery: ''
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;

    // console.log();
    // console.log();
    // console.log(wrapper);
    // console.log(wrapper.find(Repository));
    // console.log();
    // console.log();

    expect(wrapper.find(ReactCSSTransitionGroup).children().length).to.equal(notifications.length);
    // expect(wrapper.find('.octicon').first().props().className).to.contain('octicon-issue-opened');

  });

});
