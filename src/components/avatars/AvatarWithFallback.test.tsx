import { fireEvent, screen } from '@testing-library/react';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { type Link, Size } from '../../types';
import {
  AvatarWithFallback,
  type AvatarWithFallbackProps,
} from './AvatarWithFallback';

describe('renderer/components/avatars/AvatarWithFallback.tsx', () => {
  const props: AvatarWithFallbackProps = {
    src: 'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
    alt: 'gitify-app',
    name: '@gitify-app',
    size: Size.MEDIUM,
    userType: 'User',
  };

  it('should render avatar - human user', () => {
    const tree = renderWithAppContext(<AvatarWithFallback {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render avatar - non-human user', () => {
    const tree = renderWithAppContext(
      <AvatarWithFallback {...props} userType={'Organization'} />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders the fallback icon when no src url - human user', () => {
    const tree = renderWithAppContext(
      <AvatarWithFallback {...props} src={undefined} />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('renders the fallback icon when no src url - non human user', () => {
    const tree = renderWithAppContext(
      <AvatarWithFallback {...props} src={undefined} userType="Bot" />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('renders the fallback icon when the image fails to load (isBroken = true) - human user', () => {
    renderWithAppContext(<AvatarWithFallback {...props} />);

    // Find the avatar element by its alt text
    const avatar = screen.getByAltText('gitify-app');

    // Simulate image load error (wrapped in act via fireEvent)
    fireEvent.error(avatar);

    expect(screen.getByTestId('avatar')).toMatchSnapshot();
  });

  it('renders the fallback icon when the image fails to load (isBroken = true) - non human user', () => {
    renderWithAppContext(<AvatarWithFallback {...props} userType={'Bot'} />);

    // Find the avatar element by its alt text
    const avatar = screen.getByAltText('gitify-app');

    // Simulate image load error (wrapped in act via fireEvent)
    fireEvent.error(avatar);

    expect(screen.getByTestId('avatar')).toMatchSnapshot();
  });
});
