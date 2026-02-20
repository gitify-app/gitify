import { renderWithAppContext } from '../../__helpers__/test-utils';

import { FieldLabel, type FieldLabelProps } from './FieldLabel';

describe('renderer/components/fields/FieldLabel.tsx', () => {
  const props: FieldLabelProps = {
    name: 'appearance',
    label: 'Appearance',
  };

  it('should render', () => {
    const tree = renderWithAppContext(<FieldLabel {...props} />);
    expect(tree.container).toMatchSnapshot();
  });
});
