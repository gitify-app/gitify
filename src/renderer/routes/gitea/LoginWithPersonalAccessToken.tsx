import type { FC } from 'react';

import { LoginWithPersonalAccessTokenForm } from '../../components/login/LoginWithPersonalAccessTokenForm';

export const GiteaLoginWithPersonalAccessTokenRoute: FC = () => (
  <LoginWithPersonalAccessTokenForm
    docsTooltip="Gitea API documentation"
    forge="gitea"
    hostnameCaption="Your Gitea instance hostname (for example gitea.example.com)"
    hostnamePlaceholder="gitea.example.com"
    title="Login to Gitea with Personal Access Token"
    tokenPlaceholder="Your Gitea personal access token"
    tokenSettingsCaption="on your Gitea instance to create a token, then paste it below."
    tokenSettingsLabel="Open token settings"
  />
);
