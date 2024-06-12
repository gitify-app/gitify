import { MarkGithubIcon } from '@primer/octicons-react';
import { render } from '@testing-library/react';
import { IconColor } from '../../types';
import { type IPillButton, PillButton } from './PillButton';

describe('components/buttons/PillButton.tsx', () => {
  it('should render', () => {
    const props: IPillButton = {
      title: 'Mock Pill',
      metric: 1,
      icon: MarkGithubIcon,
      color: IconColor.GREEN,
    };
    const tree = render(<PillButton {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
