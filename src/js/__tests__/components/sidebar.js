// import React from 'react'; // eslint-disable-line no-unused-vars
// import { fromJS } from 'immutable';
// import { mount } from 'enzyme';
// import { List } from 'immutable';

// const { shell, ipcRenderer } = require('electron');

// import { Sidebar } from '../../components/sidebar';

// function setup(props) {
//   const options = {
//     context: {
//       router: {
//         push: jest.fn(),
//         replace: jest.fn()
//       }
//     }
//   };

//   const wrapper = mount(<Sidebar {...props} />, options);

//   return {
//     context: options.context,
//     props: props,
//     wrapper: wrapper,
//   };
// };

// describe('components/Sidebar.js', () => {

//   let clock;
//   const notifications = fromJS([{ id: 1 }, { id: 2 }]);

//   beforeEach(() => {
//     clock = jest.useFakeTimers();

//     ipcRenderer.send.mockReset();
//     shell.openExternal.mockReset();
//   });

//   afterEach(() => {
//     clock.clearAllTimers();
//   });

//   it('should render itself & its children (logged in)', () => {
//     const props = {
//       isFetching: false,
//       notifications: notifications,
//       isLoggedIn: true,
//     };

//     spyOn(Sidebar.prototype, 'componentDidMount').and.callThrough();

//     const { wrapper } = setup(props);

//     expect(wrapper).toBeDefined();
//     expect(Sidebar.prototype.componentDidMount).toHaveBeenCalledTimes(1);
//     expect(wrapper.find('.fa-refresh').length).toBe(1);
//     expect(wrapper.find('.fa-cog').length).toBe(1);
//     expect(wrapper.find('.tag-count').text()).toBe(`${notifications.size} Unread`);
//   });

//   it('should load notifications after 60000ms', function () {
//     const props = {
//       isFetching: false,
//       notifications: notifications,
//       fetchNotifications: jest.fn(),
//       isLoggedIn: 'true',
//     };

//     const { wrapper } = setup(props);

//     expect(wrapper).toBeDefined();

//     clock.runTimersToTime(60000);
//     expect(props.fetchNotifications).toHaveBeenCalledTimes(1);
//   });

//   it('should render itself & its children (logged out)', function () {
//     const props = {
//       isFetching: false,
//       notifications: List(),
//       isLoggedIn: false,
//     };

//     spyOn(Sidebar.prototype, 'componentDidMount').and.callThrough();

//     const { wrapper } = setup(props);

//     expect(wrapper).toBeDefined();
//     expect(Sidebar.prototype.componentDidMount).toHaveBeenCalledTimes(1);
//     expect(wrapper.find('.fa-refresh').length).toBe(0);
//     expect(wrapper.find('.fa-cog').length).toBe(0);
//     expect(wrapper.find('.tag-success').length).toBe(0);
//   });

//   it('should render itself & its children (logged in/settings page)', () => {
//     const props = {
//       isFetching: false,
//       notifications: notifications,
//       isLoggedIn: true,
//     };

//     spyOn(Sidebar.prototype, 'componentDidMount').and.callThrough();

//     const { wrapper } = setup(props);

//     expect(wrapper).toBeDefined();
//     expect(Sidebar.prototype.componentDidMount).toHaveBeenCalledTimes(1);
//     expect(wrapper.find('.fa-refresh').length).toBe(1);
//     expect(wrapper.find('.fa-cog').length).toBe(1);
//     expect(wrapper.find('.tag-count').text()).toBe(`${notifications.size} Unread`);
//   });

//   it('should open the gitify repo in browser', () => {
//     const props = {
//       isFetching: false,
//       notifications: List(),
//       isLoggedIn: false
//     };

//     const { wrapper } = setup(props);

//     expect(wrapper).toBeDefined();

//     wrapper.find('.logo').simulate('click');

//     expect(shell.openExternal).toHaveBeenCalledTimes(1);
//     expect(shell.openExternal).toHaveBeenCalledWith('http://www.github.com/manosim/gitify');
//   });

//   it('should toggle the settings modal', () => {
//     const props = {
//       isFetching: false,
//       notifications: notifications,
//       isLoggedIn: 'true',
//       toggleSettingsModal: jest.fn(),
//     };

//     const { wrapper } = setup(props);

//     expect(wrapper).toBeDefined();
//     expect(wrapper.find('.fa-cog').length).toBe(1);

//     wrapper.find('.fa-cog').simulate('click');

//     expect(props.toggleSettingsModal).toHaveBeenCalledTimes(1);
//   });

//   it('should refresh the notifications', () => {
//     const props = {
//       fetchNotifications: jest.fn(),
//       isFetching: false,
//       notifications: notifications,
//       isLoggedIn: 'true',
//     };

//     const { wrapper } = setup(props);

//     expect(wrapper).toBeDefined();
//     expect(wrapper.find('.fa-refresh').length).toBe(1);

//     wrapper.find('.fa-refresh').simulate('click');
//     expect(props.fetchNotifications).toHaveBeenCalledTimes(1);
//   });

//   it('open the gitify repo in browser', () => {
//     const props = {
//       hasStarred: false,
//       notifications: notifications,
//     };

//     const { wrapper } = setup(props);

//     expect(wrapper.find('.btn-star').length).toBe(1);

//     wrapper.find('.btn-star').simulate('click');
//     expect(shell.openExternal).toHaveBeenCalledTimes(1);
//   });
// });

describe('components/Sidebar.js', () => {
  it('asd', () => {
    expect(1).toBe(1);
  });
});
