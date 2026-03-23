import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockSettings } from '../../__mocks__/state-mocks';

import { SearchFilterSuggestions } from './SearchFilterSuggestions';

describe('renderer/components/filters/SearchFilterSuggestions.tsx', () => {
  it('should render itself & its children - closed', () => {
    const tree = renderWithProviders(
      <SearchFilterSuggestions inputValue={''} open={false} />,
    );

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - open without detailed notifications enabled', () => {
    const tree = renderWithProviders(
      <SearchFilterSuggestions inputValue={''} open={true} />,
      {
        settings: {
          ...mockSettings,
          detailedNotifications: false,
        },
      },
    );

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - open with detailed notifications enabled', () => {
    const tree = renderWithProviders(
      <SearchFilterSuggestions inputValue={''} open={true} />,
      {
        settings: {
          ...mockSettings,
          detailedNotifications: true,
        },
      },
    );

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - input token invalid', () => {
    const tree = renderWithProviders(
      <SearchFilterSuggestions inputValue={'invalid'} open={true} />,
      {
        settings: {
          ...mockSettings,
          detailedNotifications: false,
        },
      },
    );

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - input token valid', () => {
    const tree = renderWithProviders(
      <SearchFilterSuggestions inputValue={'repo:'} open={true} />,
      {
        settings: {
          ...mockSettings,
          detailedNotifications: false,
        },
      },
    );

    expect(tree.container).toMatchSnapshot();
  });
});
