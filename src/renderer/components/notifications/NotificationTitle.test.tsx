import { renderWithAppContext } from '../../__helpers__/test-utils';

import { NotificationTitle } from './NotificationTitle';

describe('renderer/components/notifications/NotificationTitle.tsx', () => {
  it('should render plain text without code blocks', () => {
    const tree = renderWithAppContext(
      <NotificationTitle title="Simple notification title" />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render text with single inline code block', () => {
    const tree = renderWithAppContext(
      <NotificationTitle title="refactor: migrate deprecated atlaskit `xcss`" />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render text with multiple inline code blocks', () => {
    const tree = renderWithAppContext(
      <NotificationTitle title="Replace `foo` with `bar` in config" />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render text with code block at the start', () => {
    const tree = renderWithAppContext(
      <NotificationTitle title="`useState` hook implementation" />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render text with code block at the end', () => {
    const tree = renderWithAppContext(
      <NotificationTitle title="Fix issue with `render`" />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should apply custom className', () => {
    const tree = renderWithAppContext(
      <NotificationTitle
        className="truncate"
        title="refactor: migrate deprecated atlaskit `xcss`"
      />,
    );

    expect(tree).toMatchSnapshot();
  });
});
