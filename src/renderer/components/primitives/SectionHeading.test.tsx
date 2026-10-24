import { PersonFillIcon } from '@primer/octicons-react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { SectionHeading } from './SectionHeading';

describe('renderer/components/primitives/SectionHeading.tsx', () => {
  it('should render a heading by default', async () => {
    const { container } = renderWithProviders(
      <SectionHeading icon={PersonFillIcon}>Heading</SectionHeading>,
    );

    expect(container).toMatchSnapshot();
  });

  it('should render a legend for a fieldset', async () => {
    const { container } = renderWithProviders(
      <fieldset>
        <SectionHeading as="legend" icon={PersonFillIcon}>
          Legend
        </SectionHeading>
      </fieldset>,
    );

    expect(container).toMatchSnapshot();
  });

  it('should render a specific heading level', async () => {
    const { container } = renderWithProviders(
      <SectionHeading as="h2" icon={PersonFillIcon}>
        Heading
      </SectionHeading>,
    );

    expect(container).toMatchSnapshot();
  });
});
