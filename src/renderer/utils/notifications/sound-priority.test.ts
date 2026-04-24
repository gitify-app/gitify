import type {
  GitifyNotification,
  GitifyPullRequestReview,
  GitifyPullRequestState,
  Reason,
} from '../../types';

import { getSoundEvent, pickSoundEvent } from './sound-priority';

function notif(reason: Reason): GitifyNotification {
  return {
    reason: { code: reason, title: reason, description: reason },
    subject: { type: 'Issue' },
  } as unknown as GitifyNotification;
}

function pr(
  reason: Reason,
  state?: GitifyPullRequestState,
  reviews?: GitifyPullRequestReview[],
): GitifyNotification {
  return {
    reason: { code: reason, title: reason, description: reason },
    subject: { type: 'PullRequest', state, reviews },
  } as unknown as GitifyNotification;
}

describe('renderer/utils/notifications/sound-priority.ts', () => {
  describe('getSoundEvent', () => {
    it('returns the raw reason for non-PR notifications', () => {
      expect(getSoundEvent(notif('mention'))).toBe('mention');
    });

    it('returns "pr_merged_assigned" for any merged PR notification', () => {
      expect(getSoundEvent(pr('author', 'MERGED'))).toBe('pr_merged_assigned');
      expect(getSoundEvent(pr('assign', 'MERGED'))).toBe('pr_merged_assigned');
      expect(getSoundEvent(pr('subscribed', 'MERGED'))).toBe(
        'pr_merged_assigned',
      );
    });

    it('also fires "pr_merged_assigned" for the MERGE_QUEUE state', () => {
      expect(getSoundEvent(pr('author', 'MERGE_QUEUE'))).toBe(
        'pr_merged_assigned',
      );
    });

    it('prefers merge over prior approvals on the same PR', () => {
      const reviews: GitifyPullRequestReview[] = [
        { state: 'APPROVED', users: ['a'] },
      ];
      expect(getSoundEvent(pr('author', 'MERGED', reviews))).toBe(
        'pr_merged_assigned',
      );
    });

    it('returns "review_changes_requested" when any review requested changes', () => {
      const reviews: GitifyPullRequestReview[] = [
        { state: 'APPROVED', users: ['a'] },
        { state: 'CHANGES_REQUESTED', users: ['b'] },
      ];
      expect(getSoundEvent(pr('author', 'OPEN', reviews))).toBe(
        'review_changes_requested',
      );
    });

    it('returns "review_approved" when reviews contain only approvals', () => {
      const reviews: GitifyPullRequestReview[] = [
        { state: 'APPROVED', users: ['a'] },
      ];
      expect(getSoundEvent(pr('author', 'OPEN', reviews))).toBe(
        'review_approved',
      );
    });

    it('falls back to the raw reason for an open PR with no actionable reviews', () => {
      expect(getSoundEvent(pr('comment', 'OPEN'))).toBe('comment');
    });
  });

  describe('pickSoundEvent', () => {
    it('returns undefined for an empty batch', () => {
      expect(pickSoundEvent([])).toBeUndefined();
    });

    it('returns the only event when one notification', () => {
      expect(pickSoundEvent([notif('comment')])).toBe('comment');
    });

    it('picks the highest-priority event in a mixed batch', () => {
      const batch = [notif('subscribed'), notif('mention'), notif('comment')];
      expect(pickSoundEvent(batch)).toBe('mention');
    });

    it('prefers security_alert over any other event', () => {
      const batch = [
        notif('mention'),
        notif('security_alert'),
        notif('review_requested'),
      ];
      expect(pickSoundEvent(batch)).toBe('security_alert');
    });

    it('picks pr_merged_assigned over review and mention events', () => {
      const reviews: GitifyPullRequestReview[] = [
        { state: 'APPROVED', users: ['a'] },
      ];
      const batch = [
        pr('author', 'OPEN', reviews), // review_approved
        notif('mention'),
        pr('assign', 'MERGED'), // pr_merged_assigned
      ];
      expect(pickSoundEvent(batch)).toBe('pr_merged_assigned');
    });

    it('falls back to the first item when no entry is ranked', () => {
      const batch = [notif('subscribed'), notif('author')];
      expect(pickSoundEvent(batch)).toBe('author');
    });
  });
});
