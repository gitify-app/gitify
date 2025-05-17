import { render } from '@testing-library/react';

import { FieldLabel, type IFieldLabel } from './FieldLabel';

describe('renderer/components/fields/FieldLabel.tsx', () => {
  const props: IFieldLabel = {
    name: 'appearance',
    label: 'Appearance',
  };

  it('should render', () => {
    const tree = render(<FieldLabel {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
