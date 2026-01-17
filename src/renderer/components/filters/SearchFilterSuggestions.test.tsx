import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockSettings } from '../../__mocks__/state-mocks';

import { SearchFilterSuggestions } from './SearchFilterSuggestions';

describe('renderer/components/filters/SearchFilterSuggestions.tsx', () => {
  it('should render itself & its children - closed', () => {
    const tree = renderWithAppContext(
      <SearchFilterSuggestions inputValue={''} open={false} />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - open without detailed notifications enabled', () => {
    const tree = renderWithAppContext(
      <SearchFilterSuggestions inputValue={''} open={true} />,
      {
        settings: {
          ...mockSettings,
          detailedNotifications: false,
        },
      },
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - open with detailed notifications enabled', () => {
    const tree = renderWithAppContext(
      <SearchFilterSuggestions inputValue={''} open={true} />,
      {
        settings: {
          ...mockSettings,
          detailedNotifications: true,
        },
      },
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - input token invalid', () => {
    const tree = renderWithAppContext(
      <SearchFilterSuggestions inputValue={'invalid'} open={true} />,
      {
        settings: {
          ...mockSettings,
          detailedNotifications: false,
        },
      },
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - input token valid', () => {
    const tree = renderWithAppContext(
      <SearchFilterSuggestions inputValue={'repo:'} open={true} />,
      {
        settings: {
          ...mockSettings,
          detailedNotifications: false,
        },
      },
    );

    expect(tree).toMatchSnapshot();
  });
});
