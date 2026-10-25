import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';
import { mockSettings } from '../../__mocks__/state-mocks';

import {
  ALL_SEARCH_QUALIFIERS,
  BASE_SEARCH_QUALIFIERS,
  DETAILED_ONLY_SEARCH_QUALIFIERS,
} from '../../utils/notifications/filters';
import { SearchFilterSuggestions } from './SearchFilterSuggestions';

describe('renderer/components/filters/SearchFilterSuggestions.tsx', () => {
  it('should render itself & its children - closed', () => {
    const tree = renderWithProviders(<SearchFilterSuggestions inputValue={''} open={false} />);

    expect(tree.container).toBeEmptyDOMElement();
  });

  it('should render itself & its children - open without detailed notifications enabled', () => {
    renderWithProviders(<SearchFilterSuggestions inputValue={''} open={true} />, {
      settings: {
        ...mockSettings,
        detailedNotifications: false,
      },
    });

    for (const qualifier of BASE_SEARCH_QUALIFIERS) {
      expect(screen.getByText(qualifier.prefix)).toBeInTheDocument();
    }

    for (const qualifier of DETAILED_ONLY_SEARCH_QUALIFIERS) {
      expect(screen.queryByText(qualifier.prefix)).not.toBeInTheDocument();
    }
  });

  it('should render itself & its children - open with detailed notifications enabled', () => {
    renderWithProviders(<SearchFilterSuggestions inputValue={''} open={true} />, {
      settings: {
        ...mockSettings,
        detailedNotifications: true,
      },
    });

    for (const qualifier of ALL_SEARCH_QUALIFIERS) {
      expect(screen.getByText(qualifier.prefix)).toBeInTheDocument();
    }
  });

  it('should render itself & its children - input token invalid', () => {
    renderWithProviders(<SearchFilterSuggestions inputValue={'invalid'} open={true} />, {
      settings: {
        ...mockSettings,
        detailedNotifications: false,
      },
    });

    expect(screen.getByText(/Please use one of the supported filters/)).toBeInTheDocument();
  });

  it('should render itself & its children - input token valid', () => {
    renderWithProviders(<SearchFilterSuggestions inputValue={'repo:'} open={true} />, {
      settings: {
        ...mockSettings,
        detailedNotifications: false,
      },
    });

    expect(screen.getByText('repo:')).toBeInTheDocument();
    expect(screen.queryByText('author:')).not.toBeInTheDocument();
  });
});
