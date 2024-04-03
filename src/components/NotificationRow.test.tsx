import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { act, fireEvent, render } from '@testing-library/react';

import * as helpers from '../utils/helpers';

import { AppContext } from '../context/App';
import { mockedSingleNotification } from '../__mocks__/mockedData';
import { NotificationRow } from './NotificationRow';
import { mockAccounts, mockSettings } from '../__mocks__/mock-state';
import { shell } from 'electron';

describe('components/NotificationRow.tsx', () => {
  beforeEach(() => {
    jest.spyOn(helpers, 'openInBrowser');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children with avatar', async () => {
    (global as any).Date.now = jest.fn(() => new Date('2024'));

    const props = {
      notification: mockedSingleNotification,
      hostname: 'github.com',
    };

    const tree = TestRenderer.create(<NotificationRow {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children without avatar', async () => {
    (global as any).Date.now = jest.fn(() => new Date('2024'));

    const mockNotification = mockedSingleNotification;
    mockNotification.subject.user = null;

    const props = {
      notification: mockNotification,
      hostname: 'github.com',
    };

    const tree = TestRenderer.create(<NotificationRow {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should open a notification in the browser', () => {
    const removeNotificationFromState = jest.fn();

    const props = {
      notification: mockedSingleNotification,
      hostname: 'github.com',
    };

    const { getByRole } = render(
      <AppContext.Provider
        value={{
          settings: { ...mockSettings, markAsDoneOnOpen: false },
          removeNotificationFromState,
          accounts: mockAccounts,
        }}
      >
        <NotificationRow {...props} />
      </AppContext.Provider>,
    );

    fireEvent.click(getByRole('main'));
    expect(helpers.openInBrowser).toHaveBeenCalledTimes(1);
    expect(removeNotificationFromState).toHaveBeenCalledTimes(1);
  });

  it('should open a notification in browser & mark it as done', () => {
    const markNotificationDone = jest.fn();

    const props = {
      notification: mockedSingleNotification,
      hostname: 'github.com',
    };

    const { getByRole } = render(
      <AppContext.Provider
        value={{
          settings: { ...mockSettings, markAsDoneOnOpen: true },
          markNotificationDone,
          accounts: mockAccounts,
        }}
      >
        <NotificationRow {...props} />
      </AppContext.Provider>,
    );

    fireEvent.click(getByRole('main'));
    expect(helpers.openInBrowser).toHaveBeenCalledTimes(1);
    expect(markNotificationDone).toHaveBeenCalledTimes(1);
  });

  it('should mark a notification as read', () => {
    const markNotification = jest.fn();

    const props = {
      notification: mockedSingleNotification,
      hostname: 'github.com',
    };

    const { getByTitle } = render(
      <AppContext.Provider
        value={{
          settings: { ...mockSettings, markAsDoneOnOpen: false },
          accounts: mockAccounts,
        }}
      >
        <AppContext.Provider value={{ markNotification }}>
          <NotificationRow {...props} />
        </AppContext.Provider>
      </AppContext.Provider>,
    );

    fireEvent.click(getByTitle('Mark as Read'));
    expect(markNotification).toHaveBeenCalledTimes(1);
  });

  it('should mark a notification as done', () => {
    const markNotificationDone = jest.fn();

    const props = {
      notification: mockedSingleNotification,
      hostname: 'github.com',
    };

    const { getByTitle } = render(
      <AppContext.Provider
        value={{
          settings: { ...mockSettings },
          accounts: mockAccounts,
        }}
      >
        <AppContext.Provider value={{ markNotificationDone }}>
          <NotificationRow {...props} />
        </AppContext.Provider>
      </AppContext.Provider>,
    );

    fireEvent.click(getByTitle('Mark as Done'));
    expect(markNotificationDone).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe from a notification thread', () => {
    const unsubscribeNotification = jest.fn();

    const props = {
      notification: mockedSingleNotification,
      hostname: 'github.com',
    };

    const { getByTitle } = render(
      <AppContext.Provider value={{}}>
        <AppContext.Provider value={{ unsubscribeNotification }}>
          <NotificationRow {...props} />
        </AppContext.Provider>
      </AppContext.Provider>,
    );
    fireEvent.click(getByTitle('Unsubscribe'));
    expect(unsubscribeNotification).toHaveBeenCalledTimes(1);
  });

  it('should open notification user profile', async () => {
    const props = {
      notification: {
        ...mockedSingleNotification,
        subject: {
          ...mockedSingleNotification.subject,
          user: {
            login: 'some-user',
            html_url: 'https://github.com/some-user',
            avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4',
            type: 'User',
          },
        },
      },
      hostname: 'github.com',
    };

    let getByLabelText;

    await act(async () => {
      const { getByLabelText: getByLabelTextLocal } = render(
        <AppContext.Provider
          value={{
            settings: { ...mockSettings },
            accounts: mockAccounts,
          }}
        >
          <NotificationRow {...props} />
        </AppContext.Provider>,
      );
      getByLabelText = getByLabelTextLocal;
    });

    fireEvent.click(getByLabelText('View User Profile'));
    expect(shell.openExternal).toHaveBeenCalledTimes(1);
  });
});
