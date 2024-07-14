import { PersonFillIcon } from '@primer/octicons-react';
import { render } from '@testing-library/react';
import { Legend } from './Legend';

describe('routes/components/settings/Legend.tsx', () => {
  it('should render the legend', async () => {
    const { container } = render(<Legend icon={PersonFillIcon}>Legend</Legend>);

    expect(container).toMatchSnapshot();
  });
});
