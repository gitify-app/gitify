import { renderWithAppContext } from '../../__helpers__/test-utils';

import { NotificationTitle } from './NotificationTitle';

describe('renderer/components/notifications/NotificationTitle.tsx', () => {
  it('should render plain text without code blocks', () => {
    const tree = renderWithAppContext(
      <NotificationTitle title="Simple notification title" wrapTitle={false} />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render text with single inline code block', () => {
    const tree = renderWithAppContext(
      <NotificationTitle
        title="refactor: migrate deprecated atlaskit `xcss`"
        wrapTitle={false}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render text with multiple inline code blocks', () => {
    const tree = renderWithAppContext(
      <NotificationTitle
        title="Replace `foo` with `bar` in config"
        wrapTitle={false}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render text with code block at the start', () => {
    const tree = renderWithAppContext(
      <NotificationTitle
        title="`useState` hook implementation"
        wrapTitle={false}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render text with code block at the end', () => {
    const tree = renderWithAppContext(
      <NotificationTitle title="Fix issue with `render`" wrapTitle={false} />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should apply truncate className when wrapTitle is false', () => {
    const tree = renderWithAppContext(
      <NotificationTitle
        title="refactor: migrate deprecated atlaskit `xcss`"
        wrapTitle={false}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should not apply truncate className when wrapTitle is true', () => {
    const tree = renderWithAppContext(
      <NotificationTitle
        title="refactor: migrate deprecated atlaskit `xcss`"
        wrapTitle={true}
      />,
    );

    expect(tree).toMatchSnapshot();
  });
});
