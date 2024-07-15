import { fireEvent, render, screen } from '@testing-library/react';
import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import { GroupBy } from '../../types';
import { mockSingleNotification } from '../../utils/api/__mocks__/response-mocks';
import * as comms from '../../utils/comms';
import { NotificationHeader } from './NotificationHeader';

describe('components/notification/NotificationHeader.tsx', () => {
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

  it('should render itself & its children - group by date', async () => {
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

  it('should open notification user profile - group by date', () => {
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

    fireEvent.click(screen.getByTitle(props.notification.repository.full_name));
    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      props.notification.repository.html_url,
    );
  });
});
