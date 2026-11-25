import { useTranslation } from 'react-i18next';

import { LoginWithPersonalAccessTokenForm } from '../../components/login/LoginWithPersonalAccessTokenForm';

export function GiteaLoginWithPersonalAccessTokenRoute() {
  const { t } = useTranslation();

  return (
    <LoginWithPersonalAccessTokenForm
      docsTooltip={t('login.pat.docs_tooltip_gitea', 'Gitea API documentation')}
      forge="gitea"
      hostnameCaption={t(
        'login.pat.hostname_caption_gitea',
        'Your instance hostname or origin, e.g. gitea.example.com or http://git.internal:3000. Defaults to HTTPS.',
      )}
      hostnamePlaceholder="gitea.example.com"
      title={t('login.pat.title_gitea', 'Login to Gitea with Personal Access Token')}
      tokenPlaceholder={t('login.pat.token_placeholder_gitea', 'Your Gitea personal access token')}
      tokenSettingsCaption={t(
        'login.pat.token_settings_caption_gitea',
        'on your Gitea instance to create a token, then paste it below.',
      )}
      tokenSettingsLabel={t('login.pat.token_settings_label', 'Open token settings')}
    />
  );
}
