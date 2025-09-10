import { render } from '@testing-library/react';

import { mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import type { SettingsState } from '../../types';
import { SearchFilterSuggestions } from './SearchFilterSuggestions';

describe('renderer/components/filters/SearchFilterSuggestions.tsx', () => {
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
        <SearchFilterSuggestions inputValue={''} open={false} />
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
        <SearchFilterSuggestions inputValue={''} open={true} />
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
        <SearchFilterSuggestions inputValue={''} open={true} />
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
        <SearchFilterSuggestions inputValue={'invalid'} open={true} />
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
        <SearchFilterSuggestions inputValue={'repo:'} open={true} />
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });
});
