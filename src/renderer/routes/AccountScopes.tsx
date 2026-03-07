import type { FC } from 'react';
import { useLocation } from 'react-router-dom';

import {
  AlertFillIcon,
  LinkExternalIcon,
  ShieldCheckIcon,
} from '@primer/octicons-react';
import { Button, Label, Stack, Text } from '@primer/react';

import { Constants, OAUTH_SCOPE } from '../constants';

import { ScopeStatusIcon } from '../components/icons/ScopeStatusIcon';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
import { Header } from '../components/primitives/Header';

import type { Account } from '../types';

import {
  getAlternateScopeNames,
  getRecommendedScopeNames,
  getRequiredScopeNames,
  hasRequiredScopes,
} from '../utils/auth/utils';
import { openDeveloperSettings } from '../utils/links';

interface LocationState {
  account: Account;
}

export const AccountScopesRoute: FC = () => {
  const location = useLocation();
  const { account } = location.state as LocationState;

  const scopes = account.scopes ?? [];
  const scopesLoaded = account.scopes !== undefined;

  const hasRequired = scopesLoaded && hasRequiredScopes(account);
  const repoGranted = scopes.includes(OAUTH_SCOPE.REPO.name);
  const publicRepoGranted = scopes.includes(OAUTH_SCOPE.PUBLIC_REPO.name);
  const hasDetailedNotifications =
    scopesLoaded && (repoGranted || publicRepoGranted);

  // Scopes that don't belong to any known tier
  const allKnownNames = new Set<string>([
    ...getRequiredScopeNames(),
    ...getRecommendedScopeNames(),
    ...getAlternateScopeNames(),
  ]);
  const extraScopes = scopes.filter((s) => !allKnownNames.has(s));

  return (
    <Page testId="account-scopes">
      <Header icon={ShieldCheckIcon}>Scopes</Header>
      <Contents>
        <Stack direction="vertical" gap="none">
          {!scopesLoaded && (
            <Stack
              align="center"
              className="rounded-md px-3 py-2 bg-gitify-accounts text-xs"
              data-testid="account-scopes-no-scopes"
              direction="horizontal"
              gap="condensed"
            >
              <AlertFillIcon className="text-gitify-warning" size={14} />
              <Text>Scopes not loaded — try refreshing the account.</Text>
            </Stack>
          )}

          {scopesLoaded && (
            <Stack direction="vertical" gap="normal">
              <Stack direction="vertical" gap="condensed">
                <Stack
                  align="center"
                  className="px-1 text-xs font-semibold"
                  direction="horizontal"
                  gap="condensed"
                >
                  <ScopeStatusIcon granted={hasRequired} size={12} />
                  <Text>Required</Text>
                </Stack>

                {Constants.OAUTH_SCOPES.REQUIRED.map(
                  ({ name, description }) => {
                    const granted = scopes.includes(name);
                    return (
                      <Stack
                        align="center"
                        className="gitify-scope-row"
                        data-testid="account-scopes-required-scope"
                        direction="horizontal"
                        justify="space-between"
                        key={name}
                        padding="condensed"
                      >
                        <Stack direction="vertical" gap="none">
                          <Text className="text-xs font-mono">{name}</Text>
                          <Text className="text-xs opacity-60">
                            {description}
                          </Text>
                        </Stack>
                        <ScopeStatusIcon granted={granted} withTestId />
                      </Stack>
                    );
                  },
                )}
              </Stack>

              <Stack direction="vertical" gap="condensed">
                <Stack
                  align="center"
                  className="px-1 text-xs font-semibold"
                  direction="horizontal"
                  gap="condensed"
                >
                  <ScopeStatusIcon
                    granted={hasDetailedNotifications}
                    size={12}
                  />
                  <Text>Detailed Notifications</Text>
                </Stack>

                {/* repo row */}
                <Stack
                  align="center"
                  className="gitify-scope-row"
                  data-testid="account-scopes-repo-scope"
                  direction="horizontal"
                  justify="space-between"
                  padding="condensed"
                >
                  <Stack direction="vertical" gap="none">
                    <Text className="text-xs font-mono">
                      {OAUTH_SCOPE.REPO.name}
                    </Text>
                    <Text className="text-xs opacity-60">
                      {OAUTH_SCOPE.REPO.description}
                    </Text>
                  </Stack>
                  <ScopeStatusIcon granted={repoGranted} withTestId />
                </Stack>

                {/* public_repo row */}
                <Stack
                  align="center"
                  className="gitify-scope-row"
                  data-testid="account-scopes-public-repo-scope"
                  direction="horizontal"
                  justify="space-between"
                  padding="condensed"
                >
                  <Stack direction="vertical" gap="none">
                    <Text className="text-xs font-mono">
                      {OAUTH_SCOPE.PUBLIC_REPO.name}
                    </Text>
                    <Text className="text-xs opacity-60">
                      {OAUTH_SCOPE.PUBLIC_REPO.description}
                    </Text>
                  </Stack>
                  <ScopeStatusIcon
                    granted={publicRepoGranted}
                    notApplicable={repoGranted}
                    withTestId
                  />
                </Stack>
              </Stack>

              {/* ── Extra granted scopes ── */}
              {extraScopes.length > 0 && (
                <Stack direction="vertical" gap="condensed">
                  <Stack
                    align="center"
                    className="px-1 text-xs font-semibold"
                    direction="horizontal"
                    gap="condensed"
                  >
                    <ShieldCheckIcon size={12} />
                    <Text>Additional scopes</Text>
                  </Stack>

                  <Stack
                    className="gitify-scope-row flex-wrap"
                    data-testid="account-scopes-extra-scopes"
                    direction="horizontal"
                    gap="condensed"
                    padding="condensed"
                  >
                    {extraScopes.map((scope) => (
                      <Label key={scope} size="small" variant="secondary">
                        {scope}
                      </Label>
                    ))}
                  </Stack>
                </Stack>
              )}
            </Stack>
          )}
        </Stack>
      </Contents>

      <Footer justify="end">
        <Button
          data-testid="account-scopes-manage-link"
          leadingVisual={LinkExternalIcon}
          onClick={() => openDeveloperSettings(account)}
        >
          Developer settings
        </Button>
      </Footer>
    </Page>
  );
};
