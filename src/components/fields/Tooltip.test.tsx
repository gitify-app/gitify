import * as TestRenderer from 'react-test-renderer';

import { type ITooltip, Tooltip } from './Tooltip';

describe('components/fields/Tooltip.tsx', () => {
  const props: ITooltip = {
    tooltip: 'This is some tooltip text',
  };

  it('should render', () => {
    const tree = TestRenderer.create(<Tooltip {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
