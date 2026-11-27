import { screen } from '@testing-library/react';

import { IssueClosedIcon, IssueOpenedIcon, SkipIcon } from '@primer/octicons-react';

import { renderWithProviders } from '../__helpers__/test-utils';

import type { GitifyIssueStatusKind } from '../types';

import {
  getIssueStatusIcon,
  IssueInProgressIcon,
  IssueInReviewIcon,
  IssueTodoIcon,
} from './IssueStatusIcon';

describe('renderer/icons/IssueStatusIcon.tsx', () => {
  it.each([
    ['backlog', IssueOpenedIcon],
    ['todo', IssueTodoIcon],
    ['in_progress', IssueInProgressIcon],
    ['in_review', IssueInReviewIcon],
    ['done', IssueClosedIcon],
    ['not_planned', SkipIcon],
    ['duplicate', SkipIcon],
    ['unknown', IssueOpenedIcon],
  ] as const)('maps %s to its glyph', (kind, expected) => {
    expect(getIssueStatusIcon(kind)).toBe(expected);
  });

  it.each([
    'backlog',
    'todo',
    'in_progress',
    'in_review',
    'done',
    'not_planned',
    'duplicate',
    'unknown',
  ] as const)('renders %s with currentColor', (kind: GitifyIssueStatusKind) => {
    const Icon = getIssueStatusIcon(kind);
    const tree = renderWithProviders(<Icon />);

    expect(tree.container.querySelector('svg')).toHaveAttribute('fill', 'currentColor');
  });

  it('exposes a supplied accessible label', () => {
    renderWithProviders(<IssueInReviewIcon aria-label="In review" />);

    expect(screen.getByLabelText('In review')).toBeInTheDocument();
  });
});
