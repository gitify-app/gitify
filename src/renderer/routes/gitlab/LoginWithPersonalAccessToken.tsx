import { Trans, useTranslation } from 'react-i18next';

import { Text } from '@primer/react';

import { LoginWithPersonalAccessTokenForm } from '../../components/login/LoginWithPersonalAccessTokenForm';

export function GitLabLoginWithPersonalAccessTokenRoute() {
  const { t } = useTranslation();

  return (
    <LoginWithPersonalAccessTokenForm
      docsTooltip={t('login.pat.docs_tooltip_gitlab', 'GitLab To-Do API documentation')}
      forge="gitlab"
      hostnameCaption={t(
        'login.pat.hostname_caption_gitlab',
        'Your GitLab instance hostname (for example gitlab.com)',
      )}
      hostnamePlaceholder="gitlab.com"
      title={t('login.pat.title_gitlab', 'Login to GitLab with Personal Access Token')}
      tokenPlaceholder={t(
        'login.pat.token_placeholder_gitlab',
        'Your GitLab personal access token',
      )}
      tokenSettingsLabel={t('login.pat.token_settings_label', 'Open token settings')}
    >
      <Text className="text-xs">
        <Trans
          i18nKey="login.pat.scopes_note_gitlab"
          components={[
            <Text className="font-semibold" key={0} />,
            <Text className="font-semibold" key={1} />,
            <Text className="font-semibold" key={2} />,
          ]}
          defaults="Requires the <0>api</0> scope, or a fine-grained token with <1>Todo</1> (read, update) and <2>User</2> (read) permissions. GitLab shows your To-Do items, so you will see fewer notifications than on GitHub."
        />
      </Text>
    </LoginWithPersonalAccessTokenForm>
  );
}
