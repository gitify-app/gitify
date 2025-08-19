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
