import { mockGitHubCloudAccount } from '../../../__mocks__/account-mocks';

import type { Account, Hostname } from '../../../types';
import type { GerritChangeInfo } from './types';

import { toIsoTimestamp, transformGerritChanges } from './transform';

describe('renderer/utils/forges/gerrit/transform.ts', () => {
  const gerritAccount: Account = {
    ...mockGitHubCloudAccount,
    forge: 'gerrit',
    platform: 'Gerrit',
    hostname: 'gerrit.example.com' as Hostname,
  };

  function buildChange(overrides: Partial<GerritChangeInfo> = {}): GerritChangeInfo {
    return {
      id: 'platform%2Fframeworks%2Fbase~1234',
      project: 'platform/frameworks/base',
      branch: 'main',
      change_id: 'Iabc123',
      subject: 'Fix a bug',
      status: 'NEW',
      created: '2024-01-15 10:00:00.000000000',
      updated: '2024-01-15 12:00:00.123456789',
      _number: 1234,
      owner: { _account_id: 7, username: 'jdoe', name: 'John Doe' },
      ...overrides,
    };
  }

  it('maps a change to a GitifyNotification, always unread', () => {
    const [n] = transformGerritChanges([buildChange()], gerritAccount);

    expect(n.id).toBe('platform%2Fframeworks%2Fbase~1234');
    expect(n.unread).toBe(true);
    expect(n.reason.code).toBe('review_requested');
    expect(n.subject.type).toBe('PullRequest');
    expect(n.subject.title).toBe('Fix a bug');
    expect(n.subject.number).toBe(1234);
    expect(n.subject.state).toBe('OPEN');
    expect(n.subject.htmlUrl).toBe(
      'https://gerrit.example.com/c/platform%2Fframeworks%2Fbase/+/1234',
    );
    expect(n.subject.url).toBe(
      'https://gerrit.example.com/a/changes/platform%2Fframeworks%2Fbase~1234',
    );
  });

  it('uses the author reason when the caller owns the change', () => {
    const ownAccount: Account = { ...gerritAccount, user: { ...gerritAccount.user!, id: '7' } };
    const [n] = transformGerritChanges([buildChange()], ownAccount);

    expect(n.reason.code).toBe('author');
  });

  it('maps repository from a nested project namespace', () => {
    const [n] = transformGerritChanges([buildChange()], gerritAccount);

    expect(n.repository.fullName).toBe('platform/frameworks/base');
    expect(n.repository.name).toBe('base');
    expect(n.repository.owner.login).toBe('platform/frameworks');
    expect(n.repository.htmlUrl).toBe(
      'https://gerrit.example.com/admin/repos/platform%2Fframeworks%2Fbase',
    );
  });

  it('falls back to the project name as owner login when there is no nesting', () => {
    const [n] = transformGerritChanges([buildChange({ project: 'standalone' })], gerritAccount);

    expect(n.repository.name).toBe('standalone');
    expect(n.repository.owner.login).toBe('standalone');
  });

  it.each([
    ['NEW', undefined, 'OPEN'],
    ['NEW', true, 'DRAFT'],
    ['MERGED', undefined, 'MERGED'],
    ['ABANDONED', undefined, 'CLOSED'],
  ] as const)('maps status=%s, work_in_progress=%s to state %s', (status, wip, expected) => {
    const [n] = transformGerritChanges(
      [buildChange({ status, work_in_progress: wip })],
      gerritAccount,
    );

    expect(n.subject.state).toBe(expected);
  });

  it('maps the owner onto subject.author/user, falling back to email/id when name/username are absent', () => {
    const [n] = transformGerritChanges(
      [buildChange({ owner: { _account_id: 9, email: 'anon@example.com' } })],
      gerritAccount,
    );

    expect(n.subject.author?.login).toBe('anon@example.com');
    expect(n.subject.user?.login).toBe('anon@example.com');

    const [withOnlyId] = transformGerritChanges(
      [buildChange({ owner: { _account_id: 9 } })],
      gerritAccount,
    );
    expect(withOnlyId.subject.author?.login).toBe('9');
  });
});

describe('renderer/utils/forges/gerrit/transform.ts toIsoTimestamp', () => {
  it('converts a Gerrit timestamp into a parseable ISO-8601 string', () => {
    expect(toIsoTimestamp('2024-01-15 12:00:00.123456789')).toBe('2024-01-15T12:00:00.123Z');
    expect(new Date(toIsoTimestamp('2024-01-15 12:00:00.123456789')).toISOString()).toBe(
      '2024-01-15T12:00:00.123Z',
    );
  });

  it('pads short fractional seconds', () => {
    expect(toIsoTimestamp('2024-01-15 12:00:00.5')).toBe('2024-01-15T12:00:00.500Z');
  });
});
