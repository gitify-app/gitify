import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MarkGithubIcon } from '@primer/octicons-react';

import { renderWithAppContext } from '../../__helpers__/test-utils';

import { Header } from './Header';

const navigateMock = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

describe('renderer/components/primitives/Header.tsx', () => {
  const fetchNotificationsMock = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render itself & its children', () => {
    const tree = renderWithAppContext(
      <Header icon={MarkGithubIcon}>Test Header</Header>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should navigate back', async () => {
    renderWithAppContext(<Header icon={MarkGithubIcon}>Test Header</Header>);

    await userEvent.click(screen.getByTestId('header-nav-back'));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('should navigate back and fetch notifications', async () => {
    renderWithAppContext(
      <Header fetchOnBack icon={MarkGithubIcon}>
        Test Header
      </Header>,
      { fetchNotifications: fetchNotificationsMock },
    );

    await userEvent.click(screen.getByTestId('header-nav-back'));

    expect(fetchNotificationsMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
