import type { FC } from 'react';

import { Text } from '@primer/react';

import { LoginWithPersonalAccessTokenForm } from '../../components/login/LoginWithPersonalAccessTokenForm';

export const GitLabLoginWithPersonalAccessTokenRoute: FC = () => (
  <LoginWithPersonalAccessTokenForm
    docsTooltip="GitLab To-Do API documentation"
    forge="gitlab"
    hostnameCaption="Your GitLab instance hostname (for example gitlab.com)"
    hostnamePlaceholder="gitlab.com"
    title="Login to GitLab with Personal Access Token"
    tokenPlaceholder="Your GitLab personal access token"
    tokenSettingsCaption="on your GitLab instance to create a token, then paste it below."
    tokenSettingsLabel="Open token settings"
  >
    <Text className="text-xs">
      Requires the <Text className="font-semibold">api</Text> scope, or a fine-grained token with{' '}
      <Text className="font-semibold">Todo</Text> (read, update) and{' '}
      <Text className="font-semibold">User</Text> (read) permissions. GitLab shows your To-Do items,
      so you will see fewer notifications than on GitHub.
    </Text>
  </LoginWithPersonalAccessTokenForm>
);
