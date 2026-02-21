import { renderWithAppContext } from '../../__helpers__/test-utils';

import { useSettingsStore } from '../../stores';

import { SearchFilterSuggestions } from './SearchFilterSuggestions';

describe('renderer/components/filters/SearchFilterSuggestions.tsx', () => {
  it('should render itself & its children - closed', () => {
    const tree = renderWithAppContext(
      <SearchFilterSuggestions inputValue={''} open={false} />,
    );

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - open without detailed notifications enabled', () => {
    useSettingsStore.setState({ detailedNotifications: false });

    const tree = renderWithAppContext(
      <SearchFilterSuggestions inputValue={''} open={true} />,
    );

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - open with detailed notifications enabled', () => {
    useSettingsStore.setState({ detailedNotifications: true });

    const tree = renderWithAppContext(
      <SearchFilterSuggestions inputValue={''} open={true} />,
    );

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - input token invalid', () => {
    const tree = renderWithAppContext(
      <SearchFilterSuggestions inputValue={'invalid'} open={true} />,
    );

    expect(tree.container).toMatchSnapshot();
  });

  it('should render itself & its children - input token valid', () => {
    const tree = renderWithAppContext(
      <SearchFilterSuggestions inputValue={'repo:'} open={true} />,
    );

    expect(tree.container).toMatchSnapshot();
  });
});
