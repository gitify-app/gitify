import { MarkGithubIcon } from '@primer/octicons-react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Size } from '../../types';
import { type ISidebarButton, SidebarButton } from './SidebarButton';

describe('components/buttons/SidebarButton.tsx', () => {
  it('should render with metric', () => {
    const props: ISidebarButton = {
      title: 'Mock Sidebar Button',
      metric: 1,
      icon: MarkGithubIcon,
    };
    const tree = render(
      <MemoryRouter>
        <SidebarButton {...props} />
      </MemoryRouter>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render without metric', () => {
    const props: ISidebarButton = {
      title: 'Mock Sidebar Button',
      metric: 0,
      icon: MarkGithubIcon,
    };
    const tree = render(
      <MemoryRouter>
        <SidebarButton {...props} />
      </MemoryRouter>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should render - with specific size', () => {
    const props: ISidebarButton = {
      title: 'Mock Sidebar Button',
      metric: 0,
      icon: MarkGithubIcon,
      size: Size.MEDIUM,
    };
    const tree = render(
      <MemoryRouter>
        <SidebarButton {...props} />
      </MemoryRouter>,
    );
    expect(tree).toMatchSnapshot();
  });
});
