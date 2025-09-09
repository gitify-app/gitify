import { render } from '@testing-library/react';

import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import type { SettingsState } from '../../types';
import { SearchFilterSuggestions } from './SearchFilterSuggestions';

describe('renderer/components/filters/SearchFilterSuggestions.tsx', () => {
  const mockOnClose = jest.fn();

  it('should render itself & its children - closed', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          settings: {
            ...mockSettings,
            detailedNotifications: false,
          } as SettingsState,
        }}
      >
        <SearchFilterSuggestions
          inputValue={''}
          onClose={mockOnClose}
          open={false}
        />
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - open', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          settings: {
            ...mockSettings,
            detailedNotifications: true,
          } as SettingsState,
        }}
      >
        <SearchFilterSuggestions
          inputValue={''}
          onClose={mockOnClose}
          open={true}
        />
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - open with detailed enabled', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          settings: {
            ...mockSettings,
            detailedNotifications: true,
          } as SettingsState,
        }}
      >
        <SearchFilterSuggestions
          inputValue={''}
          onClose={mockOnClose}
          open={true}
        />
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - input token invalid', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          settings: {
            ...mockSettings,
            detailedNotifications: false,
          } as SettingsState,
        }}
      >
        <SearchFilterSuggestions
          inputValue={'invalid'}
          onClose={mockOnClose}
          open={true}
        />
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - input token valid', () => {
    const tree = render(
      <AppContext.Provider
        value={{
          settings: {
            ...mockSettings,
            detailedNotifications: false,
          } as SettingsState,
        }}
      >
        <SearchFilterSuggestions
          inputValue={'repo:'}
          onClose={mockOnClose}
          open={true}
        />
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });
});
