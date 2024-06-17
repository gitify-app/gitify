import type { Reason } from '../typesGitHub';
import { formatReason } from './reason';

describe('utils/reason.ts', () => {
  it('formatReason - should format the notification reason', () => {
    expect(formatReason('approval_requested')).toMatchSnapshot();
    expect(formatReason('assign')).toMatchSnapshot();
    expect(formatReason('author')).toMatchSnapshot();
    expect(formatReason('ci_activity')).toMatchSnapshot();
    expect(formatReason('comment')).toMatchSnapshot();
    expect(formatReason('invitation')).toMatchSnapshot();
    expect(formatReason('manual')).toMatchSnapshot();
    expect(formatReason('member_feature_requested')).toMatchSnapshot();
    expect(formatReason('mention')).toMatchSnapshot();
    expect(formatReason('review_requested')).toMatchSnapshot();
    expect(formatReason('security_advisory_credit')).toMatchSnapshot();
    expect(formatReason('security_alert')).toMatchSnapshot();
    expect(formatReason('state_change')).toMatchSnapshot();
    expect(formatReason('subscribed')).toMatchSnapshot();
    expect(formatReason('team_mention')).toMatchSnapshot();
    expect(formatReason('something_else_unknown' as Reason)).toMatchSnapshot();
  });
});
