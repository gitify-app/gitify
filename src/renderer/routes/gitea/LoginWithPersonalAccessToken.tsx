import type { FC } from 'react';

import { LoginWithPersonalAccessTokenForm } from '../../components/login/LoginWithPersonalAccessTokenForm';

export const GiteaLoginWithPersonalAccessTokenRoute: FC = () => (
  <LoginWithPersonalAccessTokenForm
    docsTooltip="Gitea API documentation"
    forge="gitea"
    hostnameCaption="Your instance hostname or origin, e.g. gitea.example.com or http://git.internal:3000. Defaults to HTTPS."
    hostnamePlaceholder="gitea.example.com"
    title="Login to Gitea with Personal Access Token"
    tokenPlaceholder="Your Gitea personal access token"
    tokenSettingsCaption="on your Gitea instance to create a token, then paste it below."
    tokenSettingsLabel="Open token settings"
  />
);
