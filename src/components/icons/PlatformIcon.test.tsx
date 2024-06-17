import { render } from '@testing-library/react';
import { type IPlatformIcon, PlatformIcon } from './PlatformIcon';

describe('components/icons/PlatformIcon.tsx', () => {
  it('should render GitHub Cloud icon', () => {
    const props: IPlatformIcon = {
      type: 'GitHub Cloud',
      size: 16,
    };
    const tree = render(<PlatformIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render GitHub Enterprise Service icon', () => {
    const props: IPlatformIcon = {
      type: 'GitHub Enterprise Server',
      size: 16,
    };
    const tree = render(<PlatformIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
