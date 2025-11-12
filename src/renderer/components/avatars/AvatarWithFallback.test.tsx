import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, it } from 'vitest';

import { type Link, Size } from '../../types';
import {
  AvatarWithFallback,
  type IAvatarWithFallback,
} from './AvatarWithFallback';

describe('renderer/components/avatars/AvatarWithFallback.tsx', () => {
  const props: IAvatarWithFallback = {
    src: 'https://avatars.githubusercontent.com/u/133795385?s=200&v=4' as Link,
    alt: 'gitify-app',
    name: '@gitify-app',
    size: Size.MEDIUM,
    userType: 'User',
  };

  it('should render avatar - human user', () => {
    const tree = render(<AvatarWithFallback {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render avatar - non-human user', () => {
    const tree = render(
      <AvatarWithFallback {...props} userType={'Organization'} />,
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders the fallback icon when no src url - human user', () => {
    const tree = render(<AvatarWithFallback {...props} src={null} />);

    expect(tree).toMatchSnapshot();
  });

  it('renders the fallback icon when no src url - non human user', () => {
    const tree = render(
      <AvatarWithFallback {...props} src={null} userType="Bot" />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('renders the fallback icon when the image fails to load (isBroken = true) - human user', () => {
    render(<AvatarWithFallback {...props} />);

    // Find the avatar element by its alt text
    const avatar = screen.getByAltText('gitify-app') as HTMLImageElement;

    // Simulate image load error (wrapped in act via fireEvent)
    fireEvent.error(avatar);

    expect(screen.getByTestId('avatar')).toMatchSnapshot();
  });

  it('renders the fallback icon when the image fails to load (isBroken = true) - non human user', () => {
    render(<AvatarWithFallback {...props} userType={'Bot'} />);

    // Find the avatar element by its alt text
    const avatar = screen.getByAltText('gitify-app') as HTMLImageElement;

    // Simulate image load error (wrapped in act via fireEvent)
    fireEvent.error(avatar);

    expect(screen.getByTestId('avatar')).toMatchSnapshot();
  });
});
