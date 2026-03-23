import { act } from '@testing-library/react';

import { renderWithProviders } from '../__helpers__/test-utils';
import { mockSettings } from '../__mocks__/state-mocks';

import { useFiltersStore } from '../stores';
import { AllRead } from './AllRead';

describe('renderer/components/AllRead.tsx', () => {
  it('should render itself & its children - no filters', async () => {
    let tree: ReturnType<typeof renderWithProviders> | null = null;

    await act(async () => {
      tree = renderWithProviders(<AllRead />, {
        settings: {
          ...mockSettings,
        },
      });
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - with filters', async () => {
    let tree: ReturnType<typeof renderWithProviders> | null = null;

    await act(async () => {
      tree = renderWithProviders(<AllRead />, {
        settings: {
          ...mockSettings,
        },
        filters: {
          reasons: ['author'],
        },
      });
    });

    expect(tree.container).toMatchSnapshot();
  });
});
