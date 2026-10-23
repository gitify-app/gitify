import { act } from '@testing-library/react';

import { renderWithProviders } from '../__helpers__/test-utils';

import { Loading } from './Loading';

describe('renderer/components/Loading.tsx', () => {
  it('should render itself & its children', async () => {
    let tree: ReturnType<typeof renderWithProviders> | null = null;

    await act(async () => {
      tree = renderWithProviders(<Loading />);
    });

    expect(tree!.getByText('Loading')).toBeInTheDocument();
    expect(tree!.container.querySelector('img')).toHaveAttribute('alt', '⏳');
    expect(tree!.container).toMatchSnapshot();
  });

  it('should keep the same emoji when re-rendering', async () => {
    let tree: ReturnType<typeof renderWithProviders> | null = null;

    await act(async () => {
      tree = renderWithProviders(<Loading />);
    });

    const emojiSrc = tree!.container.querySelector('img')?.getAttribute('src');
    expect(emojiSrc).toBeTruthy();

    await act(async () => {
      tree!.rerender(<Loading />);
    });

    expect(tree!.container.querySelector('img')).toHaveAttribute('src', emojiSrc!);
  });
});
