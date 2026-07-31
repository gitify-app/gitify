import type { FC } from 'react';

import { Text, Tooltip } from '@primer/react';

import { LoginWithPersonalAccessTokenForm } from '../../components/login/LoginWithPersonalAccessTokenForm';

import { formatRecommendedOAuthScopes } from '../../utils/auth/scopes';

export const GitHubLoginWithPersonalAccessTokenRoute: FC = () => (
  <LoginWithPersonalAccessTokenForm
    docsTooltip="GitHub documentation"
    forge="github"
    hostnameCaption="Change only if you are using GitHub Enterprise Server"
    hostnamePlaceholder="github.com"
    title="Login with Personal Access Token"
    tokenPlaceholder="Your generated token (40 characters)"
    tokenSettingsCaption="on GitHub to paste the token below."
    tokenSettingsLabel="Generate a PAT"
  >
    <Text as="i" className="text-xs">
      The{' '}
      <Tooltip direction="se" text={formatRecommendedOAuthScopes()}>
        <button type="button">
          <Text as="u">recommended scopes</Text>
        </button>
      </Tooltip>{' '}
      will be automatically selected for you.
    </Text>
  </LoginWithPersonalAccessTokenForm>
);
