import { DownloadIcon } from '@primer/octicons-react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { SettingsGroupHeading } from './SettingsGroupHeading';

describe('renderer/components/settings/SettingsGroupHeading.tsx', () => {
  it('renders a group heading', async () => {
    const { container } = renderWithProviders(
      <SettingsGroupHeading icon={DownloadIcon}>Fetch</SettingsGroupHeading>,
    );

    expect(container).toMatchSnapshot();
  });
});
