// import { waitFor } from '@testing-library/react';

// import {
//   mockAccountNotifications,
//   mockSingleAccountNotifications,
// } from '../../__mocks__/notifications-mocks';
// import { mockAuth } from '../../__mocks__/state-mocks';
// import { defaultSettings } from '../../context/defaults';
// import type { SettingsState } from '../../types';
// import * as native from './native';

// const raiseSoundNotificationMock = jest.spyOn(native, 'raiseSoundNotification');

// describe('renderer/utils/notifications/native.ts', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('triggerNativeNotifications', () => {
//     it('should raise a native notification and play sound for a single new notification', async () => {
//       const settings: SettingsState = {
//         ...defaultSettings,
//         playSound: true,
//         showNotifications: true,
//       };

//       native.triggerNativeNotifications([], mockSingleAccountNotifications, {
//         auth: mockAuth,
//         settings,
//       });

//       // wait for async native handling (generateGitHubWebUrl) to complete
//       await waitFor(() =>
//         expect(window.gitify.raiseNativeNotification).toHaveBeenCalledTimes(1),
//       );

//       expect(window.gitify.raiseNativeNotification).toHaveBeenCalledWith(
//         expect.stringContaining(
//           mockSingleAccountNotifications[0].notifications[0].repository
//             .full_name,
//         ),
//         expect.stringContaining(
//           mockSingleAccountNotifications[0].notifications[0].subject.title,
//         ),
//         expect.stringContaining(
//           mockSingleAccountNotifications[0].notifications[0].repository
//             .html_url,
//         ),
//       );

//       await waitFor(() =>
//         expect(raiseSoundNotificationMock).toHaveBeenCalledTimes(1),
//       );
//       expect(raiseSoundNotificationMock).toHaveBeenCalledWith(0.2);
//     });

//     it('should raise a native notification and play sound for multiple new notifications', async () => {
//       const settings: SettingsState = {
//         ...defaultSettings,
//         playSound: true,
//         showNotifications: true,
//       };

//       native.triggerNativeNotifications([], mockAccountNotifications, {
//         auth: mockAuth,
//         settings,
//       });

//       await waitFor(() =>
//         expect(window.gitify.raiseNativeNotification).toHaveBeenCalledTimes(1),
//       );

//       expect(window.gitify.raiseNativeNotification).toHaveBeenCalledWith(
//         'Gitify',
//         'You have 4 notifications',
//         null,
//       );

//       await waitFor(() =>
//         expect(raiseSoundNotificationMock).toHaveBeenCalledTimes(1),
//       );
//       expect(raiseSoundNotificationMock).toHaveBeenCalledWith(0.2);
//     });

//     it('should not raise a native notification or play a sound when there are no new notifications', () => {
//       const settings: SettingsState = {
//         ...defaultSettings,
//         playSound: true,
//         showNotifications: true,
//       };

//       native.triggerNativeNotifications(
//         mockSingleAccountNotifications,
//         mockSingleAccountNotifications,
//         {
//           auth: mockAuth,
//           settings,
//         },
//       );

//       expect(window.gitify.raiseNativeNotification).not.toHaveBeenCalled();
//       expect(raiseSoundNotificationMock).not.toHaveBeenCalled();
//     });

//     it('should not raise a native notification or play a sound when there are zero notifications', () => {
//       const settings: SettingsState = {
//         ...defaultSettings,
//         playSound: true,
//         showNotifications: true,
//       };

//       native.triggerNativeNotifications([], [], {
//         auth: mockAuth,
//         settings,
//       });

//       expect(window.gitify.raiseNativeNotification).not.toHaveBeenCalled();
//       expect(raiseSoundNotificationMock).not.toHaveBeenCalled();
//     });

//     it('should not raise a native notification when setting disabled', () => {
//       const settings: SettingsState = {
//         ...defaultSettings,
//         showNotifications: false,
//       };

//       native.triggerNativeNotifications([], mockAccountNotifications, {
//         auth: mockAuth,
//         settings,
//       });

//       expect(window.gitify.raiseNativeNotification).not.toHaveBeenCalled();
//     });
//   });
// });
