import { act } from '@testing-library/react';

import {
  ensureStableEmojis,
  renderWithAppContext,
} from '../__helpers__/test-utils';
import { mockSettings } from '../__mocks__/state-mocks';

import { AllRead } from './AllRead';

describe('renderer/components/AllRead.tsx', () => {
  beforeEach(() => {
    ensureStableEmojis();
  });

  it('should render itself & its children - no filters', async () => {
    let tree: ReturnType<typeof renderWithAppContext> | null = null;

    await act(async () => {
      tree = renderWithAppContext(<AllRead />, {
        settings: {
          ...mockSettings,
          filterReasons: [],
          filterStates: [],
          filterSubjectTypes: [],
          filterUserTypes: [],
          filterIncludeSearchTokens: [],
          filterExcludeSearchTokens: [],
        },
      });
    });

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - with filters', async () => {
    let tree: ReturnType<typeof renderWithAppContext> | null = null;

    await act(async () => {
      tree = renderWithAppContext(<AllRead />, {
        settings: {
          ...mockSettings,
          filterReasons: ['author'],
        },
      });
    });

    expect(tree.container).toMatchSnapshot();
  });
});
