import { mockGitLabAccount } from '../../../__mocks__/account-mocks';

import type { GitLabTodo } from './types';

import { transformGitLabTodos } from './transform';

/**
 * Shaped after a live `GET /api/v4/todos` response from gitlab.com. The
 * embedded project deliberately omits `web_url`/`avatar_url` because the real
 * payload does not include them.
 */
function mockTodo(overrides: Partial<GitLabTodo> = {}): GitLabTodo {
  return {
    id: 752350892,
    project: {
      id: 38499048,
      name: 'Fonts',
      name_with_namespace: 'Afonso Jorge Ramos / Fonts',
      path: 'Fonts',
      path_with_namespace: 'afonsojramos/Fonts',
      description: '',
    },
    author: {
      id: 2846743,
      username: 'afonsojramos',
      name: 'Afonso Jorge Ramos',
      avatar_url: 'https://gitlab.com/uploads/-/system/user/avatar/2846743/avatar.png',
      web_url: 'https://gitlab.com/afonsojramos',
    },
    action_name: 'assigned',
    target_type: 'Issue',
    target: {
      id: 199190353,
      iid: 1,
      title: 'gitify-scope-scratch',
      state: 'opened',
      web_url: 'https://gitlab.com/afonsojramos/Fonts/-/work_items/1',
      user_notes_count: 3,
      author: {
        id: 2846743,
        username: 'afonsojramos',
        name: 'Afonso Jorge Ramos',
        avatar_url: 'https://gitlab.com/uploads/-/system/user/avatar/2846743/avatar.png',
        web_url: 'https://gitlab.com/afonsojramos',
      },
    },
    target_url: 'https://gitlab.com/afonsojramos/Fonts/-/work_items/1',
    body: 'gitify-scope-scratch',
    state: 'pending',
    created_at: '2026-08-26T14:52:51.152Z',
    updated_at: '2026-08-26T14:52:51.152Z',
    ...overrides,
  };
}

