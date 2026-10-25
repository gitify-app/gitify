import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../../__helpers__/test-utils';

import { SettingsList } from './SettingsList';

describe('renderer/components/settings/controls/SettingsList.tsx', () => {
  it('renders its children in a divided list', () => {
    renderWithProviders(
      <SettingsList>
        <div>First setting</div>
        <div>Second setting</div>
      </SettingsList>,
    );

    expect(screen.getByText('First setting')).toBeInTheDocument();
    expect(screen.getByText('Second setting')).toBeInTheDocument();
  });
});
