import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';
import { GroupBy } from '../../types';
import * as comms from '../../utils/comms';
import { NotificationHeader } from './NotificationHeader';

describe('renderer/components/notifications/NotificationHeader.tsx', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render itself & its children - group by repositories', async () => {
    const props = {
      notification: mockGitifyNotification,
    };

    const tree = renderWithAppContext(<NotificationHeader {...props} />, {
      settings: { ...mockSettings, groupBy: GroupBy.REPOSITORY },
    });

    expect(tree).toMatchSnapshot();
  });

  describe('should render itself & its children - group by date', () => {
    it('with notification number', async () => {
      const props = {
        notification: mockGitifyNotification,
      };

      const tree = renderWithAppContext(<NotificationHeader {...props} />, {
        settings: { ...mockSettings, groupBy: GroupBy.DATE },
      });

      expect(tree).toMatchSnapshot();
    });

    it('with showNumber setting disabled', async () => {
      const props = {
        notification: mockGitifyNotification,
      };

      const tree = renderWithAppContext(<NotificationHeader {...props} />, {
        settings: {
          ...mockSettings,
          showNumber: false,
          groupBy: GroupBy.DATE,
        },
      });

      expect(tree).toMatchSnapshot();
    });

    it('without notification number', async () => {
      const props = {
        notification: {
          ...mockGitifyNotification,
          subject: { ...mockGitifyNotification.subject, number: null },
        },
      };

      const tree = renderWithAppContext(<NotificationHeader {...props} />, {
        settings: { ...mockSettings, groupBy: GroupBy.DATE },
      });

      expect(tree).toMatchSnapshot();
    });
  });

  it('should open notification user profile - group by date', async () => {
    const openExternalLinkSpy = vi
      .spyOn(comms, 'openExternalLink')
      .mockImplementation(() => {});

    const props = {
      notification: mockGitifyNotification,
    };

    renderWithAppContext(<NotificationHeader {...props} />, {
      settings: { ...mockSettings, groupBy: GroupBy.DATE },
    });

    await userEvent.click(screen.getByTestId('view-repository'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      props.notification.repository.htmlUrl,
    );
  });
});
