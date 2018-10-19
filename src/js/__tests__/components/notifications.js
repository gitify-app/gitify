import React from 'react'; // eslint-disable-line no-unused-vars
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { List } from 'immutable';

import { AccountNotifications } from '../../components/notifications';
import { mockedGithubNotifications } from '../../__mocks__/mockedData';

jest.mock('../../components/repository');

describe('components/notifications.js', () => {
  it('should render itself (github.com with notifications)', () => {
    const props = {
      hostname: 'github.com',
      notifications: mockedGithubNotifications,
      markAccountNotifications: () => {},
    };

    const tree = renderer.create(<AccountNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render itself (github.com without notifications)', () => {
    const props = {
      hostname: 'github.com',
      notifications: List(),
      markAccountNotifications: () => {},
    };

    const tree = renderer.create(<AccountNotifications {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it("should mark an account's notification as read", () => {
    const props = {
      markAccountNotifications: jest.fn(),
      hostname: 'github.com',
      notifications: mockedGithubNotifications,
    };

    const wrapper = shallow(<AccountNotifications {...props} />);

    expect(wrapper).toBeDefined();
    wrapper.find('.octicon-check').simulate('click');
    expect(props.markAccountNotifications).toHaveBeenCalledTimes(1);
  });
});
