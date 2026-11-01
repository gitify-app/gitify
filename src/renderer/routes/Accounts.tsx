import { type FC, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  AlertFillIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  KeyIcon,
  type OcticonProps,
  PersonAddIcon,
  PersonIcon,
  ShieldCheckIcon,
  SignOutIcon,
  StarFillIcon,
  StarIcon,
  SyncIcon,
} from '@primer/octicons-react';
import { ActionList, ActionMenu, Button, IconButton, Stack, Text } from '@primer/react';

import { cn } from 'cn';

import { useAppNavigate } from '../hooks/useAppNavigate';
import { useLogins } from '../hooks/useLogins';
import { useNotifications } from '../hooks/useNotifications';
import { useAccountsStore } from '../stores';

import { AvatarWithFallback } from '../components/avatars/AvatarWithFallback';
import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Footer } from '../components/primitives/Footer';
import { Header } from '../components/primitives/Header';

import { type Account, type GitifyError, IconColor, Size } from '../types';
import type { ForgeAdapter } from '../utils/forges/types';

import { determineFailureType } from '../utils/api/errors';
import { hasAlternateScopes, hasRecommendedScopes } from '../utils/auth/scopes';
import { getAccountUUID } from '../utils/auth/utils';
import { isErrorType } from '../utils/core/errors';
import { rendererLogError, toError } from '../utils/core/logger';
import {
  translateAuthMethod,
  translateForgeTagline,
  translateLoginMethodLabel,
} from '../utils/forges/labels';
import { getAdapter, listAdapters } from '../utils/forges/registry';
import { openAccountProfile, openAccountSettings, openHost } from '../utils/system/links';
import { getPlatformIcon } from '../utils/ui/icons';

function RecommendedScopesIcon({ className, ...props }: Readonly<OcticonProps>) {
  return <ShieldCheckIcon {...props} className={cn(IconColor.GREEN, className)} />;
}

function AlternateScopesIcon({ className, ...props }: Readonly<OcticonProps>) {
  return <ShieldCheckIcon {...props} className={cn('text-gitify-warning', className)} />;
}

function getScopeIcon(account: Account): FC<OcticonProps> {
  if (hasRecommendedScopes(account)) {
    return RecommendedScopesIcon;
  }
  if (hasAlternateScopes(account)) {
    return AlternateScopesIcon;
  }
  return ShieldCheckIcon;
}

