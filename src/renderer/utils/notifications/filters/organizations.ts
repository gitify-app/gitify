import type { SettingsState } from '../../../types';
import type { Notification } from '../../../typesGitHub';

export function hasIncludeOrganizationFilters(settings: SettingsState) {
  return settings.filterIncludeOrganizations.length > 0;
}

export function hasExcludeOrganizationFilters(settings: SettingsState) {
  return settings.filterExcludeOrganizations.length > 0;
}

export function filterNotificationByOrganization(
  notification: Notification,
  organizationName: string,
): boolean {
  return (
    notification.repository.owner.login.toLowerCase() ===
    organizationName.toLowerCase()
  );
}
