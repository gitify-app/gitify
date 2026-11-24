import { useTranslation } from 'react-i18next';

import { LoginWithPersonalAccessTokenForm } from '../../components/login/LoginWithPersonalAccessTokenForm';

export function GerritLoginWithPersonalAccessTokenRoute() {
  const { t } = useTranslation();

  return (
    <LoginWithPersonalAccessTokenForm
      docsTooltip={t('login.pat.docs_tooltip_gerrit', 'Gerrit HTTP credentials documentation')}
      forge="gerrit"
      hostnameCaption={t(
        'login.pat.hostname_caption_gerrit',
        'The hostname of your self-hosted Gerrit instance.',
      )}
      hostnamePlaceholder="gerrit.example.com"
      showUsernameField
      title={t('login.pat.title_gerrit', 'Login to Gerrit with HTTP Credentials')}
      tokenPlaceholder={t(
        'login.pat.token_placeholder_gerrit',
        'Your Gerrit HTTP password or authentication token',
      )}
      tokenSettingsCaption={t(
        'login.pat.token_settings_caption_gerrit',
        'on your Gerrit account to generate an HTTP password / authentication token, then paste it below.',
      )}
      tokenSettingsLabel={t(
        'login.pat.token_settings_label_gerrit',
        'Open HTTP credentials settings',
      )}
      usernameCaption={t('login.pat.username_caption_gerrit', 'Your Gerrit username')}
      usernamePlaceholder="jdoe"
    />
  );
}
