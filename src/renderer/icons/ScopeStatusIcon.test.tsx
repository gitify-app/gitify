import { screen } from '@testing-library/react';

import { renderWithProviders } from '../__helpers__/test-utils';

import { ScopeStatusIcon } from './ScopeStatusIcon';

describe('renderer/icons/ScopeStatusIcon.tsx', () => {
  describe('granted state', () => {
    it('renders a success icon when granted', () => {
      const tree = renderWithProviders(<ScopeStatusIcon granted={true} />);
      expect(tree.container).toMatchSnapshot();
    });

    it('announces the granted status', () => {
      renderWithProviders(<ScopeStatusIcon granted={true} />);
      expect(screen.getByRole('img', { name: 'granted' })).toBeInTheDocument();
    });
  });

  describe('missing state', () => {
    it('renders a danger icon when not granted', () => {
      const tree = renderWithProviders(<ScopeStatusIcon granted={false} />);
      expect(tree.container).toMatchSnapshot();
    });

    it('announces the missing status', () => {
      renderWithProviders(<ScopeStatusIcon granted={false} />);
      expect(screen.getByRole('img', { name: 'missing' })).toBeInTheDocument();
    });
  });

  describe('notApplicable state', () => {
    it('renders a dash icon when notApplicable', () => {
      const tree = renderWithProviders(<ScopeStatusIcon granted={false} notApplicable={true} />);
      expect(tree.container).toMatchSnapshot();
    });

    it('ignores granted=true when notApplicable is true', () => {
      renderWithProviders(<ScopeStatusIcon granted={true} notApplicable={true} />);
      expect(screen.getByRole('img', { name: 'not applicable' })).toBeInTheDocument();
      expect(screen.queryByRole('img', { name: 'granted' })).not.toBeInTheDocument();
    });
  });

  describe('subject prop', () => {
    it('prefixes the subject to the accessible name', () => {
      renderWithProviders(<ScopeStatusIcon granted={false} subject="repo" />);
      expect(screen.getByRole('img', { name: 'repo missing' })).toBeInTheDocument();
    });
  });

  describe('size prop', () => {
    it('renders correctly with a custom size', () => {
      const tree = renderWithProviders(<ScopeStatusIcon granted={true} size={20} />);
      expect(tree.container).toMatchSnapshot();
    });
  });
});
