import React from 'react'; // eslint-disable-line no-unused-vars
import { shallow } from 'enzyme';
import { NotificationsPage } from '../../components/notifications';
import AllRead from '../../components/all-read';
import Oops from '../../components/oops';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
const shell = window.require('electron').shell;

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
    expect(wrapper.find(ReactCSSTransitionGroup).children().length).to.equal(2);
    expect(wrapper.find('.fork').text()).to.contain('Star Gitify on GitHub');
    expect(wrapper.find('.errored').length).to.equal(0);
    expect(wrapper.find('.all-read').length).to.equal(0);

  });

  it('should render an error message if failed', function () {

    const props = {
      failed: true,
      isFetching: false,
      notifications: [],
      searchQuery: ''
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find(ReactCSSTransitionGroup).length).to.equal(0);
    expect(wrapper.find('.loading-container').length).to.equal(0);
    expect(wrapper.find('.fork').length).to.equal(0);
    expect(wrapper.find('.all-read').length).to.equal(0);
    expect(wrapper.find(Oops).length).to.equal(1);

  });

  it('should render the all read screen if no notifications and no search query', function () {

    const props = {
      failed: false,
      isFetching: false,
      notifications: [],
      searchQuery: ''
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find(ReactCSSTransitionGroup).length).to.equal(0);
    expect(wrapper.find('.loading-container').length).to.equal(0);
    expect(wrapper.find('.fork').length).to.equal(0);
    expect(wrapper.find('.all-read').length).to.equal(0);
    expect(wrapper.find('.errored').length).to.equal(0);

    expect(wrapper.find(AllRead).length).to.equal(1);

  });

  it('should not find any results for a search query', function () {

    const props = {
      failed: false,
      isFetching: false,
      notifications: notifications,
      searchQuery: 'llama'
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find(ReactCSSTransitionGroup).children().length).to.equal(0);
    expect(wrapper.find('.errored').length).to.equal(0);
    expect(wrapper.find('.fork').length).to.equal(0);
    expect(wrapper.find('h3').text()).to.contain('No Search Results.');

  });

  it('should find a result for a search query', function () {

    const props = {
      failed: false,
      isFetching: false,
      notifications: notifications,
      searchQuery: 'trevor'
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find('.all-read').length).to.equal(0);
    expect(wrapper.find('.errored').length).to.equal(0);
    expect(wrapper.find(AllRead).length).to.equal(0);

    expect(wrapper.find(ReactCSSTransitionGroup).children().length).to.equal(1);
    expect(wrapper.find('.fork').length).to.equal(1);

  });

  it('open the gitify repo in browser', function () {

    const props = {
      failed: false,
      isFetching: false,
      notifications: notifications,
      searchQuery: ''
    };

    const { wrapper } = setup(props);

    expect(wrapper).to.exist;
    expect(wrapper.find(ReactCSSTransitionGroup).children().length).to.equal(2);
    expect(wrapper.find('.fork').length).to.equal(1);

    wrapper.find('.fork').simulate('click');
    expect(shell.openExternal).to.have.been.calledOnce;
    shell.openExternal.reset();

  });
});
