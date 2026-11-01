import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PersonIcon } from '@primer/octicons-react';

import { navigateMock, renderWithProviders } from '../__helpers__/test-utils';

import type { GitifyError } from '../types';

import { Oops } from './Oops';

describe('renderer/components/Oops.tsx', () => {
  it('renders itself & its children - specified error', async () => {
    const mockError = {
      title: 'Error title',
      descriptions: ['Error description'],
      emojis: ['🔥'],
    };

    let tree: ReturnType<typeof renderWithProviders> | null = null;

    await act(async () => {
      tree = renderWithProviders(<Oops error={mockError} />);
    });

    expect(tree!.container).toMatchSnapshot();
  });

  it('renders itself & its children - fallback to unknown error', async () => {
    let tree: ReturnType<typeof renderWithProviders> | null = null;

    await act(async () => {
      tree = renderWithProviders(<Oops error={null as unknown as GitifyError} />);
    });

    expect(tree!.container).toMatchSnapshot();
  });

  it('renders action buttons and navigate on click', async () => {
    const mockError = {
      title: 'Error title',
      descriptions: ['Error description'],
      emojis: ['🔥'],
      actions: [
        {
          label: 'Go somewhere',
          route: '/somewhere',
          variant: 'danger' as const,
          icon: PersonIcon,
        },
      ],
    };

    renderWithProviders(<Oops error={mockError} />);

    await userEvent.click(screen.getByText('Go somewhere'));

    expect(navigateMock).toHaveBeenCalledWith('/somewhere');
  });

  it('renders extra actions alongside the error actions', () => {
    const mockError = {
      title: 'Error title',
      descriptions: ['Error description'],
      emojis: ['🔥'],
      actions: [
        {
          label: 'Go somewhere',
          route: '/somewhere',
          variant: 'danger' as const,
          icon: PersonIcon,
        },
      ],
    };

    renderWithProviders(
      <Oops error={mockError} extraActions={<button type="button">Reload</button>} />,
    );

    expect(screen.getByText('Go somewhere')).toBeInTheDocument();
    expect(screen.getByText('Reload')).toBeInTheDocument();
  });
});
