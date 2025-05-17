import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { GroupBy } from '../../types';
import { mockSingleNotification } from '../../utils/api/__mocks__/response-mocks';
import * as comms from '../../utils/comms';
import { NotificationHeader } from './NotificationHeader';

describe('renderer/components/notifications/NotificationHeader.tsx', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children - group by repositories', async () => {
    const props = {
      notification: mockSingleNotification,
    };

    const tree = render(
      <AppContext.Provider
        value={{ settings: { ...mockSettings, groupBy: GroupBy.REPOSITORY } }}
      >
        <NotificationHeader {...props} />
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  describe('should render itself & its children - group by date', () => {
    it('with notification number', async () => {
      const props = {
        notification: mockSingleNotification,
      };

      const tree = render(
        <AppContext.Provider
          value={{ settings: { ...mockSettings, groupBy: GroupBy.DATE } }}
        >
          <NotificationHeader {...props} />
        </AppContext.Provider>,
      );

      expect(tree).toMatchSnapshot();
    });

    it('with showNumber setting disabled', async () => {
      const props = {
        notification: mockSingleNotification,
      };

      const tree = render(
        <AppContext.Provider
          value={{
            settings: {
              ...mockSettings,
              showNumber: false,
              groupBy: GroupBy.DATE,
            },
          }}
        >
          <NotificationHeader {...props} />
        </AppContext.Provider>,
      );

      expect(tree).toMatchSnapshot();
    });

    it('without notification number', async () => {
      const props = {
        notification: {
          ...mockSingleNotification,
          subject: { ...mockSingleNotification.subject, number: null },
        },
      };

      const tree = render(
        <AppContext.Provider
          value={{ settings: { ...mockSettings, groupBy: GroupBy.DATE } }}
        >
          <NotificationHeader {...props} />
        </AppContext.Provider>,
      );

      expect(tree).toMatchSnapshot();
    });
  });

  it('should open notification user profile - group by date', async () => {
    const openExternalLinkMock = jest
      .spyOn(comms, 'openExternalLink')
      .mockImplementation();

    const props = {
      notification: mockSingleNotification,
    };

    render(
      <AppContext.Provider
        value={{ settings: { ...mockSettings, groupBy: GroupBy.DATE } }}
      >
        <NotificationHeader {...props} />
      </AppContext.Provider>,
    );

    await userEvent.click(screen.getByTestId('view-repository'));

    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      props.notification.repository.html_url,
    );
  });
});
