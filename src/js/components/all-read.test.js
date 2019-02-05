import React from 'react'; // eslint-disable-line no-unused-vars
import { mount } from 'enzyme';

import AllRead from './all-read';

describe('components/all-read.js', function() {
  it('should render itself & its children', function() {
    spyOn(AllRead.prototype, 'componentDidMount').and.callThrough();

    const wrapper = mount(<AllRead />);

    expect(wrapper).toBeDefined();
    expect(AllRead.prototype.componentDidMount).toHaveBeenCalledTimes(1);
    expect(wrapper.find('h4').text()).toBe('No new notifications.');
  });
});