describe('renderer/utils/forges/gitlab/transform.ts', () => {
  describe('transformGitLabTodos', () => {
    it('transforms a pending issue to-do item', () => {
      const [result] = transformGitLabTodos([mockTodo()], mockGitLabAccount);

      expect(result.id).toBe('752350892');
      expect(result.unread).toBe(true);
      expect(result.updatedAt).toBe('2026-08-26T14:52:51.152Z');
      expect(result.account).toBe(mockGitLabAccount);
      expect(result.subject.title).toBe('gitify-scope-scratch');
      expect(result.subject.type).toBe('Issue');
      expect(result.subject.number).toBe(1);
      expect(result.subject.state).toBe('OPEN');
      expect(result.subject.commentCount).toBe(3);
      expect(result.subject.htmlUrl).toBe('https://gitlab.com/afonsojramos/Fonts/-/work_items/1');
    });

    it('marks done items as read', () => {
      const [result] = transformGitLabTodos([mockTodo({ state: 'done' })], mockGitLabAccount);

      expect(result.unread).toBe(false);
    });

    it('derives the repository url from path_with_namespace', () => {
      const [result] = transformGitLabTodos([mockTodo()], mockGitLabAccount);

      expect(result.repository.fullName).toBe('afonsojramos/Fonts');
      expect(result.repository.name).toBe('Fonts');
      expect(result.repository.htmlUrl).toBe('https://gitlab.com/afonsojramos/Fonts');
      expect(result.repository.owner.login).toBe('afonsojramos');
    });

    it('keeps the full namespace as owner for subgroup projects', () => {
      const [result] = transformGitLabTodos(
        [
          mockTodo({
            project: {
              id: 1,
              name: 'app',
              name_with_namespace: 'Group / Sub / app',
              path: 'app',
              path_with_namespace: 'group/sub/app',
            },
          }),
        ],
        mockGitLabAccount,
      );

      expect(result.repository.fullName).toBe('group/sub/app');
      expect(result.repository.owner.login).toBe('group/sub');
      expect(result.repository.htmlUrl).toBe('https://gitlab.com/group/sub/app');
    });

    it('falls back when the project is missing', () => {
      const [result] = transformGitLabTodos([mockTodo({ project: undefined })], mockGitLabAccount);

      expect(result.repository.fullName).toBe('unknown');
      expect(result.repository.htmlUrl).toBe('https://gitlab.com');
    });

    it('falls back to the body when the target has no title', () => {
      const [result] = transformGitLabTodos(
        [mockTodo({ target: undefined, body: 'fallback title' })],
        mockGitLabAccount,
      );

      expect(result.subject.title).toBe('fallback title');
      expect(result.subject.state).toBeUndefined();
      expect(result.subject.number).toBeUndefined();
    });

    describe('subject type mapping', () => {
      it.each([
        ['Issue', 'Issue'],
        ['MergeRequest', 'PullRequest'],
        ['Commit', 'Commit'],
      ] as const)('maps %s to %s', (targetType, expected) => {
        const [result] = transformGitLabTodos(
          [mockTodo({ target_type: targetType })],
          mockGitLabAccount,
        );

        expect(result.subject.type).toBe(expected);
      });

      it.each(['Epic', 'DesignManagement::Design', 'Vulnerability', 'WikiPage::Meta'] as const)(
        'falls back to GitLabTodo for %s',
        (targetType) => {
          const [result] = transformGitLabTodos(
            [mockTodo({ target_type: targetType })],
            mockGitLabAccount,
          );

          expect(result.subject.type).toBe('GitLabTodo');
        },
      );
    });

    describe('reason mapping', () => {
      it.each([
        ['assigned', 'assign'],
        ['mentioned', 'mention'],
        ['directly_addressed', 'mention'],
        ['build_failed', 'ci_activity'],
        ['marked', 'manual'],
        ['approval_required', 'approval_requested'],
        ['unmergeable', 'state_change'],
        ['merge_train_removed', 'state_change'],
        ['member_access_requested', 'member_feature_requested'],
      ] as const)('maps %s to %s', (action, expected) => {
        const [result] = transformGitLabTodos(
          [mockTodo({ action_name: action })],
          mockGitLabAccount,
        );

        expect(result.reason.code).toBe(expected);
        expect(result.reason.title).toBeTruthy();
      });

      it('falls back to subscribed for an unknown action', () => {
        const [result] = transformGitLabTodos(
          [mockTodo({ action_name: 'something_new' as never })],
          mockGitLabAccount,
        );

        expect(result.reason.code).toBe('subscribed');
      });
    });

    describe('state mapping', () => {
      it.each([
        ['opened', 'OPEN'],
        ['closed', 'CLOSED'],
        ['merged', 'MERGED'],
      ] as const)('maps merge request %s to %s', (state, expected) => {
        const [result] = transformGitLabTodos(
          [
            mockTodo({
              target_type: 'MergeRequest',
              target: { iid: 5, title: 'mr', state },
            }),
          ],
          mockGitLabAccount,
        );

        expect(result.subject.state).toBe(expected);
      });

      it('reports draft merge requests as DRAFT', () => {
        const [result] = transformGitLabTodos(
          [
            mockTodo({
              target_type: 'MergeRequest',
              target: { iid: 5, title: 'mr', state: 'opened', draft: true },
            }),
          ],
          mockGitLabAccount,
        );

        expect(result.subject.state).toBe('DRAFT');
      });

      it('ignores merged state for issues', () => {
        const [result] = transformGitLabTodos(
          [mockTodo({ target: { iid: 1, title: 'i', state: 'merged' } })],
          mockGitLabAccount,
        );

        expect(result.subject.state).toBeUndefined();
      });
    });

    describe('user mapping', () => {
      it('uses the target author as the notification user', () => {
        const [result] = transformGitLabTodos([mockTodo()], mockGitLabAccount);

        expect(result.subject.user?.login).toBe('afonsojramos');
        expect(result.subject.author?.login).toBe('afonsojramos');
        expect(result.subject.user?.htmlUrl).toBe('https://gitlab.com/afonsojramos');
      });

      it('omits the user when the target has no author', () => {
        const [result] = transformGitLabTodos(
          [mockTodo({ target: { iid: 1, title: 't', state: 'opened' } })],
          mockGitLabAccount,
        );

        expect(result.subject.user).toBeUndefined();
        expect(result.subject.author).toBeUndefined();
      });
    });
  });
});
