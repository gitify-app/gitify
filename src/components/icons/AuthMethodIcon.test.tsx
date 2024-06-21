import { render } from '@testing-library/react';
import { Size } from '../../types';
import { AuthMethodIcon, type IAuthMethodIcon } from './AuthMethodIcon';

describe('components/icons/AuthMethodIcon.tsx', () => {
  it('should render GitHub App icon', () => {
    const props: IAuthMethodIcon = {
      type: 'GitHub App',
      size: Size.MEDIUM,
    };
    const tree = render(<AuthMethodIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render Personal Access Token icon', () => {
    const props: IAuthMethodIcon = {
      type: 'Personal Access Token',
      size: Size.MEDIUM,
    };
    const tree = render(<AuthMethodIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render OAuth App icon', () => {
    const props: IAuthMethodIcon = {
      type: 'OAuth App',
      size: Size.MEDIUM,
    };
    const tree = render(<AuthMethodIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
