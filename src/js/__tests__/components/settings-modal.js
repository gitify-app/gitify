import React from 'react'; // eslint-disable-line no-unused-vars
import { Map } from 'immutable';
import { shallow } from 'enzyme';
import { Checkbox, RadioGroup, Radio } from 'react-icheck';

const { ipcRenderer } = require('electron');

import { SettingsModal } from '../../components/settings-modal';

const options = {
  context: {
    location: {
      pathname: ''
    },
    router: {
      push: jest.fn(),
      replace: jest.fn()
    }
  }
};

function setup(props) {
  const wrapper = shallow(<SettingsModal {...props} />, options);

  return {
    context: options.context,
    props: props,
    wrapper: wrapper,
  };
};

describe('components/settings-modal.js', () => {
  const props = {
    isOpen: true,
    updateSetting: jest.fn(),
    fetchNotifications: jest.fn(),
    logout: jest.fn(),
    toggleSettingsModal: jest.fn(),
    settings: Map({
      participating: false,
      playSound: true,
      showNotifications: true,
      markOnClick: false,
      openAtStartup: false,
      showSettingsModal: false,
      hasStarred: false,
      showAppIcon: 'both',
    })
  };

  beforeEach(function() {
    ipcRenderer.send.mockReset();
    props.updateSetting.mockReset();
  });

    };

    const { wrapper } = setup(props);
    expect(wrapper).toBeDefined();
    expect(wrapper.find(Checkbox).length).toBe(5);
    expect(wrapper.find(RadioGroup).length).toBe(1);
    expect(wrapper.find(Radio).length).toBe(3);
    expect(wrapper.find('.octicon-sign-out').length).toBe(1);
  });

  it('should update a setting', function () {

    expect(wrapper).toBeDefined();



    wrapper.setProps({
      ...props,
    });
    expect(props.fetchNotifications).toHaveBeenCalledTimes(1);

  });


    const { wrapper, context } = setup(props);

    expect(wrapper).toBeDefined();

    wrapper.find('.octicon-sign-out').parent().simulate('click');

    expect(props.logout).toHaveBeenCalledTimes(1);

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon');

    expect(context.router.replace).toHaveBeenCalledTimes(1);
    expect(context.router.replace).toHaveBeenCalledWith('/login');

    expect(props.toggleSettingsModal).toHaveBeenCalledTimes(1);
  });

});
