import useNotificationFocusStore from './useNotificationFocusStore';

describe('renderer/stores/useNotificationFocusStore.ts', () => {
  beforeEach(() => {
    useNotificationFocusStore.getState().reset();
  });

  it('starts with no intent', () => {
    expect(useNotificationFocusStore.getState().intent).toBeNull();
  });

  it('requests focus with a monotonic request id', () => {
    useNotificationFocusStore.getState().requestFocus('account-1', 'notification-1');
    const first = useNotificationFocusStore.getState().intent;
    useNotificationFocusStore.getState().requestFocus('account-1', 'notification-2');
    const second = useNotificationFocusStore.getState().intent;

    expect(first).toMatchObject({
      accountUUID: 'account-1',
      notificationId: 'notification-1',
    });
    expect(second).toMatchObject({
      accountUUID: 'account-1',
      notificationId: 'notification-2',
    });
    expect(second!.requestId).toBeGreaterThan(first!.requestId);
  });

  it('clears only the matching request', () => {
    useNotificationFocusStore.getState().requestFocus('account-1', 'notification-1');
    const first = useNotificationFocusStore.getState().intent!;
    useNotificationFocusStore.getState().requestFocus('account-2', 'notification-2');
    const second = useNotificationFocusStore.getState().intent!;

    useNotificationFocusStore.getState().clearFocus(first.requestId);
    expect(useNotificationFocusStore.getState().intent).toEqual(second);

    useNotificationFocusStore.getState().clearFocus(second.requestId);
    expect(useNotificationFocusStore.getState().intent).toBeNull();
  });

  it('lets a newer request supersede the previous one', () => {
    useNotificationFocusStore.getState().requestFocus('account-1', 'notification-1');
    const first = useNotificationFocusStore.getState().intent!;
    useNotificationFocusStore.getState().requestFocus('account-2', 'notification-2');

    useNotificationFocusStore.getState().clearFocus(first.requestId);

    expect(useNotificationFocusStore.getState().intent).toMatchObject({
      accountUUID: 'account-2',
      notificationId: 'notification-2',
    });
  });

  it('reset clears the intent', () => {
    useNotificationFocusStore.getState().requestFocus('account-1', 'notification-1');
    useNotificationFocusStore.getState().reset();

    expect(useNotificationFocusStore.getState().intent).toBeNull();
  });
});
