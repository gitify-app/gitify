import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockSettings } from '../__mocks__/state-mocks';
import { ensureStableEmojis } from '../__mocks__/utils';
import { AppContext } from '../context/App';
import { AllRead } from './AllRead';

describe('renderer/components/AllRead.tsx', () => {
  beforeEach(() => {
    ensureStableEmojis();
  });

  it('should render itself & its children - no filters', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          settings: {
            ...mockSettings,
          },
        }}
      >
        <MemoryRouter>
          <AllRead />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - with filters', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          settings: {
            ...mockSettings,
            filterReasons: ['author'],
          },
        }}
      >
        <MemoryRouter>
          <AllRead />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });
});
