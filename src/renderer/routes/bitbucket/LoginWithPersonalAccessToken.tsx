import type { FC } from 'react';

import { LoginWithPersonalAccessTokenForm } from '../../components/login/LoginWithPersonalAccessTokenForm';

export const BitbucketLoginWithPersonalAccessTokenRoute: FC = () => (
  <LoginWithPersonalAccessTokenForm
    docsTooltip="Atlassian API token documentation"
    forge="bitbucket"
    showHostnameField={false}
    showUsernameField
    title="Login to Bitbucket Cloud with API Token"
    tokenPlaceholder="Your Atlassian API token"
    tokenSettingsCaption="on your Atlassian account to create an API token, then paste it below."
    tokenSettingsLabel="Open token settings"
    usernameCaption="Your Atlassian account email address"
    usernamePlaceholder="you@example.com"
  />
);
