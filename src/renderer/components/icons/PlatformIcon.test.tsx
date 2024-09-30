import { render } from '@testing-library/react';
import { Size } from '../../types';
import { type IPlatformIcon, PlatformIcon } from './PlatformIcon';

describe('renderer/components/icons/PlatformIcon.tsx', () => {
  it('should render GitHub Cloud icon', () => {
    const props: IPlatformIcon = {
      type: 'GitHub Cloud',
      size: Size.MEDIUM,
    };
    const tree = render(<PlatformIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render GitHub Enterprise Service icon', () => {
    const props: IPlatformIcon = {
      type: 'GitHub Enterprise Server',
      size: Size.MEDIUM,
    };
    const tree = render(<PlatformIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
