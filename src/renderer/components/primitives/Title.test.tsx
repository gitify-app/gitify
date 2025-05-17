import { PersonFillIcon } from '@primer/octicons-react';
import { render } from '@testing-library/react';

import { Title } from './Title';

describe('renderer/routes/components/primitives/Title.tsx', () => {
  it('should render the title - default size', async () => {
    const { container } = render(<Title icon={PersonFillIcon}>Legend</Title>);

    expect(container).toMatchSnapshot();
  });

  it('should render the title - specific size', async () => {
    const { container } = render(
      <Title icon={PersonFillIcon} size={4}>
        Legend
      </Title>,
    );

    expect(container).toMatchSnapshot();
  });
});
