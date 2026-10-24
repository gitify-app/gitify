import { DownloadIcon } from '@primer/octicons-react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { SettingsGroupHeading } from './SettingsGroupHeading';

describe('renderer/components/settings/SettingsGroupHeading.tsx', () => {
  it('should render a group heading', async () => {
    const { container } = renderWithProviders(
      <SettingsGroupHeading icon={DownloadIcon}>Fetching</SettingsGroupHeading>,
    );

    expect(container).toMatchSnapshot();
  });
});
