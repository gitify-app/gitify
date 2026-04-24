import type { GitifyNotification, SoundEvent } from '../../types';

/**
 * Derive the sound event for a single notification. For PRs we inspect the
 * enriched `subject.state` and `subject.reviews` to surface synthetic events
 * the raw `Reason` cannot express (approved vs changes-requested vs merged).
 */
export function getSoundEvent(notification: GitifyNotification): SoundEvent {
  const { reason, subject } = notification;

  if (subject.type === 'PullRequest') {
    // Merge wins over review state: a merged PR with prior approvals should
    // play the merge sound, not the approval sound.
    if (subject.state === 'MERGED' || subject.state === 'MERGE_QUEUE') {
      return 'pr_merged_assigned';
    }

    const reviews = subject.reviews ?? [];
    if (reviews.some((r) => r.state === 'CHANGES_REQUESTED')) {
      return 'review_changes_requested';
    }
    if (reviews.some((r) => r.state === 'APPROVED')) {
      return 'review_approved';
    }
  }

  return reason.code;
}

/**
 * Sound-event priority used to choose a single sound when several
 * notifications arrive in the same polling cycle. Earlier entries beat later
 * ones. Events not in this list fall back to the lowest priority.
 */
const EVENT_PRIORITY: readonly SoundEvent[] = [
  'security_alert',
  'security_advisory_credit',
  'pr_merged_assigned',
  'review_changes_requested',
  'review_approved',
  'mention',
  'team_mention',
  'review_requested',
  'approval_requested',
  'assign',
  'ci_activity',
  'state_change',
  'comment',
  'invitation',
  'manual',
  'member_feature_requested',
  'author',
  'subscribed',
];

const DEFAULT_PRIORITY_INDEX = EVENT_PRIORITY.length;

function priorityOf(event: SoundEvent): number {
  const index = EVENT_PRIORITY.indexOf(event);
  return index === -1 ? DEFAULT_PRIORITY_INDEX : index;
}

/**
 * Pick the highest-priority sound event from a batch of new notifications,
 * so the corresponding sound override (if any) is the one that gets played.
 *
 * Returns `undefined` when the batch is empty.
 */
export function pickSoundEvent(
  notifications: GitifyNotification[],
): SoundEvent | undefined {
  if (notifications.length === 0) {
    return undefined;
  }

  let winner: SoundEvent = getSoundEvent(notifications[0]);
  let winnerScore = priorityOf(winner);

  for (let i = 1; i < notifications.length; i++) {
    const candidate = getSoundEvent(notifications[i]);
    const score = priorityOf(candidate);
    if (score < winnerScore) {
      winner = candidate;
      winnerScore = score;
    }
  }

  return winner;
}
