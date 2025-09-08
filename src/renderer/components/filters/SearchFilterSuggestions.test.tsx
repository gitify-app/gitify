import { render } from '@testing-library/react';

import { SearchFilterSuggestions } from './SearchFilterSuggestions';

describe('renderer/components/filters/SearchFilterSuggestions.tsx', () => {
  const mockOnClose = jest.fn();

  it('should render itself & its children - closed', () => {
    const tree = render(
      <SearchFilterSuggestions
        inputValue={''}
        isDetailedNotificationsEnabled={false}
        onClose={mockOnClose}
        open={false}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - open', () => {
    const tree = render(
      <SearchFilterSuggestions
        inputValue={''}
        isDetailedNotificationsEnabled={false}
        onClose={mockOnClose}
        open={true}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - open with detailed enabled', () => {
    const tree = render(
      <SearchFilterSuggestions
        inputValue={''}
        isDetailedNotificationsEnabled={true}
        onClose={mockOnClose}
        open={true}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - input token invalid', () => {
    const tree = render(
      <SearchFilterSuggestions
        inputValue={'invalid'}
        isDetailedNotificationsEnabled={false}
        onClose={mockOnClose}
        open={true}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  it('should render itself & its children - input token valid', () => {
    const tree = render(
      <SearchFilterSuggestions
        inputValue={'repo:'}
        isDetailedNotificationsEnabled={false}
        onClose={mockOnClose}
        open={true}
      />,
    );

    expect(tree).toMatchSnapshot();
  });
});
