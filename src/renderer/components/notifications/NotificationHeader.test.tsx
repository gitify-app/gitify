import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockGitifyNotification } from '../../__mocks__/notifications-mocks';

import { GroupBy, useSettingsStore } from '../../stores';

import * as comms from '../../utils/comms';
import {
  NotificationHeader,
  type NotificationHeaderProps,
} from './NotificationHeader';

describe('renderer/components/notifications/NotificationHeader.tsx', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render itself & its children - group by repositories', async () => {
    useSettingsStore.setState({ groupBy: GroupBy.REPOSITORY });

    const props: NotificationHeaderProps = {
      notification: mockGitifyNotification,
    };

    const tree = renderWithAppContext(<NotificationHeader {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  describe('should render itself & its children - group by date', () => {
    it('with notification number', async () => {
      useSettingsStore.setState({ groupBy: GroupBy.DATE });

      const props: NotificationHeaderProps = {
        notification: mockGitifyNotification,
      };

      const tree = renderWithAppContext(<NotificationHeader {...props} />);

      expect(tree.container).toMatchSnapshot();
    });

    it('with showNumber setting disabled', async () => {
      useSettingsStore.setState({ groupBy: GroupBy.DATE, showNumber: false });

      const props: NotificationHeaderProps = {
        notification: mockGitifyNotification,
      };

      const tree = renderWithAppContext(<NotificationHeader {...props} />);

      expect(tree.container).toMatchSnapshot();
    });

    it('without notification number', async () => {
      useSettingsStore.setState({
        groupBy: GroupBy.DATE,
      });

      const props: NotificationHeaderProps = {
        notification: {
          ...mockGitifyNotification,
          subject: { ...mockGitifyNotification.subject, number: null },
        },
      };

      const tree = renderWithAppContext(<NotificationHeader {...props} />);

      expect(tree.container).toMatchSnapshot();
    });
  });

  it('should open notification user profile - group by date', async () => {
    useSettingsStore.setState({
      groupBy: GroupBy.DATE,
    });

    const openExternalLinkSpy = vi
      .spyOn(comms, 'openExternalLink')
      .mockImplementation(vi.fn());

    const props: NotificationHeaderProps = {
      notification: mockGitifyNotification,
    };

    renderWithAppContext(<NotificationHeader {...props} />);

    await userEvent.click(screen.getByTestId('view-repository'));

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      props.notification.repository.htmlUrl,
    );
  });
});
