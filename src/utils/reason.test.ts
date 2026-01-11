import type { Reason } from '../types';
import { getReasonDetails } from './reason';

describe('renderer/utils/reason.ts', () => {
  it('getReasonDetails - should get details for notification reason', () => {
    expect(getReasonDetails('approval_requested')).toMatchSnapshot();
    expect(getReasonDetails('assign')).toMatchSnapshot();
    expect(getReasonDetails('author')).toMatchSnapshot();
    expect(getReasonDetails('ci_activity')).toMatchSnapshot();
    expect(getReasonDetails('comment')).toMatchSnapshot();
    expect(getReasonDetails('invitation')).toMatchSnapshot();
    expect(getReasonDetails('manual')).toMatchSnapshot();
    expect(getReasonDetails('member_feature_requested')).toMatchSnapshot();
    expect(getReasonDetails('mention')).toMatchSnapshot();
    expect(getReasonDetails('review_requested')).toMatchSnapshot();
    expect(getReasonDetails('security_advisory_credit')).toMatchSnapshot();
    expect(getReasonDetails('security_alert')).toMatchSnapshot();
    expect(getReasonDetails('state_change')).toMatchSnapshot();
    expect(getReasonDetails('subscribed')).toMatchSnapshot();
    expect(getReasonDetails('team_mention')).toMatchSnapshot();
    expect(
      getReasonDetails('something_else_unknown' as Reason),
    ).toMatchSnapshot();
  });
});
