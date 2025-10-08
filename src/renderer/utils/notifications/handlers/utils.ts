import type { SubjectUser, User } from '../../../typesGitHub';

/**
 * Construct the notification subject user based on an order prioritized list of users
 * @param users array of users in order or priority
 * @returns the subject user
 */
export function getSubjectUser(users: User[]): SubjectUser {
  let subjectUser: SubjectUser = null;

  for (const user of users) {
    if (user) {
      subjectUser = {
        login: user.login,
        html_url: user.html_url,
        avatar_url: user.avatar_url,
        type: user.type,
      };

      return subjectUser;
    }
  }

  return subjectUser;
}

export function formatForDisplay(text: string[]): string {
  if (!text) {
    return '';
  }

  return text
    .join(' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase character followed by an uppercase character
    .replaceAll('_', ' ') // Replace underscores with spaces
    .replace(/\w+/g, (word) => {
      // Convert to proper case (capitalize first letter of each word)
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .trim();
}