export function AccountsRoute() {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  const { logoutFromAccount } = useLogins();
  const { notifications } = useNotifications();

  const accounts = useAccountsStore((s) => s.accounts);
  const refreshAccount = useAccountsStore((s) => s.refreshAccount);

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const [refreshErrorStates, setRefreshErrorStates] = useState<Record<string, GitifyError>>({});

  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [selectedForge, setSelectedForge] = useState<ForgeAdapter | null>(null);
  const keepMenuOpenRef = useRef(false);

  const logoutAccount = useCallback(
    (account: Account) => {
      logoutFromAccount(account);
    },
    [logoutFromAccount],
  );

  const setAsPrimaryAccount = (account: Account) => {
    useAccountsStore.setState({
      accounts: [account, ...accounts.filter((a) => a !== account)],
    });
    navigate('/accounts', { replace: true });
  };

  const handleRefresh = async (account: Account) => {
    const accountUUID = getAccountUUID(account);

    setLoadingStates((prev) => ({ ...prev, [accountUUID]: true }));
    setRefreshErrorStates((prev) => {
      const next = { ...prev };
      delete next[accountUUID];
      return next;
    });

    try {
      await refreshAccount(account);
    } catch (err) {
      setRefreshErrorStates((prev) => ({
        ...prev,
        [accountUUID]: determineFailureType(toError(err)),
      }));
    }

    navigate('/accounts', { replace: true });

    /**
     * Typically the above refresh API call completes very quickly,
     * so we add an brief artificial delay to allow the icon to spin a few times
     */
    setTimeout(() => {
      setLoadingStates((prev) => ({
        ...prev,
        [accountUUID]: false,
      }));
    }, 500);
  };

  const getAccountError = (account: Account) => {
    const accountUUID = getAccountUUID(account);
    return (
      refreshErrorStates[accountUUID] ??
      notifications.find((n) => getAccountUUID(n.account) === accountUUID)?.error ??
      null
    );
  };

  const handleReAuthenticate = (account: Account) => {
    const loginMethod = getAdapter(account).loginMethods.find(
      (method) => method.authMethod === account.method,
    );

    if (!loginMethod) {
      rendererLogError(
        'handleReAuthenticate',
        `no login method registered for forge ${account.forge} and auth method ${account.method}`,
        new Error('Unable to re-authenticate account'),
      );
      return;
    }

    navigate(loginMethod.route, {
      replace: true,
      state: { account },
    });
  };

  return (
    <Page testId="accounts">
      <Header icon={PersonIcon}>{t('accounts.title', 'Accounts')}</Header>

      <Contents scrollFade>
        {accounts.map((account, i) => {
          const adapter = getAdapter(account);
          const AuthMethodIcon = adapter.getAuthMethodIcon(account.method);
          const PlatformIcon = getPlatformIcon(account.platform);
          const accountUUID = getAccountUUID(account);
          const accountError = getAccountError(account);
          const hasBadCredentials = isErrorType(accountError, 'BAD_CREDENTIALS');

          return (
            <div className="rounded-md p-2 mb-4 bg-gitify-accounts" key={accountUUID}>
              <Stack align="stretch" direction="vertical">
                <Stack align="start" direction="horizontal">
                  <Button
                    data-testid="account-profile"
                    onClick={() => openAccountProfile(account)}
                    title={t('accounts.open_profile', 'Open account profile ↗')}
                  >
                    <AvatarWithFallback
                      alt={adapter.formatUserLogin(account.user?.login ?? '')}
                      name={adapter.formatUserLogin(account.user?.login ?? '')}
                      size={Size.XLARGE}
                      src={account.user?.avatar ?? undefined}
                    />
                  </Button>
                </Stack>

                <Stack align="start" direction="horizontal" justify="space-between">
                  <div className="pl-2 pb-2 text-xs">
                    <Stack direction="vertical" gap="condensed">
                      <Stack
                        align="center"
                        direction="horizontal"
                        gap="condensed"
                        hidden={!account.user?.name}
                      >
                        <PersonIcon />
                        <Text>{account.user?.name}</Text>
                      </Stack>

                      <Stack
                        align="center"
                        className="cursor-pointer"
                        data-testid="account-host"
                        direction="horizontal"
                        gap="condensed"
                        onClick={() => openHost(account)}
                        title={t('accounts.open_host', 'Open host ↗')}
                      >
                        {PlatformIcon && <PlatformIcon />}
                        <Text>{account.hostname}</Text>
                      </Stack>

                      <Stack
                        align="center"
                        className="cursor-pointer"
                        data-testid="account-developer-settings"
                        direction="horizontal"
                        gap="condensed"
                        onClick={() => openAccountSettings(account)}
                        title={t('accounts.open_developer_settings', 'Open developer settings ↗')}
                      >
                        {AuthMethodIcon && <AuthMethodIcon />}
                        <Text>{translateAuthMethod(account.method)}</Text>
                      </Stack>

                      {hasBadCredentials && (
                        <Stack
                          align="center"
                          className="cursor-pointer text-gitify-danger"
                          data-testid="account-bad-credentials"
                          direction="horizontal"
                          gap="condensed"
                          onClick={() => openAccountSettings(account)}
                          title={t('accounts.open_developer_settings', 'Open developer settings ↗')}
                        >
                          <AlertFillIcon />
                          <Text>
                            {t('accounts.bad_credentials', 'Invalid or expired credentials')}
                          </Text>
                        </Stack>
                      )}
                    </Stack>
                  </div>

                  <Stack direction="horizontal" gap="condensed">
                    <IconButton
                      aria-label={t('accounts.set_primary', 'Set as primary account ({{status}})', {
                        status:
                          i === 0
                            ? t('accounts.current_primary', 'current primary')
                            : t('accounts.click_to_set', 'click to set'),
                      })}
                      icon={i === 0 ? StarFillIcon : StarIcon}
                      onClick={() => setAsPrimaryAccount(account)}
                      size="small"
                      variant={i === 0 ? 'primary' : 'default'}
                    />

                    {!hasBadCredentials && adapter.accountOps.oauthScopes && (
                      <IconButton
                        aria-label={t('accounts.view_scopes', 'View scopes for {{login}}', {
                          login: account.user?.login,
                        })}
                        icon={getScopeIcon(account)}
                        onClick={() =>
                          navigate('/account-scopes', {
                            state: { account },
                          })
                        }
                        size="small"
                        variant={
                          !hasRecommendedScopes(account) && !hasAlternateScopes(account)
                            ? 'danger'
                            : 'default'
                        }
                      />
                    )}

                    {hasBadCredentials && (
                      <IconButton
                        aria-label={t('accounts.reauthenticate', 'Re-authenticate {{login}}', {
                          login: account.user?.login,
                        })}
                        icon={KeyIcon}
                        onClick={() => handleReAuthenticate(account)}
                        size="small"
                        variant="danger"
                      />
                    )}

                    <IconButton
                      aria-label={t('accounts.refresh', 'Refresh {{login}}', {
                        login: account.user?.login,
                      })}
                      icon={SyncIcon}
                      loading={loadingStates[accountUUID] || false}
                      onClick={() => handleRefresh(account)}
                      size="small"
                    />

                    <IconButton
                      aria-label={t('accounts.logout', 'Logout {{login}}', {
                        login: account.user?.login,
                      })}
                      icon={SignOutIcon}
                      onClick={() => logoutAccount(account)}
                      size="small"
                      variant="danger"
                    />
                  </Stack>
                </Stack>
              </Stack>
            </div>
          );
        })}
      </Contents>

      <Footer justify="end">
        <ActionMenu
          open={addMenuOpen}
          onOpenChange={(open) => {
            if (!open && keepMenuOpenRef.current) {
              keepMenuOpenRef.current = false;
              return;
            }
            setAddMenuOpen(open);
            if (!open) {
              setSelectedForge(null);
            }
          }}
        >
          <ActionMenu.Anchor>
            <Button data-testid="account-add-new" leadingVisual={PersonAddIcon}>
              {t('accounts.add_new', 'Add new account')}
            </Button>
          </ActionMenu.Anchor>

          <ActionMenu.Overlay width="medium">
            {selectedForge ? (
              <ActionList>
                <ActionList.Item
                  onSelect={() => {
                    keepMenuOpenRef.current = true;
                    setSelectedForge(null);
                  }}
                >
                  <ActionList.LeadingVisual>
                    <ArrowLeftIcon />
                  </ActionList.LeadingVisual>
                  {t('accounts.back', 'Back')}
                </ActionList.Item>

                <ActionList.Divider />

                <ActionList.Group>
                  <ActionList.GroupHeading>
                    <Stack align="center" direction="horizontal" gap="condensed">
                      <selectedForge.icon size={12} />
                      {selectedForge.displayName}
                    </Stack>
                  </ActionList.GroupHeading>

                  {selectedForge.loginMethods.map((method) => {
                    const MethodIcon = method.icon;
                    return (
                      <ActionList.Item
                        data-testid={`account-add-${method.testId.replace(/^login-/, '')}`}
                        key={method.testId}
                        onSelect={() => navigate(method.route, { replace: true })}
                      >
                        <ActionList.LeadingVisual>
                          <MethodIcon />
                        </ActionList.LeadingVisual>
                        {translateLoginMethodLabel(method.label)}
                      </ActionList.Item>
                    );
                  })}
                </ActionList.Group>
              </ActionList>
            ) : (
              <ActionList>
                {listAdapters().map((adapter) => {
                  const ForgeIcon = adapter.icon;
                  const hasMultipleMethods = adapter.loginMethods.length > 1;

                  return (
                    <ActionList.Item
                      data-testid={`account-add-forge-${adapter.id}`}
                      key={adapter.id}
                      onSelect={() => {
                        if (hasMultipleMethods) {
                          keepMenuOpenRef.current = true;
                          setSelectedForge(adapter);
                        } else {
                          navigate(adapter.loginMethods[0].route, { replace: true });
                        }
                      }}
                    >
                      <ActionList.LeadingVisual>
                        <ForgeIcon />
                      </ActionList.LeadingVisual>
                      <Stack direction="vertical" gap="none">
                        <span>{adapter.displayName}</span>
                        <Text className="text-xs">{translateForgeTagline(adapter.tagline)}</Text>
                      </Stack>
                      {hasMultipleMethods && (
                        <ActionList.TrailingVisual>
                          <ChevronRightIcon />
                        </ActionList.TrailingVisual>
                      )}
                    </ActionList.Item>
                  );
                })}
              </ActionList>
            )}
          </ActionMenu.Overlay>
        </ActionMenu>
      </Footer>
    </Page>
  );
}
