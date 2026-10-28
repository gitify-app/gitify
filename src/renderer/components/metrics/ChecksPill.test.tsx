import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { IconColor } from '../../types';

import { ChecksPill } from './ChecksPill';

describe('renderer/components/metrics/ChecksPill.tsx', () => {
  it('renders nothing when there are no checks', () => {
    const tree = renderWithProviders(<ChecksPill />);
    expect(tree.container).toBeEmptyDOMElement();
  });

  it('renders passing checks', () => {
    const tree = renderWithProviders(
      <ChecksPill checks={{ state: 'SUCCESS', passed: 50, failed: 0, pending: 0, total: 50 }} />,
    );

    expect(screen.getByText('50/50')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Checks: 50 passed' })).toBeInTheDocument();
    expect(tree.container.querySelector(`.${IconColor.GREEN}`)).toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('renders failing checks', () => {
    const tree = renderWithProviders(
      <ChecksPill checks={{ state: 'FAILURE', passed: 48, failed: 1, pending: 1, total: 50 }} />,
    );

    expect(screen.getByText('48/50')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Checks: 48 passed, 1 failed, 1 pending' }),
    ).toBeInTheDocument();
    expect(tree.container.querySelector(`.${IconColor.RED}`)).toBeInTheDocument();
  });

  it('renders pending checks', () => {
    const tree = renderWithProviders(
      <ChecksPill checks={{ state: 'PENDING', passed: 13, failed: 0, pending: 2, total: 15 }} />,
    );

    expect(screen.getByText('13/15')).toBeInTheDocument();
    expect(tree.container.querySelector(`.${IconColor.YELLOW}`)).toBeInTheDocument();
  });
});
