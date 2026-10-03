import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockSettings } from '../../__mocks__/state-mocks';

import { NotificationTitle } from './NotificationTitle';

describe('renderer/components/notifications/NotificationTitle.tsx', () => {
  it.each([
    ['should render plain text without code blocks', 'Simple notification title'],
    [
      'should render text with single inline code block',
      'refactor: migrate deprecated atlaskit `xcss`',
    ],
    ['should render text with multiple inline code blocks', 'Replace `foo` with `bar` in config'],
    ['should render text with code block at the start', '`useState` hook implementation'],
    ['should render text with code block at the end', 'Fix issue with `render`'],
  ])('%s', (_name, title) => {
    const tree = renderWithProviders(<NotificationTitle title={title} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('should apply truncate className when wrapNotificationTitle is false', () => {
    const tree = renderWithProviders(
      <NotificationTitle title="refactor: migrate deprecated atlaskit `xcss`" />,
      {
        settings: {
          ...mockSettings,
          wrapNotificationTitle: false,
        },
      },
    );

    expect(tree.container).toMatchSnapshot();
  });

  it('should not apply truncate className when wrapNotificationTitle is true', () => {
    const tree = renderWithProviders(
      <NotificationTitle title="refactor: migrate deprecated atlaskit `xcss`" />,
      {
        settings: {
          ...mockSettings,
          wrapNotificationTitle: true,
        },
      },
    );

    expect(tree.container).toMatchSnapshot();
  });
});
