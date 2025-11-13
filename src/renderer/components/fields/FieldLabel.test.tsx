import { render } from '@testing-library/react';

import { FieldLabel, type FieldLabelProps } from './FieldLabel';

describe('renderer/components/fields/FieldLabel.tsx', () => {
  const props: FieldLabelProps = {
    name: 'appearance',
    label: 'Appearance',
  };

  it('should render', () => {
    const tree = render(<FieldLabel {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
