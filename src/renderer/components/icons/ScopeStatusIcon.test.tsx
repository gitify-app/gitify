import { screen } from '@testing-library/react';

import { describe, expect, it } from 'vitest';

import { renderWithAppContext } from '../../__helpers__/test-utils';

import { ScopeStatusIcon } from './ScopeStatusIcon';

describe('renderer/components/icons/ScopeStatusIcon.tsx', () => {
  describe('granted state', () => {
    it('renders a success icon when granted', () => {
      const tree = renderWithAppContext(<ScopeStatusIcon granted={true} />);
      expect(tree.container).toMatchSnapshot();
    });

    it('renders a success icon with test id when withTestId is true', () => {
      renderWithAppContext(
        <ScopeStatusIcon granted={true} withTestId={true} />,
      );
      expect(
        screen.getByTestId('account-scopes-scope-granted'),
      ).toBeInTheDocument();
    });

    it('does not render a test id by default', () => {
      renderWithAppContext(<ScopeStatusIcon granted={true} />);
      expect(
        screen.queryByTestId('account-scopes-scope-granted'),
      ).not.toBeInTheDocument();
    });
  });

  describe('missing state', () => {
    it('renders a danger icon when not granted', () => {
      const tree = renderWithAppContext(<ScopeStatusIcon granted={false} />);
      expect(tree.container).toMatchSnapshot();
    });

    it('renders a danger icon with test id when withTestId is true', () => {
      renderWithAppContext(
        <ScopeStatusIcon granted={false} withTestId={true} />,
      );
      expect(
        screen.getByTestId('account-scopes-scope-missing'),
      ).toBeInTheDocument();
    });

    it('does not render a test id by default', () => {
      renderWithAppContext(<ScopeStatusIcon granted={false} />);
      expect(
        screen.queryByTestId('account-scopes-scope-missing'),
      ).not.toBeInTheDocument();
    });
  });

  describe('notApplicable state', () => {
    it('renders a dash icon when notApplicable', () => {
      const tree = renderWithAppContext(
        <ScopeStatusIcon granted={false} notApplicable={true} />,
      );
      expect(tree.container).toMatchSnapshot();
    });

    it('renders a dash icon with test id when withTestId is true', () => {
      renderWithAppContext(
        <ScopeStatusIcon
          granted={false}
          notApplicable={true}
          withTestId={true}
        />,
      );
      expect(screen.getByTestId('account-scopes-scope-na')).toBeInTheDocument();
    });

    it('does not render a test id by default', () => {
      renderWithAppContext(
        <ScopeStatusIcon granted={false} notApplicable={true} />,
      );
      expect(
        screen.queryByTestId('account-scopes-scope-na'),
      ).not.toBeInTheDocument();
    });

    it('ignores granted=true when notApplicable is true', () => {
      renderWithAppContext(
        <ScopeStatusIcon
          granted={true}
          notApplicable={true}
          withTestId={true}
        />,
      );
      expect(screen.getByTestId('account-scopes-scope-na')).toBeInTheDocument();
      expect(
        screen.queryByTestId('account-scopes-scope-granted'),
      ).not.toBeInTheDocument();
    });
  });

  describe('size prop', () => {
    it('renders correctly with a custom size', () => {
      const tree = renderWithAppContext(
        <ScopeStatusIcon granted={true} size={20} />,
      );
      expect(tree.container).toMatchSnapshot();
    });
  });
});
