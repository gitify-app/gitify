import { renderWithProviders } from '../../__helpers__/test-utils';

import { IconColor } from '../../types';

import { LabelsPill, type LabelsPillProps } from './LabelsPill';

describe('renderer/components/metrics/LabelsPill.tsx', () => {
  it('renders without labels or issue fields', () => {
    const props: LabelsPillProps = { labels: [] };

    const tree = renderWithProviders(<LabelsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders with labels', () => {
    const props: LabelsPillProps = {
      labels: [
        { name: 'enhancement', color: 'a2eeef' },
        { name: 'good-first-issue', color: '7057ff' },
      ],
    };

    const tree = renderWithProviders(<LabelsPill {...props} />);

    expect(tree.container).toMatchSnapshot();
  });

  it('renders field tokens when there are no labels', () => {
    const props: LabelsPillProps = {
      labels: [],
      issueFields: [{ name: 'Priority', value: 'High', color: IconColor.RED }],
    };

    const tree = renderWithProviders(<LabelsPill {...props} />);

    expect(tree.getByText('Priority: High')).toBeInTheDocument();
    expect(tree.container.innerHTML).toContain(IconColor.RED);
    expect(tree.container.innerHTML).toContain('var(--gitify-icon-closed)');
  });

  it('renders field tokens prepended before labels', () => {
    const props: LabelsPillProps = {
      labels: [{ name: 'enhancement', color: 'a2eeef' }],
      issueFields: [
        { name: 'Priority', value: 'High', color: IconColor.RED },
        { name: 'Effort', value: '5' },
      ],
    };

    const tree = renderWithProviders(<LabelsPill {...props} />);
    const textContent = tree.container.textContent!;

    expect(textContent).toContain('Priority: High');
    expect(textContent).toContain('Effort: 5');
    expect(textContent).toContain('enhancement');
    expect(textContent.indexOf('Priority: High')).toBeLessThan(textContent.indexOf('enhancement'));
    expect(textContent.indexOf('Effort: 5')).toBeLessThan(textContent.indexOf('enhancement'));
  });
});
