import { MarkGithubIcon } from '@primer/octicons-react';
import { render } from '@testing-library/react';
import { AvatarIcon, type IAvatar } from './AvatarIcon';

describe('components/icons/AvatarIcon.tsx', () => {
  it('should render small avatar', () => {
    const props: IAvatar = {
      defaultIcon: MarkGithubIcon,
      title: 'test',
      url: 'https://avatars.githubusercontent.com/u/583231?v=4',
      size: 'small',
    };
    const tree = render(<AvatarIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render medium avatar', () => {
    const props: IAvatar = {
      defaultIcon: MarkGithubIcon,
      title: 'test',
      url: 'https://avatars.githubusercontent.com/u/583231?v=4',
      size: 'medium',
    };
    const tree = render(<AvatarIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render default icon when no url', () => {
    const props: IAvatar = {
      defaultIcon: MarkGithubIcon,
      title: 'test',
      url: null,
      size: 'small',
    };
    const tree = render(<AvatarIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
