import { useTranslation } from 'react-i18next';

import { LoginWithPersonalAccessTokenForm } from '../../components/login/LoginWithPersonalAccessTokenForm';

export function BitbucketLoginWithPersonalAccessTokenRoute() {
  const { t } = useTranslation();

  return (
    <LoginWithPersonalAccessTokenForm
      docsTooltip={t('login.pat.docs_tooltip_bitbucket', 'Atlassian API token documentation')}
      forge="bitbucket"
      showHostnameField={false}
      showUsernameField
      title={t('login.pat.title_bitbucket', 'Login to Bitbucket Cloud with API Token')}
      tokenPlaceholder={t('login.pat.token_placeholder_bitbucket', 'Your Atlassian API token')}
      tokenSettingsCaption={t(
        'login.pat.token_settings_caption_bitbucket',
        'on your Atlassian account to create an API token, then paste it below.',
      )}
      tokenSettingsLabel={t('login.pat.token_settings_label', 'Open token settings')}
      usernameCaption={t(
        'login.pat.username_caption_bitbucket',
        'Your Atlassian account email address',
      )}
      usernamePlaceholder="you@example.com"
    />
  );
}
