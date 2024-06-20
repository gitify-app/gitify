import { MarkGithubIcon } from '@primer/octicons-react';
import { render } from '@testing-library/react';
import {
  type IInteractionButton,
  InteractionButton,
} from './InteractionButton';

describe('components/buttons/InteractionButton.tsx', () => {
  it('should render - small', () => {
    const props: IInteractionButton = {
      title: 'Mock Interaction Button',
      icon: MarkGithubIcon,
      size: 'small',
      onClick: () => () => {},
    };
    const tree = render(<InteractionButton {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render - medium', () => {
    const props: IInteractionButton = {
      title: 'Mock Interaction Button',
      icon: MarkGithubIcon,
      size: 'medium',
      onClick: () => () => {},
    };
    const tree = render(<InteractionButton {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
