import { MarkGithubIcon } from '@primer/octicons-react';
import { render } from '@testing-library/react';
import { Size } from '../../types';
import { AvatarIcon, type IAvatarIcon } from './AvatarIcon';

describe('components/icons/AvatarIcon.tsx', () => {
  it('should render extra small avatar', () => {
    const props: IAvatarIcon = {
      defaultIcon: MarkGithubIcon,
      title: 'test',
      url: 'https://avatars.githubusercontent.com/u/583231?v=4',
      size: Size.XSMALL,
    };
    const tree = render(<AvatarIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render small avatar', () => {
    const props: IAvatarIcon = {
      defaultIcon: MarkGithubIcon,
      title: 'test',
      url: 'https://avatars.githubusercontent.com/u/583231?v=4',
      size: Size.SMALL,
    };
    const tree = render(<AvatarIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render medium avatar', () => {
    const props: IAvatarIcon = {
      defaultIcon: MarkGithubIcon,
      title: 'test',
      url: 'https://avatars.githubusercontent.com/u/583231?v=4',
      size: Size.MEDIUM,
    };
    const tree = render(<AvatarIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render default extra small icon when no url', () => {
    const props: IAvatarIcon = {
      defaultIcon: MarkGithubIcon,
      title: 'test',
      url: null,
      size: Size.XSMALL,
    };
    const tree = render(<AvatarIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render default small icon when no url', () => {
    const props: IAvatarIcon = {
      defaultIcon: MarkGithubIcon,
      title: 'test',
      url: null,
      size: Size.SMALL,
    };
    const tree = render(<AvatarIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render default medium icon when no url', () => {
    const props: IAvatarIcon = {
      defaultIcon: MarkGithubIcon,
      title: 'test',
      url: null,
      size: Size.MEDIUM,
    };
    const tree = render(<AvatarIcon {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
