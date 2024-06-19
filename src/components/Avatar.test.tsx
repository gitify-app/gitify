import { MarkGithubIcon } from '@primer/octicons-react';
import { render } from '@testing-library/react';
import { Avatar, type IAvatar } from './Avatar';

describe('components/Avatar.tsx', () => {
  it('should render small avatar', () => {
    const props: IAvatar = {
      defaultIcon: MarkGithubIcon,
      title: 'test',
      url: 'https://avatars.githubusercontent.com/u/583231?v=4',
      size: 'small',
    };
    const tree = render(<Avatar {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render medium avatar', () => {
    const props: IAvatar = {
      defaultIcon: MarkGithubIcon,
      title: 'test',
      url: 'https://avatars.githubusercontent.com/u/583231?v=4',
      size: 'medium',
    };
    const tree = render(<Avatar {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render default icon when no url', () => {
    const props: IAvatar = {
      defaultIcon: MarkGithubIcon,
      title: 'test',
      url: null,
      size: 'small',
    };
    const tree = render(<Avatar {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
