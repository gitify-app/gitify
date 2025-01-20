import { MarkGithubIcon } from '@primer/octicons-react';
import { render } from '@testing-library/react';
import { IconColor } from '../../types';
import { type IPillButton, PillButton } from './PillButton';

describe('renderer/components/buttons/PillButton.tsx', () => {
  it('should render with metric', () => {
    const props: IPillButton = {
      title: 'Mock Pill',
      metric: 1,
      icon: MarkGithubIcon,
      color: IconColor.GREEN,
    };
    const tree = render(<PillButton {...props} />);
    expect(tree).toMatchSnapshot();
  });

  it('should render without metric', () => {
    const props: IPillButton = {
      title: 'Mock Pill',
      icon: MarkGithubIcon,
      color: IconColor.GREEN,
    };
    const tree = render(<PillButton {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
