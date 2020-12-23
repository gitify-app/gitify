import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { fireEvent, render } from '@testing-library/react';

const { shell } = require('electron');

import { AppContext } from '../context/App';
import { mockedSingleNotification } from '../__mocks__/mockedData';
import { NotificationItem } from './Notification';
import { mockSettings } from '../__mocks__/mock-state';

describe('components/Notification.js', () => {
  beforeEach(() => {
    spyOn(shell, 'openExternal');
  });

  it('should render itself & its children', async () => {
    (global as any).Date.now = jest.fn(() => new Date('2014'));

    const props = {
      notification: mockedSingleNotification,
      hostname: 'github.com',
    };

    const tree = TestRenderer.create(<NotificationItem {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should open a notification in the browser', () => {
    const markNotification = jest.fn();

    const props = {
      notification: mockedSingleNotification,
      hostname: 'github.com',
    };

    const { getByRole } = render(
      <AppContext.Provider
        value={{
          settings: { ...mockSettings, markOnClick: true },
          markNotification,
        }}
      >
        <NotificationItem {...props} />
      </AppContext.Provider>
    );

    fireEvent.click(getByRole('main'));
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
  });

  it('should open a notification in browser & mark it as read', () => {
    const markNotification = jest.fn();

    const props = {
      notification: mockedSingleNotification,
      hostname: 'github.com',
    };

    const { getByRole } = render(
      <AppContext.Provider
        value={{
          settings: { ...mockSettings, markOnClick: true },
          markNotification,
        }}
      >
        <NotificationItem {...props} />
      </AppContext.Provider>
    );

    fireEvent.click(getByRole('main'));
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
    expect(markNotification).toHaveBeenCalledTimes(1);
  });

  it('should mark a notification as read', () => {
    const markNotification = jest.fn();

    const props = {
      notification: mockedSingleNotification,
      hostname: 'github.com',
    };

    const { getByTitle } = render(
      <AppContext.Provider
        value={{ settings: { ...mockSettings, markOnClick: false } }}
      >
        <AppContext.Provider value={{ markNotification }}>
          <NotificationItem {...props} />
        </AppContext.Provider>
      </AppContext.Provider>
    );

    fireEvent.click(getByTitle('Mark as Read'));
    expect(markNotification).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe from a notification thread', () => {
    const unsubscribeNotification = jest.fn();

    const props = {
      notification: mockedSingleNotification,
      hostname: 'github.com',
    };

    const { getByLabelText } = render(
      <AppContext.Provider value={{}}>
        <AppContext.Provider value={{ unsubscribeNotification }}>
          <NotificationItem {...props} />
        </AppContext.Provider>
      </AppContext.Provider>
    );
    fireEvent.click(getByLabelText('Unsubscribe'));
    expect(unsubscribeNotification).toHaveBeenCalledTimes(1);
  });
});
