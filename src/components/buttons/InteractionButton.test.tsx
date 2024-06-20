import { MarkGithubIcon } from '@primer/octicons-react';
import { render } from '@testing-library/react';
import { Size } from '../../types';
import {
  type IInteractionButton,
  InteractionButton,
} from './InteractionButton';

describe('components/buttons/InteractionButton.tsx', () => {
  it('should render', () => {
    const props: IInteractionButton = {
      title: 'Mock Interaction Button',
      icon: MarkGithubIcon,
      size: Size.SMALL,
      onClick: () => () => {},
    };
    const tree = render(<InteractionButton {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
