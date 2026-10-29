import { useTranslation } from 'react-i18next';

import { Text, Tooltip } from '@primer/react';

import { LoginWithPersonalAccessTokenForm } from '../../components/login/LoginWithPersonalAccessTokenForm';

import { formatRecommendedOAuthScopes } from '../../utils/auth/scopes';

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
        {t(
          'login.pat.classic_only_note',
          'Use a classic personal access token; fine-grained tokens are not supported.',
        )}{' '}
        {t('login.pat.scopes_note_prefix', 'The')}{' '}
        <Tooltip direction="se" text={formatRecommendedOAuthScopes()}>
          <button type="button">
            <Text as="u">{t('login.pat.scopes_note_link', 'recommended scopes')}</Text>
          </button>
        </Tooltip>{' '}
        {t('login.pat.scopes_note_suffix', 'will be automatically selected for you.')}
      </Text>
    </LoginWithPersonalAccessTokenForm>
  );
}
