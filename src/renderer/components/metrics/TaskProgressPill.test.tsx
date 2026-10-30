import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../__helpers__/test-utils';

import { IconColor } from '../../types';

import { TaskProgressPill } from './TaskProgressPill';

describe('renderer/components/metrics/TaskProgressPill.tsx', () => {
  it('renders nothing without tasks', () => {
    const tree = renderWithProviders(<TaskProgressPill />);
    expect(tree.container).toBeEmptyDOMElement();
  });

  it('renders task progress', () => {
    const tree = renderWithProviders(<TaskProgressPill progress={{ completed: 5, total: 16 }} />);

    expect(screen.getByText('5/16')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tasks: 5 of 16 completed' })).toBeInTheDocument();
    expect(tree.container).toMatchSnapshot();
  });

  it('renders purple when all tasks are completed', () => {
    const tree = renderWithProviders(<TaskProgressPill progress={{ completed: 3, total: 3 }} />);

    expect(tree.container.querySelector(`.${IconColor.PURPLE}`)).toBeInTheDocument();
  });
});
