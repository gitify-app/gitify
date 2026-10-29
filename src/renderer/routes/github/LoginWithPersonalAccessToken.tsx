import { Text, Tooltip } from '@primer/react';

import { LoginWithPersonalAccessTokenForm } from '../../components/login/LoginWithPersonalAccessTokenForm';

import { formatRecommendedOAuthScopes } from '../../utils/auth/scopes';

export function GitHubLoginWithPersonalAccessTokenRoute() {
  return (
    <LoginWithPersonalAccessTokenForm
      docsTooltip="GitHub documentation"
      forge="github"
      hostnameCaption="Change only if you are using GitHub Enterprise Server"
      hostnamePlaceholder="github.com"
      title="Login with Personal Access Token"
      tokenPlaceholder="Your classic token (40 characters)"
      tokenSettingsCaption="on GitHub to paste the token below."
      tokenSettingsLabel="Generate a PAT"
    >
      <Text as="i" className="text-xs">
        Use a classic personal access token; fine-grained tokens are not supported. The{' '}
        <Tooltip direction="se" text={formatRecommendedOAuthScopes()}>
          <button type="button">
            <Text as="u">recommended scopes</Text>
          </button>
        </Tooltip>{' '}
        will be automatically selected for you.
      </Text>
    </LoginWithPersonalAccessTokenForm>
  );
}
