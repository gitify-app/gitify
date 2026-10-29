import type { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Text, Tooltip } from '@primer/react';

import { LoginWithPersonalAccessTokenForm } from '../../components/login/LoginWithPersonalAccessTokenForm';

import { formatRecommendedOAuthScopes } from '../../utils/auth/scopes';

function RecommendedScopesLink({ children }: Readonly<{ children?: ReactNode }>) {
  return (
    <Tooltip direction="se" text={formatRecommendedOAuthScopes()}>
      <button type="button">
        <Text as="u">{children}</Text>
      </button>
    </Tooltip>
  );
}

export function GitHubLoginWithPersonalAccessTokenRoute() {
  const { t } = useTranslation();

  return (
    <LoginWithPersonalAccessTokenForm
      docsTooltip={t('login.pat.docs_tooltip_github', 'GitHub documentation')}
      forge="github"
      hostnameCaption={t(
        'login.pat.hostname_caption_enterprise',
        'Change only if you are using GitHub Enterprise Server',
      )}
      hostnamePlaceholder="github.com"
      title={t('login.pat.title_github', 'Login with Personal Access Token')}
      tokenPlaceholder={t(
        'login.pat.token_placeholder_github',
        'Your classic token (40 characters)',
      )}
      tokenSettingsCaption={t(
        'login.pat.token_settings_caption_github',
        'on GitHub to paste the token below.',
      )}
      tokenSettingsLabel={t('login.pat.token_settings_label_github', 'Generate a PAT')}
    >
      <Text as="i" className="text-xs">
        <Trans
          components={[<RecommendedScopesLink key={0} />]}
          defaults="Use a classic personal access token; fine-grained tokens are not supported. The <0>recommended scopes</0> will be automatically selected for you."
          i18nKey="login.pat.scopes_note"
        />
      </Text>
    </LoginWithPersonalAccessTokenForm>
  );
}
